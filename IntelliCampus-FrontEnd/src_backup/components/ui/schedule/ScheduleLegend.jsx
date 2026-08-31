import LegendItem from "./LegendItem";

export default function ScheduleLegend({ legendItems }) {
    return (
        <div className="flex flex-col gap-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light/80 dark:bg-bg-surface-secondary-default-dark/80 p-4 md:flex-row md:items-center md:justify-between">
            <div>
                <p className="text-xs font-semibold uppercase tracking-[0.24em] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                    Legend
                </p>
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    Event colors used in the weekly view
                </p>
            </div>

            <div className="flex flex-wrap gap-3">
                {legendItems.map((item) => (
                    <LegendItem key={item.label} color={item.color} label={item.label} />
                ))}
            </div>
        </div>
    );
}