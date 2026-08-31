import { useState, useCallback, useMemo } from "react";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import ManageEntity from "../../../components/ui/ManageEntity";
import InstructorForm from "../../../feature/admin/components/InstructorForm";
import AssignRoleModal from "../../../feature/admin/components/AssignRoleModal";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import ImportDialog from "../../../components/ui/ImportDialog";
import Button from "../../../components/ui/Button";
import { UserIcon, PlusIcon, UserTieIcon, ImportIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import { fetchInstructors, createInstructor, updateInstructor, deleteInstructor } from "../../../feature/admin/services/adminInstructorsApi";
import { importInstructors } from "../../../feature/admin/services/adminImportsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function ManageInstructors() {
  const { t } = useTranslation('admin');
  const { isDesktop, isTablet } = useDeviceType();
  const navigate = useNavigate();
  const user = useRouteLoaderData("root");
  const { showError } = useError();
  const isSuperAdmin = (user?.roles || []).some(r => r.toLowerCase() === 'superadmin');

  const [assignRoleTarget, setAssignRoleTarget] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState([]);
  const [filterType, setFilterType] = useState([]);
  const [isLoanFormOpen, setIsLoanFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);

  const instructorTableHeaders = useMemo(() => {
    if (isDesktop) return [t('manageInstructors.instructorId'), t('manageInstructors.instructor'), t('manageInstructors.department'), t('manageInstructors.specialization'), t('manageInstructors.role')];
    if (isTablet) return [t('manageInstructors.instructorId'), t('manageInstructors.instructor'), t('manageInstructors.department')];
    return [t('manageInstructors.instructor')];
  }, [isDesktop, isTablet, t]);

  const instructorColumnAlignments = useMemo(() => {
    if (isDesktop) return ['text-center', 'text-start', 'text-start', 'text-start', 'text-center'];
    if (isTablet) return ['text-center', 'text-start', 'text-start'];
    return ['text-start'];
  }, [isDesktop, isTablet]);

  const searchFilter = useCallback((instructor, q) => {
    if (q) {
      if (!(instructor.fullName?.toLowerCase().includes(q) ||
          instructor.instructorId?.toLowerCase().includes(q) ||
          instructor.email?.toLowerCase().includes(q) ||
          instructor.departmentName?.toLowerCase().includes(q) ||
                      (instructor.specialization || instructor.specializationName)?.toLowerCase().includes(q))) return false;
    }
    if (filterDepartment.length > 0 && !filterDepartment.includes(instructor.departmentName)) return false;
    if (filterType.length > 0 && !filterType.includes(instructor.instructorRole)) return false;
    return true;
  }, [filterDepartment, filterType]);

  const buildInstructorRow = useCallback((instructor, { isDesktop, isTablet }) => {
    const row = {};
    if (isDesktop || isTablet) row.instructorID = instructor.instructorId || "—";
    row.instructor = (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark flex items-center justify-center text-sm font-bold text-text-accent-active-light dark:text-text-accent-active-dark overflow-hidden shrink-0">
          {instructor.profileImage ? <img src={instructor.profileImage} alt={instructor.fullName} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" />}
        </div>
        <div className="flex flex-col text-start min-w-0 max-w-40">
          <p className="truncate">{instructor.fullName}</p>
          <p className="text-xs truncate text-text-secondary-default-light dark:text-text-secondary-default-dark">{instructor.email}</p>
        </div>
      </div>
    );
    if (isDesktop || isTablet) row.department = instructor.departmentName || "—";
    if (isDesktop) { row.specialization = instructor.specialization || instructor.specializationName || "—"; row.role = instructor.role || instructor.instructorRole || "—"; }
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
      searchFilter={searchFilter}
      tableRole="instructor"
      tableHeaders={instructorTableHeaders}
      columnAlignments={instructorColumnAlignments}
      buildRow={buildInstructorRow}
      onPreview={(instructor) => navigate(`/admin/instructors/${instructor.userId || instructor._id || instructor.instructorId}`)}
      rowActions={(item, { onEdit, onDelete }) => {
        const isTargetSuperAdmin = item.roles?.some(r => r.toLowerCase() === 'superadmin');
        const items = [
          { label: t('manageInstructors.viewDetails'), onClick: () => navigate(`/admin/instructors/${item.userId || item._id || item.instructorId}`) },
          { label: t('manageInstructors.editAction'), onClick: () => onEdit(item) },
          { label: t('manageInstructors.deleteAction'), className: 'text-text-danger-default-light dark:text-text-danger-default-dark', onClick: () => onDelete(item) },
        ];
        if (isSuperAdmin && !isTargetSuperAdmin) {
          items.push({ label: t('manageInstructors.assignRole'), onClick: () => setAssignRoleTarget(item) });
        }
        return items;
      }}
      getDeleteMessage={(item) => (
        <Trans i18nKey="manageInstructors.deleteConfirm" ns="admin" values={{ name: item?.fullName, id: item?.instructorId }}>
          Are you sure you want to delete <strong>{{ name }}</strong> ({{ id }})? This action cannot be undone.
        </Trans>
      )}
      renderFilters={({ rawItems, setCurrentPage }) => {
        const departments = [...new Set(rawItems.map(i => i.departmentName).filter(Boolean))].sort();
        const instructorTypes = [...new Set(rawItems.map(i => i.instructorRole).filter(Boolean))].sort();
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
              options={instructorTypes.map(t => ({ value: t, label: t }))}
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
      renderExtraDialogs={({ loadItems }) => (
        <>
          {assignRoleTarget && (
            <AssignRoleModal
              userId={assignRoleTarget.userId}
              userName={assignRoleTarget.fullName}
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
                  await createInstructor(formData);
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
