import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartLineIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function CumulativePassRateChart({ className = "", data = [] }) {
  const chartData = data.map((d) => ({
    week: d.week,
    rate: Number(d.rate ?? 0),
  }));
  const { t } = useTranslation('instructor');

  return (
    <ChartCard title={t('chart.cumulativePassRate')} icon={<ChartLineIcon size={20} />} className={className}
      chartType="area" chartData={chartData} categoryField="week" series={[{ field: "rate", name: "Pass Rate %" }]}>

      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
          <XAxis dataKey="week" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <YAxis domain={[0, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <Tooltip contentStyle={tooltipStyle} />
          <Area type="monotone" dataKey="rate" name="Pass Rate %" stroke="var(--color-bg-fill-success-default-light)" fill="var(--color-bg-fill-success-default-light)" fillOpacity={0.2} strokeWidth={3} dot={{ r: 4, fill: "var(--color-bg-fill-success-default-light)" }} />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
