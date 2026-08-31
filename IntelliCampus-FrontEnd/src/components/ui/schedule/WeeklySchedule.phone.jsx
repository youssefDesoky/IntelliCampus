import { useTranslation } from "react-i18next";
import ScheduleLegend from "./ScheduleLegend";
import WeeklyScheduleHeader from "./WeeklyScheduleHeader";
import WeeklyScheduleDayRow from "./WeeklyScheduleDayRow";
import WeeklyScheduleAgenda from "./WeeklyScheduleAgenda.phone";
import useArabicDigits from "../../hooks/useArabicDigits";
import { getLocalizedField } from "../../utils/getLocalizedField";

const timeSlots = [
    "8:00 AM", "9:00 AM", "10:00 AM", "11:00 AM", "12:00 PM",
    "1:00 PM", "2:00 PM", "3:00 PM", "4:00 PM", "5:00 PM", "6:00 PM"
];

const days = [
    { key: "sat", label: "Saturday", short: "Sat" },
    { key: "sun", label: "Sunday", short: "Sun" },
    { key: "mon", label: "Monday", short: "Mon" },
    { key: "tue", label: "Tuesday", short: "Tue" },
    { key: "wed", label: "Wednesday", short: "Wed" },
    { key: "thu", label: "Thursday", short: "Thu" },
    // { key: "fri", label: "Friday", short: "Fri" },
];

function parseHour(timeStr) {
    const [hourStr, period] = timeStr.split(" ");
    const [h, m] = hourStr.split(":");
    let hour = parseInt(h);
    const minutes = parseInt(m) || 0;
    if (period === "PM" && hour !== 12) hour += 12;
    if (period === "AM" && hour === 12) hour = 0;
    return hour + minutes / 60;
}

function buildExamGrid(schedule, examDays) {
    const slotMap = new Map();
    const daySet = new Set();

    schedule.forEach(ev => {
        const key = `${ev.startTime} - ${ev.endTime}`;
        if (!slotMap.has(key)) {
            slotMap.set(key, { startTime: ev.startTime, endTime: ev.endTime, label: key });
        }
        daySet.add(ev.day);
    });

    const sortedSlots = [...slotMap.values()].sort(
        (a, b) => parseHour(a.startTime) - parseHour(b.startTime)
    );

    const rowDays = examDays || days.filter(d => daySet.has(d.key));

    const sortedDays = rowDays.map(d => ({
        key: d.key,
        label: d.label,
    }));

    const grid = {};
    sortedSlots.forEach(slot => { grid[slot.label] = {}; });
    schedule.forEach(ev => {
        const key = `${ev.startTime} - ${ev.endTime}`;
        if (!grid[key][ev.day]) grid[key][ev.day] = [];
        grid[key][ev.day].push(ev);
    });

    return { sortedSlots, sortedDays, grid };
}

