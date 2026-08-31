import { useTranslation } from 'react-i18next';
import Button from "../../../../../components/ui/Button";
import BaseComponent from "../../../../../components/ui/BaseComponent";
import { PaperclipIcon } from "../../../../../components/ui/icons";

export default function AttendanceExcuseCard({ onRequestExcuse }) {
    const { t } = useTranslation('student');
    return (
        <BaseComponent
            className="hidden sm:flex lg:col-span-1 h-full flex-col"
            contentClassName="flex flex-1 flex-col justify-center"
            title={t('attendance.quickAction')}
            description={t('attendance.quickActionDesc')}
            componentButton={
                <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark">
                    {t('attendance.fastTrack')}
                </span>
            }
        >
            <div className="flex flex-col items-center text-center gap-5">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark shadow-sm">
                    <PaperclipIcon size={26} className="text-text-accent-active-light dark:text-text-accent-active-dark" />
                </div>

                <div>
                    <p className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('attendance.excuseQuestion')}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('attendance.excusePrompt')}
                    </p>
                </div>

                <Button
                    variant="primary"
                    startIcon={<PaperclipIcon size={18} />}
                    className="w-full justify-center"
                    onClick={onRequestExcuse}
                >
                    {t('attendance.submitExcuse')}
                </Button>
            </div>
        </BaseComponent>
    );
}
