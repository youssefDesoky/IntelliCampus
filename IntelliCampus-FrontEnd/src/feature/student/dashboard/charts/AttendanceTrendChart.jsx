import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { ChartCard } from "../../../../components/charts";

const tooltipStyle = {
  backgroundColor: "var(--color-bg-surface-primary-default-light)",
  border: "1px solid var(--color-border-primary-default-light)",
  borderRadius: "8px",
  color: "var(--color-text-primary-default-light)",
};

export default function AttendanceTrendChart({ className = "", data = [], downloadUrl }) {
  const { t, i18n } = useTranslation("student");
  const isRTL = i18n.language === 'ar';

  const toArabicDigits = (str) => {
    if (!isRTL) return str;
    return str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]);
  };

  const translateLabel = (label) => {
    if (!isRTL) return label;
    return label.replace(/Week/g, 'أسبوع');
  };

  const chartData = data.map((point) => ({
    week: point.week,
    attendance: Number(point.attendance ?? 0),
  }));

  return (
    <ChartCard title={t("dashboard.chart.attendanceTrendWeekly")} className={className} downloadUrl={downloadUrl}
      chartType="line" chartData={chartData} categoryField="week" series={[{ field: "attendance", name: t("dashboard.chart.attendanceRate") }]}>

      <div dir={isRTL ? 'rtl' : 'ltr'}>
        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={chartData} margin={{ top: 5, right: isRTL ? -10 : 20, left: isRTL ? 20 : -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
            <XAxis
              dataKey="week"
              tickFormatter={(value) => toArabicDigits(translateLabel(value))}
              className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark"
            />
            <YAxis
              domain={[0, 100]}
              orientation={isRTL ? 'right' : 'left'}
              tickFormatter={(value) => toArabicDigits(String(value))}
              className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark"
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value) => [toArabicDigits(String(value)) + '%', t("dashboard.chart.attendanceRate")]}
              labelFormatter={(label) => toArabicDigits(translateLabel(label))}
            />
            <Line type="monotone" dataKey="attendance" name={t("dashboard.chart.attendanceRate")} stroke="var(--color-bg-fill-accent-default-light)" strokeWidth={3} dot={{ fill: "var(--color-bg-fill-accent-default-light)", r: 5 }} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </ChartCard>
  );
}
