import { LocationDotIcon, UserTieIcon } from "../icons";

const typeBadge = {
    lecture: "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-accent-light dark:text-text-blue-accent-dark",
    section: "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark",
    activity: "bg-bg-surface-green-default-light dark:bg-bg-surface-green-default-dark text-text-green-accent-light dark:text-text-green-accent-dark",
    default: "bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark",
};

const dotColor = {
    lecture: "bg-border-blue-default-light dark:bg-border-blue-default-dark",
    section: "bg-border-purple-default-light dark:bg-border-purple-default-dark",
    activity: "bg-border-green-default-light dark:bg-border-green-default-dark",
    default: "bg-border-primary-default-light dark:bg-border-primary-default-dark",
};

/**
 * Vertical, full-width agenda. Used in place of the hour-by-hour grid on
 * phones, where there isn't enough width for a horizontal timeline without
 * forcing scroll. Each day becomes a card; events inside are sorted and
 * listed top to bottom with everything visible at once, no tap-to-reveal
 * needed.
 */
export default function WeeklyScheduleAgenda({ days, schedule = [], variant = "default", onEventClick }) {
    const activeDays = days.filter((day) => schedule.some((ev) => ev.day === day.key));

    if (activeDays.length === 0) {
        return (
            <div className="p-8 text-center text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                No {variant === "exam" ? "exams" : "classes"} scheduled this week.
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-3">
            {activeDays.map((day) => {
                const events = [...schedule]
                    .filter((ev) => ev.day === day.key)
                    .sort((a, b) => a.startTime.localeCompare(b.startTime));

                return (
                    <div
                        key={day.key}
                        className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden"
                    >
                        <div className="flex items-center justify-between px-4 py-2.5 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                            <span className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {day.label}
                            </span>
                            <span className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                {events.length} {variant === "exam" ? "exam" : "class"}{events.length === 1 ? "" : "es"}
                            </span>
                        </div>

                        <div className="divide-y divide-border-primary-default-light dark:divide-border-primary-default-dark">
                            {events.map((ev) => (
                                <button
                                    key={ev.id}
                                    type="button"
                                    onClick={() => onEventClick?.(ev)}
                                    className="w-full flex gap-3 px-4 py-3 text-start hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors"
                                >
                                    <div className={`mt-1 w-1.5 rounded-full ${dotColor[ev.type] || dotColor.default}`} />
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-baseline justify-between gap-2">
                                            <span className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                                {ev.title}
                                            </span>
                                            <span className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">
                                                {ev.startTime} – {ev.endTime}
                                            </span>
                                        </div>

                                        {variant !== "exam" && (ev.location || ev.instructor) && (
                                            <div className="mt-1 flex items-center gap-3 text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                                {ev.location && (
                                                    <span className="flex items-center gap-1">
                                                        <LocationDotIcon className="w-3 h-3" />
                                                        {ev.location}
                                                    </span>
                                                )}
                                                {ev.instructor && (
                                                    <span className="flex items-center gap-1">
                                                        <UserTieIcon className="w-3 h-3" />
                                                        {ev.instructor}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {variant !== "exam" && ev.type && (
                                            <span className={`mt-1.5 inline-block rounded-full px-2 py-0.5 text-xs font-semibold uppercase tracking-wide ${typeBadge[ev.type] || typeBadge.default}`}>
                                                {ev.type}
                                            </span>
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
