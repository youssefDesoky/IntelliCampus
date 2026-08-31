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
import Dialog from "../../../components/ui/Dialog";
import { ChartCard, ProbationHeatmapChart } from "../../../components/charts";
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
import { fetchAdminDashboard, publishNews, updateNews, deleteNews } from "../../../api/dashboard";
import { DashboardSkeleton } from "../../../feature/admin/shared/SkeletonLoader";

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
const COURSE_STATUS_COLORS = {
  Active: "#22c55e",
  Inactive: "#f59e0b",
  Archived: "#9ca3af",
};

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
      <div dir="ltr">
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
      </div>
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
        <div dir="ltr">
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
        </div>

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
      <div dir="ltr">
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
      </div>
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
      <div dir="ltr">
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
      </div>
    </ChartCard>
  );
}

function CourseStatusBreakdownChart({ data, t }) {
  const filteredData = data.filter(
    (d) => !/archived/i.test(d.name)
  );
  const total = filteredData.reduce((sum, d) => sum + d.value, 0);

  return (
    <ChartCard
      title={t('dashboard.courseCatalogStatus')}
      subtitle={t('dashboard.courseCatalogStatusSubtitle')}
    >
      <div className="space-y-3">
        {filteredData.map((entry) => {
          const percentage = total > 0 ? (entry.value / total) * 100 : 0;
          const color = COURSE_STATUS_COLORS[entry.name] ?? "#9ca3af";
          return (
            <div key={entry.name}>
              <div className="flex items-center justify-between mb-1">
                <div className="flex items-center gap-2">
                  <div
                    className="w-2 h-2 rounded-full flex-shrink-0"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    {entry.name}
                  </span>
                </div>
                <span className="text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark tabular-nums">
                  {entry.value.toLocaleString()}
                </span>
              </div>
              <div className="h-2 w-full rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{ width: `${percentage}%`, backgroundColor: color }}
                />
              </div>
            </div>
          );
        })}
        <div className="pt-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
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
    </ChartCard>
  );
}

// ─── Academic Snapshot panel ──────────────────────────────────────────────────

