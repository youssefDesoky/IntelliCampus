import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
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


function mapCourseToMyCourseProps(course) {
    const initials = (course.departmentName || course.courseCode || "")
        .split(" ")
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "CS";

    const type = course.isElective ? "elective" : "mandatory";
    const status = course.studentCourseStatusName === "Completed" ? "completed" : "in-progress";

    let attendanceValue = "0%";
    let attendanceStatus = "good";
    if (course.attendance != null) {
        attendanceValue = `${Math.round(course.attendance)}%`;
        attendanceStatus = course.attendance >= 75 ? "good" : course.attendance >= 50 ? "warning" : "risk";
    }

    const gradeValue = course.grade != null
        ? typeof course.grade === "number"
            ? `${Math.round(course.grade)}%`
            : String(course.grade)
        : "—";
    const section = course.className || "";
    const creditHours = course.creditHours || 0;

    return {
        courseId: course.courseId,
        initials,
        code: course.courseCode || "",
        semester: course.semester || "",
        type,
        status,
        title: course.courseName || "",
        instructor: course.professorName || "",
        room: course.room || "",
        attendance: { value: attendanceValue, status: attendanceStatus },
        section,
        grade: gradeValue,
        creditHours,
    };
}

export default function MyCourses() {
    const { t } = useTranslation('student');
    const { isMobile } = useDeviceType();
    const navigate = useNavigate();

    const PAGE_SIZE = 6;
    const [page, setPage] = useState(1);

    const [viewMode, setViewMode] = useState(() => {
        return isMobile ? "list" : localStorage.getItem("myCoursesViewMode") || "grid";
    });
    const [filterStatus, setFilterStatus] = useState([]);
    const [filterType, setFilterType] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");

    const backendStatus =
        filterStatus.length === 1
            ? filterStatus[0] === "in-progress"
                ? "inprogress"
                : filterStatus[0]
            : null;

    const {
        data: courses = [],
        isLoading: loading,
    } = useQuery({
        queryKey: ["myCourses", backendStatus],
        queryFn: async () => {
            const result = await fetchMyStudentCourses(backendStatus, 1, 100);
            const raw = result?.data ?? (Array.isArray(result) ? result : []);
            return raw.map(mapCourseToMyCourseProps);
        },
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        localStorage.setItem("myCoursesViewMode", viewMode);
    }, [viewMode]);

    // Apply filters
    const filteredCourses = courses.filter(c => {
        if (filterStatus.length > 0 && !filterStatus.includes(c.status)) return false;
        if (filterType.length > 0 && !filterType.includes(c.type)) return false;
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            const match =
                c.title.toLowerCase().includes(q) ||
                c.code.toLowerCase().includes(q) ||
                c.instructor.toLowerCase().includes(q);
            if (!match) return false;
        }
        return true;
    });

    // Reset page when filters or search change
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
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                hasCourses={courses.length > 0}
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
                            {...(!isMobile ? { from, to, total: filteredCourses.length, label: "courses" } : {})}
                        />
                    </Section>
                )}
            </div>
        </div>
    );
}
