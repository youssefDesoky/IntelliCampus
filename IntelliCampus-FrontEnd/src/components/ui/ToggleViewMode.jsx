export default function ToggleViewMode({isVertical=false, isFirstMode, onFirstModeSelect, onSecondModeSelect, firstModeLabel, secondModeLabel, className = ""}) {
    const buttonStyle = "px-2 py-1 text-sm font-medium rounded-md whitespace-nowrap shrink-0";
    const activeStyle = "bg-bg-fill-accent-default-light text-text-accent-active-light dark:bg-bg-fill-accent-default-dark dark:text-text-accent-active-dark";
    const inactiveStyle = "text-text-secondary-default-light hover:text-text-secondary-hover-light hover:bg-bg-fill-primary-hover-light dark:text-text-secondary-default-dark dark:hover:text-text-secondary-hover-dark dark:hover:bg-bg-fill-primary-hover-dark";

    return (
        <div className={`flex ${isVertical ? 'flex-col' : 'flex-row'} items-center gap-1 p-1.5 border rounded-md border-border-primary-active-light bg-bg-surface-primary-default-light dark:border-border-primary-active-dark dark:bg-bg-surface-primary-default-dark ${className}`}>
            <button
                className={`${buttonStyle} ${isVertical ? '' : 'flex-1'} ${isFirstMode ? activeStyle : inactiveStyle}`}
                onClick={onFirstModeSelect}
            >
                {firstModeLabel}
            </button>

            <button
                className={`${buttonStyle} ${isVertical ? '' : 'flex-1'} ${!isFirstMode ? activeStyle : inactiveStyle}`}
                onClick={onSecondModeSelect}
            >
                {secondModeLabel}
            </button>
        </div>
    );
}