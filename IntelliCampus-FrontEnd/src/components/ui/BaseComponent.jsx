export default function BaseComponent({
    title,
    description,
    componentButton,
    actions,
    children,
    className = "",
    contentClassName = "",
    titleClassName = "text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark",
    descriptionClassName = "mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark",
}) {
    const contentClasses = contentClassName
        ? `px-5 py-5 sm:px-6 ${contentClassName}`
        : "px-5 py-5 sm:px-6";

    return (
        <div className={`overflow-hidden rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-sm ${className}`}>
            {(title || description || componentButton || actions) && (
                <div className="border-b border-border-primary-default-light dark:border-border-primary-default-dark px-5 py-4 sm:px-6 sm:py-5">
                    <div className="flex flex-row flex-wrap items-start justify-between gap-4">
                        <div className="flex min-w-0 flex-1 flex-col gap-1">
                            {title ? <h1 className={titleClassName}>{title}</h1> : null}
                            {description ? <p className={descriptionClassName}>{description}</p> : null}
                        </div>

                        {(componentButton || actions) ? (
                            <div className="shrink-0 flex items-center gap-3">
                                {componentButton}
                                {actions}
                            </div>
                        ) : null}
                    </div>
                </div>
            )}

		    {children ? <div className={contentClasses}>{children}</div> : null}
        </div>
    );
}