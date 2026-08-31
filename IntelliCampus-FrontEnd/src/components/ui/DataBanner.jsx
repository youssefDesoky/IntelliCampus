import { useTranslation } from "react-i18next";

export default function DataBanner({ title, span = undefined, data, className = "" }) {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const toArabicDigits = (str) => isRTL ? String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : str;

    return (
        <div dir={isRTL ? 'rtl' : 'ltr'} className={`w-full rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark p-4 sm:p-5 shadow-sm shadow-shadow-light/50 dark:shadow-shadow-dark/30 col-span-full ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between gap-4 mb-4 sm:mb-5">
                <h3 className="text-sm sm:text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {title}
                </h3>
                {span && (
                    <div className="text-xs sm:text-sm font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {span}
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="flex flex-col sm:flex-row divide-y sm:divide-y-0">
                {data.map((item, index) => (
                    <div
                        key={index}
                        className="flex-1 flex flex-col items-center justify-center py-3 sm:py-0 px-2 first:ps-0 last:pe-0 sm:border-e sm:border-e-border-primary-default-light dark:sm:border-e-border-primary-default-dark last:sm:border-e-0"
                    >
                        <span className="text-xl sm:text-2xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {toArabicDigits(item.value)}
                        </span>
                        <span className="text-[11px] sm:text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark mt-0.5">
                            {item.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}
