import { useState, useEffect, useMemo } from "react";
import { useTranslation } from 'react-i18next';
import Button from "../../../components/ui/Button";
import Dialog from "../../../components/ui/Dialog";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import Table from "../../../components/ui/Table";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import {
    PlusIcon,
    TrashIcon,
    FilePenIcon,
    XIcon,
} from "../../../components/ui/icons";
import useDeviceType from "../../../hooks/useDeviceType";
import {
    registerStudentCourse,
    unregisterStudentCourse,
    fetchStudentCourseSections,
    changeStudentCourseSection,
} from "../../../feature/admin/services/adminStudentsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

const ITEMS_PER_PAGE = 10;

export default function StudentRegisteredTab({ student, studentId, courses, availableCourses, loading, onRefresh }) {
    const { t } = useTranslation('admin');
    const { isPhone } = useDeviceType();
    const { showError } = useError();

    const registeredIds = useMemo(() => new Set(courses.map(c => c.courseId)), [courses]);
    const unregisteredCourses = useMemo(
        () => availableCourses.filter(c => !registeredIds.has(c.courseId)),
        [availableCourses, registeredIds]
    );

    const headers = useMemo(() => {
        if (isPhone) return [t('studentDetails.course'), t('studentDetails.section'), t('studentDetails.actions')];
        return [t('studentDetails.code'), t('studentDetails.course'), t('studentDetails.section'), t('studentDetails.actions')];
    }, [isPhone, t]);

    const buildRow = useMemo(() => (c, onSectionChange, onUnregister) => {
        const row = {};
        if (!isPhone) {
            row.code = c.courseCode || c.code || "-";
        }
        row.course = <span className="font-medium text-sm">{c.courseName || c.title || c.name}</span>;
        row.section = c.className || c.groupCode || t('studentDetails.sectionLabel', { id: c.classId }) || "-";
        row.actions = (
            <div className="flex items-center justify-center gap-1 sm:gap-3">
                <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); onSectionChange(c); }}>
                    <FilePenIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('studentDetails.changeSection')}</span>
                </Button>
                <Button variant="danger" size="sm" onClick={(e) => { e.stopPropagation(); onUnregister(c); }}>
                    <TrashIcon className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('studentDetails.unregister')}</span>
                </Button>
            </div>
        );
        return row;
    }, [isPhone, t]);

    const [page, setPage] = useState(1);

    const [isRegisterOpen, setIsRegisterOpen] = useState(false);
    const [selectedCourseId, setSelectedCourseId] = useState("");
    const [registering, setRegistering] = useState(false);

    const [unregisterTarget, setUnregisterTarget] = useState(null);
    const [unregistering, setUnregistering] = useState(false);

    const [sectionChangeTarget, setSectionChangeTarget] = useState(null);
    const [availableSections, setAvailableSections] = useState([]);
    const [selectedSection, setSelectedSection] = useState("");
    const [changingSection, setChangingSection] = useState(false);

    const [registerSection, setRegisterSection] = useState("");
    const [availableCoursesSections, setAvailableCoursesSections] = useState({});
    const [loadingSections, setLoadingSections] = useState(false);

    const totalPages = Math.max(1, Math.ceil(courses.length / ITEMS_PER_PAGE));
    const paginated = courses.slice((page - 1) * ITEMS_PER_PAGE, page * ITEMS_PER_PAGE);

    useEffect(() => {
        if (sectionChangeTarget) {
            fetchStudentCourseSections(studentId, sectionChangeTarget.courseId).then(setAvailableSections).catch(() => {});
            setSelectedSection(sectionChangeTarget.classId || "");
        }
    }, [sectionChangeTarget, studentId]);

    useEffect(() => {
        if (selectedCourseId) {
            fetchCourseSections(selectedCourseId);
        }
    }, [selectedCourseId]);

    useEffect(() => { setPage(1); }, [courses.length]);

    const fetchCourseSections = async (courseId) => {
        if (!courseId) return [];
        try {
            setLoadingSections(true);
            const sections = await fetchStudentCourseSections(studentId, courseId);
            setAvailableCoursesSections(prev => ({ ...prev, [courseId]: sections }));
            return sections;
        } catch (err) {
            showError(err.message);
            return [];
        } finally {
            setLoadingSections(false);
        }
    };

    const handleRegister = async () => {
        if (!selectedCourseId) return;
        setRegistering(true);
        try {
            await registerStudentCourse(studentId, selectedCourseId, registerSection || null);
            onRefresh?.();
            setIsRegisterOpen(false);
            setSelectedCourseId("");
            setRegisterSection("");
        } catch (err) {
            showError(err.message);
        } finally {
            setRegistering(false);
        }
    };

    const handleUnregister = async () => {
        if (!unregisterTarget) return;
        setUnregistering(true);
        try {
            await unregisterStudentCourse(studentId, unregisterTarget.courseId);
            onRefresh?.();
            setUnregisterTarget(null);
        } catch (err) {
            showError(err.message);
        } finally {
            setUnregistering(false);
        }
    };

    const handleChangeSection = async () => {
        if (!sectionChangeTarget || !selectedSection) return;
        setChangingSection(true);
        try {
            await changeStudentCourseSection(studentId, sectionChangeTarget.courseId, selectedSection);
            onRefresh?.();
            setSectionChangeTarget(null);
        } catch (err) {
            showError(err.message);
        } finally {
            setChangingSection(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/50 dark:bg-bg-surface-secondary-default-dark/50">
                <div className="w-8 h-8 mb-4 border-4 border-t-border-accent-active-light dark:border-t-border-accent-active-dark border-border-primary-default-light dark:border-border-primary-default-dark rounded-full animate-spin"></div>
                <p className="text-sm font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studentDetails.loadingRegistered')}</p>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-start justify-between gap-2 mb-6">
                <div className="min-w-0">
                    <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentDetails.registeredCourses')}</h3>
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1 truncate">
                        {t('studentDetails.showingRegistered', { count: courses.length })}
                    </p>
                </div>
                <Button variant="primary" onClick={() => setIsRegisterOpen(true)} className="shadow-sm hover:shadow-md transition-shadow shrink-0">
                    <PlusIcon className="w-5 h-5 sm:me-2" />
                    <span className="hidden sm:inline">{t('studentDetails.registerCourse')}</span>
                </Button>
            </div>

            <div className="flex-1">
                {courses.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 px-4 text-center rounded-xl border-2 border-dashed border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30 transition-colors hover:bg-bg-surface-secondary-default-light/50 dark:hover:bg-bg-surface-secondary-default-dark/50">
                        <div className="p-4 mb-4 rounded-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-sm ring-1 ring-border-primary-default-light dark:ring-border-primary-default-dark">
                            <PlusIcon className="w-8 h-8 text-text-secondary-default-light dark:text-text-secondary-default-dark opacity-50" />
                        </div>
                        <h4 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">{t('studentDetails.noCoursesRegistered')}</h4>
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-sm mb-6">
                            {t('studentDetails.noCoursesRegisteredDesc')}
                        </p>
                        <Button variant="outline" size="sm" onClick={() => setIsRegisterOpen(true)}>
                            <PlusIcon className="w-4 h-4 me-2" /> {t('studentDetails.addCourseNow')}
                        </Button>
                    </div>
                ) : (
                    <div className="flex flex-col space-y-4">
                        <div className="overflow-hidden rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-sm">
                            <Table
                                role="course"
                                headers={headers}
                                data={paginated.map((c) => buildRow(c, setSectionChangeTarget, setUnregisterTarget))}
                                columnAlignments={isPhone ? ["text-start", "text-center", "text-center"] : ["text-start", "text-start", "text-center", "text-center"]}
                                wrapInSection={false}
                                showHeaderActions={false}
                                showPagination={false}
                                showSelectionColumn={false}
                                showActionsColumn={false}
                            />
                        </div>
                        {totalPages > 1 && (
                            <div className="flex justify-end pt-2">
                                <PaginationButtons totalPages={totalPages} currentPage={page} setCurrentPage={setPage} />
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Register Course Modal */}
            {isRegisterOpen && (
                <ModelOverlay onClose={() => { setIsRegisterOpen(false); setSelectedCourseId(""); }} maxWidth="max-w-lg">
                    <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl w-full overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentDetails.registerACourse')}</h3>
                            <button onClick={() => { setIsRegisterOpen(false); setSelectedCourseId(""); }} className="p-1.5 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('studentDetails.registerACourseDesc')}
                            </p>
                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studentDetails.availableCourses')}</label>
                                <select
                                    value={selectedCourseId}
                                    onChange={(e) => { setSelectedCourseId(e.target.value); setRegisterSection(""); }}
                                    disabled={registering}
                                    className="w-full px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all disabled:opacity-50"
                                >
                                    <option value="" disabled>{t('studentDetails.selectCourse')}</option>
                                    {unregisteredCourses.map((c) => (
                                        <option key={c.courseId} value={c.courseId}>
                                            {c.courseCode || c.code || ""} - {c.courseName || c.title || c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {selectedCourseId && availableCoursesSections[selectedCourseId]?.length > 0 && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studentDetails.section')}</label>
                                    <select
                                        value={registerSection}
                                        onChange={(e) => setRegisterSection(e.target.value)}
                                        disabled={registering}
                                        className="w-full px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all disabled:opacity-50"
                                    >
                                        <option value="" disabled>{t('studentDetails.selectSection')}</option>
                                        {availableCoursesSections[selectedCourseId]
                                            .filter(s => s.classType === "Section")
                                            .map((section) => (
                                            <option key={section.classId} value={section.classId}>
                                                {section.groupCode || t('studentDetails.sectionLabel', { id: section.classId })}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                            {loadingSections && (
                                <div className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                    {t('studentDetails.loadingSections')}
                                </div>
                            )}
                            <div className="flex justify-end gap-2 pt-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                                <Button variant="outline" size="sm" onClick={() => { setIsRegisterOpen(false); setSelectedCourseId(""); setRegisterSection(""); }}>{t('studentDetails.cancel')}</Button>
                                <Button variant="primary" size="sm" onClick={handleRegister} disabled={registering || !selectedCourseId}>
                                    {registering ? t('studentDetails.registering') : t('studentDetails.register')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModelOverlay>
            )}

            {/* Unregister Course Modal */}
            <Dialog
                isOpen={unregisterTarget !== null}
                variant="warning"
                title={t('studentDetails.unregisterCourse')}
                onClose={() => setUnregisterTarget(null)}
                onConfirm={handleUnregister}
                confirmText={unregistering ? t('studentDetails.unregistering') : t('studentDetails.yesUnregister')}
                cancelText={t('studentDetails.cancel')}
                showCloseButton={true}
                preventCloseOnOverlayClick={unregistering}
            >
                <div className="py-4 space-y-5">
                    <div className="flex items-start gap-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-lg">
                        <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/40 flex items-center justify-center shrink-0">
                            <TrashIcon className="w-5 h-5 text-red-600 dark:text-red-400" />
                        </div>
                        <div className="space-y-2">
                            <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentDetails.confirmUnregistration')}</p>
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed">
                                {t('studentDetails.confirmUnregistrationDesc', {
                                    courseName: unregisterTarget?.courseName || unregisterTarget?.title || unregisterTarget?.name,
                                    courseCode: unregisterTarget?.courseCode || unregisterTarget?.code,
                                    studentName: student?.fullName || student?.name
                                })}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('studentDetails.unregistrationWarning')}
                        </p>
                    </div>
                </div>
            </Dialog>

            {/* Change Section Modal */}
            {sectionChangeTarget && (
                <ModelOverlay onClose={() => setSectionChangeTarget(null)} maxWidth="max-w-lg">
                    <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl w-full overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary-default-light dark:text-text-primary-default-dark">{t('studentDetails.changeSection')}</h3>
                            <button onClick={() => setSectionChangeTarget(null)} className="p-1.5 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors">
                                <XIcon className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-5 space-y-5">
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('studentDetails.changeSectionDesc', {
                                    courseName: sectionChangeTarget?.courseName || sectionChangeTarget?.title || sectionChangeTarget?.name,
                                    courseCode: sectionChangeTarget?.courseCode || sectionChangeTarget?.code
                                })}
                            </p>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studentDetails.availableSections')}</label>
                                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                                    {availableSections.filter(s => s.classType === "Section").map((s) => (
                                        <button
                                            key={s.classId}
                                            disabled={changingSection}
                                            onClick={() => setSelectedSection(s.classId)}
                                            className={`flex items-center justify-center py-2.5 px-3 rounded-lg border text-sm font-medium transition-all ${
                                                selectedSection === s.classId
                                                    ? "border-border-accent-active-light dark:border-border-accent-active-dark bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark shadow-sm ring-1 ring-border-accent-active-light dark:ring-border-accent-active-dark"
                                                    : "border-border-primary-default-light dark:border-border-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark hover:border-text-secondary-default-light dark:hover:border-text-secondary-default-dark"
                                            } disabled:opacity-50 `}
                                        >
                                            {s.groupCode || t('studentDetails.sectionLabel', { id: s.classId })}
                                        </button>
                                    ))}
                                </div>
                            </div>
                            <div className="flex justify-end gap-2 pt-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                                <Button variant="secondary" size="sm" onClick={() => setSectionChangeTarget(null)}>{t('studentDetails.cancel')}</Button>
                                <Button variant="primary" size="sm" onClick={handleChangeSection} disabled={changingSection || !selectedSection}>
                                    {changingSection ? t('studentDetails.saving') : t('studentDetails.saveChanges')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModelOverlay>
            )}
        </div>
    );
}
