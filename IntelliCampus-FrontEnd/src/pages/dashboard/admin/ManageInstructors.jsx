import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import ManageEntity from "../../../components/ui/ManageEntity";
import InstructorForm from "../../../feature/admin/components/InstructorForm";
import AssignRoleModal from "../../../feature/admin/components/AssignRoleModal";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import ImportDialog from "../../../components/ui/ImportDialog";
import Button from "../../../components/ui/Button";
import { UserIcon, PlusIcon, UserTieIcon, ImportIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import useAdminScope from "../../../hooks/useAdminScope";
import { fetchInstructors, createInstructor, updateInstructor, deleteInstructor, loanInstructor } from "../../../feature/admin/services/adminInstructorsApi";
import { fetchDepartments } from "../../../feature/admin/services/adminDepartmentsApi";
import { importInstructors } from "../../../feature/admin/services/adminImportsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';
import { ManageContentSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

const ALL_INSTRUCTOR_ROLES = ['TeachingAssistant', 'Lecturer', 'AssistantLecturer', 'AssociateProfessor', 'Professor'];

export default function ManageInstructors() {
  const { t, i18n } = useTranslation('admin');
  const { isDesktop, isTablet } = useDeviceType();
  const navigate = useNavigate();
  const { showError } = useError();
  const { isSuperAdmin } = useAdminScope();

  const [assignRoleTarget, setAssignRoleTarget] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState([]);
  const [filterType, setFilterType] = useState([]);
  const [isLoanFormOpen, setIsLoanFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);

  useEffect(() => {
    fetchDepartments().then(result => {
      const depts = Array.isArray(result) ? result : (result?.data ?? []);
      setAllDepartments(depts);
    }).catch(() => {});
  }, []);

  const departmentNameToId = useMemo(() => {
    const map = {};
    allDepartments.forEach(d => {
      const name = d.departmentName;
      if (name) map[name] = d.departmentId ?? d.id;
    });
    return map;
  }, [allDepartments]);

  const filters = useMemo(() => ({
    departmentId: filterDepartment.length === 1 ? departmentNameToId[filterDepartment[0]] : undefined,
    instructorRole: filterType.length === 1 ? filterType[0] : undefined,
  }), [filterDepartment, filterType, departmentNameToId]);

  const instructorTableHeaders = useMemo(() => {
    if (isDesktop) return [t('manageInstructors.instructorId'), t('manageInstructors.instructor'), t('manageInstructors.department'), t('manageInstructors.role')];
    if (isTablet) return [t('manageInstructors.instructorId'), t('manageInstructors.instructor'), t('manageInstructors.department')];
    return [t('manageInstructors.instructor')];
  }, [isDesktop, isTablet, t]);

  const instructorColumnAlignments = useMemo(() => {
    if (isDesktop) return ['text-center', 'text-start', 'text-start', 'text-center'];
    if (isTablet) return ['text-center', 'text-start', 'text-start'];
    return ['text-start'];
  }, [isDesktop, isTablet]);

  const buildInstructorRow = useCallback((instructor, { isDesktop, isTablet }) => {
    const row = {};
    if (isDesktop || isTablet) row.instructorID = instructor.instructorId || "—";
    row.instructor = (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark flex items-center justify-center text-sm font-bold text-text-accent-active-light dark:text-text-accent-active-dark overflow-hidden shrink-0">
          {instructor.profileImage ? <img src={instructor.profileImage} alt={getLocalizedField(instructor, 'fullName', i18n.language)} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" />}
        </div>
        <div className="flex flex-col text-start min-w-0 max-w-40">
          <p className="truncate">{getLocalizedField(instructor, 'fullName', i18n.language)}</p>
          <p className="text-xs truncate text-text-secondary-default-light dark:text-text-secondary-default-dark">{instructor.email}</p>
        </div>
      </div>
    );
    if (isDesktop || isTablet) row.department = instructor.departmentName || "—";
    if (isDesktop) { row.role = instructor.role || instructor.instructorRole || "—"; }
    return row;
  }, []);

  return (
    <ManageEntity
      entityName={t('manageInstructors.entityName')}
      entityNamePlural={t('manageInstructors.entityNamePlural')}
      entityIdField="userId"
      fetchItems={fetchInstructors}
      createItem={createInstructor}
      updateItem={updateInstructor}
      deleteItem={deleteInstructor}
      headerTitle={t('manageInstructors.title')}
      headerSubtitle={t('manageInstructors.subtitle')}
      headerAddLabel={t('manageInstructors.addLabel')}
      renderHeaderActions={({ openForm }) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            <ImportIcon size={24} />
            <span className="hidden sm:inline">{t('manageInstructors.importBtn')}</span>
          </Button>
          <Button variant="secondary" onClick={() => setIsLoanFormOpen(true)}>
            <UserTieIcon size={24} />
            <span className="hidden sm:inline">{t('manageInstructors.loanBtn')}</span>
          </Button>
          <Button variant="primary" onClick={() => openForm(null)}>
            <PlusIcon size={24} />
            <span className="hidden sm:inline">{t('manageInstructors.addBtn')}</span>
          </Button>
        </div>
      )}
  searchPlaceholder={t('manageInstructors.search')}
  serverSidePagination={true}
  filters={filters}
  tableRole="instructor"
      tableHeaders={instructorTableHeaders}
      columnAlignments={instructorColumnAlignments}
      buildRow={buildInstructorRow}
      onPreview={(instructor) => navigate(`/admin/instructors/${instructor.userId || instructor._id || instructor.instructorId}`)}
      rowActions={(item, { onEdit, onDelete }) => {
        const isTargetSuperAdmin = item.roles?.some(r => r.toLowerCase() === 'superadmin');
        const items = [
          { label: t('manageInstructors.viewDetails'), tone: 'primary', onClick: () => navigate(`/admin/instructors/${item.userId || item._id || item.instructorId}`) },
          { label: t('manageInstructors.editAction'), tone: 'primary', onClick: () => onEdit(item) },
          { label: t('manageInstructors.deleteAction'), tone: 'danger', onClick: () => onDelete(item) },
        ];
        if (isSuperAdmin && !isTargetSuperAdmin) {
          items.push({ label: t('manageInstructors.assignRole'), tone: 'accent', onClick: () => setAssignRoleTarget(item) });
        }
        return items;
      }}
      getDeleteMessage={(item) => {
        const name = getLocalizedField(item, 'fullName', i18n.language);
        const id = item?.instructorId;
        return (
          <Trans i18nKey="manageInstructors.deleteConfirm" ns="admin" values={{ name, id }}>
            Are you sure you want to delete <strong>{{ name }}</strong> ({{ id }})? This action cannot be undone.
          </Trans>
        );
      }}
      renderFilters={({ setCurrentPage }) => {
        const departments = allDepartments.map(d => d.departmentName).filter(Boolean).sort();
        return (
          <>
            <FilterDropdown
              label={t('manageInstructors.filterDepartment')}
              options={departments.map(d => ({ value: d, label: d }))}
              selectedValues={filterDepartment}
              onChange={(v) => { setFilterDepartment(v); setCurrentPage(1); }}
            />
            <FilterDropdown
              label={t('manageInstructors.filterType')}
              options={ALL_INSTRUCTOR_ROLES.map(r => ({ value: r, label: r }))}
              selectedValues={filterType}
              onChange={(v) => { setFilterType(v); setCurrentPage(1); }}
            />
          </>
        );
      }}
      renderForm={({ isFormOpen, editingItem, closeForm, handleCreate, handleFormSubmit }) => {
        if (!isFormOpen) return null;
        if (editingItem) {
          return <InstructorForm method="put" initialData={editingItem} onClose={closeForm} onSubmit={handleFormSubmit} />;
        }
        return <InstructorForm method="post" onClose={closeForm} onSubmit={handleCreate} />;
      }}
      renderLoading={() => <ManageContentSkeleton />}
      renderExtraDialogs={({ loadItems }) => (
        <>
          {assignRoleTarget && (
            <AssignRoleModal
              userId={assignRoleTarget.userId}
              userName={getLocalizedField(assignRoleTarget, 'fullName', i18n.language)}
              onClose={() => setAssignRoleTarget(null)}
              onRolesUpdated={loadItems}
            />
          )}
          {isLoanFormOpen && (
            <InstructorForm
              mode="loan"
              onClose={() => setIsLoanFormOpen(false)}
              onSubmit={async (formData) => {
                try {
                  const { instructorId, ...loanData } = formData;
                  await loanInstructor(instructorId, loanData);
                  setIsLoanFormOpen(false);
                  await loadItems();
                } catch (err) {
                  showError(err.message);
                }
              }}
            />
          )}
          {isImportOpen && (
            <ImportDialog
              title={t('manageInstructors.importDialogTitle')}
              subtitle={t('manageInstructors.importDialogSubtitle')}
              onClose={() => setIsImportOpen(false)}
              onImport={async (file) => {
                try {
                  await importInstructors(file);
                  setIsImportOpen(false);
                  await loadItems();
                } catch (err) {
                  showError(err.message);
                }
              }}
            />
          )}
        </>
      )}
    />
  );
}
