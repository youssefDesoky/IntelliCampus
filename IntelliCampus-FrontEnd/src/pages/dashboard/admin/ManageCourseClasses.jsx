import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Section from "../../../components/ui/Section";
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import ImportDialog from "../../../components/ui/ImportDialog";
import ClassForm from "../../../feature/admin/components/ClassForm";
import CourseForm from "../../../feature/admin/components/CourseForm";
import ManageCourseStudentsTab from "./ManageCourseStudentsTab";
import ManageCourseGradesTab from "./ManageCourseGradesTab";
import {
  PlusIcon,
  ImportIcon,
  FilePenIcon,
  TrashIcon,
  CalendarIcon,
  LocationDotIcon,
  UserTieIcon,
  AngleDownIcon,
  ArrowRightIcon,
} from "../../../components/ui/icons";
import {
  fetchCourseById,
  fetchCourseClasses,
  addClassToCourse,
  createLecture,
  createSection,
  updateClass,
  deleteClassFromCourse,
  updateCourse,
  fetchCourses,
  deactivateCourse,
  activateCourse,
} from "../../../feature/admin/services/adminCoursesApi";
import { importClasses } from "../../../feature/admin/services/adminImportsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';
import { CourseClassesSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

const tabs = [
    { key: "classes", label: "Classes" },
    { key: "students", label: "Students" },
    { key: "grades", label: "Upload Final Grades" },
];

function ClassCard({ cls, onEdit, onDelete }) {
    const { t } = useTranslation('admin');
    const isLecture = cls.classTypeName === "Lecture";

    function formatTime(timeSpan) {
        if (!timeSpan) return "";
        const parts = String(timeSpan).split(":");
        const h = parseInt(parts[0], 10);
        const m = parts[1] || "00";
        const ampm = h >= 12 ? t('manageCourseClasses.pm') : t('manageCourseClasses.am');
        const h12 = h % 12 || 12;
        return `${h12}:${m} ${ampm}`;
    }

    function formatSchedule(cls) {
        const day = cls.dayName || "";
        const start = formatTime(cls.startTime);
        const end = formatTime(cls.endTime);
        if (start && end) return `${day} ${start} – ${end}`;
        if (start) return `${day} ${start}`;
        return day || "—";
    }
    
    // Modernized theme configuration preserving your exact custom design tokens
    const theme = isLecture ? {
        text: "text-purple-600 dark:text-purple-400",
        bg: "bg-purple-600 dark:bg-purple-500",
        badge: "bg-purple-50 dark:bg-purple-950/40 text-purple-700 dark:text-purple-300 border-purple-200/60 dark:border-purple-800/50",
        glow: "shadow-purple-500/[0.02] dark:shadow-purple-500/[0.05]",
        bar: "bg-purple-500"
    } : {
        text: "text-emerald-600 dark:text-emerald-400",
        bg: "bg-emerald-600 dark:bg-emerald-500",
        badge: "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200/60 dark:border-emerald-800/50",
        glow: "shadow-emerald-500/[0.02] dark:shadow-emerald-500/[0.05]",
        bar: "bg-emerald-500"
    };

    const capacityPercentage = cls.capacity ? Math.min((cls.enrolledCount ?? 0) / cls.capacity * 100, 100) : 0;
    const isFull = capacityPercentage >= 100;
    const instructorInitial = cls.instructorName ? cls.instructorName.trim().charAt(0) : "?";

    return (
        <div className={`group relative flex flex-col justify-between p-5 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark hover:shadow-xl ${theme.glow} hover:-translate-y-1 transition-all duration-300 ease-out overflow-hidden`}>
            
            {/* Subtle card-glare ambient texture on hover */}
            <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-gradient-to-br from-transparent via-transparent to-neutral-500/[0.02] dark:to-white/[0.02] transition-opacity duration-300 pointer-events-none" />

            <div>
                {/* Header: Class Type Status & Floating Actions */}
                <div className="flex items-center justify-between mb-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide border ${theme.badge}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${theme.bg} animate-pulse`} />
                        {cls.classTypeName || "Class"}
                    </span>
                    
                    {/* Hover actions menu */}
                    <div className="flex items-center gap-0.5 opacity-100 sm:opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <button
                            onClick={() => onEdit(cls)}
                            className="p-1.5 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark transition-colors"
                            title={t('manageCourseClasses.editClass')}
                        >
                            <FilePenIcon className="w-4 h-4" />
                        </button>
                        <button
                            onClick={() => onDelete(cls)}
                            className="p-1.5 rounded-lg text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-red-50 dark:hover:bg-red-950/30 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            title={t('manageCourseClasses.deleteClass')}
                        >
                            <TrashIcon className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Main Session Content */}
                <div className="mb-5">
                    <h4 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark tracking-tight line-clamp-2 leading-snug">
                        {formatSchedule(cls)}
                    </h4>
                    <div className="flex items-center gap-1.5 mt-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        <LocationDotIcon className="w-3.5 h-3.5 shrink-0 text-neutral-400 dark:text-neutral-500" />
                        <span className="truncate font-medium">{cls.roomName || t('manageCourseClasses.noRoom')}</span>
                    </div>
                </div>
            </div>

            {/* Bottom Row: Metadata Grid & Embedded Progress */}
            <div className="relative pt-3.5 border-t border-border-primary-default-light/60 dark:border-border-primary-default-dark/60">
                <div className="flex items-center justify-between gap-4">
                    
                    {/* Compact Instructor Profile Block */}
                    <div className="flex items-center gap-2 min-w-0">
                        <div className="flex h-7 w-7 items-center justify-center rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 font-bold text-xs shrink-0 select-none">
                            {instructorInitial}
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary-default-light dark:text-text-secondary-default-dark leading-none mb-0.5">{t('manageCourseClasses.instructor')}</p>
                            <p className="text-xs font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                {cls.instructorName || t('manageCourseClasses.unassigned')}
                            </p>
                        </div>
                    </div>

                    {/* Compact Capacity Counter */}
                    {cls.capacity != null && (
                        <div className="text-end shrink-0">
                            <p className="text-[10px] uppercase tracking-wider font-bold text-text-secondary-default-light dark:text-text-secondary-default-dark leading-none mb-0.5">{t('manageCourseClasses.enrolled')}</p>
                            <p className={`text-xs font-bold ${isFull ? 'text-red-500' : 'text-text-primary-default-light dark:text-text-primary-default-dark'}`}>
                                {cls.enrolledCount ?? 0} <span className="text-neutral-400 font-normal">/</span> {cls.capacity}
                            </p>
                        </div>
                    )}
                </div>

                {/* Minimalist Flush Bottom Progress Ribbon */}
                {cls.capacity != null && (
                    <div className="absolute -bottom-5 -start-5 -end-5 h-1 bg-neutral-100 dark:bg-neutral-800/40 overflow-hidden">
                        <div
                            className={`h-full transition-all duration-500 ease-out ${isFull ? 'bg-red-500' : theme.bar}`}
                            style={{ width: `${capacityPercentage}%` }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
function ClassSection({ icon: Icon, title, classes, onEdit, onDelete, onAdd }) {
    const { t } = useTranslation('admin');
    const isLecture = title === "Lectures";

    const addLabel = isLecture ? t('manageCourseClasses.addLecture') : t('manageCourseClasses.addSection');

    return (
        <Section>
            <div className="flex items-center gap-2 mb-4">
                {Icon && (
                    <div className={`p-1.5 rounded-md ${isLecture ? 'bg-purple-100 dark:bg-purple-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'}`}>
                        <Icon className={`w-4 h-4 ${isLecture ? 'text-purple-600 dark:text-purple-400' : 'text-emerald-600 dark:text-emerald-400'}`} />
                    </div>
                )}
                <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {title}
                </h2>
                <span className="text-sm font-normal text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    ({classes.length})
                </span>
                <div className="ms-auto">
                    <button
                        onClick={onAdd}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wide transition-colors bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark hover:bg-bg-fill-accent-default-light dark:hover:bg-bg-fill-accent-default-dark hover:text-white"
                    >
                        <PlusIcon className="w-3.5 h-3.5" />
                        {addLabel}
                    </button>
                </div>
            </div>

            {classes.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
                    {classes.map(cls => (
                        <ClassCard key={cls.classId} cls={cls} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                </div>
            ) : (
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark py-6 text-center">
                    {t('manageCourseClasses.noClasses', { type: title.toLowerCase() })}
                </p>
            )}
        </Section>
    );
}

export default function ManageCourseClasses() {
    const { t, i18n } = useTranslation('admin');
    const { courseId } = useParams();
    const navigate = useNavigate();

    const { showError } = useError();

    const [course, setCourse] = useState(null);
    const [classes, setClasses] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("classes");

    const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
    const [createClassType, setCreateClassType] = useState(null);
    const [editingClass, setEditingClass] = useState(null);
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [isEditCourseOpen, setIsEditCourseOpen] = useState(false);
    const [allCourses, setAllCourses] = useState([]);
    const [isDeactivateOpen, setIsDeactivateOpen] = useState(false);

    const loadData = useCallback(async () => {
        try {
            const [courseData, classesData] = await Promise.all([
                fetchCourseById(courseId),
                fetchCourseClasses(courseId),
            ]);
            const course = courseData ? {
                ...courseData,
                isActive:
                    courseData.statusName?.toLowerCase() === "active" ||
                    (typeof courseData.status === "string" && courseData.status.toLowerCase() === "active") ||
                    courseData.status === 0,
            } : courseData;
            setCourse(course);
            setClasses(Array.isArray(classesData) ? classesData : []);
        } catch (err) {
            showError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, [courseId]);

    useEffect(() => { loadData(); }, [loadData]);

    const handleAddClass = async (payloads) => {
        const arr = Array.isArray(payloads) ? payloads : [payloads];
        try {
            const apiFn = createClassType === "Lecture" ? createLecture : createSection;
            for (const data of arr) {
                await apiFn(courseId, data);
            }
            setIsCreateFormOpen(false);
            setCreateClassType(null);
            await loadData();
        } catch (err) {
            showError(err.message);
        }
    };

    const handleEditClick = (cls) => {
        const start = cls.startTime ? cls.startTime.slice(0, 5) : "";
        const scheduleStr = `${cls.dayName || ""} ${start}`.trim();
        setEditingClass({
            _classId: cls.classId,
            type: cls.classTypeName,
            instructor: cls.instructorName,
            instructorId: cls.instructorId,
            schedule: scheduleStr,
            room: cls.roomName,
            roomId: cls.roomId,
            capacity: cls.capacity,
        });
    };

    const handleEditSubmit = async (formData) => {
        try {
            const id = editingClass._classId;
            await updateClass(id, formData);
            setEditingClass(null);
            await loadData();
        } catch (err) {
            showError(err.message);
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteTarget) return;
        try {
            await deleteClassFromCourse(courseId, deleteTarget.classId);
            await loadData();
        } catch (err) {
            showError(err.message);
        }
        setDeleteTarget(null);
    };

    const handleEditCourse = async (formData) => {
        try {
            await updateCourse(courseId, formData);
            setIsEditCourseOpen(false);
            await loadData();
        } catch (err) {
            showError(err.message);
        }
    };

    const handleOpenEdit = async () => {
        try {
            const courses = await fetchCourses();
            setAllCourses(Array.isArray(courses) ? courses : []);
        } catch (err) {
            showError(err.message);
        }
        setIsEditCourseOpen(true);
    };

    const handleDeactivate = async () => {
        try {
            await deactivateCourse(courseId);
            setIsDeactivateOpen(false);
            await loadData();
        } catch (err) {
            showError(err.message);
        }
    };

    const handleReactivate = async () => {
        try {
            await activateCourse(courseId);
            await loadData();
        } catch (err) {
            showError(err.message);
        }
    };

    const lectures = classes.filter((c) => c.classTypeName === "Lecture");
    const sections = classes.filter((c) => c.classTypeName === "Section");

    if (isLoading) {
        return <CourseClassesSkeleton />;
    }

    return (
        <div className="p-0 sm:p-6">
            {/* ── Header ── */}
            <div className="flex items-start justify-between gap-4 mb-6">
                <div className="flex items-center gap-4 min-w-0">
                    <button
                        onClick={() => navigate("/admin/courses")}
                        className="shrink-0 w-10 h-10 rounded-xl bg-transparent flex items-center justify-center hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors"
                        title={t('manageCourseClasses.backToCourses')}
                    >
                        <ArrowRightIcon className="w-5 h-5 rotate-180 rtl:scale-x-[-1] text-text-secondary-active-light dark:text-text-secondary-active-dark" />
                    </button>
                    <div className="min-w-0">
                        <h1 className="text-xl md:text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark truncate">
                            {getLocalizedField(course, 'courseName', i18n.language) || t('manageCourseClasses.course')}
                        </h1>
                        <p className="text-text-secondary-active-light dark:text-text-secondary-active-dark text-xs md:text-sm truncate">
                            {getLocalizedField(course, 'courseCode', i18n.language) || ""}{course?.courseCode && course?.departmentName ? ` ${t('manageCourseClasses.separator')} ` : ""}{course?.departmentName || ""}{course?.creditHours ? ` ${t('manageCourseClasses.separator')} ${t('manageCourseClasses.creditHoursLabel', { hours: course.creditHours })}` : ""}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <Button variant="secondary" size="sm" onClick={handleOpenEdit}>
                        <FilePenIcon className="w-4 h-4" />
                        <span className="hidden sm:inline"> {t('manageCourseClasses.editCourse')}</span>
                    </Button>
                    {course?.isActive ? (
                        <Button variant="warning" size="sm" onClick={() => setIsDeactivateOpen(true)}>
                            <span className="hidden sm:inline"> {t('manageCourseClasses.deactivate')}</span>
                        </Button>
                    ) : (
                        <Button variant="success" size="sm" onClick={handleReactivate}>
                            <span className="hidden sm:inline"> {t('manageCourseClasses.reactivate')}</span>
                        </Button>
                    )}
                </div>
            </div>

            {/* ── Tabs ── */}
            <div className="flex gap-1 mb-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                {tabs.map((tab) => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all ${
                            activeTab === tab.key
                                ? "border-border-accent-active-light dark:border-border-accent-active-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                                : "border-transparent text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark"
                        }`}
                    >
                        {tab.key === "classes" ? t('manageCourseClasses.tabClasses') : tab.key === "students" ? t('manageCourseClasses.tabStudents') : t('manageCourseClasses.tabGrades')}
                    </button>
                ))}
            </div>

            {/* ─── Tab: Classes ─── */}
            {activeTab === "classes" && (
                <div className="space-y-6">
                    <div className="flex items-center gap-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl px-4 py-3 border border-border-primary-default-light dark:border-border-primary-default-dark">
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{t('manageCourseClasses.manageSessions')}</p>
                            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('manageCourseClasses.manageSessionsHint')}</p>
                        </div>
                        <Button variant="secondary" size="sm" onClick={() => setIsImportOpen(true)}>
                            <ImportIcon size={18} />
                            <span className="hidden sm:inline"> {t('manageCourseClasses.import')}</span>
                        </Button>
                    </div>

                    <ClassSection
                        icon={AngleDownIcon}
                        title={t('manageCourseClasses.lectures')}
                        classes={lectures}
                        onEdit={handleEditClick}
                        onDelete={setDeleteTarget}
                        onAdd={() => { setCreateClassType("Lecture"); setIsCreateFormOpen(true); }}
                    />

                    <ClassSection
                        icon={AngleDownIcon}
                        title={t('manageCourseClasses.sections')}
                        classes={sections}
                        onEdit={handleEditClick}
                        onDelete={setDeleteTarget}
                        onAdd={() => { setCreateClassType("Section"); setIsCreateFormOpen(true); }}
                    />
                </div>
            )}

            {/* ─── Tab: Students ─── */}
            {activeTab === "students" && (
                <ManageCourseStudentsTab courseId={courseId} />
            )}

            {/* ─── Tab: Upload Final Grades ─── */}
            {activeTab === "grades" && (
                <ManageCourseGradesTab courseId={courseId} courseName={getLocalizedField(course, 'courseName', i18n.language)} />
            )}

            {/* Add Class Form */}
            {isCreateFormOpen && (
                <ClassForm
                    onClose={() => { setIsCreateFormOpen(false); setCreateClassType(null); }}
                    onSubmit={handleAddClass}
                    courseDepartment={course?.departmentName || course?.department || ""}
                    classType={createClassType}
                />
            )}

            {/* Edit Class Form */}
            {editingClass && (
                <ClassForm
                    initialData={editingClass}
                    onClose={() => setEditingClass(null)}
                    onSubmit={handleEditSubmit}
                    courseDepartment={course?.departmentName || course?.department || ""}
                    classType={editingClass.type}
                />
            )}

            {/* Edit Course Form */}
            {isEditCourseOpen && (
                <CourseForm
                    method="put"
                    initialData={course}
                    onClose={() => setIsEditCourseOpen(false)}
                    onSubmit={handleEditCourse}
                    allCourses={allCourses}
                />
            )}

            {/* Import Dialog */}
            {isImportOpen && (
                <ImportDialog
                    title={t('manageCourseClasses.importTitle')}
                    subtitle={t('manageCourseClasses.importSubtitle')}
                    onClose={() => setIsImportOpen(false)}
                    onImport={async (file) => {
                        try {
                            await importClasses(file);
                            setIsImportOpen(false);
                            await loadData();
                        } catch (err) {
                            showError(err.message);
                        }
                    }}
                />
            )}

            {/* Delete Confirmation */}
            <Dialog
                isOpen={deleteTarget !== null}
                variant="error"
                title={t('manageCourseClasses.deleteTitle')}
                onClose={() => setDeleteTarget(null)}
                onConfirm={() => { handleDeleteConfirm(); return true; }}
                confirmText={t('manageCourseClasses.delete')}
                cancelText={t('manageCourseClasses.cancel')}
                showCloseButton={true}
            >
                {t('manageCourseClasses.deleteConfirm', {
                    type: deleteTarget?.classTypeName,
                    id: deleteTarget?.classId,
                    taughtBy: deleteTarget?.instructorName ? t('manageCourseClasses.taughtBy', { name: deleteTarget.instructorName }) : ''
                })}
            </Dialog>

{/* Deactivate Confirmation */}
            <Dialog
                isOpen={isDeactivateOpen}
                variant="warning"
                title={t('manageCourseClasses.deactivateTitle')}
                onClose={() => setIsDeactivateOpen(false)}
                onConfirm={() => { handleDeactivate(); return true; }}
                confirmText={t('manageCourseClasses.deactivate')}
                cancelText={t('manageCourseClasses.cancel')}
                showCloseButton={true}
            >
                {t('manageCourseClasses.deactivateConfirm', { name: getLocalizedField(course, 'courseName', i18n.language), code: getLocalizedField(course, 'courseCode', i18n.language) })}
            </Dialog>
        </div>
    );
}
