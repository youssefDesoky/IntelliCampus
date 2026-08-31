import { useEffect, useState, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import { BookIcon } from "../../../components/ui/icons";
import Section from "../../../components/ui/Section";
import DataBanner from "../../../components/ui/DataBanner";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import useDeviceType from "../../../hooks/useDeviceType";

import InstructorCourseCard from "../../../feature/instructor/components/courses/InstructorCourseCard";
import InstructorCoursesHeader from "../../../feature/instructor/components/courses/InstructorCoursesHeader";
import { fetchMyTeachingCourses } from "../../../feature/course/services/coursesApi";
import { InstructorCoursesSkeleton } from "../../../feature/instructor/SkeletonLoader";
import { getLocalizedField } from '../../../utils/getLocalizedField';


export default function InstructorCourses() {
    const { t, i18n } = useTranslation('instructor');
    const { isMobile } = useDeviceType();
    const navigate = useNavigate();

    const mapCourseToCardProps = (course) => {
        const initials = (getLocalizedField(course, 'departmentName', i18n.language) || getLocalizedField(course, 'courseCode', i18n.language) || course.courseCode || "")
            .split(" ")
            .map(w => w[0])
            .join("")
            .toUpperCase()
            .slice(0, 2) || "CS";

        return {
            courseId: course.courseId,
            initials,
            code: getLocalizedField(course, 'courseCode', i18n.language) || course.courseCode || "",
            semester: getLocalizedField(course, 'semester', i18n.language) || course.semester || "",
            type: course.isElective ? "elective" : "core",
            title: getLocalizedField(course, 'courseName', i18n.language) || "",
            room: getLocalizedField(course, 'room', i18n.language) || course.roomAr || course.room || "",
            totalStudents: course.totalStudents,
            creditHours: course.creditHours,
        };
    };

    const PAGE_SIZE = 6;
    const [page, setPage] = useState(1);

    const [viewMode, setViewMode] = useState(() => {
        return isMobile ? "list" : localStorage.getItem("instructorCoursesViewMode") || "grid";
    });
    const [filterType, setFilterType] = useState([]);
    const [searchInput, setSearchInput] = useState("");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setSearchQuery(searchInput), 300);
        return () => clearTimeout(timer);
    }, [searchInput]);

    const { data: rawCourses = [], isLoading: loading } = useQuery({
        queryKey: ["instructorCourses", searchQuery],
        queryFn: async () => {
            const params = { pageSize: 50 };
            if (searchQuery) params.search = searchQuery;
            const data = await fetchMyTeachingCourses(params);
            return (Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : []);
        },
        staleTime: 5 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    const courses = useMemo(
        () => (Array.isArray(rawCourses) ? rawCourses.map(mapCourseToCardProps) : []),
        [rawCourses, i18n.language]
    );

    useEffect(() => {
        localStorage.setItem("instructorCoursesViewMode", viewMode);
    }, [viewMode]);

    // Client-side filtering
    const filteredCourses = useMemo(() => courses.filter(c => {
        if (filterType.length > 0 && !filterType.includes(c.type)) return false;
        return true;
    }), [courses, filterType]);

    // Pagination
    const totalPages = Math.max(1, Math.ceil(filteredCourses.length / PAGE_SIZE));
    const from = (page - 1) * PAGE_SIZE + 1;
    const to = Math.min(page * PAGE_SIZE, filteredCourses.length);
    const paginatedCourses = filteredCourses.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    useEffect(() => {
        setPage(1);
    }, [filterType, searchQuery]);

    useEffect(() => {
        if (page > totalPages) setPage(1);
    }, [filteredCourses.length, page, totalPages]);

    // Compute stats from filtered data
    const totalHours = filteredCourses.reduce((sum, c) => sum + (c.creditHours || 0), 0);
    const totalStudents = filteredCourses.reduce((sum, c) => sum + (c.totalStudents || 0), 0);

    const handleEnterClassroom = useCallback((courseId) => {
        navigate(`/instructor/courses/${courseId}`);
    }, [navigate]);

    const stats = [
        { label: t('courses.assignedCourses'), value: filteredCourses.length },
        { label: t('courses.totalHours'), value: totalHours },
        { label: t('courses.totalStudents'), value: totalStudents },
    ];

    return (
        <div className="flex flex-col min-h-[calc(100vh-160px)]">
            <InstructorCoursesHeader
                isMobile={isMobile}
                viewMode={viewMode}
                setViewMode={setViewMode}
                searchQuery={searchInput}
                setSearchQuery={setSearchInput}
                filterType={filterType}
                setFilterType={setFilterType}
                hasCourses={true}
            />

            <div className="flex flex-col flex-1">
                {filteredCourses.length > 0 && (
                    <Section className="hidden md:grid grid-cols-3 gap-6 mb-6">
                        <DataBanner
                            title={t('courses.statistics')}
                            data={stats}
                        />
                    </Section>
                )}

                {loading && <InstructorCoursesSkeleton viewMode={viewMode} />}

                {!loading && filteredCourses.length === 0 && (
                    <div className="flex flex-col items-center justify-center flex-1 text-center">
                        <BookIcon className="w-12 h-12 mb-4 opacity-40 text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
                        <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                            {courses.length === 0 ? t('courses.empty') : t('courses.noMatch')}
                        </h3>
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md">
                            {courses.length === 0 ? t('courses.emptyDesc') : t('courses.adjustFilters')}
                        </p>
                    </div>
                )}

                {!loading && paginatedCourses.length > 0 && (
                    <Section className={`flex-1 ${viewMode === "grid" ? "grid grid-cols-2 gap-4 content-start" : "flex flex-col gap-4"}`}>
                        {paginatedCourses.map((course) => (
                            <InstructorCourseCard key={course.courseId} {...course} onEnterClassroom={() => handleEnterClassroom(course.courseId)} />
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