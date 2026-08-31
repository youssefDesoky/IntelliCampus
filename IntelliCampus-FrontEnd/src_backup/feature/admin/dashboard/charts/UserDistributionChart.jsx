import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartCard } from "../../../../components/charts";

const data = [
  { role: "Students", count: 1560 },
  { role: "Instructors", count: 85 },
  { role: "Admins", count: 12 },
];

const COLORS = [
  "var(--color-bg-fill-accent-default-light)",
  "var(--color-bg-fill-success-default-light)",
  "var(--color-bg-fill-warning-default-light)",
];

export default function UserDistributionChart({ className = "" }) {
  const { t } = useTranslation('admin');
  return (
    <ChartCard title={t('dashboard.userDistribution')} className={className}
      chartType="pie" chartData={data} categoryField="role" series={[{ field: "count", name: t('dashboard.count') }]}>

      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} dataKey="count" nameKey="role" cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={4}>
            {data.map((_, index) => (
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
          <Legend wrapperStyle={{ fontSize: "12px" }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
