import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from 'react-i18next';
import Section from "../../../components/ui/Section";

import MyCourse from "../../../feature/student/courses/myCourses/MyCourse";
import { MyCoursesPageSkeleton } from "../../../feature/student/courses/myCourses/SkeletonLoader";
import useDeviceType from "../../../hooks/useDeviceType";

import { BookIcon } from "../../../components/ui/icons";
import DataBanner from "../../../components/ui/DataBanner";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import MyCoursesHeader from "../../../feature/student/courses/myCourses/MyCoursesHeader";
import { fetchMyStudentCourses } from "../../../feature/course/services/coursesApi";
import { getLocalizedField } from '../../../utils/getLocalizedField';
import useArabicDigits from "../../../hooks/useArabicDigits";

const GRADE_MAP = {
  "A+": "ممتاز مرتفع", "A": "ممتاز", "A-": "ممتاز منخفض",
  "B+": "جيد جداً مرتفع", "B": "جيد جداً", "B-": "جيد جداً منخفض",
  "C+": "جيد مرتفع", "C": "جيد", "C-": "جيد منخفض",
  "D+": "مقبول مرتفع", "D": "مقبول", "D-": "مقبول منخفض",
  "F": "راسب", "N/A": "غير متاح",
};

function toArabicGrade(g, isAr) {
  if (!isAr) return g;
  const clean = String(g).trim().toUpperCase();
  return GRADE_MAP[clean] || g;
}

