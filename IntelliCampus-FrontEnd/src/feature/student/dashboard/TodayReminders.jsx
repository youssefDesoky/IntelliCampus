import { useQuery } from "@tanstack/react-query";
import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import TodayReminderItem from "./upcomingDeadlines/TodayReminderItem";

import { BellIconDark, BellSlashIcon, ArrowRightIcon } from "../../../components/ui/icons";
import { fetchRemindersByDay } from "../remindersApi";

export default function TodayReminders({ className }) {
    const { t } = useTranslation('student');
    const { data: reminders = [], isLoading, error } = useQuery({
        queryKey: ["todayReminders"],
        queryFn: () => fetchRemindersByDay(new Date()),
        staleTime: 0,
    });

    return (
        <div className={`flex flex-col p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg h-full ${className}`}>
            <div id="today-reminders-header" className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{t("dashboard.todayReminders")}</h2>
                <BellIconDark className="w-6 h-6" />
            </div>

            <menu className="flex flex-col gap-3 mb-8">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                        <BellIconDark className="w-12 h-12 mb-4" />
                        <p className="text-center">{t("dashboard.loadingReminders")}</p>
                    </div>
                ) : reminders.length === 0 ? (
                    <div className="flex-1 mb-4 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                        <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <BellSlashIcon className="w-12 h-12 mb-4" />
                            <p className="text-center">{t("dashboard.noRemindersToday")}</p>
                        </div>
                    </div>
                ) : (
                    reminders.map((reminder, index) => (
                        <TodayReminderItem key={reminder.id ?? index} reminder={reminder} />
                    ))
                )}
            </menu>

            <NavLink to="/reminders" className="text-text-accent-default-light dark:text-text-accent-default-dark hover:underline flex items-center gap-2 justify-center font-medium">
                {t("dashboard.viewAllReminders")}
                <ArrowRightIcon className="w-4 h-4 rtl:scale-x-[-1]" />
            </NavLink>
        </div>
    );
}
