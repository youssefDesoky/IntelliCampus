import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";

import DashboardCourse from "./courses/DashboardCourse.jsx";

import Button from "../../../components/ui/Button.jsx";
import { ListIcon, Grid3ColIcon, ArrowRightIcon } from "../../../components/ui/icons";


export default function DashboardCourses({ studentCourses=[], className = "" }) {
    const { t } = useTranslation('student');
    return (
        <div className={`p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg ${className}`}>
            <div id="dashboard-my-courses-header" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <h2 className="text-2xl font-bold">{t("dashboard.courses")}</h2>
                
                <div className="flex items-center gap-4">
                    <div className="flex flex-row items-center gap-1 bg-bg-surface-primary-hover-light dark:bg-bg-surface-primary-hover-dark p-1 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md">
                        <Button className="px-2 py-1 flex items-center gap-2 bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark rounded-md text-sm font-medium text-text-accent-active-light dark:text-text-accent-active-dark" test="active">
                            <Grid3ColIcon className="w-5 h-5" />
                        </Button>

                        <Button className="px-2 py-1 flex items-center gap-2 hover:bg-bg-surface-secondary-active-light dark:hover:bg-bg-surface-secondary-active-dark rounded-md text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark hover:text-text-primary-active-light dark:hover:text-text-primary-active-dark">
                            <ListIcon className="w-5 h-5" />
                        </Button>
                    </div>
                    <NavLink to="/courses" className="text-text-accent-default-light dark:text-text-accent-default-dark hover:underline flex items-center gap-2 font-medium">
                        {t("dashboard.viewAll")}
                        <ArrowRightIcon className="w-4 h-4 rtl:scale-x-[-1]" />
                    </NavLink>
                </div>
            </div>

            <div type="class-items" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {studentCourses.map((course) => (
                    <DashboardCourse key={course.id} courseData={course} />
                ))}
            </div>
        </div>
    );
}