import { useState, useCallback, useMemo } from "react";
import { useNavigate, useRouteLoaderData } from "react-router-dom";
import { useTranslation, Trans } from 'react-i18next';
import ManageEntity from "../../../components/ui/ManageEntity";
import StudentForm from "../../../feature/admin/components/StudentForm";
import AssignRoleModal from "../../../feature/admin/components/AssignRoleModal";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import { UserIcon } from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import { fetchStudents, createStudent, updateStudent, deleteStudent } from "../../../feature/admin/services/adminStudentsApi";

export default function ManageStudents() {
  const { t } = useTranslation('admin');
  const { isDesktop, isTablet } = useDeviceType();
  const navigate = useNavigate();
  const user = useRouteLoaderData("root");
  const isSuperAdmin = (user?.roles || []).some(r => r.toLowerCase() === 'superadmin');
  const isPostgradAdmin = (user?.roles || []).some(r => r.toLowerCase() === 'admin_postgrad');
  const defaultStudentType = isPostgradAdmin ? 'masters' : 'bachelor';

  const [assignRoleTarget, setAssignRoleTarget] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState([]);
  const [filterStudentType, setFilterStudentType] = useState([]);

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

    const searchFilter = useCallback((student, q) => {
    if (q) {
      if (!(student.fullName?.toLowerCase().includes(q) ||
          student.studentCode?.toLowerCase().includes(q) ||
          student.email?.toLowerCase().includes(q) ||
          student.faculty?.toLowerCase().includes(q) ||
          student.departmentName?.toLowerCase().includes(q))) return false;
    }
    if (filterDepartment.length > 0 && !filterDepartment.includes(student.department || student.departmentName || student.faculty)) return false;
    if (filterStudentType.length > 0 && !filterStudentType.includes(student.studentType)) return false;
    return true;
  }, [filterDepartment, filterStudentType]);

  const buildStudentRow = useCallback((student, { isDesktop, isTablet }) => {
    const row = {};
    if (isDesktop || isTablet) row.studentID = student.studentCode || "—";
    row.student = (
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-10 h-10 rounded-full shrink-0 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark flex items-center justify-center text-sm font-bold text-text-accent-active-light dark:text-text-accent-active-dark overflow-hidden">
          {student.profileImage ? <img src={student.profileImage} alt={student.fullName} className="w-full h-full object-cover" /> : <UserIcon className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" />}
        </div>
        <div className="flex flex-col text-start min-w-0 max-w-40">
          <p className="truncate">{student.fullName}</p>
          <p className="text-xs truncate text-text-secondary-default-light dark:text-text-secondary-default-dark">{student.email}</p>
        </div>
      </div>
    );
    if (isDesktop) row.nationalId = student.nationalId || "—";
    if (isDesktop || isTablet) {
      row.specialization = student.department || student.departmentName || student.faculty || "—";
    }
    if (isDesktop) {
      row.bylaw = student.bylawName ?? "—";
      row.gpa = student.gpa != null ? Number(student.gpa).toFixed(2) : "—";
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
      searchFilter={searchFilter}
      tableRole="student"
      tableHeaders={studentTableHeaders}
      columnAlignments={studentColumnAlignments}
      buildRow={buildStudentRow}
      onPreview={(student) => navigate(`/admin/students/${student.userId || student._id || student.studentId}`)}
      rowActions={(item, { onEdit, onDelete }) => {
        const isTargetBachelor = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_bachelor';
        const isTargetSuperAdmin = item.roles?.some(r => r.toLowerCase() === 'superadmin');
        const items = [
          { label: t('manageStudents.viewDetails'), onClick: () => navigate(`/admin/students/${item.userId || item._id}`) },
          { label: t('manageStudents.editAction'), onClick: () => onEdit(item) },
          { label: t('manageStudents.deleteAction'), className: 'text-text-danger-default-light dark:text-text-danger-default-dark', onClick: () => onDelete(item) },
        ];
        const isTargetMasters = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_masters';
        const isTargetPhD = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_phd';
        const isTargetDiploma = item.roles?.length === 1 && item.roles[0]?.toLowerCase() === 'student_diploma';
        if (isSuperAdmin && !isTargetBachelor && !isTargetMasters && !isTargetPhD && !isTargetDiploma && !isTargetSuperAdmin) {
          items.push({ label: t('manageStudents.assignRole'), onClick: () => setAssignRoleTarget(item) });
        }
        return items;
      }}
      getDeleteMessage={(item) => (
        <Trans i18nKey="manageStudents.deleteConfirm" ns="admin" values={{ name: item?.fullName, id: item?.studentId }}>
          Are you sure you want to delete <strong>{{ name }}</strong> ({{ id }})? This action cannot be undone.
        </Trans>
      )}
      renderFilters={({ rawItems, setCurrentPage }) => {
        const departments = [...new Set(rawItems.map(s => s.department || s.departmentName || s.faculty).filter(Boolean))].sort();
        const studentTypes = [...new Set(rawItems.map(s => s.studentType).filter(Boolean))].sort();
        return (
          <>
            <FilterDropdown
              label={t('manageStudents.department')}
              options={departments.map(d => ({ value: d, label: d }))}
              selectedValues={filterDepartment}
              onChange={(v) => { setFilterDepartment(v); setCurrentPage(1); }}
            />
            <FilterDropdown
              label={t('manageStudents.studentType')}
              options={studentTypes.map(t => ({ value: t, label: t }))}
              selectedValues={filterStudentType}
              onChange={(v) => { setFilterStudentType(v); setCurrentPage(1); }}
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
      renderExtraDialogs={({ loadItems, deleteTarget, setDeleteTarget }) => (
        assignRoleTarget && (
          <AssignRoleModal
            userId={assignRoleTarget.userId}
            userName={assignRoleTarget.fullName}
            onClose={() => setAssignRoleTarget(null)}
            onRolesUpdated={loadItems}
          />
        )
      )}
    />
  );
}