export default function MyCourses() {
    const { t, i18n } = useTranslation('student');
    const { convert: ar } = useArabicDigits();
    const { isMobile } = useDeviceType();
    const navigate = useNavigate();

    const mapCourseToMyCourseProps = (course) => {
        const initials = (getLocalizedField(course, 'departmentName', i18n.language) || getLocalizedField(course, 'courseCode', i18n.language) || course.courseCode || "")
            .split(" ")
            .map(w => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "CS";

        const type = course.isElective ? "elective" : "mandatory";
        const status = course.studentCourseStatusName === "Completed" ? "completed" : "in-progress";

        const isAr = i18n.language === 'ar';
        let attendanceValue = isAr ? "٠%" : "0%";
        let attendanceStatus = "good";
        if (course.attendance != null) {
            attendanceValue = `${ar(Math.round(course.attendance))}%`;
            attendanceStatus = course.attendance >= 75 ? "good" : course.attendance >= 50 ? "warning" : "risk";
        }

        let gradeValue = "—";
        if (course.grade != null) {
            if (typeof course.grade === "number") {
                gradeValue = `${ar(Math.round(course.grade))}%`;
            } else {
                gradeValue = toArabicGrade(String(course.grade), isAr);
            }
        }
        const section = getLocalizedField(course, 'className', i18n.language) || course.classNameAr || course.className || "";
        const creditHours = course.creditHours || 0;

        return {
            courseId: course.courseId,
            initials,
            code: getLocalizedField(course, 'courseCode', i18n.language) || course.courseCode || "",
            semester: getLocalizedField(course, 'semester', i18n.language) || course.semester || "",
            type,
            status,
            title: getLocalizedField(course, 'courseName', i18n.language) || "",
            instructor: getLocalizedField(course, 'professorName', i18n.language) || getLocalizedField(course, 'instructorName', i18n.language) || course.professorName || "",
            room: getLocalizedField(course, 'room', i18n.language) || course.roomAr || course.room || "",
            attendance: { value: attendanceValue, status: attendanceStatus },
            section,
            grade: gradeValue,
            creditHours,
        };
    };

    const PAGE_SIZE = 6;
    const [page, setPage] = useState(1);

    const [viewMode, setViewMode] = useState(() => {
        return isMobile ? "list" : localStorage.getItem("myCoursesViewMode") || "grid";
    });
    const [filterStatus, setFilterStatus] = useState([]);
    const [filterType, setFilterType] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => {
            setSearchQuery(searchInput);
        }, 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const backendStatus =
        filterStatus.length === 1
            ? filterStatus[0] === "in-progress"
                ? "inprogress"
                : filterStatus[0]
            : null;

    const {
        data: rawCourses = [],
        isLoading: loading,
        isFetching,
    } = useQuery({
        queryKey: ["myCourses", backendStatus, searchQuery],
        queryFn: async () => {
            const result = await fetchMyStudentCourses(backendStatus, 1, 100, searchQuery);
            const raw = result?.data ?? (Array.isArray(result) ? result : []);
            return raw;
        },
        staleTime: 2 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const courses = useMemo(
        () => (Array.isArray(rawCourses) ? rawCourses.map(mapCourseToMyCourseProps) : []),
        [rawCourses, i18n.language]
    );

    useEffect(() => {
        localStorage.setItem("myCoursesViewMode", viewMode);
    }, [viewMode]);

    // Apply filters
    const filteredCourses = useMemo(() => courses.filter(c => {
        if (filterStatus.length > 0 && !filterStatus.includes(c.status)) return false;
        if (filterType.length > 0 && !filterType.includes(c.type)) return false;
        return true;
    }), [courses, filterStatus, filterType]);

    // Reset page when filters change
    useEffect(() => {
        setPage(1);
    }, [filterStatus, filterType, searchQuery]);

    const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, filteredCourses.length);
    const paginatedCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    const handleEnterClassroom = useCallback((courseId) => {
        navigate(`/courses/${courseId}`);
    }, [navigate]);

    const handleViewMaterials = useCallback((courseId) => {
        navigate(`/courses/${courseId}/materials`);
    }, [navigate]);

    // Compute stats from filtered data
    const activeCourses = filteredCourses.filter(c => c.status === "in-progress");
    const inactiveCourses = filteredCourses.filter(c => c.status !== "in-progress");
    const totalHours = filteredCourses.reduce((sum, c) => sum + (c.creditHours || 0), 0);

    const stats = [
        { label: t('myCourses.totalCourses'), value: filteredCourses.length },
        { label: t('myCourses.active'), value: activeCourses.length },
        { label: t('myCourses.completedCourses'), value: inactiveCourses.length },
        { label: t('myCourses.totalHours'), value: totalHours },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-160px)]">
            <MyCoursesHeader
                isMobile={isMobile}
                viewMode={viewMode}
                setViewMode={setViewMode}
                filterStatus={filterStatus}
                setFilterStatus={setFilterStatus}
                filterType={filterType}
                setFilterType={setFilterType}
                searchQuery={searchInput}
                setSearchQuery={setSearchInput}
                hasCourses={true}
            />

            <div className="flex flex-col flex-1">
                {filteredCourses.length > 0 && (
                    <Section className="hidden md:grid grid-cols-4 gap-6 mb-6">
                        <DataBanner
                            title={t('myCourses.statistics')}
                            data={stats}
                        />
                    </Section>
                )}

                {loading && <MyCoursesPageSkeleton viewMode={viewMode} />}

                {!loading && filteredCourses.length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 text-center">
                        <BookIcon className="w-12 h-12 mb-4 opacity-40 text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
                        <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                            {courses.length === 0 ? t('myCourses.noEnrolled') : t('myCourses.noMatch')}
                        </h3>
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md">
                            {courses.length === 0
                                ? t('myCourses.notEnrolledDesc')
                                : t('myCourses.adjustFilters')}
                        </p>
                    </div>
                )}

                {!loading && paginatedCourses.length > 0 && (
                    <Section className={`flex-1 ${viewMode === "grid" ? "grid grid-cols-2 gap-4 content-start" : "flex flex-col gap-4"}`}>
                        {paginatedCourses.map((course) => (
                            <MyCourse key={course.courseId} {...course} onEnterClassroom={() => handleEnterClassroom(course.courseId)} onViewMaterials={() => handleViewMaterials(course.courseId)} />
                        ))}
                    </Section>
                )}

                {!loading && totalPages > 1 && (
                    <Section className="mt-auto mb-6">
                        <PaginationButtons
                            totalPages={totalPages}
                            currentPage={page}
                            setCurrentPage={setPage}
                            {...(!isMobile ? { from, to, total: filteredCourses.length, label: t('myCourses.courses') } : {})}
                        />
                    </Section>
                )}
            </div>
        </div>
    );
}
