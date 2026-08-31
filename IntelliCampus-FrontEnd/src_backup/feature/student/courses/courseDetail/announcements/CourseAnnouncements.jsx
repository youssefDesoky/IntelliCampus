import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, useRouteLoaderData } from "react-router-dom";

import { fetchCourseAnnouncements } from "../../../../course/components/announcements";
import CourseAnnouncementCard from "../../../../course/components/announcements/CourseAnnouncementCard";
import { CourseAnnouncementsSkeleton } from "./SkeletonLoader";

export default function CourseAnnouncements() {
    const { t } = useTranslation('student');
    const user = useRouteLoaderData("root");
    const outletContext = useOutletContext();
    const courseId = outletContext?.courseId;
    const { data: announcements = [], isLoading: loading } = useQuery({
        queryKey: ["courseAnnouncements", courseId],
        queryFn: () => fetchCourseAnnouncements(courseId),
        staleTime: 5 * 60 * 1000,
        enabled: !!courseId,
        select: (data) => {
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            return [];
        },
    });

    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return new Date(b.date) - new Date(a.date);
        }
        return a.isPinned ? -1 : 1;
    });

    if (loading) {
        return <CourseAnnouncementsSkeleton />;
    }

    if (announcements.length === 0) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('announcements.emptyTitle')}</h3>
                <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    {t('announcements.emptyDesc')}
                </p>
            </div>
        );
    }

	return (
		<div className="space-y-4">
            {sortedAnnouncements.map((announcement) => (
                <CourseAnnouncementCard
                    key={announcement.id}
                    announcement={announcement}
                    currentUser={user}
                    courseId={courseId}
                    userRole="student"
                />
            ))}
        </div>
	);
}