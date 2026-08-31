import { useTranslation } from "react-i18next";
import Section from "../../../components/ui/Section";
import { CalendarSlashIcon, ClockIcon, LocationDotIcon } from "../../../components/ui/icons";

const examTypeStyles = {
    Midterm: "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-default-light dark:text-text-blue-default-dark border-border-blue-default-light dark:border-border-blue-default-dark",
    Final: "bg-bg-surface-green-default-light dark:bg-bg-surface-green-default-dark text-text-green-default-light dark:text-text-green-default-dark border-border-green-default-light dark:border-border-green-default-dark",
};

export default function ExamSchedule({ exams = [] }) {
    const { t } = useTranslation("student");
    const getDaysRemaining = (dateStr) => {
        const examDate = new Date(dateStr);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        examDate.setHours(0, 0, 0, 0);
        const diffTime = examDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const sortedExams = [...exams].sort((left, right) => new Date(left.date) - new Date(right.date));

    return (
        <Section className="exam-schedule space-y-6">
            {/* Exam Cards */}
            <div className="flex flex-col space-y-4">
                {sortedExams.length > 0 ? (
                    sortedExams.map((exam) => (
                        <ExamCard key={exam.examScheduleId} exam={exam} daysRemaining={getDaysRemaining(exam.date)} />
                    ))
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] text-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                        <CalendarSlashIcon className="w-12 h-12 mb-4 opacity-40" />
                        <p className="text-sm">{t("schedule.noExams")}</p>
                    </div>
                )}
            </div>
        </Section>
    );
}

function ExamCard({ exam, daysRemaining }) {
    const examDate = new Date(exam.date);

    return (
        <div
            className={`
                flex flex-row items-stretch gap-3 p-4 md:p-5
                rounded-2xl border
                border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark
                shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5
            `}
        >
            {/* Date Badge */}
            <div
                className={`
                    flex flex-col items-center justify-center
                    w-20 md:w-24 shrink-0
                    rounded-xl md:rounded-2xl
                    ${examTypeStyles[exam.examType] || examTypeStyles.Midterm}
                    border
                `}
            >
                <span className="text-xl md:text-2xl font-bold leading-none">
                    {examDate.getDate()}
                </span>
                <span className="text-xs uppercase tracking-wide mt-1">
                    {examDate.toLocaleDateString("en-US", { month: "short" })}
                </span>
                <span className="text-xs mt-0.5">
                    {exam.day?.slice(0, 3)}
                </span>
            </div>

            {/* Exam Details */}
            <div className="flex-1 min-w-0 flex flex-col justify-center space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-active-light dark:text-text-secondary-active-dark">
                        {exam.courseCode}
                    </span>

                    <span
                        className={`px-2.5 py-1 text-xs font-semibold rounded-full capitalize ${examTypeStyles[exam.examType]}`}
                    >
                        {exam.examType}
                    </span>

                </div>

                <h3 className="text-sm md:text-lg font-semibold text-text-primary-active-light dark:text-text-primary-active-dark truncate">
                    {exam.courseName}
                </h3>

                <div className="flex flex-col gap-1 text-xs md:text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">
                    <span className="flex items-center gap-1.5">
                        <ClockIcon className="w-4 h-4" />
                        {exam.startTime} - {exam.endTime}
                    </span>

                    <span className="flex items-center gap-1.5">
                        <LocationDotIcon className="w-4 h-4" />
                        {exam.location}
                    </span>
                </div>
            </div>

            {/* Days Remaining */}
            {daysRemaining >= 0 && (
                <div className="flex items-center justify-center ps-2 md:ps-4 border-s border-border-primary-default-light dark:border-border-primary-default-dark w-16 md:w-20 shrink-0">
                    <div className="text-center">
                        <span className="text-xl md:text-2xl font-bold text-text-accent-active-light dark:text-text-accent-active-dark leading-none">
                            {daysRemaining}
                        </span>
                        <p className="text-xs text-text-secondary-active-light dark:text-text-secondary-active-dark">
                            {t("schedule.daysLeft")}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}