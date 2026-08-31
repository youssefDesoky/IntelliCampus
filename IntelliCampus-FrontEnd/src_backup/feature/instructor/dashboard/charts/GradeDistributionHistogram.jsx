import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartBarIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function GradeDistributionHistogram({ className = "", data = [] }) {
  const chartData = data.map((d) => ({
    range: d.range,
    count: Number(d.count ?? 0),
  }));
  const { t } = useTranslation('instructor');

  return (
    <ChartCard title={t('chart.gradeDistribution')} icon={<ChartBarIcon size={20} />} className={className}
      chartType="bar" chartData={chartData} categoryField="range" series={[{ field: "count", name: "Students" }]}>

      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
          <XAxis dataKey="range" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <YAxis className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <Tooltip contentStyle={tooltipStyle} />
          <Bar dataKey="count" name="Students" fill="var(--color-bg-fill-accent-default-light)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
