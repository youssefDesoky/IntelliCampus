import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { BrainIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function ClassAverageByTopicChart({ className = "", data = [] }) {
  const chartData = data.map((d) => ({
    topic: d.topic,
    average: Number(d.average ?? 0),
  }));
  const { t } = useTranslation('instructor');

  return (
    <ChartCard title={t('chart.classAverageByTopic')} icon={<BrainIcon size={20} />} className={className}
      chartType="bar" chartData={chartData} categoryField="topic" series={[{ field: "average", name: "Average Score" }]}>

      <div dir="ltr">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 30 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
            <XAxis dataKey="topic" angle={-20} textAnchor="end" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
            <YAxis domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
            <Tooltip contentStyle={tooltipStyle} />
            <Bar dataKey="average" name="Average Score" fill="var(--color-bg-fill-purple-default-light)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
