import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "../../../../components/charts";

export default function GradeDistributionChart({ className = "", data = [] }) {
  const { t, i18n } = useTranslation("student");
  const isRTL = i18n.language === 'ar';

  const toArabicDigits = (str) => {
    if (!isRTL) return str;
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  };

  const chartData = data.map((point) => ({
    course: point.course,
    grade: Number(point.grade ?? 0),
  }));

  return (
    <ChartCard title={t("dashboard.chart.gradeDistribution")} className={className}
      chartType="bar" chartData={chartData} categoryField="course" series={[{ field: "grade", name: t("dashboard.chart.grade") }]}>

      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={chartData} margin={{ top: 5, right: isRTL ? -10 : 20, left: isRTL ? 20 : -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
            <XAxis
              dataKey="course"
              tickFormatter={(value) => toArabicDigits(value)}
              className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark"
            />
            <YAxis
              domain={[0, 100]}
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
              formatter={(value) => [toArabicDigits(String(value)), t("dashboard.chart.grade")]}
              labelFormatter={(label) => toArabicDigits(label)}
            />
            <Bar dataKey="grade" name={t("dashboard.chart.grade")} fill="var(--color-bg-fill-purple-default-light)" radius={[6, 6, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
