import { format } from "date-fns";
import { useTranslation } from "react-i18next";

export default function TodayReminderItem({ reminder }) {
    const { t } = useTranslation('student');
    const completed = reminder.submissionState === "completed";
    return (
        <li className={`p-4 border border-s-8 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 ease-in-out ${
            completed
                ? "border-green-300 dark:border-green-700 border-s-green-500 dark:border-s-green-400 bg-green-50 dark:bg-green-950/40"
                : "border-border-primary-default-light dark:border-border-primary-default-dark border-s-border-accent-default-light dark:border-s-border-accent-default-dark"
        }`}>
            <div className="mb-2 flex justify-between items-center">
                <h3 className={`text-sm font-semibold ${completed ? "text-green-700 dark:text-green-300 line-through opacity-70" : ""}`}>{reminder.title}</h3>
                <div className="flex items-center gap-2">
                    {completed && (
                        <span className="px-2 py-0.5 text-[10px] font-bold rounded-md bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                            {t("dashboard.completed")}
                        </span>
                    )}
                    <p className="text-xs font-medium text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{reminder.priority}</p>
                </div>
            </div>

            <div className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark flex items-center">
                <span>{reminder.category}</span>
                <span className="mx-2 w-2 h-1 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"></span>
                <span>{reminder.dueAt ? format(new Date(reminder.dueAt), "hh:mm a") : reminder.dueDate}</span>
            </div>
        </li>
    );
}
