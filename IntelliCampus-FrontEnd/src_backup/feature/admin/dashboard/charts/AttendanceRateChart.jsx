import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard } from "../../../../components/charts";
import { ChartLineIcon } from "../../../../components/ui/icons";
import { attendanceRateData } from "../data/dashboardData";

export default function AttendanceRateChart({ className = "" }) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();
  const rateLabel = t('dashboard.rate');
  const [hiddenSeries, setHiddenSeries] = useState({});

 const handleLegendClick = (entry) => {
 setHiddenSeries((prev) => ({ ...prev, [entry]: !prev[entry] }));
 };

 const customTooltipStyle = {
 backgroundColor: "var(--color-bg-surface-primary-default-light)",
 border: "1px solid var(--color-border-primary-default-light)",
 borderRadius: "8px",
 color: "var(--color-text-primary-default-light)",
 };

 return (
  <ChartCard
   title={t('dashboard.attendanceRateOverTime')}
   icon={<ChartLineIcon className="w-5 h-5" />}
   onTitleClick={() => navigate("/admin/analytics")}
   className={className}
   chartType="line" chartData={attendanceRateData} categoryField="month" series={[{ field: "rate", name: rateLabel }]}>

 <ResponsiveContainer width="100%" height={260}>
 <LineChart data={attendanceRateData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
 <XAxis dataKey="month" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
 <YAxis domain={[60, 100]} className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
  <Tooltip contentStyle={customTooltipStyle} formatter={(value) => [`${value}%`, rateLabel]} />
  <Legend
  wrapperStyle={{ fontSize: "12px", cursor: "pointer" }}
  onClick={(e) => handleLegendClick(e.value)}
  />
  {!hiddenSeries[rateLabel] && (
  <Line
  type="monotone"
  dataKey="rate"
  stroke="var(--color-bg-fill-accent-default-light)"
  strokeWidth={3}
  dot={{ r: 4, fill: "var(--color-bg-fill-accent-default-light)" }}
  activeDot={{ r: 6 }}
  name={rateLabel}
  />
 )}
 </LineChart>
 </ResponsiveContainer>
 </ChartCard>
 );
}
