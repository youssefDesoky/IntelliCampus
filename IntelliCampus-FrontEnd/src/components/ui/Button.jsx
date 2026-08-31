import { useTranslation } from 'react-i18next';

export default function Button({
    variant = "primary",
    size = "md",
    width = "w-fit",
    loading = false,
    disabled = false,
    loadingText,
    startIcon,
    endIcon,
    children,
    className = "",
    ...props
}) {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const base = "rounded-md font-medium transition-colors flex items-center justify-center gap-2 whitespace-nowrap shrink-0";
    const loadingDot = "mx-1 bg-current rounded-full inline-block w-1.5 h-1.5";
    
    const variants = {
        primary: "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark active:bg-bg-fill-accent-default-light/80 dark:active:bg-bg-fill-accent-default-dark/80 border border-border-primary-default-light dark:border-border-primary-default-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-blue-accent-light dark:focus-visible:ring-text-blue-accent-dark",
        secondary: "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-fill-secondary-hover-light dark:hover:bg-bg-fill-secondary-hover-dark active:bg-bg-fill-secondary-active-light dark:active:bg-bg-fill-secondary-active-dark border border-border-primary-default-light dark:border-border-primary-default-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-blue-accent-light dark:focus-visible:ring-text-blue-accent-dark",
        text: "bg-transparent text-text-secondary-active-light dark:text-text-secondary-active-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark active:bg-bg-fill-tertiary-active-light dark:active:bg-bg-fill-tertiary-active-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-blue-accent-light dark:focus-visible:ring-text-blue-accent-dark",
        danger: "bg-bg-fill-danger-default-light dark:bg-bg-fill-danger-default-dark text-white hover:opacity-90 active:opacity-80 border border-border-danger-default-light dark:border-border-danger-default-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-blue-accent-light dark:focus-visible:ring-text-blue-accent-dark",
        success: "bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark text-white hover:opacity-90 active:opacity-80 border border-border-success-default-light dark:border-border-success-default-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-blue-accent-light dark:focus-visible:ring-text-blue-accent-dark",
        warning: "bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark text-white dark:text-black hover:opacity-90 active:opacity-80 border border-border-warning-default-light dark:border-border-warning-default-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-text-blue-accent-light dark:focus-visible:ring-text-blue-accent-dark",
    };

    const sizeStyles = {
        sm: "px-3 py-1.5 h-8 text-sm",
        md: "px-4 py-2 h-10 text-sm",
        lg: "px-5 py-3 h-11 text-base",
    };

    return (
        <button
            className={`${width} ${base} ${sizeStyles[size] || sizeStyles.md} ${variants[variant] || variants.primary} ${
                disabled || loading ? "opacity-50" : ""
            } ${className}`}
            disabled={disabled || loading}
            {...props}
        >
            {loading ? 
                <div className="flex items-center justify-center">
                    {loadingText && <span>{loadingText}</span>}
                    <span className={`${loadingDot} animate-bounce`} style={{ animationDelay: "200ms" }}></span>
                    <span className={`${loadingDot} animate-bounce`} style={{ animationDelay: "400ms" }}></span>
                    <span className={`${loadingDot} animate-bounce`} style={{ animationDelay: "600ms" }}></span>
                </div> : 
                isRTL ? (
                    <>
                        {startIcon}
                        {children}
                        {endIcon}
                    </>
                ) : (
                    <>
                        {children}
                        {startIcon}
                        {endIcon}
                    </>
                )
            }
        </button>
    );
}
