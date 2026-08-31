import { useTranslation } from "react-i18next";

export default function CalendarDays() {
    const { t } = useTranslation("common");
    const dayKeys = ["sundayShort", "mondayShort", "tuesdayShort", "wednesdayShort", "thursdayShort", "fridayShort", "saturdayShort"];

    return (
        <div className="grid grid-cols-7 gap-2 mb-4">
            {dayKeys.map(key => (
                <div
                    key={key}
                    className="text-center text-sm font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark"
                >
                    {t(`days.${key}`)}
                </div>
            ))}
        </div>
    );
}
