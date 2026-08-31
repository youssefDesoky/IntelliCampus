import { useTranslation } from 'react-i18next';
import { useState, useEffect, useMemo } from "react";
import { useQuery, useQueryClient, keepPreviousData } from "@tanstack/react-query";

import useDeviceType from "../../../hooks/useDeviceType";
import useArabicDigits from "../../../hooks/useArabicDigits";

import WeeklySchedule, { days } from "../../../components/ui/WeeklySchedule";
import WeeklyScheduleAgenda from "../../../components/ui/schedule/WeeklyScheduleAgenda.phone";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import Dialog from "../../../components/ui/Dialog";
import { FileLinesIcon, CalendarIcon, AngleDownIcon, WarningIcon } from "../../../components/ui/icons";

import CourseCard from "../../../feature/student/courses/courseRegister/CourseCard";
import CourseRegistrationHeader from "../../../feature/student/courses/courseRegister/CourseRegistrationHeader";
import CoursesRegistrationActionButtons from "../../../feature/student/courses/courseRegister/CourseRegistrationActionButtons";
import { RegistrationPageSkeleton } from "../../../feature/student/courses/courseRegister/SkeletonLoader";

import {
    fetchActiveCourses,
    fetchClassesForCourse,
    getMyRegistrations,
    registerForCourse,
    unregisterFromCourse,
    fetchRegistrationSettings,
    changeCourseSection,
} from "../../../feature/student/courses/courseRegister/registrationApi";
import { fetchMySchedule } from "../../../feature/student/schedule/scheduleApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';


const ITEMS_PER_PAGE = 3;

