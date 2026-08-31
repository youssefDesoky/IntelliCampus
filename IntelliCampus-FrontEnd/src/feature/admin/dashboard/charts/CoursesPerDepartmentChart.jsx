import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "../../../../components/charts";

const data = [
  { department: "Computer Science", courses: 24 },
  { department: "Engineering", courses: 18 },
  { department: "Business", courses: 14 },
  { department: "Psychology", courses: 10 },
  { department: "Mathematics", courses: 8 },
  { department: "English", courses: 5 },
];

export default function CoursesPerDepartmentChart({ className = "" }) {
  const { t } = useTranslation('admin');
  return (
    <ChartCard title={t('dashboard.coursesPerDepartment')} className={className}
      chartType="bar" chartData={data} categoryField="department" series={[{ field: "courses", name: t('dashboard.courses') }]}>

      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
          <XAxis dataKey="department" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <YAxis className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-surface-primary-default-light)",
              border: "1px solid var(--color-border-primary-default-light)",
              borderRadius: "8px",
              color: "var(--color-text-primary-default-light)",
            }}
          />
          <Bar dataKey="courses" fill="var(--color-bg-fill-purple-default-light)" radius={[6, 6, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
