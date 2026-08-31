import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartCard } from "../../../../components/charts";

const COLORS = [
  "var(--color-bg-fill-accent-default-light)",
  "var(--color-bg-fill-success-default-light)",
  "var(--color-bg-fill-purple-default-light)",
  "var(--color-bg-fill-warning-default-light)",
  "var(--color-bg-fill-info-default-light)",
];

export default function StudyTimeChart({ className = "", data = [] }) {
  const { t } = useTranslation("student");
  const chartData = data.map((point) => ({
    subject: point.subject,
    hours: Number(point.hours ?? 0),
  }));

  return (
    <ChartCard title={t("dashboard.chart.studyTimePerSubject")} className={className}
      chartType="pie" chartData={chartData} categoryField="subject" series={[{ field: "hours", name: t("dashboard.chart.hours") }]}> 

      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie data={chartData} dataKey="hours" nameKey="subject" cx="50%" cy="50%" outerRadius={80} innerRadius={45} paddingAngle={4}>
            {chartData.map((_, index) => (
              <Cell key={index} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-surface-primary-default-light)",
              border: "1px solid var(--color-border-primary-default-light)",
              borderRadius: "8px",
              color: "var(--color-text-primary-default-light)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "11px", color: "var(--color-text-secondary-default-light)" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
