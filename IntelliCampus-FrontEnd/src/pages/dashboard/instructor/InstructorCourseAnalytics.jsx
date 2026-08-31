import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import Button from "../../../components/ui/Button";
import { CheckIcon, UserCheckIcon, DownloadIcon } from "../../../components/ui/icons";
import { ChartCard } from "../../../components/charts";
import PerformanceOverTimeChart from "../../../feature/instructor/dashboard/charts/PerformanceOverTimeChart";
import StudentScoreHeatmap from "../../../feature/instructor/dashboard/charts/StudentScoreHeatmap";
import { CourseWorkBreakdownChart } from "../../../feature/instructor/dashboard/charts";
import { downloadBlob } from "../../../api/apiClient";
import { fetchCourseAnalytics } from "../../../feature/instructor/services/analyticsApi";

const tooltipStyle = {
    backgroundColor: "var(--color-bg-surface-primary-default-light)",
    border: "1px solid var(--color-border-primary-default-light)",
    borderRadius: "8px",
    color: "var(--color-text-primary-default-light)",
};

const EMPTY = { assessmentPerformance: [], submissionRate: [], weeklyAttendance: [], courseWorkBreakdown: {}, studentScoreHeatmap: [] };

export default function InstructorCourseAnalytics() {
    const { t } = useTranslation('instructor');
    const { courseId } = useOutletContext();

    const [data, setData] = useState(EMPTY);
    const [loadedCourseId, setLoadedCourseId] = useState(null);
    const loading = loadedCourseId !== courseId;

    useEffect(() => {
        let cancelled = false;
        fetchCourseAnalytics(courseId)
            .then((result) => { if (!cancelled) { setData(result ?? EMPTY); setLoadedCourseId(courseId); } })
            .catch(() => { if (!cancelled) { setData(EMPTY); setLoadedCourseId(courseId); } });
        return () => { cancelled = true; };
    }, [courseId]);


    const handleDownloadAll = () => {
        downloadBlob(downloadUrl, `analytics-${courseId}.json`);
    };

    const downloadUrl = `${import.meta.env.VITE_API_URL ?? ""}/api/courses/${courseId}/analytics/export`;

    const { submissionRate, weeklyAttendance, assessmentPerformance, courseWorkBreakdown, studentScoreHeatmap } = data;
    // backend supplies AssessmentPerformance; PerformanceOverTimeChart expects minScore (optional, defaults to 0)
    const performanceOverTime = (assessmentPerformance ?? []).map((d) => ({
        name: d.name,
        average: Number(d.average ?? 0),
        maxScore: Number(d.maxScore ?? 0),
    }));

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                        Analytics
                    </h2>
                </div>
                <p className="text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark py-8">
                    Loading analytics…
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('chart.analyticsTitle')}
                </h2>
                <Button variant="secondary" size="sm" onClick={handleDownloadAll} startIcon={<DownloadIcon size={16} />}>
                    <span className="hidden sm:inline">{t('chart.downloadAll')}</span>
                </Button>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-full">
                    <CourseWorkBreakdownChart data={courseWorkBreakdown ?? {}} downloadUrl={downloadUrl} />
                </div>

                <ChartCard title={t('chart.submissionRate')} icon={<CheckIcon size={20} />} downloadUrl={downloadUrl}
                    chartType="pie" chartData={submissionRate} categoryField="name" series={[{ field: "value", name: t('chart.count') }]}>
                    <div dir="ltr">
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie
                                    data={submissionRate}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={4}
                                    dataKey="value"
                                    nameKey="name"
                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                >
                                    {submissionRate.map((entry, index) => (
                                        <Cell key={index} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={tooltipStyle} />
                                <Legend wrapperStyle={{ fontSize: "12px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={t('chart.studentAttendance')} icon={<UserCheckIcon size={20} />} downloadUrl={downloadUrl}
                    chartType="line" chartData={weeklyAttendance} categoryField="week" series={[{ field: "present", name: t('chart.studentsAttended') }]}>
                    <div dir="ltr">
                        <ResponsiveContainer width="100%" height={260}>
                            <LineChart data={weeklyAttendance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
                                <XAxis dataKey="week" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
                                <YAxis domain={[0, 42]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
                                <Tooltip contentStyle={tooltipStyle} />
                                <Line type="monotone" dataKey="present" stroke="var(--color-bg-fill-accent-default-light)" strokeWidth={3} dot={{ r: 5, fill: "var(--color-bg-fill-accent-default-light)" }} name={t('chart.studentsAttended')} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </ChartCard>

                <PerformanceOverTimeChart data={performanceOverTime} />
            </div>

            <StudentScoreHeatmap data={studentScoreHeatmap ?? []} downloadUrl={downloadUrl} />
        </div>
    );
}