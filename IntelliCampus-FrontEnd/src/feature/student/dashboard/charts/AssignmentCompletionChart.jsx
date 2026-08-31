import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard } from "../../../../components/charts";

export default function AssignmentCompletionChart({ className = "", data = [] }) {
  const { t, i18n } = useTranslation("student");
  const isRTL = i18n.language === 'ar';

  const toArabicDigits = (str) => {
    if (!isRTL) return str;
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  };

  const chartData = data.map((point) => ({
    course: point.course,
    completed: Number(point.completed ?? 0),
    pending: Number(point.pending ?? 0),
  }));

  return (
    <ChartCard title={t("dashboard.chart.assignmentCompletion")} className={className}
      chartType="bar" chartData={chartData} categoryField="course" series={[{ field: "completed", name: t("dashboard.chart.completed") }, { field: "pending", name: t("dashboard.chart.pending") }]}>

      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: isRTL ? -10 : 20, left: isRTL ? 20 : -10, bottom: 5 }} barSize={24}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
            <XAxis
              dataKey="course"
              tickFormatter={(value) => toArabicDigits(value)}
              className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark"
            />
            <YAxis
              orientation={isRTL ? 'right' : 'left'}
              tickFormatter={(value) => toArabicDigits(String(value))}
              className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark"
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "var(--color-bg-surface-primary-default-light)",
                border: "1px solid var(--color-border-primary-default-light)",
                borderRadius: "8px",
                color: "var(--color-text-primary-default-light)",
              }}
              formatter={(value, name) => [toArabicDigits(String(value)), name]}
              labelFormatter={(label) => toArabicDigits(label)}
            />
            <Legend wrapperStyle={{ fontSize: "11px", color: "var(--color-text-secondary-default-light)" }} />
            <Bar dataKey="completed" fill="var(--color-bg-fill-success-default-light)" radius={[4, 4, 0, 0]} name={t("dashboard.chart.completed")} />
            <Bar dataKey="pending" fill="var(--color-bg-fill-warning-default-light)" radius={[4, 4, 0, 0]} name={t("dashboard.chart.pending")} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