function AcademicSnapshot({ stats, snapshot, t }) {
  const snap = snapshot ?? {};
  const totalStudents = stats?.totalStudents ?? 0;
  const metrics = [
    { label: t('dashboard.passRate'),          value: `${(snap.passRate ?? 0).toFixed(0)}%`,      progress: snap.passRate ?? 0, color: "#22c55e" },
    { label: t('dashboard.courseCompletion'),  value: `${(snap.courseCompletion ?? 0).toFixed(0)}%`, progress: snap.courseCompletion ?? 0, color: "#3b82f6" },
    { label: t('dashboard.studentRetention'),  value: `${(snap.studentRetention ?? 0).toFixed(0)}%`, progress: snap.studentRetention ?? 0, color: "#8b5cf6" },
    { label: t('dashboard.averageGpa'),        value: `${(snap.averageGpa ?? 0).toFixed(2)} / 4.0`,progress: ((snap.averageGpa ?? 0) / 4 * 100), color: "#f59e0b" },
    { label: t('dashboard.probationCount'),    value: `${snap.probationCount ?? 0}`, progress: totalStudents > 0 ? ((snap.probationCount ?? 0) / totalStudents * 100) : 0, color: "#ef4444" },
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
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
  });

  const invalidateAllDashboards = () => {
    queryClient.invalidateQueries({ queryKey: ["adminDashboard"] });
    queryClient.invalidateQueries({ queryKey: ["studentDashboard"] });
    queryClient.invalidateQueries({ queryKey: ["instructorDashboard"] });
  };

  const publishMutation = useMutation({
    mutationFn: publishNews,
    onSuccess: (newItem) => {
      setNewsInput("");
      queryClient.setQueryData(["adminDashboard"], (old) => {
        if (!old) return old;
        return {
          ...old,
          latestNews: [newItem, ...(old.latestNews ?? [])].slice(0, 5),
        };
      });
      invalidateAllDashboards();
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, title }) => updateNews(id, title),
    onSuccess: (updatedItem) => {
      setEditingId(null);
      setEditText("");
      queryClient.setQueryData(["adminDashboard"], (old) => {
        if (!old) return old;
        return {
          ...old,
          latestNews: (old.latestNews ?? []).map((it) =>
            it.id === updatedItem.id ? { ...it, ...updatedItem } : it
          ),
        };
      });
      invalidateAllDashboards();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteNews,
    onSuccess: (_data, deletedId) => {
      queryClient.setQueryData(["adminDashboard"], (old) => {
        if (!old) return old;
        return {
          ...old,
          latestNews: (old.latestNews ?? []).filter((it) => it.id !== deletedId),
        };
      });
      invalidateAllDashboards();
    },
  });

  const handlePublish = (e) => {
    e.preventDefault();
    const trimmed = newsInput.trim();
    if (!trimmed) return;
    publishMutation.mutate(trimmed);
  };

  const handleStartEdit = (item) => {
    setEditingId(`${item.kind ?? "Broadcast"}-${item.id}`);
    setEditText(item.title);
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditText("");
  };

  const handleSaveEdit = (id) => {
    const trimmed = editText.trim();
    if (!trimmed) return;
    updateMutation.mutate({ id, title: trimmed });
  };

  const handleDelete = (id) => {
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = () => {
    if (deleteConfirmId !== null) {
      deleteMutation.mutate(deleteConfirmId);
    }
    setDeleteConfirmId(null);
  };

  const handleCancelDelete = () => {
    setDeleteConfirmId(null);
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
  const probationHeatmapData = dashboard?.charts?.probationHeatmap ?? [];

  const textAreaClasses =
    "px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all placeholder:text-text-secondary-default-light dark:placeholder:text-text-secondary-default-dark";

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

          <form onSubmit={handlePublish} className="mb-5 flex gap-2">
            <TextArea
              minHeight={80}
              maxHeight={120}
              className={`${textAreaClasses} flex-1 min-w-0`}
              placeholder={t('dashboard.announcementPlaceholder')}
              value={newsInput}
              onChange={(e) => setNewsInput(e.target.value)}
            />
            <Button
              type="submit"
              variant="primary"
              size="md"
              className="h-full"
              loading={publishMutation.isPending}
              loadingText={t('dashboard.publishing')}
              endIcon={<PaperPlaneIcon className="w-4 h-4" />}
            >
              {t('dashboard.publish')}
            </Button>
          </form>

          <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 no-scrollbar">
            {dashboard.latestNews?.length > 0 ? (
              dashboard.latestNews.slice(0, 5).map((item) => {
                const itemKey = `${item.kind ?? "Broadcast"}-${item.id}`;
                const isEditing = editingId === itemKey;
                return (
                  <li
                    key={itemKey}
                    className="flex gap-4 p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"
                  >
                    <div className="w-0.5 flex-shrink-0 rounded-full bg-text-accent-default-light dark:bg-text-accent-default-dark self-stretch" />
                    <div className="flex-1 min-w-0">
                      {isEditing ? (
                        <div className="space-y-2">
                          <textarea
                            className="w-full px-3 py-2 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light outline-none resize-none text-sm"
                            rows={3}
                            value={editText}
                            onChange={(e) => setEditText(e.target.value)}
                          />
                          <div className="flex gap-2 justify-end">
                            <button
                              type="button"
                              onClick={handleCancelEdit}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => handleSaveEdit(item.id)}
                              disabled={updateMutation.isPending || !editText.trim()}
                              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-text-accent-default-light dark:bg-text-accent-default-dark text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                            >
                              {updateMutation.isPending ? "Saving..." : "Save"}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
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
                              ? (item.updatedAt && new Date(item.updatedAt).getTime() !== new Date(item.date).getTime()
                                ? t('dashboard.editedTime', { time: formatDistanceToNow(new Date(item.updatedAt), { addSuffix: true, locale: i18n.language === 'ar' ? ar : undefined }) })
                                : t('dashboard.postedTime', { time: formatDistanceToNow(new Date(item.date), { addSuffix: true, locale: i18n.language === 'ar' ? ar : undefined }) }))
                              : t('dashboard.postedRecently')}
                          </p>
                        </>
                      )}
                    </div>
                    {!isEditing && (
                      <div className="flex flex-col gap-1.5 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(item)}
                          className="p-1.5 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark text-text-tertiary-default-light dark:text-text-tertiary-default-dark hover:text-text-accent-default-light dark:hover:text-text-accent-default-dark transition-colors"
                          title="Edit"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path d="M5.433 13.917l1.262-3.155A4 4 0 017.58 9.42l6.92-6.918a2.121 2.121 0 013 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.5.5 0 01-.65-.65z" />
                            <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0010 3H4.75A2.75 2.75 0 002 5.75v9.5A2.75 2.75 0 004.75 18h9.5A2.75 2.75 0 0017 15.25V10a.75.75 0 00-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5z" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(item.id)}
                          className="p-1.5 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark text-text-tertiary-default-light dark:text-text-tertiary-default-dark hover:text-text-error-default-light dark:hover:text-text-error-default-dark transition-colors"
                          title="Delete"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                            <path fillRule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c-.84 0-1.673.025-2.5.075V3.75c0-.69.56-1.25 1.25-1.25h2.5c.69 0 1.25.56 1.25 1.25v.325C11.673 4.025 10.84 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </div>
                    )}
                </li>
              );
            })
            ) : (
              <li className="py-10 text-center">
                <BullHornIcon className="w-10 h-10 mx-auto mb-2 text-text-tertiary-default-light dark:text-text-tertiary-default-dark opacity-25" />
                <p className="text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                  {t('dashboard.noAnnouncements')}
                </p>
              </li>
            )}
          </div>
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

        <div className="mt-6">
          <ProbationHeatmapChart data={probationHeatmapData} t={t} />
        </div>
      </Section>

      <Dialog
        isOpen={deleteConfirmId !== null}
        variant="warning"
        title="Delete Announcement"
        onConfirm={handleConfirmDelete}
        onClose={handleCancelDelete}
        confirmText="Delete"
        cancelText="Cancel"
      >
        Are you sure you want to delete this announcement? This action cannot be undone.
      </Dialog>
    </>
  );
}
