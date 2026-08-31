import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Section from "../../../components/ui/Section";
import useArabicDigits from "../../../hooks/useArabicDigits";

export default function AttendanceOverall({className, studentAttendance}) {
    const { t } = useTranslation('student');
    const { convert: ar } = useArabicDigits();
    return (
        <div className={`p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg ${className}`}>
            <h2 className="text-2xl font-semibold mb-4">{t("attendance.title")}</h2>

            <div className="relative w-48 h-48 mx-auto mb-4">
                <svg className="w-full h-full -rotate-90">
                    {/* Background circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="none"
                        className="text-text-tertiary-default-light dark:text-text-tertiary-default-dark"
                    />

                    {/* Progress circle */}
                    <circle
                        cx="96"
                        cy="96"
                        r="80"
                        stroke="currentColor"
                        strokeWidth="16"
                        fill="none"
                        strokeDasharray={2 * Math.PI * 80}
                        strokeDashoffset={(1 - studentAttendance / 100) * 2 * Math.PI * 80}
                        strokeLinecap="round"
                        className={`${studentAttendance >= 75 ? 'text-text-accent-default-light dark:text-text-accent-default-dark' : studentAttendance >= 50 ? 'text-text-warning-default-light dark:text-text-warning-default-dark' : 'text-text-danger-default-light dark:text-text-danger-default-dark'} transition-all duration-500`}
                    />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <p className="text-3xl font-bold">{ar(studentAttendance)}%</p>
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t("attendance.overall")}</p>
                </div>
            </div>


            <div className="mb-4 py-4 text-sm border-y border-border-primary-default-light text-text-primary-default-light dark:text-text-primary-default-dark dark:border-border-primary-default-dark">
                <div className="flex justify-between mb-2">
                    <p>{t("attendance.present")}</p>
                    <p>{ar(41)}</p>
                </div>

                <div className="flex justify-between mb-2">
                    <p>{t("attendance.absent")}</p>
                    <p>{ar(9)}</p>
                </div>

                <div className="flex justify-between">
                    <p>{t("dashboard.totalClasses")}</p>
                    <p>{ar(50)}</p>
                </div>
            </div>

            <NavLink 
                to="/attendance" 
                className="block text-center bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark px-4 py-2 rounded-lg hover:bg-bg-surface-accent-hover-light dark:hover:bg-bg-surface-accent-hover-dark transition duration-200"
            >
                {t("dashboard.viewDetailedAttendance")}
            </NavLink>
        </div>
    );
}