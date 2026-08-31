import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartLineIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { ChartCard } from "../../../../components/charts";
import { getLocalizedField } from '../../../../utils/getLocalizedField';

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function PerformanceOverTimeChart({ className = "", data = [], downloadUrl }) {
  const { t, i18n } = useTranslation('instructor');
  const chartData = data.map((d) => ({
    name: getLocalizedField(d, 'name', i18n.language),
    average: Number(d.average ?? 0),
    maxScore: Number(d.maxScore ?? 0),
    minScore: Number(d.minScore ?? 0),
  }));

  return (
    <ChartCard title={t('chart.performanceOverTime')} icon={<ChartLineIcon size={20} />} className={className} downloadUrl={downloadUrl}
      chartType="line" chartData={chartData} categoryField="name" series={[{ field: "average", name: "Average" }, { field: "maxScore", name: "Max Score" }, { field: "minScore", name: "Min Score" }]}>

      <div dir="ltr">
        <ResponsiveContainer width="100%" height={280}>
          <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
            <XAxis dataKey="name" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
            <YAxis domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
            <Tooltip contentStyle={tooltipStyle} />
            <Legend wrapperStyle={{ fontSize: "12px" }} />
            <Line type="monotone" dataKey="average" stroke="var(--color-bg-fill-accent-default-light)" strokeWidth={3} dot={{ r: 5, fill: "var(--color-bg-fill-accent-default-light)" }} name="Average" />
            <Line type="monotone" dataKey="maxScore" stroke="var(--color-bg-fill-success-default-light)" strokeWidth={2} dot={{ r: 4 }} name="Max Score" strokeDasharray="5 5" />
            <Line type="monotone" dataKey="minScore" stroke="var(--color-bg-fill-danger-default-light)" strokeWidth={2} dot={{ r: 4 }} name="Min Score" strokeDasharray="5 5" />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
