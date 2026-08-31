import { Outlet, useParams, useLocation, useNavigate } from "react-router-dom";
import { useMemo, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import CourseNavBar from "./CourseNavBar";

import Section from "../../../components/ui/Section";
import { 
    BullHornIcon, 
    UsersIcon, 
    FolderOpenIconDark, 
    UserCheckIcon, 
    ChartBarIcon, 
    FilePenIcon, 
    BrainIcon,
    StickyNoteIcon,
    VideoIcon,
    ChartLineIcon,
    ArrowRightIcon,
    CalendarDaysIcon,
    UserIcon,
    ClockIcon,
} from "../../../components/ui/icons";
import { CourseShellSkeleton } from "./SkeletonLoader";
import { fetchCourseMaterialsOrganized } from "../services/materialsApi";
import { fetchCourseById } from "../services/coursesApi";


const links = [
    { to: "", end: true, icon: <BullHornIcon className="w-5 h-5" />, label: "Announcements" },
    { to: "analytics", icon: <ChartLineIcon className="w-5 h-5" />, label: "Analytics" },
    { to: "materials", icon: <FolderOpenIconDark className="w-5 h-5" />, label: "Materials" },
    { to: "assignments", icon: <FilePenIcon className="w-5 h-5" />, label: "Assignments" },
    { to: "quizzes", icon: <BrainIcon className="w-5 h-5" />, label: "Quizzes" },
    { to: "attendance", icon: <UserCheckIcon className="w-5 h-5" />, label: "Attendance" },
    { to: "grades", icon: <ChartBarIcon className="w-5 h-5" />, label: "Grades" },
    { to: "community", icon: <UsersIcon className="w-5 h-5" />, label: "Study Group" },
    { to: "smart-notes", icon: <StickyNoteIcon className="w-5 h-5" />, label: "Smart Notes" },
    { to: "meeting", icon: <VideoIcon className="w-5 h-5" />, label: "Meeting" },
];

const INSTRUCTOR_HIDE = new Set(["smart-notes"]);
const STUDENT_HIDE = new Set(["analytics"]);

export default function CourseShell() {
    const { courseId } = useParams();
    const location = useLocation();
    const { pathname } = location;
    const navigate = useNavigate();
    const isInstructor = pathname.startsWith("/instructor");

    const queryClient = useQueryClient();
    const searchParams = new URLSearchParams(location.search);
    const folderId = searchParams.get('folderId');

    const { data: materialsData, isLoading: materialsLoading } = useQuery({
        queryKey: ["courseMaterials", courseId, folderId],
        queryFn: () => fetchCourseMaterialsOrganized(courseId, folderId),
        staleTime: 5 * 60 * 1000,
        enabled: !!courseId,
    });

    const { data: courseData, isLoading: courseLoading } = useQuery({
        queryKey: ["courseById", courseId],
        queryFn: () => fetchCourseById(courseId),
        staleTime: 5 * 60 * 1000,
        enabled: !!courseId,
    });

    const isLoading = materialsLoading || courseLoading;

    const refreshMaterials = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ["courseMaterials", courseId] });
        queryClient.invalidateQueries({ queryKey: ["courseById", courseId] });
    }, [queryClient, courseId]);

    // Build the course object for the header and child routes
    const course = {
        id: courseId,
        title: courseData?.courseName || courseData?.title || materialsData?.courseName || `Course ${courseId}`,
        semester: courseData?.semester || "",
        professor: courseData?.professorName || courseData?.instructorName || "",
        progress: materialsData?.progress ?? 0,
        folders: materialsData?.folders || [],
        courseCode: courseData?.courseCode || `CS ${courseId}`,
        creditHours: courseData?.creditHours,
    };

    const visibleLinks = useMemo(
        () => links.filter((l) => isInstructor ? !INSTRUCTOR_HIDE.has(l.to) : !STUDENT_HIDE.has(l.to)),
        [isInstructor]
    );

    if (isLoading) {
        return <CourseShellSkeleton />;
    }

    const initials = course.title
        .split(/[\s\-&]+/)
        .map(w => w[0])
        .join("")
        .toUpperCase()
        .slice(0, 2) || "CS";

    return (
        <>
            <Section>
                {/* Back link */}
                <button
                    type="button"
                    onClick={() => navigate(isInstructor ? "/instructor/courses" : "/courses")}
                    className="flex items-center gap-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark transition-colors mb-4"
                >
                    <ArrowRightIcon size={14} className="rotate-180 rtl:scale-x-[-1]" />
                    All courses
                </button>

                {/* Course Header Card */}
                    <div className="flex items-start gap-4 min-w-0 mb-6">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-xl flex items-center justify-center font-bold text-sm bg-bg-surface-blue-default-light text-text-blue-default-light dark:bg-bg-surface-blue-default-dark dark:text-text-blue-default-dark shrink-0">
                            {initials}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 justify-between flex-nowrap">
                                <div className="flex gap-2 items-center min-w-0">
                                    <h1 className="text-base sm:text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                        {course.title}
                                    </h1>
                                    <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                                        {course.courseCode}
                                    </span>
                                </div>
                                <span className="px-3 py-1 rounded-full text-xs font-semibold bg-bg-surface-green-default-light text-text-green-default-light dark:bg-bg-surface-green-default-dark dark:text-text-green-default-dark">
                                    Active
                                </span>
                            </div>
                            <div className="flex flex-nowrap items-center gap-x-4 gap-y-1 mt-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {course.semester && (
                                    <span className="flex items-center gap-1">
                                        <CalendarDaysIcon className="w-3.5 h-3.5" />
                                        {course.semester}
                                    </span>
                                )}
                                {course.professor && (
                                    <span className="flex items-center gap-1">
                                        <UserIcon className="w-3.5 h-3.5" />
                                        {course.professor}
                                    </span>
                                )}
                                {course.creditHours != null && (
                                    <span className="hidden sm:inline-flex items-center gap-1">
                                        <ClockIcon className="w-3.5 h-3.5" />
                                        {course.creditHours} credit hour{course.creditHours !== 1 ? "s" : ""}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>

                <CourseNavBar links={visibleLinks} />
                <Outlet context={{ course, courseId, refreshMaterials }} />
            </Section>
        </>
    );
}
