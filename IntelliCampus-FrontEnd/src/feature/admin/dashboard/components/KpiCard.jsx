import { UsersIcon, BookIcon, UserTieIcon, ChartLineIcon, ClipboardCheckIcon } from "../../../../components/ui/icons";

const iconMap = {
 users: UsersIcon,
 book: BookIcon,
 userTie: UserTieIcon,
 chartLine: ChartLineIcon,
 clipboardCheck: ClipboardCheckIcon,
};

const colorMap = {
 blue: {
 bg: "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark",
 border: "border-border-blue-default-light dark:border-border-blue-default-dark",
 text: "text-text-blue-accent-light dark:text-text-blue-accent-dark",
 icon: "text-[var(--color-text-blue-accent-light)] dark:text-[var(--color-text-blue-accent-dark)] dark:text-[var(--color-text-blue-accent-light)] dark:text-[var(--color-text-blue-accent-dark)]",
 },
 amber: {
 bg: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark",
 border: "border-border-amber-default-light dark:border-border-amber-default-dark",
 text: "text-text-amber-accent-light dark:text-text-amber-accent-dark",
 icon: "text-[var(--color-text-warning-hover-light)] dark:text-[var(--color-text-warning-hover-dark)] dark:text-[var(--color-text-warning-default-light)] dark:text-[var(--color-text-warning-default-dark)]",
 },
 green: {
 bg: "bg-bg-surface-green-default-light dark:bg-bg-surface-green-default-dark",
 border: "border-border-green-default-light dark:border-border-green-default-dark",
 text: "text-text-green-accent-light dark:text-text-green-accent-dark",
 icon: "text-[var(--color-text-success-default-light)] dark:text-[var(--color-text-success-default-dark)] dark:text-[var(--color-text-success-default-light)] dark:text-[var(--color-text-success-default-dark)]",
 },
 purple: {
 bg: "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark",
 border: "border-border-purple-default-light dark:border-border-purple-default-dark",
 text: "text-text-purple-accent-light dark:text-text-purple-accent-dark",
 icon: "text-[var(--color-text-purple-default-light)] dark:text-[var(--color-text-purple-default-dark)] dark:text-[var(--color-text-purple-accent-light)] dark:text-[var(--color-text-purple-accent-dark)]",
 },
 red: {
 bg: "bg-bg-surface-red-default-light dark:bg-bg-surface-red-default-dark",
 border: "border-border-red-default-light dark:border-border-red-default-dark",
 text: "text-text-red-default-light dark:text-text-red-default-dark",
 icon: "text-[var(--color-text-danger-default-light)] dark:text-[var(--color-text-danger-default-dark)] dark:text-[var(--color-text-danger-default-light)] dark:text-[var(--color-text-danger-default-dark)]",
 },
};

export default function KpiCard({ title, value, trend, icon = "users", color = "blue" }) {
 const IconComponent = iconMap[icon];
 const colors = colorMap[color];

 return (
 <div
 className={`group relative flex items-center gap-4 p-5 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-sm hover:shadow-md hover:border-primary-300 dark:hover:border-primary-700 transition-all duration-300 hover:-translate-y-1`}
 >
 <div
 className={`shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center ${colors.bg} shadow-inner group-hover:shadow-md group-hover:scale-105 transition-all duration-300`}
 >
 <IconComponent className={`w-6 h-6 ${colors.icon}`} />
 </div>

 <div className="flex flex-col grow min-w-0">
 <p className="text-xs font-medium uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">
 {title}
 </p>
 <div className="flex items-center gap-2 mt-0.5">
 <h2 className="text-2xl md:text-3xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark leading-tight tracking-tight">
 {value}
 </h2>
 {trend && (
 <span
 className={`inline-flex items-center gap-0.5 text-xs font-semibold px-1.5 py-0.5 rounded-full ${ trend.isUp ? "text-text-success-default-light dark:text-text-success-default-dark bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark" : "text-text-danger-default-light dark:text-text-danger-default-dark bg-bg-surface-danger-default-light dark:bg-bg-surface-danger-default-dark" }`}
 >
 <svg
 xmlns="http://www.w3.org/2000/svg"
 viewBox="0 0 384 512"
 className={`w-2.5 h-2.5 fill-current ${trend.isUp ? "" : "rotate-180"}`}
 >
 <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2V448c0 17.7 14.3 32 32 32s32-14.3 32-32V141.3l105.4 105.3c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z" />
 </svg>
 {trend.value}%
 </span>
 )}
 </div>
 </div>
 </div>
 );
}
