const getTimeIndex = (time) => {
    const [hourStr, period] = time.split(" ");
    const [hourPart, minutePart] = hourStr.split(":");
    let hour = parseInt(hourPart);
    const minutes = parseInt(minutePart) || 0;

    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;

    return (hour - 8) + (minutes / 60);
};

import { useTranslation } from "react-i18next";
import useArabicDigits from "../../../hooks/useArabicDigits";

export default function WeeklyScheduleHeader({ slots }) {
    const { t } = useTranslation("common");
    const { localizeTime } = useArabicDigits();
    const totalSlots = slots.length;
    const firstSlotIndex = slots.length > 0 ? getTimeIndex(slots[0]) : 0;
    const slotStep = slots.length > 1 ? getTimeIndex(slots[1]) - firstSlotIndex : 1;
    const totalDuration = slots.length > 1
        ? (getTimeIndex(slots[slots.length - 1]) - firstSlotIndex) + slotStep
        : slotStep;

    return (
        <div
            className="sticky top-0 z-10 grid border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/95 dark:bg-bg-surface-secondary-default-dark/95 backdrop-blur"
            style={{ gridTemplateColumns: "100px 1fr" }}
        >
            <div className="p-2.5 md:p-3 text-center text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark border-e border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                {t("schedule.dayHeader")}
            </div>

            <div className="relative h-full min-h-12">
                {slots.map((time) => {
                    const timeIndex = getTimeIndex(time);
                    const leftPercent = totalDuration > 0
                        ? ((timeIndex - firstSlotIndex) / totalDuration) * 100
                        : 0;

                    return (
                        <div
                            key={`desktop-line-${time}`}
                            className="absolute top-0 bottom-0"
                            style={{ left: `${leftPercent}%` }}
                        >
                            <div className="h-full w-px bg-border-primary-default-light dark:bg-border-primary-default-dark" />
                        </div>
                    );
                })}

                {slots.map((time, index) => {
                    const timeIndex = getTimeIndex(time);
                    const nextTimeIndex = index < totalSlots - 1
                        ? getTimeIndex(slots[index + 1])
                        : firstSlotIndex + totalDuration;
                    const centerPercent = totalDuration > 0
                        ? (((timeIndex + nextTimeIndex) / 2 - firstSlotIndex) / totalDuration) * 100
                        : 0;

                    return (
                        <span
                            key={`desktop-label-${time}`}
                            className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 text-sm font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap"
                            style={{ left: `${centerPercent}%` }}
                        >
                            {localizeTime(time)}
                        </span>
                    );
                })}
            </div>
        </div>
    );
}