import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { UserTieIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function SectionComparisonChart({ className = "", data = [] }) {
  const sectionKeys = data.length > 0
    ? Object.keys(data[0]).filter((k) => k !== "name")
    : [];

  const sectionSeries = sectionKeys.map((k) => ({ field: k, name: k }));

  const colors = [
    "var(--color-bg-fill-accent-default-light)",
    "var(--color-bg-fill-success-default-light)",
    "var(--color-bg-fill-warning-default-light)",
    "var(--color-bg-fill-danger-default-light)",
    "var(--color-bg-fill-purple-default-light)",
  ];
  const { t } = useTranslation('instructor');

  return (
    <ChartCard title={t('chart.sectionComparison')} icon={<UserTieIcon size={20} />} className={className}
      chartType="bar" chartData={data} categoryField="name" series={sectionSeries}>

      <div dir="ltr">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
            <XAxis dataKey="name" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
            <YAxis domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            {sectionKeys.map((key, i) => (
              <Bar key={key} dataKey={key} fill={colors[i % colors.length]} radius={[4, 4, 0, 0]} />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
