import { useTranslation } from 'react-i18next';
import ProgressBox from "../../../../../components/ui/ProgressBox";
import BaseComponent from "../../../../../components/ui/BaseComponent";

export default function AttendanceBreakdown({ breakdown }) {
    const { t } = useTranslation('student');
    const { totalSessions = 0, presentSessions = 0, missedSessions = 0, percentage = 0, onTimePercentage = 0, needsImprovementPercentage = 0 } = breakdown ?? {};

    const attendanceStatus = percentage >= 85
        ? t('attendance.statusExcellent')
        : percentage >= 75
        ? t('attendance.statusGood')
        : percentage >= 50
        ? t('attendance.statusNeedsFocus')
        : t('attendance.statusAtRisk');

    const statusToneClass = percentage >= 85
        ? "bg-bg-surface-success-default-light dark:bg-bg-surface-success-default-dark text-text-success-active-light dark:text-text-success-active-dark"
        : percentage >= 75
        ? "bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark"
        : percentage >= 50
        ? "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-warning-active-light dark:text-text-warning-active-dark"
        : "bg-bg-surface-danger-default-light dark:bg-bg-surface-danger-default-dark text-text-danger-active-light dark:text-text-danger-active-dark";

    const breakdownNote = percentage >= 85
        ? t('attendance.breakdownNoteStrong')
        : percentage >= 75
        ? t('attendance.breakdownNoteClose')
        : percentage >= 50
        ? t('attendance.breakdownNoteNeedsMore')
        : t('attendance.breakdownNoteLow');

    return (
        <BaseComponent
            className="hidden sm:flex lg:col-span-1 h-full flex-col"
            contentClassName="flex flex-1 flex-col justify-center space-y-5"
            title={t('attendance.breakdownLabel')}
            titleClassName="text-xs font-semibold uppercase tracking-[0.2em] text-text-secondary-light dark:text-text-secondary-dark"
            description={t('attendance.breakdownDesc')}
        >
            <div className="space-y-4">
                <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-default-light/80 px-4 py-4 shadow-sm dark:bg-bg-surface-default-dark/80">
                    <ProgressBox progress={onTimePercentage} backgroundColor="bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark">
                        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{t('attendance.onTime')}</p>
                        <span className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">{onTimePercentage}%</span>
                    </ProgressBox>
                </div>

                <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-default-light/80 px-4 py-4 shadow-sm dark:bg-bg-surface-default-dark/80">
                    <ProgressBox progress={needsImprovementPercentage} backgroundColor="bg-bg-fill-danger-default-light dark:bg-bg-fill-danger-default-dark">
                        <p className="text-sm font-medium text-text-primary-light dark:text-text-primary-dark">{t('attendance.needsImprovement')}</p>
                        <span className="text-sm font-semibold text-text-secondary-light dark:text-text-secondary-dark">{needsImprovementPercentage}%</span>
                    </ProgressBox>
                </div>
            </div>

            <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-default-light/85 p-4 shadow-sm dark:bg-bg-surface-default-dark/85">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <p className="text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">{t('attendance.sessionSplit')}</p>
                        <p className="mt-1 text-sm text-text-secondary-light dark:text-text-secondary-dark">{breakdownNote}</p>
                    </div>

                    <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${statusToneClass}`}>
                        {attendanceStatus}
                    </span>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-2xl bg-bg-fill-secondary-default-light/80 px-3 py-3 text-center dark:bg-bg-fill-secondary-default-dark/80">
                        <p className="text-xs uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">{t('attendance.present')}</p>
                        <p className="mt-2 text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{presentSessions}</p>
                    </div>
                    <div className="rounded-2xl bg-bg-fill-secondary-default-light/80 px-3 py-3 text-center dark:bg-bg-fill-secondary-default-dark/80">
                        <p className="text-xs uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">{t('attendance.missed')}</p>
                        <p className="mt-2 text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{missedSessions}</p>
                    </div>
                    <div className="rounded-2xl bg-bg-fill-secondary-default-light/80 px-3 py-3 text-center dark:bg-bg-fill-secondary-default-dark/80">
                        <p className="text-xs uppercase tracking-[0.16em] text-text-secondary-light dark:text-text-secondary-dark">{t('attendance.total')}</p>
                        <p className="mt-2 text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{totalSessions}</p>
                    </div>
                </div>
            </div>
        </BaseComponent>
    );
}