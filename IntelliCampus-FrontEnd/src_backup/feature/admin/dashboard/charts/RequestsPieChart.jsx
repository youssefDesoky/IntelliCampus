import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { ChartCard } from "../../../../components/charts";
import { ClipboardCheckIcon } from "../../../../components/ui/icons";
import { requestsStatusData } from "../data/dashboardData";

const COLORS = [
 "var(--color-bg-fill-warning-default-light)",
 "var(--color-bg-fill-success-default-light)",
 "var(--color-bg-fill-danger-default-light)",
];

export default function RequestsPieChart({ className = "" }) {
  const { t } = useTranslation('admin');
  const navigate = useNavigate();

 const customTooltipStyle = {
 backgroundColor: "var(--color-bg-surface-primary-default-light)",
 border: "1px solid var(--color-border-primary-default-light)",
 borderRadius: "8px",
 color: "var(--color-text-primary-default-light)",
 };

 return (
  <ChartCard
   title={t('dashboard.requestsStatus')}
   icon={<ClipboardCheckIcon className="w-5 h-5" />}
   onTitleClick={() => navigate("/admin/courses")}
   className={className}
   chartType="pie" chartData={requestsStatusData} categoryField="status" series={[{ field: "count", name: t('dashboard.count') }]}>

 <ResponsiveContainer width="100%" height={260}>
 <PieChart>
 <Pie
 data={requestsStatusData}
 dataKey="count"
 nameKey="status"
 cx="50%"
 cy="50%"
 outerRadius={90}
 innerRadius={50}
 paddingAngle={4}
 >
 {requestsStatusData.map((_, index) => (
 <Cell key={index} fill={COLORS[index % COLORS.length]} />
 ))}
 </Pie>
 <Tooltip contentStyle={customTooltipStyle} />
 <Legend wrapperStyle={{ fontSize: "12px" }} />
 </PieChart>
 </ResponsiveContainer>
 </ChartCard>
 );
}
