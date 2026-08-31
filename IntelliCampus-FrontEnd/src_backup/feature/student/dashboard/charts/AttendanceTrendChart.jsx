import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function AttendanceTrendChart({ className = "", data = [], downloadUrl }) {
  const { t } = useTranslation("student");
  const chartData = data.map((point) => ({
    week: point.week,
    attendance: Number(point.attendance ?? 0),
  }));

  return (
    <ChartCard title={t("dashboard.chart.attendanceTrendWeekly")} className={className} downloadUrl={downloadUrl}
      chartType="line" chartData={chartData} categoryField="week" series={[{ field: "attendance", name: t("dashboard.chart.attendanceRate") }]}> 

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
          <XAxis dataKey="week" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <YAxis domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <Tooltip contentStyle={tooltipStyle} />
          <Line type="monotone" dataKey="attendance" stroke="var(--color-bg-fill-accent-default-light)" strokeWidth={3} dot={{ fill: "var(--color-bg-fill-accent-default-light)", r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
