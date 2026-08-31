import Button from "../../../../components/ui/Button";
import { CalendarIcon } from "../../../../components/ui/icons";
import { useTranslation } from "react-i18next";
import { getLocalizedField } from '../../../../utils/getLocalizedField';

export default function DashboardCourse({ courseData }) {
    const { t, i18n } = useTranslation('student');
    const title = getLocalizedField(courseData, 'courseName', i18n.language) ?? courseData.title ?? "";
    const id = getLocalizedField(courseData, 'courseCode', i18n.language) ?? courseData.courseCode ?? courseData.id ?? "";
    const professor = getLocalizedField(courseData, 'professorName', i18n.language) ?? getLocalizedField(courseData, 'instructorName', i18n.language) ?? courseData.professorName ?? courseData.professor ?? "";
    const department = getLocalizedField(courseData, 'departmentName', i18n.language) ?? courseData.department ?? "";
    const schedule = getLocalizedField(courseData, 'schedule', i18n.language) ?? courseData.schedule ?? "";
    const weeksCompleted = courseData.weeksCompleted ?? courseData.WeeksCompleted ?? 0;
    const totalWeeks = courseData.weeks ?? courseData.Weeks ?? 16;
    const progress = totalWeeks > 0 ? `${Math.round((weeksCompleted / totalWeeks) * 100)}%` : "0%";

    return (
        <div type="class-item" className="mb-4 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg">
            <div className="p-4 mb-4 w-full bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark rounded-t-lg inline-block">                
                <h3 className="text-xl font-bold my-2">{title}</h3>

                <p className="text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{id}</p>
            </div>

            <div className="flex items-center justify-between px-4 mb-4">
                <div className="flex items-center gap-3">
                    <img src="/images/students/youssefAhmed/profile.png" alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                        <h4 className="font-semibold">{professor}</h4>
                        <p className="text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{department}</p>
                    </div>
                </div>
            </div>

            <div className="mb-4 px-4">
                <div className="flex justify-between mb-1">
                    <p>{t("dashboard.courseProgress")}</p>
                    <span>{progress}</span>
                </div>
                <div className="w-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-full h-2.5">
                    <div className={`bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark h-2.5 rounded-full`} style={{width: progress}}></div>
                </div>
            </div>

            <div className="p-4 flex justify-between border-t border-border-primary-default-light dark:border-border-primary-default-dark text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                <div className="flex items-center gap-2">
                    <CalendarIcon className="w-5 h-5" />
                    <span>{schedule}</span>
                </div>

                <Button className="px-4 py-2 bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark rounded-lg font-medium">{t("myCourses.enterClassroom")}</Button>
            </div>
        </div>
    );
}