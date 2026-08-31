import {NavLink} from "react-router-dom";
import { useTranslation } from "react-i18next";

import TodayClassItem from "./todayClasses/TodayClassItem";

import { ArrowRightIcon, CalendarCheckIcon } from "../../../components/ui/icons";

export default function TodayClasses({ className, todayClasses=[], columnLayout = false }) {
    const { t } = useTranslation('student');
    const gridClasses = columnLayout ? "grid grid-cols-1 gap-4" : "grid grid-cols-1 md:grid-cols-2 gap-4";
    const emptyStateSpan = columnLayout ? "mb-4 h-full border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg" : "mb-4 md:col-span-2 h-full border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg";

    const showOddSlotFiller = !columnLayout && todayClasses.length % 2 !== 0;

    return (
        <div className={`p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg ${className}`}>
            <div id="today-classes-header" className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold">{t("dashboard.todayClasses")}</h2>
                
                <NavLink to="/schedule" className="text-text-accent-default-light dark:text-text-accent-default-dark hover:underline flex items-center gap-2 font-medium">
                    {t("dashboard.viewFullSchedule")}
                    <ArrowRightIcon className="w-4 h-4 rtl:scale-x-[-1]" />
                </NavLink>
            </div>

            <div type="class-items" className={gridClasses}>
                {todayClasses.length === 0 ? (
                    <div className={emptyStateSpan}>
                        <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <CalendarCheckIcon className="w-12 h-12 mb-4" />
                            <p className="text-center">{t("dashboard.noClassesToday")}</p>
                        </div>
                    </div>
                ) : (
                    <>
                        {todayClasses.map((classItem) => (<TodayClassItem key={classItem.id} classInfo={classItem} />))}

                        {showOddSlotFiller && (
                            <div className="mb-4 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
                                <div className="flex flex-col items-center justify-center h-full p-6 text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                    <CalendarCheckIcon className="w-12 h-12 mb-4" />
                            <p className="text-center">{t("dashboard.noClassesToday")}</p>
                                </div>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}