import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ManageEntity from "../../../components/ui/ManageEntity";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import ImportDialog from "../../../components/ui/ImportDialog";
import FilterDropdown from "../../../components/ui/FilterDropdown";
import CourseForm from "../../../feature/admin/components/CourseForm";
import useDeviceType from "../../../hooks/useDeviceType";
import {
  PlusIcon,
  ImportIcon,
  XIcon,
  CheckIcon,
  CalendarIcon,
} from "../../../components/ui/icons";
import {
  fetchCoursesPaginated,
  createCourse,
  updateCourse,
  deleteCourse,
  activateCourse,
  deactivateCourse,
  reactivateCourse,
  updateCourseRegistrationSettings,
} from "../../../feature/admin/services/adminCoursesApi";
import { fetchDepartments } from "../../../feature/admin/services/adminDepartmentsApi";
import { importCourses } from "../../../feature/admin/services/adminImportsApi";
import CourseRegistrationSettings from "../../../feature/admin/components/CourseRegistrationSettings";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { useTranslation, Trans } from 'react-i18next';
import { getLocalizedField } from '../../../utils/getLocalizedField';
import { ManageContentSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

function StatusBadge({ isActive, displaySemester }) {
  const { t } = useTranslation('admin');
  return (
    <span
      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
        isActive
          ? "bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark text-white"
          : "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark"
      }`}
    >
      {isActive ? <CheckIcon className="w-3 h-3" /> : <XIcon className="w-3 h-3" />}
      {isActive ? displaySemester : t('manageCourses.inactive')}
    </span>
  );
}

export default function ManageCourses() {
  const navigate = useNavigate();
  const { isDesktop, isTablet, isPhone } = useDeviceType();
  const { showError } = useError();
  const { t, i18n } = useTranslation('admin');

  const [editingCourse, setEditingCourse] = useState(null);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewingCourse, setViewingCourse] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const [filterDepartment, setFilterDepartment] = useState([]);
  const [isRegSettingsOpen, setIsRegSettingsOpen] = useState(false);
  const [allDepartments, setAllDepartments] = useState([]);
  const [bulkConfirm, setBulkConfirm] = useState(null);

  useEffect(() => {
    fetchDepartments().then(result => {
      const depts = Array.isArray(result) ? result : (result?.data ?? []);
      setAllDepartments(depts);
    }).catch(() => {});
  }, []);

  const departmentNameToId = useMemo(() => {
    const map = {};
    allDepartments.forEach(d => { map[d.departmentName] = d.departmentId; });
    return map;
  }, [allDepartments]);

  const filters = useMemo(() => ({
    departmentId: filterDepartment.length === 1 ? departmentNameToId[filterDepartment[0]] : undefined,
  }), [filterDepartment, departmentNameToId]);

  const courseTableHeaders = useMemo(() => {
    if (isDesktop) return [t('manageCourses.courseCode'), t('manageCourses.course'), t('manageCourses.department'), t('manageCourses.creditHours'), t('manageCourses.status')];
    if (isTablet) return [t('manageCourses.courseCode'), t('manageCourses.course'), t('manageCourses.department'), t('manageCourses.status')];
    return [t('manageCourses.course'), t('manageCourses.status')];
  }, [isDesktop, isTablet, t]);

  const columnAlignments = useMemo(() => {
    if (isDesktop) return ["text-center", "text-start", "text-center", "text-center", "text-center"];
    if (isTablet) return ["text-center", "text-start", "text-center", "text-center"];
    return ["text-start", "text-center"];
  }, [isDesktop, isTablet]);

  const fetchCoursesWrapped = useCallback(async ({ pageIndex = 1, pageSize = 50, searchQuery = '', filters: f = {} } = {}) => {
    const departmentId = f.departmentId || undefined;
    const result = await fetchCoursesPaginated({ pageIndex, pageSize, searchQuery, departmentId });
    const mappedData = (result?.data ?? []).map((c) => ({
      ...c,
      isActive:
        c.statusName?.toLowerCase() === "active" ||
        (typeof c.status === "string" && c.status.toLowerCase() === "active") ||
        c.status === 0,
    }));
    return { data: mappedData, totalCount: result?.totalCount ?? 0 };
  }, [filterDepartment, departmentNameToId]);

  const buildCourseRow = useCallback((course, { isDesktop, isTablet }) => {
    const row = {};
    if (isDesktop || isTablet) row.courseCode = getLocalizedField(course, 'courseCode', i18n.language) || course.courseId || "—";
    row.course = (
      <div className="flex flex-col text-start">
        <p className="font-medium">{getLocalizedField(course, 'courseName', i18n.language)}</p>
        {isDesktop && <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-50 truncate">{getLocalizedField(course, 'description', i18n.language)}</p>}
      </div>
    );
    if (isDesktop || isTablet) row.department = course.departmentName || "—";
    if (isDesktop) { row.creditHours = course.creditHours || "—"; }
    row.status = <StatusBadge isActive={course.isActive} displaySemester={course.semester} />;
    return row;
  }, []);

  return (
    <ManageEntity
      entityName={t('manageCourses.entityName')}
      entityNamePlural={t('manageCourses.entityNamePlural')}
      entityIdField="courseId"
      fetchItems={fetchCoursesWrapped}
      createItem={createCourse}
      updateItem={updateCourse}
      deleteItem={deleteCourse}
      headerTitle={t('manageCourses.title')}
      headerSubtitle={t('manageCourses.subtitle')}
      onPreview={(course) => setViewingCourse(course)}
      searchPlaceholder={t('manageCourses.search')}
      serverSidePagination={true}
      filters={filters}
      tableRole="course"
      tableRoleLabel="Courses"
      tableHeaders={courseTableHeaders}
      columnAlignments={columnAlignments}
      buildRow={buildCourseRow}
      renderHeaderActions={() => (
        <div className="flex items-center gap-2">
          <Button variant="secondary" onClick={() => setIsImportOpen(true)}>
            <ImportIcon size={24} />
            {!isPhone && t('manageCourses.import')}
          </Button>
          <Button variant="secondary" onClick={() => setIsRegSettingsOpen(true)}>
            <CalendarIcon size={24} />
            {!isPhone && t('manageCourses.registration')}
          </Button>
          <Button variant="primary" onClick={() => setIsCreateFormOpen(true)}>
            <PlusIcon size={24} />
            {!isPhone && t('manageCourses.addCourses')}
          </Button>
        </div>
      )}
      rowActions={(item, { onDelete, loadItems }) => [
        ...(item.isActive ? [{
          label: t('manageCourses.manageCourse'),
          tone: 'primary',
          onClick: () => navigate(`/admin/courses/${item.courseId}`),
        }] : []),
        {
          label: t('manageCourses.edit'),
          tone: 'primary',
          onClick: () => setEditingCourse(item),
        },
        item.isActive
          ? { label: t('manageCourses.deactivate'), tone: 'warning', onClick: async () => { await deactivateCourse(item.courseId); await loadItems(); setSuccessMessage(t('manageCourses.deactivateSuccess', { name: getLocalizedField(item, 'courseName', i18n.language) })); } }
          : { label: t('manageCourses.reactivate'), tone: 'success', onClick: async () => { await reactivateCourse(item.courseId); await loadItems(); setSuccessMessage(t('manageCourses.activateSuccess', { name: getLocalizedField(item, 'courseName', i18n.language) })); } },
        ...(item.isActive ? [{
          label: t('manageCourses.delete'),
          tone: 'danger',
          onClick: () => onDelete(item),
        }] : []),
      ]}
      renderBulkActions={({ selectedRowIds, rawItems, loadItems }) => {
        if (selectedRowIds.length === 0) return null;
        const selected = selectedRowIds.map(id => rawItems.find(c => c.courseId === id)).filter(Boolean);
        const allSelectedActive = selected.length > 0 && selected.every(c => c.isActive);
        const allSelectedInactive = selected.length > 0 && selected.every(c => !c.isActive);
        const handleActivateSelected = async () => {
          try {
            for (const id of selectedRowIds) {
              const course = rawItems.find(c => c.courseId === id);
              if (course && !course.isActive) {
                await activateCourse(id);
              }
            }
            setSuccessMessage(t('manageCourses.bulkActivateSuccess', { count: selectedRowIds.length }));
            await loadItems();
          } catch (err) {
            showError(err.message);
          } finally {
            setBulkConfirm(null);
          }
        };
        const handleDeactivateSelected = async () => {
          try {
            for (const id of selectedRowIds) {
              const course = rawItems.find(c => c.courseId === id);
              if (course && course.isActive) {
                await deactivateCourse(id);
              }
            }
            setSuccessMessage(t('manageCourses.bulkDeactivateSuccess', { count: selectedRowIds.length }));
            await loadItems();
          } catch (err) {
            showError(err.message);
          } finally {
            setBulkConfirm(null);
          }
        };
        return (
          <>
            {allSelectedInactive && (
              <Button variant="success" size="sm" onClick={() => setBulkConfirm({ type: 'activate' })} className="px-2 sm:px-4">
                <CheckIcon size={18} />
                <span className="hidden sm:inline">{t('manageCourses.activate')}</span>
              </Button>
            )}
            {allSelectedActive && (
              <Button variant="warning" size="sm" onClick={() => setBulkConfirm({ type: 'deactivate' })} className="px-2 sm:px-4">
                <XIcon size={18} />
                <span className="hidden sm:inline">{t('manageCourses.deactivate')}</span>
              </Button>
            )}
            {bulkConfirm?.type === 'activate' && (
              <Dialog
                isOpen={true}
                variant="success"
                title={t('manageCourses.activateSelectedTitle')}
                onClose={() => setBulkConfirm(null)}
                onConfirm={() => { handleActivateSelected(); return true; }}
                confirmText={t('manageCourses.activate')}
                cancelText={t('entity.cancelAction')}
                showCloseButton={true}
              >
                {t('manageCourses.bulkActivateConfirm', { count: selectedRowIds.length })}
              </Dialog>
            )}
            {bulkConfirm?.type === 'deactivate' && (
              <Dialog
                isOpen={true}
                variant="warning"
                title={t('manageCourses.deactivateSelectedTitle')}
                onClose={() => setBulkConfirm(null)}
                onConfirm={() => { handleDeactivateSelected(); return true; }}
                confirmText={t('manageCourses.deactivate')}
                cancelText={t('entity.cancelAction')}
                showCloseButton={true}
              >
                {t('manageCourses.bulkDeactivateConfirm', { count: selectedRowIds.length })}
              </Dialog>
            )}
          </>
        );
      }}
      getDeleteMessage={(item) => {
        const name = getLocalizedField(item, 'courseName', i18n.language);
        const code = getLocalizedField(item, 'courseCode', i18n.language) || item?.courseId;
        return (
          <Trans t={t} i18nKey="manageCourses.deleteConfirm" ns="admin" values={{ name, code }}>
            Are you sure you want to delete <strong>{{ name }}</strong> ({{ code }})? This action cannot be undone.
          </Trans>
        );
      }}
      renderFilters={({ setCurrentPage }) => {
        const departments = [...new Set(allDepartments.map(d => d.departmentName).filter(Boolean))].sort();
        return (
          <FilterDropdown
            label={t('manageCourses.department')}
            options={departments.map(d => ({ value: d, label: d }))}
            selectedValues={filterDepartment}
            onChange={(v) => { setFilterDepartment(v); setCurrentPage(1); }}
          />
        );
      }}
      renderForm={({ rawItems, loadItems }) => {
        if (editingCourse) {
          return (
            <CourseForm
              method="put"
              initialData={editingCourse}
              onClose={() => setEditingCourse(null)}
              onSubmit={async (formData) => {
                try {
                  await updateCourse(editingCourse.courseId, formData);
                  setEditingCourse(null);
                  await loadItems();
                } catch (err) {
                  showError(err.message);
                }
              }}
              allCourses={rawItems}
            />
          );
        }
        if (isCreateFormOpen) {
          return (
            <CourseForm
              method="post"
              onClose={() => setIsCreateFormOpen(false)}
              onSubmit={async (formData) => {
                try {
                  await createCourse(formData);
                  setIsCreateFormOpen(false);
                  await loadItems();
                } catch (err) {
                  showError(err.message);
                }
              }}
              allCourses={rawItems}
            />
          );
        }
        return null;
      }}
      renderLoading={() => <ManageContentSkeleton />}
      renderExtraDialogs={({ loadItems, rawItems }) => (
        <>
          {isImportOpen && (
            <ImportDialog
              title={t('manageCourses.importTitle')}
              subtitle={t('manageCourses.importSubtitle')}
              onClose={() => setIsImportOpen(false)}
              onImport={async (file) => {
                try {
                  await importCourses(file);
                  setIsImportOpen(false);
                  await loadItems();
                  setSuccessMessage(t('manageCourses.importSuccess'));
                } catch (err) {
                  showError(err.message);
                }
              }}
            />
          )}

          {viewingCourse && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark p-6 flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {getLocalizedField(viewingCourse, 'courseName', i18n.language) || viewingCourse.title || t('manageCourses.courseDetails')}
                  </h2>
                  <button onClick={() => setViewingCourse(null)} className="text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark transition-colors">
                    <XIcon className="w-6 h-6" />
                  </button>
                </div>
                <div className="p-6 space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.courseCode')}</p>
                      <p className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                        {getLocalizedField(viewingCourse, 'courseCode', i18n.language) || viewingCourse.id || viewingCourse.courseId || "—"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.status')}</p>
                      <StatusBadge isActive={!!viewingCourse.isActive} />
                    </div>
                  </div>
                  {getLocalizedField(viewingCourse, 'description', i18n.language) && (
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-2">{t('manageCourses.description')}</p>
                      <p className="text-text-primary-default-light dark:text-text-primary-default-dark">{getLocalizedField(viewingCourse, 'description', i18n.language)}</p>
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.department')}</p>
                      <p className="text-text-primary-default-light dark:text-text-primary-default-dark font-medium">{viewingCourse.departmentName || viewingCourse.department || "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.creditHours')}</p>
                      <p className="text-text-primary-default-light dark:text-text-primary-default-dark font-medium">{viewingCourse.creditHours ?? viewingCourse.credits ?? "—"}</p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.semester')}</p>
                      <p className="text-text-primary-default-light dark:text-text-primary-default-dark font-medium">{viewingCourse.semester || viewingCourse.level || viewingCourse.term || "—"}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg p-4">
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.enrolledStudents')}</p>
                      <p className="text-2xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                        {viewingCourse.numOfStudents ?? viewingCourse.enrolledCount ?? viewingCourse.enrolled ?? "0"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.capacity')}</p>
                      <p className="text-2xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                        {viewingCourse.capacity ?? viewingCourse.maxStudents ?? "—"}
                      </p>
                    </div>
                  </div>
                  {(viewingCourse.schedule || viewingCourse.room) && (
                    <div className="grid grid-cols-2 gap-4">
                      {viewingCourse.schedule && (
                        <div>
                          <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.schedule')}</p>
                          <p className="text-text-primary-default-light dark:text-text-primary-default-dark font-medium">{viewingCourse.schedule}</p>
                        </div>
                      )}
                      {viewingCourse.room && (
                        <div>
                          <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('manageCourses.room')}</p>
                          <p className="text-text-primary-default-light dark:text-text-primary-default-dark font-medium">{viewingCourse.room}</p>
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center gap-3 pt-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                    <Button variant="secondary" onClick={() => { const c = viewingCourse; setViewingCourse(null); setEditingCourse(c); }}>{t('manageCourses.edit')}</Button>
                    {viewingCourse.isActive && (
                      <Button variant="primary" onClick={() => { setViewingCourse(null); navigate(`/admin/courses/${viewingCourse.courseId}`); }}>{t('manageCourses.manageCourse')}</Button>
                    )}
                    <Button variant="tertiary" onClick={() => setViewingCourse(null)}>{t('manageCourses.close')}</Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <Dialog
            isOpen={successMessage !== null}
            variant="success"
            title={t('manageCourses.successTitle')}
            onClose={() => setSuccessMessage(null)}
            confirmText={t('manageCourses.ok')}
            showCloseButton={true}
          >
            {successMessage}
          </Dialog>

          {isRegSettingsOpen && (
            <CourseRegistrationSettings
              onClose={() => setIsRegSettingsOpen(false)}
              onSave={async (data) => {
                try {
                  const activeCourses = rawItems.filter(c => c.isActive);
                  for (const c of activeCourses) {
                    await updateCourseRegistrationSettings(c.courseId, data);
                  }
                  await loadItems();
                  setSuccessMessage(t('manageCourses.regSettingsSuccess', { count: activeCourses.length }));
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
