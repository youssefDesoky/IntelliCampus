import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import ManageEntity from "../../../components/ui/ManageEntity";
import StudentForm from "../../../feature/admin/components/StudentForm";
import AssignRoleModal from "../../../feature/admin/components/AssignRoleModal";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import { UserIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import useAdminScope from "../../../hooks/useAdminScope";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../../../feature/admin/services/adminStudentsApi";
import { fetchDepartments } from "../../../feature/admin/services/adminDepartmentsApi";
import useArabicDigits from "../../../hooks/useArabicDigits";
import { ManageContentSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

const ALL_STUDENT_TYPES = ['Bachelor', 'Masters', 'PhD', 'Diploma'];

export default function ManageStudents() {
  const { t } = useTranslation('admin');
  const { convert: ar } = useArabicDigits();
  const { isDesktop, isTablet } = useDeviceType();
  const navigate = useNavigate();
  const { isSuperAdmin, studentType, defaultStudentType, canSwitchStudentType } = useAdminScope();

  const [assignRoleTarget, setAssignRoleTarget] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState([]);
  const [filterStudentType, setFilterStudentType] = useState(() =>
    canSwitchStudentType ? [] : (studentType ? [studentType] : [])
  );
  const [filterProbation, setFilterProbation] = useState([]);
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
    status: filterStudentType.length === 1 ? filterStudentType[0] : undefined,
    departmentId: filterDepartment.length === 1 ? departmentNameToId[filterDepartment[0]] : undefined,
    probation: filterProbation.length === 1 ? filterProbation[0] : undefined,
  }), [filterDepartment, filterStudentType, filterProbation, departmentNameToId]);

  const studentTableHeaders = useMemo(() => {
    if (isDesktop) return [t('manageStudents.studentId'), t('manageStudents.student'), t('manageStudents.nationalId'), t('manageStudents.department'), t('manageStudents.bylaw'), t('manageStudents.gpa')];
    if (isTablet) return [t('manageStudents.studentId'), t('manageStudents.student'), t('manageStudents.department')];
    return [t('manageStudents.student')];
  }, [isDesktop, isTablet, t]);

  const studentColumnAlignments = useMemo(() => {
    if (isDesktop) return ['text-center', 'text-start', 'text-center', 'text-start', 'text-start', 'text-center'];
    if (isTablet) return ['text-center', 'text-start', 'text-start'];
    return ['text-start'];
  }, [isDesktop, isTablet]);

  const buildStudentRow = useCallback((student, { isDesktop, isTablet }) => {
    const row = {};
    const isOnProbation = student.isOnProbation === true;
    if (isDesktop || isTablet) row.studentID = student.studentCode || "—";
    row.student = (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full shrink-0 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark flex items-center justify-center text-sm font-bold text-text-accent-active-light dark:text-text-accent-active-dark overflow-hidden">
          {student.profileImage ? <img src={student.profileImage} alt={student.fullName} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" />}
        </div>
        <div className="flex flex-col text-start min-w-0 max-w-40">
          <div className="flex items-center gap-1.5">
            <p className="truncate">{student.fullName}</p>
            {isOnProbation && (
              <span className="shrink-0 px-1.5 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-bg-surface-warning-default-light dark:bg-bg-surface-warning-default-dark text-text-warning-default-light dark:text-text-warning-default-dark border border-border-warning-default-light dark:border-border-warning-default-dark">
                {t('studentDetails.probation')}
              </span>
            )}
          </div>
          <p className="text-xs truncate text-text-secondary-default-light dark:text-text-secondary-default-dark">{student.email}</p>
        </div>
      </div>
    );
    if (isDesktop) row.nationalId = student.nationalId || "—";
    if (isDesktop || isTablet) {
      row.department = student.department || student.departmentName || student.faculty || "—";
    }
    if (isDesktop) {
      row.bylaw = student.bylawName ?? "—";
      row.gpa = student.gpa != null ? ar(Number(student.gpa).toFixed(2)) : "—";
    }
    return row;
  }, []);

  return (
    <ManageEntity
      entityName={t('manageStudents.entityName')}
      entityNamePlural={t('manageStudents.entityNamePlural')}
      entityIdField="userId"
      fetchItems={fetchStudents}
      createItem={createStudent}
      updateItem={updateStudent}
      deleteItem={deleteStudent}
      headerType="user"
      headerRole="student"
      searchPlaceholder={t('manageStudents.search')}
      serverSidePagination={true}
      filters={filters}
      tableRole="student"
      tableHeaders={studentTableHeaders}
      columnAlignments={studentColumnAlignments}
      buildRow={buildStudentRow}
      onPreview={(student) => navigate(`/admin/students/${student.userId || student._id || student.studentId}`)}
      rowActions={(item, { onEdit, onDelete }) => {
        const isTargetBachelor = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_bachelor';
        const isTargetSuperAdmin = item.roles?.some(r => r.toLowerCase() === 'superadmin');
        const items = [
          { label: t('manageStudents.viewDetails'), tone: 'primary', onClick: () => navigate(`/admin/students/${item.userId || item._id}`) },
          { label: t('manageStudents.editAction'), tone: 'primary', onClick: () => onEdit(item) },
          { label: t('manageStudents.deleteAction'), tone: 'danger', onClick: () => onDelete(item) },
        ];
        const isTargetMasters = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_masters';
        const isTargetPhD = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_phd';
        const isTargetDiploma = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_diploma';
        if (isSuperAdmin && !isTargetBachelor && !isTargetMasters && !isTargetPhD && !isTargetDiploma && !isTargetSuperAdmin) {
          items.push({ label: t('manageStudents.assignRole'), tone: 'accent', onClick: () => setAssignRoleTarget(item) });
        }
        return items;
      }}
      getDeleteMessage={(item) => {
        const name = item?.fullName;
        const id = item?.studentId;
        return (
          <Trans i18nKey="manageStudents.deleteConfirm" ns="admin" values={{ name, id }}>
            Are you sure you want to delete <strong>{{ name }}</strong> ({{ id }})? This action cannot be undone.
          </Trans>
        );
      }}
      renderFilters={({ setCurrentPage }) => {
        const departments = allDepartments.map(d => d.departmentName).filter(Boolean).sort();
        return (
          <>
            <FilterDropdown
              label={t('manageStudents.studentType')}
              options={ALL_STUDENT_TYPES.map(st => ({ value: st, label: st }))}
              selectedValues={filterStudentType}
              onChange={canSwitchStudentType ? (v) => { setFilterStudentType(v); setCurrentPage(1); } : () => {}}
              disabled={!canSwitchStudentType}
            />
            {isSuperAdmin && (
              <FilterDropdown
                label={t('manageStudents.department')}
                options={departments.map(d => ({ value: d, label: d }))}
                selectedValues={filterDepartment}
                onChange={(v) => { setFilterDepartment(v); setCurrentPage(1); }}
              />
            )}
            <FilterDropdown
              label={t('studentDetails.probation')}
              options={[
                { value: "true", label: t('studentDetails.probation') },
                { value: "false", label: t('manageStudents.nonProbation') },
              ]}
              selectedValues={filterProbation}
              onChange={(v) => { setFilterProbation(v); setCurrentPage(1); }}
            />
          </>
        );
      }}
      renderForm={({ isFormOpen, editingItem, closeForm, handleCreate, handleFormSubmit }) => {
        if (!isFormOpen) return null;
        if (editingItem) {
          return <StudentForm method="put" initialData={editingItem} onClose={closeForm} onSubmit={handleFormSubmit} isSuperAdmin={isSuperAdmin} defaultStudentType={defaultStudentType} />;
        }
        return <StudentForm method="post" onClose={closeForm} onSubmit={handleCreate} isSuperAdmin={isSuperAdmin} defaultStudentType={defaultStudentType} />;
      }}
      renderLoading={() => <ManageContentSkeleton />}
      renderExtraDialogs={({ loadItems, deleteTarget, setDeleteTarget }) => (
        assignRoleTarget && (
          <AssignRoleModal
            userId={assignRoleTarget.userId}
            userName={getLocalizedField(assignRoleTarget, 'fullName', i18n.language)}
            onClose={() => setAssignRoleTarget(null)}
            onRolesUpdated={loadItems}
          />
        )
      )}
    />
  );
}
