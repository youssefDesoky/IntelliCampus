import { format } from "date-fns";
import { ar } from "date-fns/locale";
import { useTranslation } from "react-i18next";
import { AngleDownIcon } from "../icons";


export default function CalendarHeader({ currentMonth, onPrev, onNext }) {
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';
    const locale = isRTL ? ar : undefined;
    const toArabicDigits = (str) => isRTL ? str.replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : str;
    return (
        <div className="flex items-center justify-between px-2 mb-6">
            <span className="text-xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
                {toArabicDigits(format(currentMonth, "MMMM yyyy", { locale }))}
            </span>

            <div className="flex gap-4">
                <button
                    onClick={onPrev}
                    className="p-1 rounded-full hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark text-text-accent-default-light dark:text-text-accent-default-dark"
                >
                    <AngleDownIcon className={`w-6 h-6 ${i18n.language === 'ar' ? '-rotate-90' : 'rotate-90'}`} />
                </button>

                <button
                    onClick={onNext}
                    className="p-1 rounded-full hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark text-text-accent-default-light dark:text-text-accent-default-dark"
                >
                    <AngleDownIcon className={`w-6 h-6 ${i18n.language === 'ar' ? 'rotate-90' : '-rotate-90'}`} />
                </button>
            </div>
        </div>
  );
}
