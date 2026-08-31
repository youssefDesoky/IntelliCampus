export default function LegendItem({ color, label }) {
    return (
        <div className="flex items-center gap-2 rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark px-3 py-1.5 shadow-sm">
            <span className={`w-3 h-3 rounded-full ${color}`} />
            <span className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{label}</span>
        </div>
    );
}