import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { ar } from 'date-fns/locale';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

import BoxData from "../../../components/ui/BoxData";
import Section from "../../../components/ui/Section";
import TextArea from "../../../components/ui/TextArea";
import Button from "../../../components/ui/Button";
import { ChartCard } from "../../../components/charts";
import {
  UsersIcon,
  UserTieIcon,
  BookIcon,
  HouseIcon,
  CalendarDaysIcon,
  LocationDotIcon,
  ChartBarIcon,
  BullHornIcon,
  PaperPlaneIcon,
} from "../../../components/ui/icons";
import { fetchAdminDashboard, publishNews } from "../../../api/dashboard";

// ─── Stat card config ────────────────────────────────────────────────────────

const statIcons = {
  totalStudents: <UsersIcon className="w-6 h-6 text-blue-600" />,
  instructors:   <UserTieIcon className="w-6 h-6 text-emerald-600" />,
  courses:       <BookIcon className="w-6 h-6 text-amber-600" />,
  departments:   <HouseIcon className="w-6 h-6 text-rose-600" />,
  activeClasses: <CalendarDaysIcon className="w-6 h-6 text-purple-600" />,
  rooms:         <LocationDotIcon className="w-6 h-6 text-cyan-600" />,
};

const statIconStyles = {
  totalStudents: "bg-blue-100   dark:bg-bg-surface-blue-default-dark",
  instructors:   "bg-green-100  dark:bg-bg-surface-green-default-dark",
  courses:       "bg-yellow-100 dark:bg-bg-surface-yellow-default-dark",
  departments:   "bg-red-100    dark:bg-bg-surface-red-default-dark",
  activeClasses: "bg-purple-100 dark:bg-bg-surface-purple-default-dark",
  rooms:         "bg-cyan-100   dark:bg-bg-surface-cyan-default-dark",
};

const GRADE_COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"];
const COURSE_STATUS_COLORS = ["#22c55e", "#f59e0b"];

// ─── Shared chart primitives ──────────────────────────────────────────────────

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-lg text-xs">
      {label && (
        <p className="font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">
          {label}
        </p>
      )}
      {payload.map((entry, i) => (
        <p key={i} className="font-medium" style={{ color: entry.color ?? entry.fill }}>
          {entry.name}:{" "}
          <span className="font-bold">{entry.value}</span>
        </p>
      ))}
    </div>
  );
}

// ─── Chart components ─────────────────────────────────────────────────────────