// CHANGED: the dense grid is now wrapped in `hidden md:block` and a
// WeeklyScheduleAgenda is rendered in `md:hidden` above it. Pure CSS switch —
// no JS device detection, so there's no layout flash on load/resize.
function ExamScheduleView({ schedule, onEventClick, examDays }) {
    const { t, i18n } = useTranslation("common");
    const { localizeTime } = useArabicDigits();
    const { sortedSlots, sortedDays, grid } = buildExamGrid(schedule, examDays);

    if (sortedSlots.length === 0) return null;

    return (
        <>
            <div className="md:hidden">
                <WeeklyScheduleAgenda
                    days={examDays || days}
                    schedule={schedule}
                    variant="exam"
                    onEventClick={onEventClick}
                />
            </div>

            <div className="hidden md:block overflow-x-auto">
                <div className="min-w-190">
                    <div
                        className="grid border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/95 dark:bg-bg-surface-secondary-default-dark/95"
                        style={{ gridTemplateColumns: `120px repeat(${sortedSlots.length}, 1fr)` }}
                    >
                        <div className="p-2.5 md:p-3 text-center text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark border-e border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                            {t("schedule.dateHeader")}
                        </div>
                        {sortedSlots.map(slot => (
                            <div key={slot.label} className="p-2.5 md:p-3 text-center text-xs md:text-sm font-semibold uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark border-e last:border-e-0 border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                {localizeTime(slot.label)}
                            </div>
                        ))}
                    </div>

                    {sortedDays.map((day, rowIndex) => (
                        <div
                            key={day.key}
                            className={`grid ${rowIndex < sortedDays.length - 1 ? "border-b border-border-primary-default-light dark:border-border-primary-default-dark" : ""}`}
                            style={{ gridTemplateColumns: `120px repeat(${sortedSlots.length}, 1fr)` }}
                        >
                            <div className="p-3 flex items-center justify-center border-e border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <span className="text-xs md:text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark whitespace-nowrap">
                                    {day.label}
                                </span>
                            </div>
                            {sortedSlots.map(slot => {
                                const events = grid[slot.label]?.[day.key] || [];
                                return (
                                    <div key={slot.label} className="p-1.5 min-h-[4rem] flex flex-col gap-1 border-e last:border-e-0 border-border-primary-default-light dark:border-border-primary-default-dark">
                                        {events.length > 0 ? events.map(ev => (
                                            <div
                                                key={ev.id}
                                                onClick={() => onEventClick?.(ev)}
                                                className="rounded-md border-s-2 border-border-blue-default-light dark:border-border-blue-default-dark bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark px-2 py-1 text-xs font-medium text-text-blue-default-light dark:text-text-blue-default-dark cursor-pointer hover:brightness-110 transition-all leading-tight"
                                            >
                                                {getLocalizedField(ev, 'title', i18n.language)}
                                            </div>
                                        )) : (
                                            <div className="flex-1 flex items-center justify-center text-text-tertiary-default-light dark:text-text-tertiary-default-dark text-xs">
                                                —
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    ))}
                </div>
            </div>
        </>
    );
}

// CHANGED: dropped the `isMobile` prop entirely. The layout switch between
// agenda and grid is now a pure `md:` breakpoint, so there's nothing to wire
// up from a device-detection hook anymore.
export default function WeeklySchedule({ schedule = [], variant, onEventClick, examDays }) {
    const { t } = useTranslation("common");
    const { convert: ar } = useArabicDigits();
    const activeDays = new Set(schedule.map((item) => item.day)).size;

    const itemsText = ar(t("schedule.itemCount", { count: schedule.length }));
    const daysText = ar(t("schedule.dayCount", { count: activeDays || 0 }));

    return (
        <div className="w-full overflow-x-hidden rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-sm shadow-shadow-light dark:shadow-shadow-dark">
            <div className="border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-linear-to-r from-bg-surface-secondary-default-light via-bg-surface-primary-default-light to-bg-surface-secondary-default-light dark:from-bg-surface-secondary-default-dark dark:via-bg-surface-primary-default-dark dark:to-bg-surface-secondary-default-dark px-4 py-4 md:px-6 md:py-5">
                <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                    <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            {variant === "exam" ? t("schedule.examTimetable") : t("schedule.weeklyTimeline")}
                        </p>
                        <h2 className="text-xl md:text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark">
                            {variant === "exam" ? t("schedule.examScheduleTitle") : t("schedule.classPlanTitle")}
                        </h2>
                        <p className="text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">
                            {t("schedule.scheduledItems", { itemsText, daysText })}
                        </p>
                    </div>

                    {variant !== "exam" && (
                        <div className="flex flex-wrap gap-2 text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">
                            <span className="rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light/80 dark:bg-bg-surface-primary-default-dark/80 px-3 py-1.5">
                                {t("schedule.dragFreeView")}
                            </span>
                            <span className="rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light/80 dark:bg-bg-surface-primary-default-dark/80 px-3 py-1.5">
                                {t("schedule.tapEventForDetails")}
                            </span>
                        </div>
                    )}
                </div>
            </div>

            {variant === "exam" ? (
                <ExamScheduleView schedule={schedule} onEventClick={onEventClick} examDays={examDays} />
            ) : (
                <>
                    <div className="md:hidden">
                        <WeeklyScheduleAgenda days={days} schedule={schedule} variant="default" />
                    </div>

                    <div className="hidden md:block overflow-x-auto">
                        <div className="min-w-190">
                            <WeeklyScheduleHeader slots={timeSlots} />
                            <WeeklyScheduleDayRow days={days} schedule={schedule} slots={timeSlots} />
                        </div>
                    </div>
                </>
            )}

            {/* Legend */}
            {variant !== "exam" && (
                <ScheduleLegend legendItems={[
                    { color: "bg-bg-fill-info-default-light dark:bg-bg-fill-info-default-dark", label: t("schedule.typeLecture") },
                    { color: "bg-bg-fill-purple-default-light dark:bg-bg-fill-purple-default-dark", label: t("schedule.typeSection") },
                    { color: "bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark", label: t("schedule.typeActivity") }
                ]} />
            )}
        </div>
    );
}
