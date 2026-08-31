import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard } from "../../../../components/charts";

const data = [
  { month: "Sep", students: 120, instructors: 8 },
  { month: "Oct", students: 145, instructors: 10 },
  { month: "Nov", students: 180, instructors: 12 },
  { month: "Dec", students: 165, instructors: 11 },
  { month: "Jan", students: 210, instructors: 15 },
  { month: "Feb", students: 250, instructors: 18 },
  { month: "Mar", students: 235, instructors: 16 },
  { month: "Apr", students: 280, instructors: 20 },
];

export default function EnrollmentTrendChart({ className = "" }) {
  const { t } = useTranslation('admin');
  return (
    <ChartCard title={t('dashboard.enrollmentTrends')} className={className}
      chartType="line" chartData={data} categoryField="month" series={[{ field: "students", name: t('dashboard.students') }, { field: "instructors", name: t('dashboard.instructors') }]}>

      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
          <XAxis dataKey="month" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <YAxis className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
          <Tooltip
            contentStyle={{
              backgroundColor: "var(--color-bg-surface-primary-default-light)",
              border: "1px solid var(--color-border-primary-default-light)",
              borderRadius: "8px",
              color: "var(--color-text-primary-default-light)",
            }}
          />
          <Legend wrapperStyle={{ fontSize: "12px" }} />
          <Line type="monotone" dataKey="students" stroke="var(--color-bg-fill-accent-default-light)" strokeWidth={3} dot={{ r: 4 }} name={t('dashboard.students')} />
          <Line type="monotone" dataKey="instructors" stroke="var(--color-bg-fill-success-default-light)" strokeWidth={3} dot={{ r: 4 }} name={t('dashboard.instructors')} />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
