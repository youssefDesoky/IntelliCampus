import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";

import { formatDistanceToNow } from "date-fns";
import { ar } from 'date-fns/locale';
import BoxData from "../../../components/ui/BoxData";
import Section from "../../../components/ui/Section";
import { BookIcon, ClipboardCheckIcon, ChartLineIcon, NewspaperIcon, NewspaperSlashIcon, ChartBarIcon } from "../../../components/ui/icons";

import StudyTimer from "../../../feature/student/dashboard/StudyTimer";
import TodayReminders from "../../../feature/student/dashboard/TodayReminders";
import { AttendanceTrendChart } from "../../../feature/student/dashboard/charts";
import { DashboardSkeleton } from "../../../feature/student/dashboard/SkeletonLoader";
import { fetchStudentDashboard } from "../../../api/dashboard";

const statIcons = {
  activeCourses: <BookIcon className="w-6 h-6 text-blue-600" />,
  attendanceRate: <ClipboardCheckIcon className="w-6 h-6 text-amber-600" />,
  currentGpa: <ChartLineIcon className="w-6 h-6 text-rose-600" />,
};

const statIconStyles = {
  activeCourses: "bg-blue-100 dark:bg-bg-surface-blue-default-dark",
  attendanceRate: "bg-yellow-100 dark:bg-bg-surface-yellow-default-dark",
  currentGpa: "bg-red-100 dark:bg-bg-surface-red-default-dark",
};

export default function Dashboard() {
  const { t, i18n } = useTranslation('student');
  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ["studentDashboard"],
    queryFn: fetchStudentDashboard,
    staleTime: 5 * 60 * 1000,
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
      title: t('dashboard.attendanceRate'),
      value: `${stats.attendanceRate ?? 0}%`,
      icon: statIcons.attendanceRate,
      iconStyle: statIconStyles.attendanceRate,
    },
    {
      id: 3,
      title: t('dashboard.currentGpa'),
      value: stats.currentGpa ?? "0.0",
      icon: statIcons.currentGpa,
      iconStyle: statIconStyles.currentGpa,
    },
  ];

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  if (error) {
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

      <Section className="flex flex-col justify-evenly lg:grid lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold">{t('dashboard.latestNews')}</h2>
            <NewspaperIcon className="w-6 h-6" />
          </div>

          <menu className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 no-scrollbar">
            {dashboard.latestNews?.length > 0 ? (
              dashboard.latestNews.slice(0, 5).map((item) => (
                <li
                  key={`${item.kind ?? "Course"}-${item.id}`}
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
              <li className="p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark h-full flex flex-col items-center justify-center gap-2">
                <NewspaperSlashIcon className="w-12 h-12 opacity-40" />
                <p className="text-sm">{t('dashboard.noNews')}</p>
              </li>
            )}
          </menu>

        </div>

        <div className="lg:col-span-4 flex flex-col gap-6">
          <TodayReminders />
          <StudyTimer />
        </div>
      </Section>

      <Section className="block">
        <div className="flex items-center gap-3 mb-6">
          <ChartBarIcon className="w-7 h-7 text-text-accent-default-light dark:text-text-accent-default-dark" />
          <h2 className="text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">{t('dashboard.analytics')}</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <AttendanceTrendChart className="lg:col-span-12" data={dashboard.attendanceTrend ?? []} />
        </div>
      </Section>
    </>
  );
}
