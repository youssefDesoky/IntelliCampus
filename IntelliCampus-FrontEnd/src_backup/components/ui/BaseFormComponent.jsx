import ModelOverlay from "./ModelOverlay";
import Button from "./Button";
import { useTranslation } from 'react-i18next';

export default function BaseFormComponent({
    isOpen,
    title,
    description,
    onClose,
    onSubmit,
    submitText = "Submit",
    cancelText = "Cancel",
    children,
    maxWidth = "max-w-5xl",
    className = "",
    contentClassName = "",
    maxHeight = "max-h-[75vh] sm:max-h-none",
    footerClassName = "",
    submitDisabled = false,
    submitLoading = false,
    submitVariant = "primary",
    cancelVariant = "secondary",
}) {
    const { t } = useTranslation('common');
    if (!isOpen) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit?.(event);
    };

    return (
        <ModelOverlay onClose={onClose} maxWidth={maxWidth}>
            <form
                className={`relative z-50 w-full rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)] flex flex-col ${maxHeight} ${className}`}
                onSubmit={handleSubmit}
            >
                <div className="shrink-0 flex items-center justify-between gap-4 border-b border-border-primary-default-light px-3 sm:px-6 py-4 dark:border-border-primary-default-dark">
                    <div className="min-w-0 truncate">
                        <h3 className="text-xl font-semibold truncate text-text-primary-default-light dark:text-text-primary-default-dark">{title}</h3>
                        {description ? (
                            <p className="mt-1 text-sm truncate text-text-secondary-default-light dark:text-text-secondary-default-dark">{description}</p>
                        ) : null}
                    </div>

                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border-primary-default-light bg-bg-surface-secondary-default-light p-2 text-icon-secondary-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-icon-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                        aria-label={t('closeForm')}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5 fill-current" aria-hidden="true">
                            <path d="M18.3 5.71 12 12.01l-6.29-6.3-1.42 1.42 6.3 6.29-6.3 6.29 1.42 1.42 6.29-6.3 6.29 6.3 1.42-1.42-6.3-6.29 6.3-6.29z" />
                        </svg>
                    </button>
                </div>

                <div className={`flex-1 p-6 overflow-y-auto no-scrollbar flex flex-col justify-center ${contentClassName}`}>{children}</div>

                <div className={`shrink-0 flex gap-3 border-t border-border-primary-default-light px-3 sm:px-6 py-4 sm:justify-end dark:border-border-primary-default-dark ${footerClassName}`}>
                    <Button variant={cancelVariant} type="button" onClick={onClose} width="flex-1 sm:w-auto">
                        {cancelText}
                    </Button>
                    <Button
                        variant={submitVariant}
                        type="submit"
                        width="flex-1 sm:w-auto"
                        disabled={submitDisabled}
                        loading={submitLoading}
                    >
                        {submitText}
                    </Button>
                </div>
            </form>
        </ModelOverlay>
    );
}