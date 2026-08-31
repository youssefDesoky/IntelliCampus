import ModelOverlay from "./ModelOverlay";
import Button from "./Button";
import { useTranslation } from 'react-i18next';

export default function BaseFormComponent({
    isOpen,
    title,
    description,
    onClose,
    onSubmit,
    submitText,
    cancelText,
    children,
    maxWidth = "max-w-5xl",
    className = "",
    contentClassName = "",
    maxHeight = "max-h-[85vh]",
    footerClassName = "",
    submitDisabled = false,
    submitLoading = false,
    submitVariant = "primary",
    cancelVariant = "secondary",
    fullScreen = false,
}) {
    const { t } = useTranslation('common');
    const displaySubmitText = submitText ?? t('submit', 'Submit');
    const displayCancelText = cancelText ?? t('cancel', 'Cancel');
    if (!isOpen) return null;

    const handleSubmit = (event) => {
        event.preventDefault();
        onSubmit?.(event);
    };

    return (
        <ModelOverlay onClose={onClose} maxWidth={maxWidth} fullScreen={fullScreen}>
            <form
                className={`relative z-50 w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark flex flex-col ${fullScreen ? "h-full rounded-none border-0 shadow-none" : `rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)] ${maxHeight}`} ${className}`}
                onSubmit={handleSubmit}
            >
                <div className={`shrink-0 flex items-center justify-between gap-4 border-b border-border-primary-default-light px-3 sm:px-6 py-4 dark:border-border-primary-default-dark ${fullScreen ? "px-6" : ""}`}>
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

                <div className={`flex-1 overflow-y-auto no-scrollbar flex flex-col justify-start ${fullScreen ? "p-6" : "p-6"} ${contentClassName}`}>{children}</div>

                <div className={`shrink-0 flex gap-3 border-t border-border-primary-default-light px-3 sm:px-6 py-4 dark:border-border-primary-default-dark ${fullScreen ? "justify-end" : "sm:justify-end"} ${footerClassName}`}>
                    <Button variant={cancelVariant} type="button" onClick={onClose} width={fullScreen ? "auto" : "flex-1 sm:w-auto"}>
                        {displayCancelText}
                    </Button>
                    <Button
                        variant={submitVariant}
                        type="submit"
                        width={fullScreen ? "auto" : "flex-1 sm:w-auto"}
                        disabled={submitDisabled}
                        loading={submitLoading}
                    >
                        {displaySubmitText}
                    </Button>
                </div>
            </form>
        </ModelOverlay>
    );
}