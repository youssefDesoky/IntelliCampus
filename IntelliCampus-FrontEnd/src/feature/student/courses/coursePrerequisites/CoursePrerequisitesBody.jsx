import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { FileSlashIcon } from "../../../../components/ui/icons";
import Section from "../../../../components/ui/Section";
import CoursePrerequisitesCard from "./CoursePrerequisitesCard";
import { PrereqPageSkeleton } from "./SkeletonLoader";
import { fetchCoursePrerequisites } from "../../services/profileApi";
import { getLocalizedField } from '../../../../utils/getLocalizedField';

export default function CoursePrerequisitesBody({ search = "" }) {
    const { t, i18n } = useTranslation('student');
    const [debouncedSearch, setDebouncedSearch] = useState("");

    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(search), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const { data: courseData = [], isLoading: loading, error } = useQuery({
        queryKey: ["coursePrerequisites", debouncedSearch],
        queryFn: async () => {
            const params = debouncedSearch ? { searchQuery: debouncedSearch, PageSize: 500 } : { PageSize: 500 };
            const data = await fetchCoursePrerequisites(params);
            const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
            return list.map((course) => ({
                id: course.courseId,
                title: getLocalizedField(course, 'courseName', i18n.language) || "",
                code: getLocalizedField(course, 'courseCode', i18n.language) || course.courseCode || "",
                creditHours: course.creditHours || "",
                isElective: course.isElective ?? false,
                prerequisites: (course.prerequisites || []).map((p) => ({
                    id: getLocalizedField(p, 'code', i18n.language) || p.code || "",
                    title: getLocalizedField(p, 'title', i18n.language) || p.title || "",
                })),
            }));
        },
        staleTime: 10 * 60 * 1000,
        placeholderData: keepPreviousData,
    });

    if (loading) {
        return (
            <Section>
                <PrereqPageSkeleton />
            </Section>
        );
    }

    return (
        <Section className="flex flex-col h-full">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {courseData.map((course) => (
                    <CoursePrerequisitesCard key={course.id} course={course} />
                ))}
            </div>

            {courseData.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                    <FileSlashIcon className="w-12 h-12 mb-4 opacity-40" />
                    <p className="text-sm">{search.trim() ? t('prerequisites.noSearchMatch') : t('prerequisites.noData')}</p>
                </div>
            )}
        </Section>
    );
}
