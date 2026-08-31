import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import { formatDistanceToNow, format } from "date-fns";
import { ar } from 'date-fns/locale';
import BoxData from "../../../components/ui/BoxData";
import Section from "../../../components/ui/Section";
import {
  BookIcon, ClipboardCheckIcon, UsersIcon,
  BullHornIcon, ChartBarIcon, BellIconDark, ArrowRightIcon, NewspaperSlashIcon,
} from "../../../components/ui/icons";

import { AttendanceTrendChart } from "../../../feature/student/dashboard/charts";
import { DashboardSkeleton } from "../../../feature/student/dashboard/SkeletonLoader";
import { fetchInstructorDashboard } from "../../../api/dashboard";
import { fetchRemindersByDay } from "../../../feature/instructor/reminders/remindersApi";


const statIcons = {
  activeCourses: <BookIcon className="w-6 h-6 text-blue-600" />,
  totalStudents: <UsersIcon className="w-6 h-6 text-emerald-600" />,
  averageAttendance: <ClipboardCheckIcon className="w-6 h-6 text-amber-600" />,
};

const statIconStyles = {
  activeCourses: "bg-blue-100 dark:bg-bg-surface-blue-default-dark",
  totalStudents: "bg-emerald-100 dark:bg-bg-surface-green-default-dark",
  averageAttendance: "bg-yellow-100 dark:bg-bg-surface-yellow-default-dark",
};

export default function InstructorDashboard() {
  const { t, i18n } = useTranslation('instructor');
  const {
    data: dashboard,
    isLoading: dashLoading,
    error: dashError,
  } = useQuery({
    queryKey: ["instructorDashboard"],
    queryFn: fetchInstructorDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const {
    data: reminders = [],
    isLoading: remindersLoading,
  } = useQuery({
    queryKey: ["instructorReminders", "today"],
    queryFn: () => fetchRemindersByDay(new Date()),
    staleTime: 60 * 1000,
    select: (data) => (Array.isArray(data) ? data.filter((r) => r.category !== "exams" && r.category !== "assignments") : []),
  });

  const stats = dashboard?.stats ?? {};
  const statsData = [
    {
      id: 1,
      title: t('dashboard.activeCourses'),
      value: stats.activeCourses ?? 0,
      icon: statIcons.activeCourses,
      iconStyle: statIconStyles.activeCourses,
    },
    {
      id: 2,
      title: t('dashboard.totalStudents'),
      value: stats.totalStudents ?? 0,
      icon: statIcons.totalStudents,
      iconStyle: statIconStyles.totalStudents,
    },
    {
      id: 3,
      title: t('dashboard.averageAttendance'),
      value: `${stats.averageAttendance ?? 0}%`,
      icon: statIcons.averageAttendance,
      iconStyle: statIconStyles.averageAttendance,
    },
  ];

  if (dashLoading) {
    return <DashboardSkeleton />;
  }

  if (dashError) {
    return (
      <div className="flex items-center justify-center h-64 text-text-error-default-light dark:text-text-error-default-dark">
        {t('dashboard.error')}
      </div>
    );
  }

  return (
    <>
      <Section className="hidden sm:grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {statsData.map((stat) => (
          <BoxData
            key={stat.id}
            title={stat.title}
            value={stat.value}
            icon={stat.icon}
            iconStyle={stat.iconStyle}
          />
        ))}
      </Section>

      <Section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t('dashboard.latestNews')}</h2>
            <BullHornIcon className="w-6 h-6" />
          </div>

          <menu className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 no-scrollbar">
            {dashboard.latestNews?.length > 0 ? (
              dashboard.latestNews.slice(0, 5).map((item) => (
                <li
                  key={item.id}
                  className="p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"
                >
                  <p className="font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{item.title}</p>
                  <p className="text-xs mt-1 text-text-secondary-default-light dark:text-text-secondary-default-dark">{item.course}</p>
                  <p className="text-xs mt-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                    {item.date
                      ? (item.updatedAt && new Date(item.updatedAt).getTime() !== new Date(item.date).getTime()
                        ? t('dashboard.editedTime', { time: formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true, locale: i18n.language === 'ar' ? ar : undefined }) })
                        : t('dashboard.postedTime', { time: formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: i18n.language === 'ar' ? ar : undefined }) }))
                      : t('dashboard.postedRecently')}
                  </p>
                </li>
              ))
            ) : (
              <li className="p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark flex flex-col items-center justify-center gap-2">
                <NewspaperSlashIcon className="w-12 h-12 opacity-40" />
                <p className="text-sm">{t('dashboard.noNews')}</p>
              </li>
            )}
          </menu>
        </div>

        <div className="lg:col-span-4 flex flex-col">
          <div className="p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold">{t('dashboard.todayReminders')}</h2>
              <BellIconDark className="w-6 h-6" />
            </div>

            <menu className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 no-scrollbar mb-8">
              {remindersLoading ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                  <BellIconDark className="w-12 h-12 mb-4" />
                  <p className="text-center">{t('dashboard.loadingReminders')}</p>
                </div>
              ) : reminders.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                  <BellIconDark className="w-12 h-12 mb-4" />
                  <p className="text-center">{t('dashboard.noReminders')}</p>
                </div>
              ) : (
                reminders.map((reminder) => {
                  const completed = reminder.submissionState === "completed";
                  return (
                  <li
                    key={reminder.id}
                    className={`p-4 border border-s-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
                      completed
                        ? "border-green-300 dark:border-green-700 border-s-green-500 dark:border-s-green-400 bg-green-50 dark:bg-green-950/40"
                        : "border-border-primary-default-light dark:border-border-primary-default-dark border-s-border-accent-default-light dark:border-s-border-accent-default-dark"
                    }`}
                  >
                    <div className="mb-2 flex justify-between items-center">
                      <h3 className={`text-sm font-semibold ${completed ? "text-green-700 dark:text-green-300 line-through opacity-70" : ""}`}>{reminder.title}</h3>
                      <div className="flex items-center gap-2">
                        {completed && (
                          <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                            {t('dashboard.finished')}
                          </span>
                        )}
                        <p className="text-xs font-medium text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{reminder.priority}</p>
                      </div>
                    </div>
                    <div className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark flex items-center">
                      <span>{reminder.category}</span>
                      <span className="mx-2 w-2 h-1 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark" />
                      <span>{reminder.dueAt ? format(new Date(reminder.dueAt), "hh:mm a") : reminder.dueDate}</span>
                    </div>
                  </li>
                  );
                })
              )}
            </menu>

            <NavLink to="/instructor/reminders" className="text-text-accent-default-light dark:text-text-accent-default-dark hover:underline flex items-center gap-2 justify-center font-medium shrink-0">
              {t('dashboard.viewAllReminders')}
              <ArrowRightIcon className="w-4 h-4 rtl:scale-x-[-1]" />
            </NavLink>
          </div>
        </div>
      </Section>

      <Section>
        <div className="flex items-center gap-3 mb-6">
          <ChartBarIcon className="w-7 h-7 text-text-accent-default-light dark:text-text-accent-default-dark" />
          <h2 className="text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">{t('dashboard.analytics')}</h2>
        </div>

        <AttendanceTrendChart data={dashboard.attendanceTrend ?? []} />
      </Section>
    </>
  );
}
