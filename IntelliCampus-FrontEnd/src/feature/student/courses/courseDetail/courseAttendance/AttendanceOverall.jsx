import { useTranslation } from 'react-i18next';
import CircularProgress from "../../../../../components/ui/CircularProgress";
import BaseComponent from "../../../../../components/ui/BaseComponent";
import Button from "../../../../../components/ui/Button";
import { PaperclipIcon } from "../../../../../components/ui/icons";
import useArabicDigits from "../../../../../hooks/useArabicDigits";

export default function AttendanceOverall({ attendance, onRequestExcuse }) {
    const { t } = useTranslation('student');
    const { convert: ar } = useArabicDigits();
    const { percentage = 0, attendedSessions = 0, missedSessions = 0 } = attendance ?? {};

    const attendanceSummary = percentage >= 75
        ? t('attendance.summaryStrong')
        : percentage >= 50
        ? t('attendance.summaryFine')
        : t('attendance.summaryBehind');

    const attendanceStatus = percentage >= 85
        ? t('attendance.statusExcellent')
        : percentage >= 75
        ? t('attendance.statusGood')
        : percentage >= 50
        ? t('attendance.statusNeedsFocus')
        : t('attendance.statusAtRisk');

    const attendanceStatusClass = percentage >= 85
        ? "bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark text-text-success-active-light dark:text-text-success-active-dark"
        : percentage >= 75
        ? "bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark"
        : percentage >= 50
        ? "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-warning-active-light dark:text-text-warning-active-dark"
        : "bg-bg-surface-danger-default-light dark:bg-bg-surface-danger-default-dark text-text-danger-active-light dark:text-text-danger-active-dark";

    return (
        <BaseComponent
            className="lg:col-span-1 h-full flex flex-col"
            contentClassName="flex flex-1 flex-col justify-center"
            title={t('attendance.overall')}
            description={t('attendance.overallDesc')}
            componentButton={
                <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${attendanceStatusClass}`}>
                    {attendanceStatus}
                </span>
            }
        >
            <div className="flex flex-col items-center text-center gap-5">
                <CircularProgress progress={percentage} size={140} />
                <p className="text-sm leading-6 text-text-secondary-default-light dark:text-text-secondary-default-dark">{attendanceSummary}</p>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
                <div className="rounded-xl bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('attendance.attended')}</p>
					<p className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{ar(attendedSessions)}</p>
                </div>
                <div className="rounded-xl bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark px-4 py-3 text-center">
                    <p className="text-xs uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark mb-1">{t('attendance.missed')}</p>
					<p className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{ar(missedSessions)}</p>
                </div>
            </div>

            <Button variant="primary" startIcon={<PaperclipIcon size={18} />} className="mt-6 w-full justify-center sm:hidden" onClick={onRequestExcuse}>
                {t('attendance.submitExcuse')}
            </Button>
        </BaseComponent>
    );
}