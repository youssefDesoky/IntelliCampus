import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import useDeviceType from "../../../hooks/useDeviceType";

import WeeklySchedule, { days } from "../../../components/ui/WeeklySchedule";
import WeeklyScheduleAgenda from "../../../components/ui/schedule/WeeklyScheduleAgenda.phone";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import Dialog from "../../../components/ui/Dialog";
import { FileLinesIcon, CalendarIcon, AngleDownIcon } from "../../../components/ui/icons";

import CourseCard from "../../../feature/student/courses/courseRegister/CourseCard";
import CourseRegistrationNote from "../../../feature/student/courses/courseRegister/CourseRegistrationNote";
import CourseRegistrationHeader from "../../../feature/student/courses/courseRegister/CourseRegistrationHeader";
import CoursesRegistrationActionButtons from "../../../feature/student/courses/courseRegister/CourseRegistrationActionButtons";
import { RegistrationPageSkeleton } from "../../../feature/student/courses/courseRegister/SkeletonLoader";

import {
    fetchActiveCourses,
    fetchClassesForCourse,
    getMyRegistrations,
    registerForCourse,
    unregisterFromCourse,
} from "../../../feature/student/courses/courseRegister/registrationApi";
import { fetchMySchedule } from "../../../feature/student/schedule/scheduleApi";
import { useError } from '../../../contexts/ErrorContext.jsx';


function mapRegistrationToCard(reg) {
    return {
        id:          reg.courseCode  ?? reg.code ?? reg.courseId ?? "",
        title:       reg.courseName  ?? "",
        code:        reg.courseCode  ?? reg.code ?? "",
        creditHours: reg.creditHours ?? "",
        professor:   reg.professorName ?? reg.professor ?? "",
        avatar:      reg.professorAvatar ?? reg.instructorAvatar ?? reg.avatar ?? null,
        schedule:    reg.schedule    ?? "",
        room:        reg.room        ?? "",
        courseId:     reg.courseId,
        classId:      reg.classId,
        isRegistered: true,
    };
}

function mapActiveCourseToCard(course) {
    return {
        id:            course.courseCode  ?? course.code ?? course.courseId ?? course.id ?? "",
        title:         course.courseName  ?? course.title   ?? "",
        code:          course.courseCode  ?? course.code ?? "",
        creditHours:   course.creditHours ?? "",
        professor:     course.professorName ?? course.professor ?? course.instructor ?? "",
        avatar:        course.professorAvatar ?? course.instructorAvatar ?? course.avatar ?? null,
        schedule:      course.schedule    ?? "",
        room:          course.room        ?? "",
        preRequisites: course.prerequisites ?? course.preRequisites ?? null,
        courseId:       course.courseId    ?? course.id,
        classId:       course.classId,
        isElective:    course.isElective ?? false,
        isRegistered: false,
    };
}

const ITEMS_PER_PAGE = 3;

