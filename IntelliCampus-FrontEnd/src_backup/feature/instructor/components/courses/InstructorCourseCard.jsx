import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  BookIcon,
  FilePenIcon,
  ClipboardCheckIcon,
  UserCheckIcon,
  ChartBarIcon,
  ChartLineIcon,
  UsersIcon,
  UsersPlusIcon,
  VideoIcon,
  DoorOpenIcon,
  LocationDotIcon,
} from "../../../../components/ui/icons";

export default function InstructorCourseCard({
  courseId,
  initials = "CS",
  code = "CS301-A",
  semester = "",
  type = "elective",
  title = "Course",
  room = "",
  totalStudents,
  onEnterClassroom,
}) {
  const { t } = useTranslation('instructor');
  const navigate = useNavigate();

  const typeStyles = {
    elective: {
      label: t('courses.elective'),
      avatar: "bg-bg-surface-purple-default-light text-text-purple-default-light dark:bg-bg-surface-purple-default-dark dark:text-text-purple-default-dark",
      badge: "bg-bg-surface-purple-default-light text-text-purple-default-light border-purple-300 dark:bg-bg-surface-purple-default-dark dark:text-text-purple-default-dark dark:border-purple-800",
      classroom: "bg-purple-600 hover:bg-purple-700 text-white",
    },
    core: {
      label: t('courses.core'),
      avatar: "bg-bg-surface-blue-default-light text-text-blue-default-light dark:bg-bg-surface-blue-default-dark dark:text-text-blue-default-dark",
      badge: "bg-bg-surface-blue-default-light text-text-blue-default-light border-blue-300 dark:bg-bg-surface-blue-default-dark dark:text-text-blue-default-dark dark:border-blue-800",
      classroom: "bg-blue-600 hover:bg-blue-700 text-white",
    },
  };

  const typeAccent = typeStyles[type] || typeStyles.elective;

  const quickLinks = [
    { label: t('courses.analytics'), icon: ChartLineIcon, path: `/instructor/courses/${courseId}/analytics` },
    { label: t('courses.materials'), icon: BookIcon, path: `/instructor/courses/${courseId}/materials` },
    { label: t('courses.assignments'), icon: FilePenIcon, path: `/instructor/courses/${courseId}/assignments` },
    { label: t('courses.quizzes'), icon: ClipboardCheckIcon, path: `/instructor/courses/${courseId}/quizzes` },
    { label: t('courses.attendance'), icon: UserCheckIcon, path: `/instructor/courses/${courseId}/attendance` },
    { label: t('courses.grades'), icon: ChartBarIcon, path: `/instructor/courses/${courseId}/grades` },
    { label: t('courses.studyGroup'), icon: UsersPlusIcon, path: `/instructor/courses/${courseId}/community` },
    { label: t('courses.meeting'), icon: VideoIcon, path: `/instructor/courses/${courseId}/meeting` },
  ];

  return (
    <div className="group w-full rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark shadow-md shadow-shadow-light/40 dark:shadow-shadow-dark/20 hover:shadow-lg hover:shadow-shadow-light/50 dark:hover:shadow-shadow-dark/30 transition-shadow duration-300 overflow-hidden">
      <div className="p-4 sm:p-5">
        {/* Header: Avatar + Info + Classroom */}
        <div className="flex items-start gap-3 sm:gap-4">
          {/* Avatar */}
          <div
            className={`hidden sm:flex w-12 h-12 rounded-xl items-center justify-center font-bold text-lg flex-shrink-0 ${typeAccent.avatar}`}
          >
            {initials}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            {/* Badges row */}
            <div className="flex flex-wrap items-center gap-2 mb-1.5">
              <span className={`px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border ${typeAccent.badge}`}>
                {typeAccent.label}
              </span>
              <span className="px-2.5 py-0.5 rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-xs font-semibold">
                {code}
              </span>
              {semester && (
                <span className="text-text-tertiary-default-light dark:text-text-tertiary-default-dark text-xs">
                  {semester}
                </span>
              )}
            </div>

            {/* Title */}
            <h2 className="text-base sm:text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark truncate mb-2">
              {title}
            </h2>

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
              {room && (
                <div className="flex items-center gap-1.5">
                  <LocationDotIcon className="w-3.5 h-3.5" />
                  <span>{room}</span>
                </div>
              )}
              {totalStudents != null && (
                <div className="flex items-center gap-1.5">
                  <UsersIcon className="w-3.5 h-3.5" />
                  <span>{t('courses.studentCount', { count: totalStudents })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Desktop Classroom button */}
          <button
            type="button"
            onClick={onEnterClassroom}
            className={`hidden sm:flex items-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-xl whitespace-nowrap transition-all active:scale-[0.98] ${typeAccent.classroom}`}
          >
            <DoorOpenIcon className="w-4 h-4" />
            {t('courses.classroom')}
          </button>
        </div>

        {/* Quick links grid */}
        <div className="grid grid-cols-4 gap-1.5 sm:gap-2 mt-4 pt-4 border-t border-border-tertiary-default-light dark:border-border-tertiary-default-dark">
          {quickLinks.map((link) => {
            const Icon = link.icon;
            return (
              <button
                key={link.path}
                type="button"
                onClick={() => navigate(link.path)}
                title={link.label}
                className="flex flex-col items-center gap-1 p-2 sm:p-2.5 rounded-xl text-text-secondary-default-light dark:text-text-secondary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark border border-transparent hover:border-border-primary-default-light dark:hover:border-border-primary-default-dark transition-all"
              >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="text-[10px] sm:text-xs font-medium leading-tight text-center">{link.label}</span>
              </button>
            );
          })}
        </div>

        {/* Mobile Classroom button */}
        <div className="sm:hidden mt-4">
          <button
            type="button"
            onClick={onEnterClassroom}
            className={`w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-semibold rounded-xl transition-all active:scale-[0.98] ${typeAccent.classroom}`}
          >
            <DoorOpenIcon className="w-4 h-4" />
            {t('courses.enterClassroom')}
          </button>
        </div>
      </div>
    </div>
  );
}
