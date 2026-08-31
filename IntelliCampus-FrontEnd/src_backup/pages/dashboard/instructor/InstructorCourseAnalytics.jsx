import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
    LineChart, Line, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { ChartBarIcon, CheckIcon, UserCheckIcon, DownloadIcon } from "../../../components/ui/icons";
import Button from "../../../components/ui/Button";
import { ChartCard } from "../../../components/charts";
import PerformanceOverTimeChart from "../../../feature/instructor/dashboard/charts/PerformanceOverTimeChart";
import StudentScoreHeatmap from "../../../feature/instructor/dashboard/charts/StudentScoreHeatmap";
import { CourseWorkBreakdownChart } from "../../../feature/instructor/dashboard/charts";
import { downloadBlob } from "../../../api/apiClient";
import { CourseAnalyticsSkeleton } from "../../../feature/instructor/SkeletonLoader";

const tooltipStyle = {
    backgroundColor: "var(--color-bg-surface-primary-default-light)",
    border: "1px solid var(--color-border-primary-default-light)",
    borderRadius: "8px",
    color: "var(--color-text-primary-default-light)",
};

const MOCK_DATA = {
    submissionRate: [
        { name: "Submitted", value: 78, color: "var(--color-bg-fill-success-default-light)" },
        { name: "Pending", value: 22, color: "var(--color-bg-fill-warning-default-light)" },
    ],
    weeklyAttendance: [
        { week: "W1", present: 38 },
        { week: "W2", present: 36 },
        { week: "W3", present: 34 },
        { week: "W4", present: 37 },
        { week: "W5", present: 32 },
        { week: "W6", present: 35 },
        { week: "W7", present: 39 },
        { week: "W8", present: 36 },
    ],
    performanceOverTime: [
        { name: "Quiz 1", average: 72, maxScore: 98, minScore: 45 },
        { name: "Quiz 2", average: 75, maxScore: 100, minScore: 40 },
        { name: "Midterm", average: 68, maxScore: 95, minScore: 35 },
        { name: "Quiz 3", average: 78, maxScore: 100, minScore: 50 },
        { name: "Project", average: 82, maxScore: 100, minScore: 55 },
        { name: "Final", average: 74, maxScore: 96, minScore: 38 },
    ],
    studentScoreHeatmap: [
        { student: "Alice Johnson", scores: { "Quiz 1": 85, "Quiz 2": 90, "Midterm": 78, "Quiz 3": 92, "Final": 88 } },
        { student: "Bob Smith", scores: { "Quiz 1": 72, "Quiz 2": 75, "Midterm": 68, "Quiz 3": 80, "Final": 74 } },
        { student: "Charlie Brown", scores: { "Quiz 1": 65, "Quiz 2": 60, "Midterm": 55, "Quiz 3": 70, "Final": 62 } },
        { student: "Diana Prince", scores: { "Quiz 1": 95, "Quiz 2": 98, "Midterm": 92, "Quiz 3": 96, "Final": 94 } },
        { student: "Eve Williams", scores: { "Quiz 1": 70, "Quiz 2": 72, "Midterm": 68, "Quiz 3": 75, "Final": 71 } },
        { student: "Frank Miller", scores: { "Quiz 1": 55, "Quiz 2": 58, "Midterm": 45, "Quiz 3": 60, "Final": 52 } },
        { student: "Grace Lee", scores: { "Quiz 1": 88, "Quiz 2": 85, "Midterm": 82, "Quiz 3": 90, "Final": 86 } },
        { student: "Henry Davis", scores: { "Quiz 1": 68, "Quiz 2": 70, "Midterm": 65, "Quiz 3": 72, "Final": 68 } },
    ],
    courseWorkBreakdown: {
        totalMarks: 40,
        breakdown: [
            { type: "Quiz", marks: 10 },
            { type: "Assignment", marks: 5 },
            { type: "Midterm", marks: 20 },
        ],
        undeclaredMarks: 5,
    },
};

export default function InstructorCourseAnalytics() {
    const { t } = useTranslation('instructor');
    const { courseId } = useOutletContext();
    const downloadUrl = `/api/analytics/instructor/course/${courseId}/export`;

    const { submissionRate, weeklyAttendance, performanceOverTime, studentScoreHeatmap, courseWorkBreakdown } = MOCK_DATA;

    const handleDownloadAll = async () => {
        const filename = `course-analytics-${courseId}.pdf`;
        await downloadBlob(downloadUrl, filename);
    };

    if (!MOCK_DATA) {
        return <CourseAnalyticsSkeleton />;
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
                </ChartCard>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <ChartCard title={t('chart.studentAttendance')} icon={<UserCheckIcon size={20} />} downloadUrl={downloadUrl}
                    chartType="line" chartData={weeklyAttendance} categoryField="week" series={[{ field: "present", name: t('chart.studentsAttended') }]}>
                    <ResponsiveContainer width="100%" height={260}>
                        <LineChart data={weeklyAttendance} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
                            <XAxis dataKey="week" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
                            <YAxis domain={[0, 42]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
                            <Tooltip contentStyle={tooltipStyle} />
                            <Line type="monotone" dataKey="present" stroke="var(--color-bg-fill-accent-default-light)" strokeWidth={3} dot={{ r: 5, fill: "var(--color-bg-fill-accent-default-light)" }} name={t('chart.studentsAttended')} />
                        </LineChart>
                    </ResponsiveContainer>
                </ChartCard>

                <PerformanceOverTimeChart data={performanceOverTime ?? []} downloadUrl={downloadUrl} />
            </div>

            <StudentScoreHeatmap data={studentScoreHeatmap ?? []} downloadUrl={downloadUrl} />
        </div>
    );
}
