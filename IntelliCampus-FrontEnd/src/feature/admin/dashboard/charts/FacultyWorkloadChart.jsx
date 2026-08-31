import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { ChartCard } from "../../../../components/charts";
import { UserTieIcon } from "../../../../components/ui/icons";
import { facultyWorkloadData } from "../data/dashboardData";

export default function FacultyWorkloadChart({ className = "" }) {
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
   title={t('dashboard.facultyWorkload')}
   icon={<UserTieIcon className="w-5 h-5" />}
   onTitleClick={() => navigate("/admin/instructors")}
   className={className}
   chartType="bar" chartData={facultyWorkloadData} categoryField="name" series={[{ field: "courses", name: t('dashboard.courses') }, { field: "students", name: t('dashboard.students') }]}>

 <ResponsiveContainer width="100%" height={260}>
 <BarChart data={facultyWorkloadData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
 <CartesianGrid strokeDasharray="3 3" className="stroke-border-primary-default-light dark:stroke-border-primary-default-dark" />
 <XAxis dataKey="name" className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
 <YAxis className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark" />
 <Tooltip contentStyle={customTooltipStyle} />
 <Legend wrapperStyle={{ fontSize: "12px" }} />
  <Bar dataKey="courses" fill="var(--color-bg-fill-accent-default-light)" radius={[6, 6, 0, 0]} name={t('dashboard.courses')} />
  <Bar dataKey="students" fill="var(--color-bg-fill-purple-default-light)" radius={[6, 6, 0, 0]} name={t('dashboard.students')} />
 </BarChart>
 </ResponsiveContainer>
 </ChartCard>
 );
}
