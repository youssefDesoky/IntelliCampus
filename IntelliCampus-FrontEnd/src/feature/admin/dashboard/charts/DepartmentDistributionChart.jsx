import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "../../../../components/charts";

const data = [
  { department: "Computer Science", students: 520 },
  { department: "Engineering", students: 380 },
  { department: "Business", students: 290 },
  { department: "Psychology", students: 175 },
  { department: "Mathematics", students: 135 },
  { department: "English", students: 60 },
];

export default function DepartmentDistributionChart({ className = "" }) {
  const { t } = useTranslation('admin');
  return (
    <ChartCard title={t('dashboard.studentsPerDepartment')} className={className}
      chartType="bar" chartData={data} categoryField="department" series={[{ field: "students", name: t('dashboard.students') }]}>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }} layout="vertical">
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
          <XAxis type="number" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <YAxis type="category" dataKey="department" width={120} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-surface-primary-default-light)",
              border: "1px solid var(--color-border-primary-default-light)",
              borderRadius: "8px",
              color: "var(--color-text-primary-default-light)",
            }}
          />
          <Bar dataKey="students" fill="var(--color-bg-fill-accent-default-light)" radius={[0, 6, 6, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