export default function CoursesRegistration() {
    const { t, i18n } = useTranslation('student');
    const { isDesktop, isMobile } = useDeviceType();
    const { convert: ar } = useArabicDigits();

    const mapRegistrationToCard = (reg) => {
        const fmt = (t) => t && formatTimeOption(t);
        const scheduleParts = [reg.day, reg.startTime && reg.endTime ? `${fmt(reg.startTime)} - ${fmt(reg.endTime)}` : ""].filter(Boolean);
        return {
            id:          getLocalizedField(reg, 'courseCode', i18n.language) ?? reg.courseCode  ?? reg.code ?? reg.courseId ?? "",
            title:       getLocalizedField(reg, 'courseName', i18n.language)  ?? "",
            code:        getLocalizedField(reg, 'courseCode', i18n.language) ?? reg.courseCode  ?? reg.code ?? "",
            creditHours: reg.creditHours ?? "",
            professor:   getLocalizedField(reg, 'professorName', i18n.language) ?? getLocalizedField(reg, 'instructorName', i18n.language) ?? reg.professorName ?? reg.professor ?? "",
            avatar:      reg.professorAvatar ?? reg.instructorAvatar ?? reg.avatar ?? null,
            schedule:    getLocalizedField(reg, 'schedule', i18n.language) ?? reg.schedule ?? scheduleParts.join(" ") ?? "",
            room:        getLocalizedField(reg, 'room', i18n.language) ?? reg.roomAr ?? reg.room ?? "",
            courseId:     reg.courseId,
            classId:      reg.classId,
            isProject:    reg.isProject ?? false,
            isElective:   reg.isElective ?? false,
            isRegistered: true,
        };
    };

    const mapActiveCourseToCard = (course) => ({
        id:            getLocalizedField(course, 'courseCode', i18n.language) ?? course.courseCode  ?? course.code ?? course.courseId ?? course.id ?? "",
        title:         getLocalizedField(course, 'courseName', i18n.language)  ?? course.title   ?? "",
        code:          getLocalizedField(course, 'courseCode', i18n.language) ?? course.courseCode  ?? course.code ?? "",
        creditHours:   course.creditHours ?? "",
        professor:     getLocalizedField(course, 'professorName', i18n.language) ?? getLocalizedField(course, 'instructorName', i18n.language) ?? course.professorName ?? course.professor ?? course.instructor ?? "",
        avatar:        course.professorAvatar ?? course.instructorAvatar ?? course.avatar ?? null,
        schedule:      getLocalizedField(course, 'schedule', i18n.language) ?? course.schedule ?? "",
        room:          getLocalizedField(course, 'room', i18n.language) ?? course.room ?? "",
        preRequisites: course.prerequisites ?? course.preRequisites ?? null,
        courseId:       course.courseId    ?? course.id,
        classId:       course.classId,
        isElective:    course.isElective ?? false,
        isProject:     course.isProject ?? false,
        isRegistered: false,
    });

        /* ── Time utilities ── */
        function parseTimeToMinutes(timeStr) {
            if (!timeStr) return 0;
            if (typeof timeStr === 'object') {
                const h = timeStr.hours ?? timeStr.hour ?? 0;
                const m = timeStr.minutes ?? timeStr.minute ?? 0;
                return h * 60 + m;
            }
            const match12 = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
            if (match12) {
                let h = parseInt(match12[1], 10);
                const m = parseInt(match12[2], 10);
                if (match12[3].toUpperCase() === 'PM' && h !== 12) h += 12;
                if (match12[3].toUpperCase() === 'AM' && h === 12) h = 0;
                return h * 60 + m;
            }
            const parts = timeStr.split(':');
            return parseInt(parts[0], 10) * 60 + parseInt(parts[1] || '0', 10);
        }

        function normalizeDay(day) {
            if (day === null || day === undefined) return '';
            if (typeof day === 'number') {
                const dayNames = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
                return dayNames[day] || '';
            }
            if (typeof day !== 'string' || day.length === 0) return '';
            return day.toLowerCase().slice(0, 3);
        }

        function isOverlapping(a, b) {
            const dayA = normalizeDay(a.dayName ?? a.day);
            const dayB = normalizeDay(b.dayName ?? b.day);
            if (dayA !== dayB) return false;
            const sA = parseTimeToMinutes(a.startTime ?? a.start ?? '');
            const eA = parseTimeToMinutes(a.endTime ?? a.end ?? '');
            const sB = parseTimeToMinutes(b.startTime ?? b.start ?? '');
            const eB = parseTimeToMinutes(b.endTime ?? b.end ?? '');
            return sA < eB && sB < eA;
        }

        function formatTimeOption(timeStr) {
            if (!timeStr) return '';
            const parts = timeStr.split(':');
            const h = parseInt(parts[0], 10);
            const m = parts[1] || '00';
            const ampm = h >= 12 ? 'PM' : 'AM';
            const h12 = h % 12 || 12;
            return `${h12.toString().padStart(2, '0')}:${m} ${ampm}`;
        }

        function detectTimeConflicts(registeredEvents, lectures, selectedSection, courseTitle, courseId) {
            const conflicts = [];
            const candidates = [];
            if (lectures?.length) {
                for (const lec of lectures)
                    candidates.push({ type: 'Lecture', courseId, ...lec });
            }
            if (selectedSection) candidates.push({ type: 'Section', courseId, ...selectedSection });

            for (const candidate of candidates) {
                for (const event of registeredEvents) {
                    if (event.courseId === courseId) continue;
                    if (isOverlapping(candidate, event)) {
                        conflicts.push({
                            type: candidate.type,
                            courseTitle,
                            courseId: candidate.courseId,
                            conflictWith: event.title || event.courseName || 'Another course',
                            day: candidate.dayName ?? candidate.day ?? '',
                            time: `${formatTimeOption(candidate.startTime)} – ${formatTimeOption(candidate.endTime)}`,
                        });
                    }
                }
            }
            return conflicts;
        }

    const [locallyAddedCourses, setLocallyAddedCourses] = useState([]);
    const [pendingRemovalIds, setPendingRemovalIds] = useState(new Set());
    const [sectionOptionsByCourseId, setSectionOptionsByCourseId] = useState({});
    const [selectedSectionByCourseId, setSelectedSectionByCourseId] = useState({});
    const [courseClassesData, setCourseClassesData] = useState({});
    const [registrationSettings, setRegistrationSettings] = useState(null);
    const [activeFilter, setActiveFilter] = useState("all");
    const [searchValue, setSearchValue] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [conflicts, setConflicts] = useState([]);
    const [showConflictDialog, setShowConflictDialog] = useState(false);
    const [conflictDialogData, setConflictDialogData] = useState({});
    const { showError } = useError();
    const queryClient = useQueryClient();

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchValue), 400);
        return () => clearTimeout(timer);
    }, [searchValue]);

    const { data: registrationData, isLoading: loading } = useQuery({
        queryKey: ["coursesRegistration", debouncedSearch],
        queryFn: async () => {
            const params = { pageSize: 100, ...(debouncedSearch ? { searchQuery: debouncedSearch } : {}) };
            const [registrationsResult, coursesResult] = await Promise.all([
                getMyRegistrations(),
                fetchActiveCourses(params),
            ]);
            const registrations = registrationsResult?.data ?? (Array.isArray(registrationsResult) ? registrationsResult : []);
            const courses = coursesResult?.data ?? (Array.isArray(coursesResult) ? coursesResult : []);
            return { registrations, courses };
        },
        staleTime: 0,
        placeholderData: keepPreviousData,
    });

    const { data: scheduleData = [], isLoading: schedulePreviewLoading } = useQuery({
        queryKey: ["studentSchedule", "registration"],
        queryFn: fetchMySchedule,
        staleTime: 2 * 60 * 1000,
    });

    const { data: settingsData } = useQuery({
        queryKey: ["registrationSettings"],
        queryFn: fetchRegistrationSettings,
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        if (settingsData) setRegistrationSettings(settingsData);
    }, [settingsData]);

    /* ── Existing registered events for conflict checking ── */
    const existingScheduleEvents = useMemo(() => {
        const events = Array.isArray(scheduleData) ? scheduleData : [];
        return events;
    }, [scheduleData]);

    /* ── Detect conflicts within the existing schedule itself ── */
    const existingScheduleConflicts = useMemo(() => {
        const events = existingScheduleEvents.filter(
            (e) => !pendingRemovalIds.has(e.courseId)
        );
        const raw = [];
        for (let i = 0; i < events.length; i++) {
            for (let j = i + 1; j < events.length; j++) {
                if (events[i].courseId && events[i].courseId === events[j].courseId) continue;
                if (isOverlapping(events[i], events[j])) {
                    raw.push({
                        type: events[i].type || 'Event',
                        courseTitle: events[i].title || events[i].courseName || 'Course',
                        courseId: events[i].courseId || `existing-${i}`,
                        conflictWith: events[j].title || events[j].courseName || 'Another course',
                        day: events[i].day,
                        time: `${formatTimeOption(events[i].startTime)} – ${formatTimeOption(events[i].endTime)}`,
                    });
                }
            }
        }
        const keyOf = (c) => [c.courseTitle, c.conflictWith].sort().join('|') + '|' + (c.day ?? '') + '|' + (c.time ?? '') + '|' + (c.type ?? '');
        return raw.filter((c, idx) => raw.findIndex((c2) => keyOf(c2) === keyOf(c)) === idx);
    }, [existingScheduleEvents, pendingRemovalIds]);

    /* ── Detect time conflicts whenever selected section changes ── */
    useEffect(() => {
        const courseIds = locallyAddedCourses.map(c => c.courseId).filter(Boolean);
        const found = [];

        for (const courseId of courseIds) {
            if (pendingRemovalIds.has(courseId)) continue;
            const course = locallyAddedCourses.find(c => c.courseId === courseId);
            if (!course) continue;

            const classes = courseClassesData[courseId];
            if (!classes) continue;

            const lectures = classes.lectures ?? [];

            const selectedSectionOpt = selectedSectionByCourseId[courseId];
            let selectedSection = null;
            if (selectedSectionOpt && classes.sections?.length > 0) {
                selectedSection = classes.sections.find(
                    s => (s.classId ?? s.id) === selectedSectionOpt.value
                ) ?? null;
            }

            /* ── Build pending events from other locally-added courses ── */
            const otherPendingEvents = [];
            for (const otherCourse of locallyAddedCourses) {
                if (otherCourse.courseId === courseId) continue;
                if (pendingRemovalIds.has(otherCourse.courseId)) continue;
                const otherClasses = courseClassesData[otherCourse.courseId];
                if (!otherClasses) continue;

                if (otherClasses.lectures?.length) {
                    for (const lec of otherClasses.lectures) {
                        otherPendingEvents.push({
                            ...lec,
                            title: otherCourse.title,
                            courseName: otherCourse.title,
                            courseId: otherCourse.courseId,
                        });
                    }
                }

                const otherSectionOpt = selectedSectionByCourseId[otherCourse.courseId];
                if (otherSectionOpt && otherClasses.sections?.length > 0) {
                    const otherSection = otherClasses.sections.find(
                        s => (s.classId ?? s.id) === otherSectionOpt.value
                    );
                    if (otherSection) {
                        otherPendingEvents.push({
                            ...otherSection,
                            title: otherCourse.title,
                            courseName: otherCourse.title,
                            courseId: otherCourse.courseId,
                        });
                    }
                }
            }

            const filteredExisting = existingScheduleEvents.filter(
                e => !pendingRemovalIds.has(e.courseId)
            );
            const courseConflicts = detectTimeConflicts(
                [...filteredExisting, ...otherPendingEvents],
                lectures,
                selectedSection,
                course.title,
                courseId
            );
            found.push(...courseConflicts);
        }

        setConflicts(found);
    }, [selectedSectionByCourseId, locallyAddedCourses, courseClassesData, existingScheduleEvents, pendingRemovalIds]);

    const allConflicts = useMemo(() => {
        return [...existingScheduleConflicts, ...conflicts];
    }, [existingScheduleConflicts, conflicts]);

    const selectedCourses = useMemo(() => {
        const serverSelected = (registrationData?.registrations || []).map(mapRegistrationToCard);
        return [...serverSelected, ...locallyAddedCourses];
    }, [registrationData, locallyAddedCourses, i18n.language]);

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
    }, [registrationData, locallyAddedCourses, activeFilter, i18n.language]);

    const [selectedCoursesPage, setSelectedCoursesPage]   = useState(1);
    const [availableCoursesPage, setAvailableCoursesPage] = useState(1);

    const [showResultDialog, setShowResultDialog]   = useState(false);
    const [resultDialogVariant, setResultDialogVariant] = useState("success");
    const [resultDialogMessage, setResultDialogMessage] = useState("");
    const [scheduleOpen, setScheduleOpen] = useState(false);
    const schedulePreview = Array.isArray(scheduleData) ? scheduleData : [];

    const mergedSchedulePreview = useMemo(() => {
        const serverEvents = Array.isArray(scheduleData)
            ? scheduleData
                .filter(e => !pendingRemovalIds.has(e.courseId))
                .map(e => ({
                      ...e,
                      instructor: e.instructorName ?? e.instructor ?? "",
                  }))
            : [];
        const pendingEvents = [];

        locallyAddedCourses.forEach((course) => {
            const classes = courseClassesData[course.courseId];
            if (!classes) return;

            const toDayKey = (dayStr) => {
                if (!dayStr) return null;
                const d = dayStr.toLowerCase().slice(0, 3);
                return d === "sat" ? "sat" : d === "sun" ? "sun" : d === "mon" ? "mon"
                    : d === "tue" ? "tue" : d === "wed" ? "wed" : d === "thu" ? "thu"
                    : d === "fri" ? "fri" : d;
            };

            const formatTime = (time) => {
                if (!time) return null;
                if (typeof time === "object") {
                    const h = time.hours ?? time.hour ?? 0;
                    const m = time.minutes ?? time.minute ?? 0;
                    const period = h >= 12 ? "PM" : "AM";
                    const hour12 = h === 0 ? 12 : h > 12 ? h - 12 : h;
                    return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${period}`;
                }
                const parts = String(time).split(':');
                const h = parseInt(parts[0], 10);
                const m = parts[1] || '00';
                const period = h >= 12 ? 'PM' : 'AM';
                const hour12 = h % 12 || 12;
                return `${hour12.toString().padStart(2, "0")}:${m} ${period}`;
            };

            if (classes.lectures?.length) {
                for (const lec of classes.lectures) {
                    const dayKey = toDayKey(lec.dayName ?? lec.day ?? "");
                    if (dayKey) {
                        pendingEvents.push({
                            day: dayKey,
                            startTime: formatTime(lec.startTime),
                            endTime: formatTime(lec.endTime),
                            title: course.title,
                            location: lec.roomName ?? lec.room ?? "",
                            type: "lecture",
                            instructor: lec.instructorName ?? "",
                        });
                    }
                }
            }

            const selectedSectionOpt = selectedSectionByCourseId[course.courseId];
            if (selectedSectionOpt) {
                const sectionClass = classes.sections.find((s) => (s.classId ?? s.id) === selectedSectionOpt.value);
                if (sectionClass) {
                    const dayKey = toDayKey(sectionClass.dayName ?? sectionClass.day ?? "");
                    if (dayKey) {
                        pendingEvents.push({
                            day: dayKey,
                            startTime: formatTime(sectionClass.startTime),
                            endTime: formatTime(sectionClass.endTime),
                            title: course.title,
                            location: sectionClass.roomName ?? sectionClass.room ?? "",
                            type: "section",
                            instructor: sectionClass.instructorName ?? "",
                        });
                    }
                }
            }
        });

        return [...serverEvents, ...pendingEvents];
    }, [scheduleData, locallyAddedCourses, courseClassesData, selectedSectionByCourseId, pendingRemovalIds]);

    const selectedCredits = selectedCourses
        .filter(c => !pendingRemovalIds.has(c.courseId))
        .reduce(
            (sum, c) => sum + (typeof c.creditHours === 'number' ? c.creditHours : 0),
            0
        );

    /* ── Load sections & class data for selected courses ── */
    useEffect(() => {
        let isMounted = true;

        async function loadSections() {
            const projectCourseIds = new Set(
                selectedCourses.filter(c => c.isProject).map(c => c.courseId).filter(Boolean)
            );
            const courseIds = selectedCourses
                .map((c) => c.courseId)
                .filter((id) => id !== undefined && id !== null && !projectCourseIds.has(id));

            if (courseIds.length === 0) {
                setSectionOptionsByCourseId({});
                setCourseClassesData({});
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
                        const lectures = list.filter((cls) => {
                            const type = (cls.classTypeName ?? cls.classType ?? cls.type ?? "").toString().toLowerCase();
                            return type === "lecture";
                        });

                        const options = sections.map((cls) => {
                            const day = cls.dayName ?? "";
                            const start = formatTimeOption(cls.startTime);
                            const end = formatTimeOption(cls.endTime);
                            const room = cls.roomName ?? cls.room ?? "";
                            const taName = cls.instructorName ?? cls.taName ?? "";
                            const classId = cls.classId ?? cls.id ?? "";
                            const timeStr = start && end ? `${start}–${end}` : "";
                            const scheduleStr = [day, timeStr].filter(Boolean).join(" ");
                            const label = `${scheduleStr} — ${room}${taName ? ` (${taName})` : ""}`;
                            return {
                                value: classId,
                                label,
                            };
                        });

                        return { courseId, options, lectures, sections, allClasses: list };
                    })
                );

                if (!isMounted) return;

                const optionsMap = {};
                const classesMap = {};
                results.forEach(({ courseId, options, lectures, sections, allClasses }) => {
                    optionsMap[courseId] = options;
                    classesMap[courseId] = { lectures, sections, allClasses };
                });

                setSectionOptionsByCourseId(optionsMap);
                setCourseClassesData(classesMap);

                setSelectedSectionByCourseId((prev) => {
                    const next = { ...prev };
                    selectedCourses.forEach((course) => {
                        if (course.isProject) {
                            next[course.courseId] = null;
                            return;
                        }
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

    /* ── Section change handler with conflict side-effect (useEffect) ── */
    const handleSectionChange = (courseId, option) => {
        setSelectedSectionByCourseId((prev) => ({
            ...prev,
            [courseId]: option,
        }));
    };

    /* ── Register / Unregister handlers ── */
    const handleRegister = (course) => {
        setLocallyAddedCourses((prev) => {
            if (prev.some((c) => c.courseId === course.courseId)) return prev;
            return [...prev, { ...course, isRegistered: false }];
        });
        if (course.isProject) {
            setSelectedSectionByCourseId((prev) => ({
                ...prev,
                [course.courseId]: null,
            }));
        }
    };

    const togglePendingRemoval = (courseId) => {
        setPendingRemovalIds((prev) => {
            const next = new Set(prev);
            if (next.has(courseId)) {
                next.delete(courseId);
            } else {
                next.add(courseId);
            }
            return next;
        });
    };

    const handleUnregister = (course) => {
        togglePendingRemoval(course.courseId);
    };

    const handleConfirmRegistration = async () => {
        const activeCourses = selectedCourses.filter((c) => !pendingRemovalIds.has(c.courseId));
        const pending = activeCourses.filter((c) => !c.isRegistered);
        const coursesToRemove = selectedCourses.filter((c) => c.isRegistered && pendingRemovalIds.has(c.courseId));
        if (pending.length === 0 && activeCourses.length === 0 && coursesToRemove.length === 0) return;

        for (const course of pending) {
            if (course.isProject) continue;
            const section = selectedSectionByCourseId[course.courseId];
            if (!section?.value) {
                showError(t('registration.selectSection', { title: course.title }));
                return;
            }
        }

        const pendingCourseIds = new Set(pending.map(c => c.courseId));
        const relevantConflicts = allConflicts.filter(
            c => pendingCourseIds.has(c.courseId) || pending.some(p => p.title === c.conflictWith)
        );
        if (pending.length > 0 && relevantConflicts.length > 0) {
            setConflictDialogData({
                message: `Cannot confirm registration due to time conflict${relevantConflicts.length > 1 ? 's' : ''}.`,
                conflicts: [...relevantConflicts],
            });
            setShowConflictDialog(true);
            return;
        }

        const settings = registrationSettings;
        if (settings) {
            const totalCredits = activeCourses.reduce(
                (sum, c) => sum + (typeof c.creditHours === 'number' ? c.creditHours : 0),
                0
            );
            const isSummer = settings.semester?.toLowerCase().startsWith("summer") ?? false;
            if (settings.effectiveMaxCreditHours != null && totalCredits > settings.effectiveMaxCreditHours) {
                showError(`Total credits (${totalCredits}) exceed the maximum of ${settings.effectiveMaxCreditHours}.`);
                return;
            }
            if (!isSummer && settings.minCreditHoursPerSemester != null && totalCredits < settings.minCreditHoursPerSemester) {
                showError(`Total credits (${totalCredits}) are below the minimum of ${settings.minCreditHoursPerSemester}.`);
                return;
            }
            if (settings.isOnProbation) {
                if (settings.probationRegistrationLimit != null && totalCredits > settings.probationRegistrationLimit) {
                    showError(`You are on academic probation (GPA: ${settings.currentGpa?.toFixed(2)}). Maximum credits limited to ${settings.probationRegistrationLimit}.`);
                    return;
                }
            }
        }

        const successMsgs = [];
        const failureMsgs = [];

        for (const course of pending) {
            const section = course.isProject ? null : selectedSectionByCourseId[course.courseId];
            try {
            await registerForCourse(course.courseId, section?.value ?? null);
                successMsgs.push(t('registration.registerSuccess', { title: course.title }));
            } catch (err) {
                const msg = err?.message || err?.toString() || "Unknown error";
                failureMsgs.push(t('registration.registerError', { title: course.title }) + `: ${msg}`);
            }
        }

        const registeredCourses = activeCourses.filter((c) => c.isRegistered);
        for (const course of registeredCourses) {
            if (course.isProject) continue;
            const newSection = selectedSectionByCourseId[course.courseId];
            if (newSection && newSection.value !== course.classId) {
                try {
                    await changeCourseSection(course.courseId, newSection.value);
                    successMsgs.push(`Changed section for ${course.title}`);
                } catch (err) {
                    const msg = err?.message || err?.toString() || "Unknown error";
                    failureMsgs.push(`Failed to change section for ${course.title}: ${msg}`);
                }
            }
        }

        /* ── Process pending removals ── */
        for (const course of coursesToRemove) {
            try {
                await unregisterFromCourse(course.courseId);
                successMsgs.push(`Removed ${course.title}`);
            } catch (err) {
                const msg = err?.message || err?.toString() || "Unknown error";
                failureMsgs.push(`Failed to remove ${course.title}: ${msg}`);
            }
        }

        setLocallyAddedCourses([]);
        setPendingRemovalIds(new Set());
        await queryClient.invalidateQueries({ queryKey: ["coursesRegistration"] });
        await queryClient.invalidateQueries({ queryKey: ["studentSchedule", "registration"] });

        if (failureMsgs.length === 0 && successMsgs.length === 0) {
            setResultDialogVariant("info");
            setResultDialogMessage("No changes were made.");
        } else if (failureMsgs.length === 0) {
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
                pendingRemovalIds={pendingRemovalIds}
                activeFilter={activeFilter}
                onFilterChange={setActiveFilter}
                searchValue={searchValue}
                onSearchChange={setSearchValue}
                registrationSettings={registrationSettings}
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
                            <span className="text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">{ar(availableCourses.length)}</span>
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
                            <span className="text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">{ar(selectedCredits)}</span>
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
                                            handleSectionChange(course.courseId, opt)
                                        }
                                        conflicts={allConflicts.filter(c => c.courseId === course.courseId)}
                                        isPendingRemoval={pendingRemovalIds.has(course.courseId)}
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
                                <WeeklyScheduleAgenda days={days} schedule={mergedSchedulePreview} variant="default" />
                            ) : (
                                <WeeklySchedule schedule={mergedSchedulePreview} />
                            )}
                        </div>
                    )}
                </div>

                {/* Bottom action bar */}
                <div className="flex flex-col gap-4 border-t-2 border-border-primary-default-light dark:border-border-primary-default-dark pt-6">
                    {allConflicts.length > 0 && (
                        <div className="flex items-start gap-3 p-4 rounded-lg bg-bg-surface-danger-default-light dark:bg-bg-surface-danger-default-dark border border-border-danger-default-light dark:border-border-danger-default-dark">
                            <WarningIcon className="w-5 h-5 text-text-danger-default-light dark:text-text-danger-default-dark shrink-0 mt-0.5" />
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-text-danger-default-light dark:text-text-danger-default-dark">
                                    {allConflicts.length} time conflict{allConflicts.length > 1 ? 's' : ''} detected
                                </p>
                                <ul className="mt-1 text-xs text-text-danger-default-light/80 dark:text-text-danger-default-dark/80 space-y-0.5">
                                    {allConflicts.map((c, i) => (
                                        <li key={i}>
                                            {c.courseTitle} {c.type} — overlaps with "{c.conflictWith}" on {c.day} at {c.time}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    )}
                    <div className="flex justify-end">
                        <CoursesRegistrationActionButtons onConfirm={handleConfirmRegistration} />
                    </div>
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

            <Dialog
                isOpen={showConflictDialog}
                variant="error"
                title="Time Conflict Detected"
                onClose={() => setShowConflictDialog(false)}
                confirmText="OK"
            >
                <div className="space-y-3">
                    <p>{conflictDialogData.message}</p>
                    {conflictDialogData.conflicts?.length > 0 && (
                        <ul className="text-left space-y-2 mt-2">
                            {conflictDialogData.conflicts.map((c, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm">
                                    <span className="text-text-danger-default-light dark:text-text-danger-default-dark shrink-0 mt-0.5">•</span>
                                    <span>
                                        <strong>{c.courseTitle}</strong> ({c.type}) — <strong>{c.day}</strong> at <strong>{c.time}</strong>
                                        <br />
                                        <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                            Conflicts with: {c.conflictWith}
                                        </span>
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </Dialog>
        </>
    );
}