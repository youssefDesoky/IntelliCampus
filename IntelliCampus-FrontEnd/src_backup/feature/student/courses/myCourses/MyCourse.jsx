import {
  CheckIcon,
  StarIcon,
  UsersIcon,
  LocationDotIcon,
  UserIcon,
} from "../../../../components/ui/icons";

import { useTranslation } from 'react-i18next';

const typeStyles = (t) => ({
  elective: {
    label: t('myCourses.electiveLabel'),
    avatar: "bg-bg-surface-purple-default-light text-text-purple-default-light dark:bg-bg-surface-purple-default-dark dark:text-text-purple-default-dark",
    badge: "bg-bg-surface-purple-default-light text-text-purple-default-light border-border-purple-default-light dark:bg-bg-surface-purple-default-dark dark:text-text-purple-default-dark dark:border-border-purple-default-dark",
  },
  mandatory: {
    label: t('myCourses.mandatoryLabel'),
    avatar: "bg-bg-surface-blue-default-light text-text-blue-default-light dark:bg-bg-surface-blue-default-dark dark:text-text-blue-default-dark",
    badge: "bg-bg-surface-blue-default-light text-text-blue-default-light border-border-blue-default-light dark:bg-bg-surface-blue-default-dark dark:text-text-blue-default-dark dark:border-border-blue-default-dark",
  },
});

const statusStyles = {
  "in-progress": "bg-bg-surface-secondary-default-light text-text-secondary-default-light border-border-primary-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-secondary-default-dark dark:border-border-primary-default-dark",
  completed: "bg-bg-surface-green-default-light text-text-green-default-light border-border-green-default-light dark:bg-bg-surface-green-default-dark dark:text-text-green-default-dark dark:border-border-green-default-dark",
};

const attendanceStyles = {
  good: "bg-bg-surface-green-default-light text-text-green-default-light dark:bg-bg-surface-green-default-dark dark:text-text-green-default-dark",
  warning: "bg-bg-surface-amber-default-light text-text-amber-default-light dark:bg-bg-surface-amber-default-dark dark:text-text-amber-default-dark",
  risk: "bg-bg-surface-red-default-light text-text-red-default-light dark:bg-bg-surface-red-default-dark dark:text-text-red-default-dark",
};

function StatusBadge({ label, className }) {
  return (
    <span
      className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border leading-none ${className}`}
    >
      {label}
    </span>
  );
}

function ActionButtons({ onEnterClassroom, onViewMaterials, layout, t }) {
  const isHorizontal = layout === "horizontal";
  return (
    <div
      className={`flex ${isHorizontal ? "flex-row" : "flex-col"} ${isHorizontal ? "gap-2" : "gap-2"} ${isHorizontal ? "w-full" : ""}`}
    >
      <button
        onClick={onEnterClassroom}
        className={`px-4 py-2 text-sm font-semibold rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark whitespace-nowrap transition-opacity hover:opacity-90 ${isHorizontal ? "flex-1" : ""}`}
      >
        {t('myCourses.enterClassroom')}
      </button>
      <button
        onClick={onViewMaterials}
        className={`px-4 py-2 text-sm font-semibold rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark whitespace-nowrap transition-colors hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark ${isHorizontal ? "flex-1" : ""}`}
      >
        {t('myCourses.viewMaterials')}
      </button>
    </div>
  );
}

function Stat({ icon, label, value, iconClass }) {
  return (
    <div className="flex items-center gap-3">
      <div
        className={`w-9 h-9 rounded-full flex items-center justify-center flex-shrink-0 ${iconClass}`}
      >
        {icon}
      </div>
      <div className="flex flex-col">
        <span className="text-[11px] text-text-secondary-default-light dark:text-text-secondary-default-dark leading-none">
          {label}
        </span>
        <span className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark leading-none mt-0.5">
          {value}
        </span>
      </div>
    </div>
  );
}

export default function MyCourse({
  initials = "CS",
  code = "CS301-A",
  semester = "Fall 2025",
  type = "elective",
  status = "in-progress",
  title = "Database Systems",
  instructor = "Dr. Amina Hassan",
  room = "Room B204",
  attendance = { value: "88%", status: "good" },
  section = "A",
  grade = "A-",
  onEnterClassroom,
  onViewMaterials,
}) {
  const { t } = useTranslation('student');
  const typeAccent = typeStyles(t)[type] || typeStyles(t).elective;
  const statusClass = statusStyles[status] || statusStyles["in-progress"];
  const statusLabel = status === "completed" ? t('myCourses.completedStatus') : t('myCourses.inProgress');
  const attClass = attendanceStyles[attendance.status] || attendanceStyles.good;

  return (
    <div className="w-full rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark p-4 sm:p-5 shadow-sm shadow-shadow-light/50 dark:shadow-shadow-dark/30">
      <div className="flex flex-col sm:flex-row gap-4">
        {/* Avatar — hidden on mobile */}
        <div
          className={`hidden sm:flex w-14 h-14 rounded-xl items-center justify-center font-bold text-base flex-shrink-0 ${typeAccent.avatar}`}
        >
          {initials}
        </div>

        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Header row */}
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-xs font-semibold">
                {code}
              </span>
              <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark text-xs">
                {semester}
              </span>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wide border leading-none ${typeAccent.badge}`}>
                {typeAccent.label}
              </span>
            </div>
            {/* Mobile status */}
            <div className="sm:hidden flex items-center">
              <StatusBadge label={statusLabel} className={statusClass} />
            </div>
          </div>

          {/* Title */}
          <h2 className="text-base sm:text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark mb-3 truncate">
            {title}
          </h2>

          {/* Info row */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-xs sm:text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mb-4">
            <div className="flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{instructor}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <LocationDotIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>{room}</span>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 sm:gap-6">
            <Stat
              icon={<CheckIcon className="w-4 h-4" />}
              label={t('myCourses.attendance')}
              value={attendance.value}
              iconClass={attClass}
            />
            <Stat
              icon={<UsersIcon className="w-4 h-4" />}
              label={t('myCourses.section')}
              value={section}
              iconClass="bg-bg-surface-purple-default-light text-text-purple-default-light dark:bg-bg-surface-purple-default-dark dark:text-text-purple-default-dark"
            />
            <Stat
              icon={<StarIcon className="w-4 h-4" />}
              label={t('myCourses.grade')}
              value={grade}
              iconClass="bg-bg-surface-secondary-default-light text-text-secondary-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-secondary-default-dark"
            />
          </div>
        </div>

        {/* Desktop: status + action buttons */}
        <div className="hidden sm:flex flex-col items-end flex-shrink-0 min-w-[140px]">
          <StatusBadge label={statusLabel} className={statusClass} />
          <div className="flex flex-col items-end justify-center gap-2 flex-1 mt-2">
            <ActionButtons
              onEnterClassroom={onEnterClassroom}
              onViewMaterials={onViewMaterials}
              layout="vertical"
              t={t}
            />
          </div>
        </div>

        {/* Mobile: action buttons */}
        <div className="sm:hidden">
          <ActionButtons
            onEnterClassroom={onEnterClassroom}
            onViewMaterials={onViewMaterials}
            layout="horizontal"
            t={t}
          />
        </div>
      </div>
    </div>
  );
}
