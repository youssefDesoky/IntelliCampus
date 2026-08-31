import { useTranslation } from 'react-i18next';
import { EllipsisVerticalIcon } from "./icons";
// Icons
import { AngleDownIcon } from "./icons";

export default function PaginationButtons ({ totalPages, currentPage, setCurrentPage, from, to, total, label }) {
    const { t, i18n } = useTranslation('common');
    const isRTL = i18n.language === 'ar';
    const toArabicDigits = (str) => isRTL ? String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : str;
    const buttonStyle = `p-2 w-10 h-10 flex items-center justify-center rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark 
        bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark 
        hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark 
        disabled:opacity-50 disabled:bg-bg-fill-primary-disabled-light dark:disabled:bg-bg-fill-primary-disabled-dark
    `;

    const activeButtonStyle = `p-2 w-10 h-10 flex items-center justify-center rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark 
        bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark 
        hover:bg-bg-fill-accent-default-light dark:hover:bg-bg-fill-accent-default-dark
    `;

    const showEllipsis = totalPages > 4;

    return (
        <div className={`flex items-center gap-4 ${total != null ? 'justify-between' : 'justify-center'}`} dir={isRTL ? 'rtl' : 'ltr'}>
            {total != null && (
                <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    {t('pagination.showing')} {toArabicDigits(from)}–{toArabicDigits(to)} {t('pagination.of')} {toArabicDigits(total)} {label || t('pagination.rows')}
                </span>
            )}
            <div className="flex items-center gap-2">
                <button 
                    className={buttonStyle} 
                    onClick={() => setCurrentPage(prev => prev - 1)} 
                    disabled={currentPage === 1}
                >
                    <AngleDownIcon className={`${isRTL ? '-rotate-90' : 'rotate-90'} w-5 h-5`} />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
                    if (showEllipsis) {
                        if (pageNum === 2 && currentPage > 3) {
                            return (
                                <EllipsisVerticalIcon
                                    key={`ellipsis-start-${pageNum}`}
                                    size={20}
                                    className="self-center rotate-90 text-text-primary-default-light dark:text-text-primary-default-dark"
                                />
                            );
                        }
                        if (pageNum === totalPages - 1 && currentPage < totalPages - 2) {
                            return (
                                <EllipsisVerticalIcon
                                    key={`ellipsis-end-${pageNum}`}
                                    size={20}
                                    className="self-center rotate-90 text-text-primary-default-light dark:text-text-primary-default-dark"
                                />
                            );
                        }
                        if (pageNum !== 1 && pageNum !== totalPages && Math.abs(pageNum - currentPage) > 1) {
                            return null;
                        }
                    }

                    return (
                        <button 
                            key={pageNum}
                            className={pageNum === currentPage ? activeButtonStyle : buttonStyle}
                            onClick={() => setCurrentPage(pageNum)}
                        >
                            {toArabicDigits(pageNum)}
                        </button>
                    );
                })}

                <button 
                    className={buttonStyle} 
                    onClick={() => setCurrentPage(prev => prev + 1)} 
                    disabled={currentPage === totalPages}
                >
                    <AngleDownIcon className={`${i18n.language === 'ar' ? 'rotate-90' : '-rotate-90'} w-5 h-5`} />
                </button>
            </div>
        </div>
    );
}