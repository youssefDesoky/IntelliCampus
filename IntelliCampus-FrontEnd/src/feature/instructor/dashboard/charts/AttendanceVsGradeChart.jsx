import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ZAxis } from "recharts";
import { UserCheckIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

const CustomTooltip = ({ active, payload, attendanceLabel, gradeLabel }) => {
  if (!active || !payload?.length) return null;
  const { student, attendance, grade } = payload[0].payload;
  return (
    <div className="p-3 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg shadow-lg">
      <p className="font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{student}</p>
      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{attendanceLabel}: {attendance}%</p>
      <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{gradeLabel}: {grade}%</p>
    </div>
  );
};

export default function AttendanceVsGradeChart({ className = "", data = [] }) {
  const { t } = useTranslation('instructor');
  return (
    <ChartCard title={t('chart.attendanceVsGrade')} icon={<UserCheckIcon size={20} />} className={className}
      chartType="scatter" chartData={data} categoryField="attendance" series={[{ field: "grade", name: t('chart.gradePct') }]}>

      <div dir="ltr">
        <ResponsiveContainer width="100%" height={280}>
          <ScatterChart margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
            <XAxis dataKey="attendance" name={t('chart.attendance')} unit="%" domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" label={{ value: t('chart.attendancePct'), position: "insideBottom", offset: -5, style: { fontSize: "11px", fill: "var(--color-text-tertiary-default-light)" } }} />
            <YAxis dataKey="grade" name={t('chart.grade')} unit="%" domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" label={{ value: t('chart.gradePct'), angle: -90, position: "insideLeft", style: { fontSize: "11px", fill: "var(--color-text-tertiary-default-light)" } }} />
            <ZAxis range={[60, 60]} />
            <Tooltip content={<CustomTooltip attendanceLabel={t('chart.attendance')} gradeLabel={t('chart.grade')} />} wrapperStyle={{ outline: "none" }} />
            <Legend wrapperStyle={{ fontSize: "12px" }} payload={[{ value: t('chart.dotLegend'), type: "circle", color: "var(--color-bg-fill-accent-default-light)" }]} />
            <Scatter data={data} fill="var(--color-bg-fill-accent-default-light)" name={t('chart.students')} />
          </ScatterChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