export default function CoursesRegistration() {
    const { t } = useTranslation('student');
    const { isDesktop, isMobile } = useDeviceType();

    const [locallyAddedCourses, setLocallyAddedCourses] = useState([]);
    const [sectionOptionsByCourseId, setSectionOptionsByCourseId] = useState({});
    const [selectedSectionByCourseId, setSelectedSectionByCourseId] = useState({});
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const { showError } = useError();
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchValue), 400);
        return () => clearTimeout(timer);
    }, [searchValue]);

    const { data: registrationData, isLoading: loading } = useQuery({
        queryKey: ["coursesRegistration", debouncedSearch],
        queryFn: async () => {
            const params = debouncedSearch ? { searchQuery: debouncedSearch } : {};
            const [registrationsResult, coursesResult] = await Promise.all([
                getMyRegistrations(),
                fetchActiveCourses(params),
            ]);
            const registrations = registrationsResult?.data ?? (Array.isArray(registrationsResult) ? registrationsResult : []);
            const courses = coursesResult?.data ?? (Array.isArray(coursesResult) ? coursesResult : []);
            return { registrations, courses };
        },
        staleTime: 2 * 60 * 1000,
    });

    const { data: scheduleData = [], isLoading: schedulePreviewLoading } = useQuery({
        queryKey: ["studentSchedule"],
        queryFn: fetchMySchedule,
        staleTime: 5 * 60 * 1000,
    });

    const selectedCourses = useMemo(() => {
        const serverSelected = (registrationData?.registrations || []).map(mapRegistrationToCard);
        return [...serverSelected, ...locallyAddedCourses];
    }, [registrationData, locallyAddedCourses]);

    const availableCourses = useMemo(() => {
        const registeredIds = new Set((registrationData?.registrations || []).map(r => r.courseId));
        const serverAvailable = (registrationData?.courses
            ? (Array.isArray(registrationData.courses) ? registrationData.courses : [])
                .filter(c => !registeredIds.has(c.courseId ?? c.id))
                .map(mapActiveCourseToCard)
            : []);
        const addedIds = new Set(locallyAddedCourses.map(c => c.courseId));
        const withoutLocallyAdded = serverAvailable.filter(c => !addedIds.has(c.courseId));

        let filtered = withoutLocallyAdded;

        if (activeFilter === "required") {
            filtered = filtered.filter(c => !c.isElective);
        } else if (activeFilter === "elective") {
            filtered = filtered.filter(c => c.isElective);
        }

        return filtered;
    }, [registrationData, locallyAddedCourses, activeFilter]);

    const [selectedCoursesPage, setSelectedCoursesPage]   = useState(1);
    const [availableCoursesPage, setAvailableCoursesPage] = useState(1);

    const [showResultDialog, setShowResultDialog]   = useState(false);
    const [resultDialogVariant, setResultDialogVariant] = useState("success");
    const [resultDialogMessage, setResultDialogMessage] = useState("");
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const schedulePreview = Array.isArray(scheduleData) ? scheduleData : [];

    const selectedCredits = selectedCourses.reduce(
        (sum, c) => sum + (typeof c.creditHours === 'number' ? c.creditHours : 0),
        0
    );

    /* ── Load sections for selected courses ── */
    useEffect(() => {
        let isMounted = true;

        async function loadSections() {
            const courseIds = selectedCourses
                .map((c) => c.courseId)
                .filter((id) => id !== undefined && id !== null);

            if (courseIds.length === 0) {
                setSectionOptionsByCourseId({});
                return;
            }

            try {
                const results = await Promise.all(
                    courseIds.map(async (courseId) => {
                        const classes = await fetchClassesForCourse(courseId);
                        const list = Array.isArray(classes) ? classes : [];
                        const sections = list.filter((cls) => {
                            const type = (cls.classTypeName ?? cls.classType ?? cls.type ?? "").toString().toLowerCase();
                            return type === "section";
                        });

                        const options = sections.map((cls) => {
                            const groupName = cls.groupCode ?? cls.group ?? cls.groupName ?? cls.className ?? "";
                            const taName = cls.instructorName ?? cls.taName ?? "";
                            const classId = cls.classId ?? cls.id ?? "";
                            return {
                                value: classId,
                                label: `${groupName} — ${taName}`,
                            };
                        });

                        return { courseId, options };
                    })
                );

                if (!isMounted) return;

                const optionsMap = {};
                results.forEach(({ courseId, options }) => {
                    optionsMap[courseId] = options;
                });

                setSectionOptionsByCourseId(optionsMap);

                setSelectedSectionByCourseId((prev) => {
                    const next = { ...prev };
                    selectedCourses.forEach((course) => {
                        const options = optionsMap[course.courseId] || [];
                        if (course.classId && options.some((opt) => opt.value === course.classId)) {
                            next[course.courseId] = options.find((opt) => opt.value === course.classId);
                        } else if (!next[course.courseId] && options.length > 0) {
                            next[course.courseId] = options[0];
                        }
                    });
                    return next;
                });
            } catch (err) {
                if (!isMounted) return;
                showError(err.message || t('registration.sectionError'));
            }
        }

        loadSections();
        return () => { isMounted = false; };
    }, [selectedCourses]);

    /* ── Pagination helpers ── */
    const selectedTotalPages  = Math.max(1, Math.ceil(selectedCourses.length  / ITEMS_PER_PAGE));
    const availableTotalPages = Math.max(1, Math.ceil(availableCourses.length / ITEMS_PER_PAGE));

    const paginatedSelected = selectedCourses.slice(
        (selectedCoursesPage - 1) * ITEMS_PER_PAGE,
        selectedCoursesPage * ITEMS_PER_PAGE
    );
    const paginatedAvailable = availableCourses.slice(
        (availableCoursesPage - 1) * ITEMS_PER_PAGE,
        availableCoursesPage * ITEMS_PER_PAGE
    );

    /* ── Register / Unregister handlers ── */
    const handleRegister = (course) => {
        setLocallyAddedCourses((prev) => {
            if (prev.some((c) => c.courseId === course.courseId)) return prev;
            return [...prev, { ...course, isRegistered: false }];
        });
    };

    const handleUnregister = async (course) => {
        if (!course.isRegistered) {
            setLocallyAddedCourses((prev) => prev.filter((c) => c.courseId !== course.courseId));
            return;
        }

        try {
            await unregisterFromCourse(course.courseId);
            await queryClient.invalidateQueries({ queryKey: ["coursesRegistration"] });
        } catch (err) {
            showError(err.message || t('registration.unregisterError'));
        }
    };

    const handleConfirmRegistration = async () => {
        const pending = selectedCourses.filter((c) => !c.isRegistered);
        if (pending.length === 0) return;

        for (const course of pending) {
            const section = selectedSectionByCourseId[course.courseId];
            if (!section?.value) {
                showError(t('registration.selectSection', { title: course.title }));
                return;
            }
        }

        const successMsgs = [];
        const failureMsgs = [];

        for (const course of pending) {
            const section = selectedSectionByCourseId[course.courseId];
            try {
                await registerForCourse(course.courseId, section.value);
                successMsgs.push(t('registration.registerSuccess', { title: course.title }));
            } catch {
                failureMsgs.push(t('registration.registerError', { title: course.title }));
            }
        }

        setLocallyAddedCourses([]);
        await queryClient.invalidateQueries({ queryKey: ["coursesRegistration"] });

        if (failureMsgs.length === 0) {
            setResultDialogVariant("success");
            setResultDialogMessage(successMsgs.join(", ") + " " + t('registration.successSuffix'));
        } else if (successMsgs.length === 0) {
            setResultDialogVariant("error");
            setResultDialogMessage(failureMsgs.join(", "));
        } else {
            setResultDialogVariant("warning");
            setResultDialogMessage(
                t('registration.partialSuccess') + "\n" + successMsgs.join(", ") + "\n\n" + t('registration.failures') + "\n" + failureMsgs.join(", ")
            );
        }
        setShowResultDialog(true);
    };

    return (
        <>
            <CourseRegistrationHeader
                deviceType={isDesktop ? "desktop" : "mobile"}
                selectedCourses={selectedCourses}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
            />

            {loading ? (
                <RegistrationPageSkeleton />
            ) : (
            <div className="flex flex-col gap-6">
                {/* Available / Selected columns */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Available Courses — LEFT */}
                    <div className="flex flex-col rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/50 dark:bg-bg-surface-secondary-default-dark/50">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark" />
                                <h3 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">{t('registration.availableCourses')}</h3>
                            </div>
                            <span className="text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">{availableCourses.length}</span>
                        </div>

                        <div className="flex-1 p-4 space-y-4 min-h-[420px]">
                            {paginatedAvailable.length > 0 ? (
                                paginatedAvailable.map((course, idx) => (
                                    <CourseCard
                                        key={course.courseId}
                                        index={(availableCoursesPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                        course={course}
                                        cardType="available"
                                        onAction={() => handleRegister(course)}
                                    />
                                ))
                            ) : (
                                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-text-secondary-active-light dark:text-text-secondary-active-dark">
                                    <FileLinesIcon className="w-12 h-12 mb-3 opacity-40" />
                                    <p className="text-sm">{t('registration.noAvailable')}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30">
                            <PaginationButtons totalPages={availableTotalPages} currentPage={availableCoursesPage} setCurrentPage={setAvailableCoursesPage} />
                        </div>
                    </div>

                    {/* Selected Courses — RIGHT */}
                    <div className="flex flex-col rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-success-default-light/10 dark:bg-bg-surface-success-default-dark/10">
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark" />
                                <h3 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">{t('registration.selectedCourses')}</h3>
                            </div>
                            <span className="text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">{selectedCredits}</span>
                        </div>

                        <div className="flex-1 p-4 space-y-4 min-h-[420px]">
                            {paginatedSelected.length > 0 ? (
                                paginatedSelected.map((course, idx) => (
                                    <CourseCard
                                        key={course.courseId}
                                        index={(selectedCoursesPage - 1) * ITEMS_PER_PAGE + idx + 1}
                                        course={course}
                                        cardType="selected"
                                        onAction={() => handleUnregister(course)}
                                        sectionOptions={sectionOptionsByCourseId[course.courseId] || []}
                                        selectedSection={selectedSectionByCourseId[course.courseId]}
                                        onSectionChange={(opt) =>
                                            setSelectedSectionByCourseId((prev) => ({
                                                ...prev,
                                                [course.courseId]: opt,
                                            }))
                                        }
                                    />
                                ))
                            ) : (
                                <div className="h-full min-h-[320px] flex flex-col items-center justify-center text-text-secondary-active-light dark:text-text-secondary-active-dark">
                                    <FileLinesIcon className="w-12 h-12 mb-3 opacity-40" />
                                    <p className="text-sm">{t('registration.noSelected')}</p>
                                </div>
                            )}
                        </div>

                        <div className="px-4 py-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30">
                            <PaginationButtons totalPages={selectedTotalPages} currentPage={selectedCoursesPage} setCurrentPage={setSelectedCoursesPage} />
                        </div>
                    </div>
                </div>

                {/* Weekly Schedule Preview — Collapsible */}
                <div className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                    <button
                        type="button"
                        onClick={() => setScheduleOpen((prev) => !prev)}
                        className="w-full flex items-center justify-between px-4 py-3 text-start hover:bg-bg-surface-secondary-default-light/50 dark:hover:bg-bg-surface-secondary-default-dark/50 transition-colors"
                    >
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="w-4 h-4 text-text-secondary-active-light dark:text-text-secondary-active-dark" />
                            <h3 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">{t('registration.weeklyPreview')}</h3>
                        </div>
                        <AngleDownIcon className={`w-4 h-4 text-text-secondary-active-light dark:text-text-secondary-active-dark transition-transform duration-200 ${scheduleOpen ? 'rotate-180' : ''}`} />
                    </button>

                    {scheduleOpen && (
                        <div className="px-4 pb-4">
                            {schedulePreviewLoading ? (
                                <div className="animate-pulse bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-xl h-48 w-full" />
                            ) : isMobile ? (
                                <WeeklyScheduleAgenda days={days} schedule={schedulePreview} variant="default" />
                            ) : (
                                <WeeklySchedule schedule={schedulePreview} />
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom action bar */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 border-t-2 border-border-primary-default-light dark:border-border-primary-default-dark pt-6">
                    <CoursesRegistrationActionButtons onConfirm={handleConfirmRegistration} />
                    <CourseRegistrationNote />
                </div>
            </div>
            )}

            <Dialog
                isOpen={showResultDialog}
                variant={resultDialogVariant}
                title={resultDialogVariant === "success" ? t('registration.complete') : resultDialogVariant === "warning" ? t('registration.partial') : t('registration.failed')}
                onClose={() => setShowResultDialog(false)}
                confirmText={t('registration.ok')}
            >
                <p>{resultDialogMessage}</p>
            </Dialog>
        </>
    );
}