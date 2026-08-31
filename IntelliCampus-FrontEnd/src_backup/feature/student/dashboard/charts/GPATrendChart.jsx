import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "../../../../components/charts";

export default function GPATrendChart({ className = "", data = [] }) {
  const { t } = useTranslation("student");
  const chartData = data.map((point) => ({
    semester: point.semester,
    gpa: Number(point.gpa ?? 0),
  }));

  return (
    <ChartCard title={t("dashboard.chart.gpaTrend")} className={className}
      chartType="line" chartData={chartData} categoryField="semester" series={[{ field: "gpa", name: t("dashboard.chart.gpaSeries") }]}> 

      <ResponsiveContainer width="100%" height={220}>
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
          <XAxis dataKey="semester" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <YAxis domain={[0, 4]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-surface-primary-default-light)",
              border: "1px solid var(--color-border-primary-default-light)",
              borderRadius: "8px",
              color: "var(--color-text-primary-default-light)",
            }}
          />
          <Line type="monotone" dataKey="gpa" stroke="var(--color-bg-fill-success-default-light)" strokeWidth={3} dot={{ fill: "var(--color-bg-fill-success-default-light)", r: 5 }} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
