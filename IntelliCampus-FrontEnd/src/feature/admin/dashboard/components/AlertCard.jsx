import { useNavigate } from "react-router-dom";
import { WarningIcon, ExclamationIcon, InfoIcon } from "../../../../components/ui/icons";

const typeConfig = {
 danger: {
 icon: WarningIcon,
 dot: "bg-bg-fill-danger-default-light dark:bg-bg-fill-danger-default-dark",
 border: "border-s-border-danger-default-light dark:border-s-border-danger-default-dark",
 bg: "bg-bg-surface-danger-default-light/20 dark:bg-bg-surface-danger-default-dark/20",
 },
 warning: {
 icon: ExclamationIcon,
 dot: "bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark",
 border: "border-s-border-warning-default-light dark:border-s-border-warning-default-dark",
 bg: "bg-bg-surface-warning-default-light/20 dark:bg-bg-surface-warning-default-dark/20",
 },
 info: {
 icon: InfoIcon,
 dot: "bg-bg-fill-info-default-light dark:bg-bg-fill-info-default-dark",
 border: "border-s-border-accent-default-light dark:border-s-border-accent-default-dark",
 bg: "bg-bg-surface-info-default-light/20 dark:bg-bg-surface-info-default-dark/20",
 },
};

export default function AlertCard({ title, description, type = "info", action, actionLink }) {
 const navigate = useNavigate();
 const config = typeConfig[type];
 const IconComponent = config.icon;

 return (
 <div
 className={`group flex items-start gap-4 p-4 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark border-s-4 ${config.border} ${config.bg} hover:shadow-md transition-all duration-300`}
 onClick={() => actionLink && navigate(actionLink)}
 >
 <div
 className={`shrink-0 w-10 h-10 rounded-lg flex items-center justify-center ${config.dot} bg-opacity-20`}
 >
 <IconComponent className="w-5 h-5 text-[var(--color-text-accent-active-light)] dark:text-[var(--color-text-accent-active-dark)]" />
 </div>
 <div className="flex-1 min-w-0">
 <h4 className="font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark">
 {title}
 </h4>
 <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1">
 {description}
 </p>
 </div>
 {action && (
 <span
 className="shrink-0 text-xs font-medium text-text-accent-default-light dark:text-text-accent-default-dark opacity-0 group-hover:opacity-100 transition-opacity duration-200 self-center"
 onClick={(e) => {
 e.stopPropagation();
 navigate(actionLink);
 }}
 >
 {action} &rarr;
 </span>
 )}
 </div>
 );
}