function AttendanceTrendChart({ data, t }) {
  return (
    <ChartCard
      title={t('dashboard.attendanceRate')}
      subtitle={t('dashboard.attendanceSubtitle')}
      chartType="area" chartData={data} categoryField="week" series={[{ field: "attendance", name: t('dashboard.attendancePercent') }]}
    >
      <ResponsiveContainer width="100%" height={210}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: -24, bottom: 0 }}>
          <defs>
            <linearGradient id="enrollGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#3b82f6" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}   />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(128,128,128,0.12)"
            vertical={false}
          />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="attendance"
            name={t('dashboard.attendancePercent')}
            stroke="#3b82f6"
            strokeWidth={2}
            fill="url(#enrollGrad)"
            dot={false}
            activeDot={{ r: 4, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function GradeDistributionChart({ data, t }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.06) return null;
    const RAD = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text
        x={x} y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard
      title={t('dashboard.gradeDistribution')}
      subtitle={t('dashboard.gradeDistributionSubtitle')}
      chartType="pie" chartData={data} categoryField="name" series={[{ field: "value", name: t('dashboard.students') }]}
    >
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="55%" height={210}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={52}
              outerRadius={84}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={GRADE_COLORS[i]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2.5">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: GRADE_COLORS[i] }}
              />
              <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark flex-1">
                {t('dashboard.gradeLabel')} {entry.name}
              </span>
              <span className="text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark tabular-nums">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                {t('dashboard.total')}
              </span>
              <span className="text-xs font-bold text-text-primary-active-light dark:text-text-primary-active-dark tabular-nums">
                {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

function TopCoursesChart({ data, t }) {
  return (
    <ChartCard
      title={t('dashboard.topEnrolledCourses')}
      subtitle={t('dashboard.topEnrolledSubtitle')}
      chartType="bar" chartData={data} categoryField="course" series={[{ field: "enrolled", name: t('dashboard.enrolled') }]}
    >
      <ResponsiveContainer width="100%" height={210}>
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 0, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            horizontal={false}
            stroke="rgba(128,128,128,0.12)"
          />
          <XAxis
            type="number"
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="category"
            dataKey="course"
            tick={{ fontSize: 10, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
            width={130}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar
            dataKey="enrolled"
            name={t('dashboard.enrolled')}
            radius={[0, 5, 5, 0]}
            fill="#8b5cf6"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function CourseStatusChart({ data, t }) {
  return (
    <ChartCard
      title={t('dashboard.courseStatusByDept')}
      subtitle={t('dashboard.courseStatusByDeptSubtitle')}
      chartType="bar" chartData={data} categoryField="dept" series={[{ field: "active", name: t('dashboard.chartActive') }, { field: "completed", name: t('dashboard.chartCompleted') }, { field: "upcoming", name: t('dashboard.chartUpcoming') }]}
    >
      <ResponsiveContainer width="100%" height={210}>
        <BarChart data={data} margin={{ top: 0, right: 8, left: -24, bottom: 0 }}>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(128,128,128,0.12)"
          />
          <XAxis
            dataKey="dept"
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: "currentColor" }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            iconSize={8}
            iconType="circle"
            wrapperStyle={{ fontSize: "11px", paddingTop: "10px" }}
          />
          <Bar dataKey="active"    name={t('dashboard.chartActive')}    stackId="a" fill="#3b82f6" />
          <Bar dataKey="completed" name={t('dashboard.chartCompleted')} stackId="a" fill="#22c55e" />
          <Bar dataKey="upcoming"  name={t('dashboard.chartUpcoming')}  stackId="a" fill="#f59e0b" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}

function CourseStatusBreakdownChart({ data, t }) {
  const total = data.reduce((sum, d) => sum + d.value, 0);

  const renderLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    if (percent < 0.06) return null;
    const RAD = Math.PI / 180;
    const r = innerRadius + (outerRadius - innerRadius) * 0.55;
    const x = cx + r * Math.cos(-midAngle * RAD);
    const y = cy + r * Math.sin(-midAngle * RAD);
    return (
      <text
        x={x} y={y}
        fill="white"
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={11}
        fontWeight={700}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartCard
      title={t('dashboard.courseCatalogStatus')}
      subtitle={t('dashboard.courseCatalogStatusSubtitle')}
      chartType="pie" chartData={data} categoryField="name" series={[{ field: "value", name: t('dashboard.courses') }]}
    >
      <div className="flex items-center gap-6">
        <ResponsiveContainer width="55%" height={210}>
          <PieChart>
            <Pie
              data={data}
              cx="50%" cy="50%"
              innerRadius={52}
              outerRadius={84}
              dataKey="value"
              labelLine={false}
              label={renderLabel}
              strokeWidth={0}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={COURSE_STATUS_COLORS[i] ?? "#9ca3af"} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>

        <div className="flex-1 space-y-2.5">
          {data.map((entry, i) => (
            <div key={entry.name} className="flex items-center gap-2.5">
              <div
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: COURSE_STATUS_COLORS[i] ?? "#9ca3af" }}
              />
              <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark flex-1">
                {entry.name}
              </span>
              <span className="text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark tabular-nums">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
          <div className="pt-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="flex items-center justify-between">
              <span className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                {t('dashboard.total')}
              </span>
              <span className="text-xs font-bold text-text-primary-active-light dark:text-text-primary-active-dark tabular-nums">
                {total.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </ChartCard>
  );
}

// ─── Academic Snapshot panel ──────────────────────────────────────────────────

function AcademicSnapshot({ stats, snapshot, t }) {
  const snap = snapshot ?? {};
  const metrics = [
    { label: t('dashboard.passRate'),          value: `${(snap.passRate ?? 0).toFixed(0)}%`,      progress: snap.passRate ?? 0, color: "#22c55e" },
    { label: t('dashboard.courseCompletion'),  value: `${(snap.courseCompletion ?? 0).toFixed(0)}%`, progress: snap.courseCompletion ?? 0, color: "#3b82f6" },
    { label: t('dashboard.studentRetention'),  value: `${(snap.studentRetention ?? 0).toFixed(0)}%`, progress: snap.studentRetention ?? 0, color: "#8b5cf6" },
    { label: t('dashboard.averageGpa'),        value: `${(snap.averageGpa ?? 0).toFixed(2)} / 4.0`,progress: ((snap.averageGpa ?? 0) / 4 * 100), color: "#f59e0b" },
  ];

  return (
    <div className="h-full p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl flex flex-col">
      <div className="mb-6">
        <h2 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
          {t('dashboard.academicSnapshot')}
        </h2>
        <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
          {t('dashboard.kpiSubtitle')}
        </p>
      </div>

      <div className="flex flex-col gap-5 flex-1">
        {metrics.map((m) => (
          <div key={m.label}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                {m.label}
              </span>
              <span className="text-xs font-bold text-text-primary-default-light dark:text-text-primary-default-dark tabular-nums">
                {m.value}
              </span>
            </div>
            <div className="h-1.5 w-full rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-700"
                style={{ width: `${Math.min(m.progress, 100)}%`, backgroundColor: m.color }}
              />
            </div>
          </div>
        ))}
      </div>

      {stats.totalStudents > 0 && (
        <div className="mt-6 pt-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
          <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark leading-relaxed">
            {t('dashboard.reflectsStudents', {
              students: stats.totalStudents?.toLocaleString(),
              departments: stats.departments,
            })}
          </p>
        </div>
      )}
    </div>
  );
}

// ─── Main export ──────────────────────────────────────────────────────────────

export default function Dashboard() {
  const { t, i18n } = useTranslation('admin');
  const queryClient = useQueryClient();
  const [newsInput, setNewsInput] = useState("");

  const statLabels = {
    totalStudents: t('dashboard.totalStudents'),
    instructors:   t('dashboard.instructors'),
    courses:       t('dashboard.courses'),
    departments:   t('dashboard.departments'),
    activeClasses: t('dashboard.activeClasses'),
    rooms:         t('dashboard.rooms'),
  };

  const { data: dashboard, isLoading, error } = useQuery({
    queryKey: ["adminDashboard"],
    queryFn: fetchAdminDashboard,
    staleTime: 5 * 60 * 1000,
  });

  const publishMutation = useMutation({
    mutationFn: publishNews,
    onSuccess: () => {
      setNewsInput("");
      queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    },
  });

  const handlePublish = (e) => {
    e.preventDefault();
    const trimmed = newsInput.trim();
    if (!trimmed) return;
    publishMutation.mutate(trimmed);
  };

  const stats = dashboard?.stats ?? {};

  const statsData = Object.entries(statLabels).map(([key, label], index) => ({
    id: index + 1,
    title: label,
    value: stats[key] ?? 0,
    icon: statIcons[key],
    iconStyle: statIconStyles[key],
  }));

  // Use API-provided chart data
  const attendanceData = dashboard?.charts?.attendanceTrend ?? [];
  const gradeData      = dashboard?.charts?.gradeDistribution  ?? [];
  const topCoursesData = dashboard?.charts?.topCourses         ?? [];
  const deptStatusData = dashboard?.charts?.departmentStatus   ?? [];
  const courseStatusData = dashboard?.charts?.courseStatusBreakdown ?? [];

  const textAreaClasses =
    "w-full px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all placeholder:text-text-secondary-default-light dark:placeholder:text-text-secondary-default-dark";

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
        {t('dashboard.loading')}
      </div>
    );
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
      {/* ── Stats Grid ────────────────────────────────────────────────── */}
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

      {/* ── Announcements + Academic Snapshot ─────────────────────────── */}
      <Section className="flex flex-col lg:grid lg:grid-cols-12 gap-6">

        {/* News feed */}
        <div className="lg:col-span-8 p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl flex flex-col">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                {t('dashboard.latestAnnouncements')}
              </h2>
              <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
                {t('dashboard.broadcastSubtitle')}
              </p>
            </div>
            <BullHornIcon className="w-5 h-5 text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          </div>

          <form onSubmit={handlePublish} className="mb-5">
            <TextArea
              minHeight={60}
              maxHeight={120}
              className={textAreaClasses}
              placeholder={t('dashboard.announcementPlaceholder')}
              value={newsInput}
              onChange={(e) => setNewsInput(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                loading={publishMutation.isPending}
                loadingText={t('dashboard.publishing')}
                startIcon={<PaperPlaneIcon className="w-4 h-4" />}
              >
                {t('dashboard.publish')}
              </Button>
            </div>
          </form>

          <menu className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 no-scrollbar">
            {dashboard.latestNews?.length > 0 ? (
              dashboard.latestNews.slice(0, 5).map((item) => (
                <li
                  key={`${item.kind ?? "Broadcast"}-${item.id}`}
                  className="flex gap-4 p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"
                >
                  {/* Colored accent bar */}
                  <div className="w-0.5 flex-shrink-0 rounded-full bg-text-accent-default-light dark:bg-text-accent-default-dark self-stretch" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                      {item.title}
                    </p>
                    {item.course && (
                      <p className="text-xs mt-0.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {item.course}
                      </p>
                    )}
                    <p className="text-xs mt-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                      {item.date
                        ? t('dashboard.postedTime', { time: formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: i18n.language === 'ar' ? ar : undefined }) })
                        : t('dashboard.postedRecently')}
                    </p>
                  </div>
                </li>
              ))
            ) : (
              <li className="py-10 text-center">
                <BullHornIcon className="w-10 h-10 mx-auto mb-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark opacity-25" />
                <p className="text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                  {t('dashboard.noAnnouncements')}
                </p>
              </li>
            )}
          </menu>
        </div>

        {/* Academic KPI snapshot */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <AcademicSnapshot stats={stats} snapshot={dashboard?.snapshot} t={t} />
          <CourseStatusBreakdownChart data={courseStatusData} t={t} />
        </div>
      </Section>

      {/* ── Analytics ─────────────────────────────────────────────────── */}
      <Section>
        <div className="flex items-center gap-3 mb-6">
          <ChartBarIcon className="w-6 h-6 text-text-accent-default-light dark:text-text-accent-default-dark" />
          <div>
            <h2 className="text-xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
              {t('dashboard.analyticsOverview')}
            </h2>
            <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
              {t('dashboard.analyticsSubtitle')}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <AttendanceTrendChart data={attendanceData} t={t} />
          <GradeDistributionChart data={gradeData} t={t} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
          <TopCoursesChart data={topCoursesData} t={t} />
          <CourseStatusChart data={deptStatusData} t={t} />
        </div>
      </Section>
    </>
  );
}
