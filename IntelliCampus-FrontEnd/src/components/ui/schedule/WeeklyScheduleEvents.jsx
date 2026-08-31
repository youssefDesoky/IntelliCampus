import { useTranslation } from "react-i18next";
import WeeklyScheduleEvent from "./WeeklyScheduleEvent";

const getTimeIndex = (time) => {
    if (!time) return 0;
    const [hourStr, period] = time.split(" ");
    const [hourPart, minutePart] = hourStr.split(":");
    let hour = parseInt(hourPart);
    const minutes = parseInt(minutePart) || 0;
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    const minuteDecimal = minutes / 60;
    return (hour - 8) + minuteDecimal;
};

function layoutColumns(events) {
    const sorted = [...events].sort((a, b) => {
        const sA = getTimeIndex(a.startTime);
        const sB = getTimeIndex(b.startTime);
        if (sA !== sB) return sA - sB;
        return getTimeIndex(a.endTime) - getTimeIndex(b.endTime);
    });

    const columns = [];
    const result = [];

    for (const event of sorted) {
        const startIdx = getTimeIndex(event.startTime);
        let col = 0;
        for (; col < columns.length; col++) {
            if (columns[col] <= startIdx) break;
        }
        const endIdx = getTimeIndex(event.endTime);
        if (col >= columns.length) {
            columns.push(endIdx);
        } else {
            columns[col] = Math.max(columns[col], endIdx);
        }
        result.push({ ...event, columnIndex: col, columnCount: columns.length });
    }

    return result.map(ev => ({ ...ev, columnCount: columns.length }));
}

export default function WeeklyScheduleEvents ({ days, day, schedule, rangeStart, totalDuration }) {
    const { t } = useTranslation("common");
    const eventsByDay = days.reduce((acc, day) => {
        acc[day.key] = schedule.filter(event => event.day === day.key);
        return acc;
    }, {});

    const laidOutEvents = layoutColumns(eventsByDay[day.key] || []);

    return (
        <div className="relative h-full min-h-20 p-2">
            {laidOutEvents.map((event, eventIndex) => (
                <WeeklyScheduleEvent
                    key={event.id || eventIndex}
                    event={event}
                    rangeStart={rangeStart}
                    totalDuration={totalDuration}
                    columnIndex={event.columnIndex}
                    columnCount={event.columnCount}
                />
            ))}

            {laidOutEvents.length === 0 && (
                <div className="absolute inset-0 flex items-center justify-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark text-xs md:text-sm">
                    {t("schedule.noClassesScheduled")}
                </div>
            )}
        </div>
    );
}