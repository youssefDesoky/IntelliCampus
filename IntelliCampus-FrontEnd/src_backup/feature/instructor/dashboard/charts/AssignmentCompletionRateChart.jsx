import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { useTranslation } from "react-i18next";
import { ClipboardCheckIcon } from "../../../../components/ui/icons";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function AssignmentCompletionRateChart({ className = "", data = [] }) {
  const { t } = useTranslation('instructor');
  return (
    <ChartCard title={t('chart.assignmentCompletion')} icon={<ClipboardCheckIcon size={20} />} className={className}
      chartType="pie" chartData={data} categoryField="name" series={[{ field: "value", name: "Count" }]}>

      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={70}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            nameKey="name"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
          >
            {data.map((entry, index) => (
              <Cell key={index} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip contentStyle={tooltipStyle} />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
