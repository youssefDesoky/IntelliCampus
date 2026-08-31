import { useState, useCallback, useMemo } from "react";
import { Trans, useTranslation } from "react-i18next";
import ManageEntity from "../../../components/ui/ManageEntity";
import Button from "../../../components/ui/Button";
import DepartmentForm from "../../../feature/admin/components/DepartmentForm";
import DepartmentSpecializationsForm from "../../../feature/admin/components/DepartmentSpecializationsForm";
import DepartmentRegistrationSettings from "../../../feature/admin/components/DepartmentRegistrationSettings";
import { fetchDepartments, createDepartment, updateDepartment, deleteDepartment, updateDepartmentRegistrationSettings } from "../../../feature/admin/services/adminDepartmentsApi";
import { fetchInstructors } from "../../../feature/admin/services/adminInstructorsApi";
import { PlusIcon, CalendarIcon } from "../../../components/ui/icons";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';

export default function ManageDepartments() {
  const { t, i18n } = useTranslation("admin");
  const { showError } = useError();
  const [instructors, setInstructors] = useState([]);
  const [specDepartment, setSpecDepartment] = useState(null);
  const [isRegSettingsOpen, setIsRegSettingsOpen] = useState(false);

  const instructorLookup = useMemo(() =>
    instructors.reduce((lookup, instructor) => {
      lookup[String(instructor.instructorId)] = instructor.name;
      return lookup;
    }, {}),
    [instructors]
  );

  const fetchAll = useCallback(async () => {
    const [departmentData, instructorData] = await Promise.all([
      fetchDepartments(),
      fetchInstructors(),
    ]);
    setInstructors(Array.isArray(instructorData) ? instructorData : []);
    return departmentData;
  }, []);

  const buildDepartmentRow = useCallback((department) => {
    const headName = department.headInstructorName || instructorLookup[String(department.instructorId)] || "—";
    return {
      department: (
        <div className="flex flex-col text-start">
          <p className="font-medium">{getLocalizedField(department, 'departmentName', i18n.language)}</p>
        </div>
      ),
      headInstructor: headName,
      courses: `${department.courseCount ?? 0}`,
      description: getLocalizedField(department, 'description', i18n.language) ? (
        <span className="truncate max-w-xs" title={getLocalizedField(department, 'description', i18n.language)}>
          {getLocalizedField(department, 'description', i18n.language)}
        </span>
      ) : "—",
    };
  }, [instructorLookup, i18n.language]);

  const searchFilter = useCallback((department, q) => {
    const headName = department.headInstructorName || instructorLookup[String(department.instructorId)] || "";
    return (
      department.departmentName?.toLowerCase().includes(q) ||
      department.departmentNameAr?.toLowerCase().includes(q) ||
      department.description?.toLowerCase().includes(q) ||
      headName.toLowerCase().includes(q) ||
      department.id?.toLowerCase().includes(q)
    );
  }, [instructorLookup]);

  return (
    <ManageEntity
      entityName={t('manageDepartments.entityName')}
      entityNamePlural={t('manageDepartments.entityNamePlural')}
      entityIdField={(item) => item.id ?? item.departmentId}
      fetchItems={fetchAll}
      createItem={createDepartment}
      updateItem={updateDepartment}
      deleteItem={deleteDepartment}
      headerTitle={t('manageDepartments.title')}
      headerSubtitle={t('manageDepartments.subtitle')}
      renderHeaderActions={({ openForm }) => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsRegSettingsOpen(true)}>
            <CalendarIcon size={24} />
            <span className="hidden sm:inline"> {t('manageDepartments.registration')}</span>
          </Button>
          <Button variant="primary" onClick={() => openForm(null)}>
            <PlusIcon size={24} />
            <span className="hidden sm:inline"> {t('manageDepartments.create')}</span>
          </Button>
        </div>
      )}
      searchPlaceholder={t('manageDepartments.search')}
      searchFilter={searchFilter}
      tableRole="department"
      tableHeaders={[t('manageDepartments.departmentName'), t('manageDepartments.headInstructor'), t('manageDepartments.courses'), t('manageDepartments.description')]}
      columnAlignments={["text-start", "text-start", "text-center", "text-start"]}
      buildRow={(item) => buildDepartmentRow(item)}
      rowActions={(item, { onEdit, onDelete }) => [
        { label: t('manageDepartments.editAction'), onClick: () => onEdit(item) },
        { label: t('manageDepartments.setSpecializations'), onClick: () => setSpecDepartment(item) },
        { label: t('manageDepartments.delete'), onClick: () => onDelete(item) },
      ]}
      getDeleteMessage={(item) => (
        <Trans ns="admin" i18nKey="manageDepartments.deleteMessage" values={{ name: getLocalizedField(item, 'departmentName', i18n.language) }}>
          Are you sure you want to delete <strong>{{ name: getLocalizedField(item, 'departmentName', i18n.language) }}</strong>?
        </Trans>
      )}
      renderForm={({ isFormOpen, editingItem, closeForm, handleFormSubmit, formIsLoading }) =>
        isFormOpen && (
          <DepartmentForm
            onClose={closeForm}
            onSubmit={handleFormSubmit}
            initialData={editingItem || {}}
            instructors={instructors}
            isLoading={formIsLoading}
          />
        )
      }
      extraDeps={[instructorLookup]}
      renderExtraDialogs={({ loadItems }) => (
        <>
          {specDepartment && (
            <DepartmentSpecializationsForm
              department={specDepartment}
              onClose={() => setSpecDepartment(null)}
              onUpdate={loadItems}
            />
          )}
          {isRegSettingsOpen && (
            <DepartmentRegistrationSettings
              onClose={() => setIsRegSettingsOpen(false)}
              onSave={async (data) => {
                try {
                  await updateDepartmentRegistrationSettings(data);
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
