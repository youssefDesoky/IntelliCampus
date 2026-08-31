import { useTranslation } from 'react-i18next';
import { InfoIcon } from "../../../../components/ui/icons";

export default function CoursesRegistrationNote() {
    const { t } = useTranslation('student');
    return (
        <div className="flex items-start gap-3 p-4 border border-border-accent-default-light dark:border-border-accent-default-dark bg-bg-surface-accent-default-light/30 dark:bg-bg-surface-accent-default-dark/30 rounded-md">
            <InfoIcon className="w-5 h-5 mt-0.5 text-bg-fill-primary-active-light dark:text-bg-fill-primary-active-dark shrink-0" />
            <div>
                <h4 className="mb-0.5 font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark">{t('registration.deadlineTitle')}</h4>
                <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark" dangerouslySetInnerHTML={{ __html: t('registration.deadlineText', { date: 'January 15, 2024' }) }} />
            </div>
        </div>
    );
}