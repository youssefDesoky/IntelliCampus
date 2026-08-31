import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { CalendarIcon } from "../ui/icons";
// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS = [
    "January", "February", "March", "April",
    "May", "June", "July", "August",
    "September", "October", "November", "December",
];
const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

// ─── Inline micro-icons (no extra dependency) ─────────────────────────────────

function ChevronLeft() {
    return (
        <svg className="w-4 h-4 rtl:scale-x-[-1]" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}
function ChevronRight() {
    return (
        <svg className="w-4 h-4 rtl:scale-x-[-1]" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse a YYYY-MM-DD string as a LOCAL date (avoids UTC midnight shift). */
function parseISO(v) {
    if (!v) return null;
    const parts = v.split("-").map(Number);
    if (parts.length !== 3 || parts.some(isNaN)) return null;
    return new Date(parts[0], parts[1] - 1, parts[2]);
}

/** Format a Date object back to YYYY-MM-DD for onChange. */
function toISO(d) {
    if (!d) return "";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

/** Format a Date for the trigger button display. */
function toDisplay(d) {
    if (!d) return "";
    return d.toLocaleDateString("en-GB", {
        day: "2-digit", month: "short", year: "numeric",
    });
}

/** Get today's date as YYYY-MM-DD. */
function getTodayISO() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DateInput({
    label,
    name,
    errorMessage = "",
    placeholder = "Select a date",
    className = "",
    isDisabled = false,
    value = "",
    onChange,
    minDate = getTodayISO(),   // YYYY-MM-DD string – defaults to today so past dates are disabled
    maxDate,   // YYYY-MM-DD string
}) {
    const [isOpen, setIsOpen]       = useState(false);
    const [selected, setSelected]   = useState(() => parseISO(value));
    const [view, setView]           = useState(() => {
        const d = parseISO(value) ?? new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });
    const [coords, setCoords]       = useState({ top: 0, left: 0 });

    const containerRef = useRef(null);
    const triggerRef   = useRef(null);
    const dropdownRef  = useRef(null);

    // ── Sync external value ──────────────────────────────────────────────────
    useEffect(() => {
        setSelected(parseISO(value));
    }, [value]);

    // ── Close on outside click / Escape ──────────────────────────────────────
    useEffect(() => {
        const handleClick = (e) => {
            if (
                containerRef.current && !containerRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, []);

    // ── Position dropdown ─────────────────────────────────────────────────────
    const updatePosition = () => {
        if (!triggerRef.current) return;
        const rect = triggerRef.current.getBoundingClientRect();
        let top = rect.bottom;
        let left = rect.left;

        if (dropdownRef.current) {
            const ddRect = dropdownRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const spaceAbove = rect.top;
            if (spaceBelow < ddRect.height && spaceAbove > ddRect.height) {
                top = rect.top - ddRect.height;
            }
            if (left + ddRect.width > window.innerWidth) {
                left = Math.max(8, window.innerWidth - ddRect.width - 8);
            }
            if (left < 8) left = 8;
        }

        setCoords({ top, left });
    };

    useEffect(() => {
        if (!isOpen) return;
        const id = requestAnimationFrame(updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    // ── Helpers ──────────────────────────────────────────────────────────────
    const isDisabledDate = (date) => {
        const min = parseISO(minDate);
        const max = parseISO(maxDate);
        const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
        if (min && d < min) return true;
        if (max && d > max) return true;
        return false;
    };

    const handleSelect = (date) => {
        if (isDisabledDate(date)) return;
        setSelected(date);
        setIsOpen(false);
        onChange?.({ target: { name, value: toISO(date) } });
        triggerRef.current?.focus();
    };

    const handleClear = () => {
        setSelected(null);
        onChange?.({ target: { name, value: "" } });
    };

    const goToPrevMonth = () =>
        setView(new Date(view.getFullYear(), view.getMonth() - 1, 1));
    const goToNextMonth = () =>
        setView(new Date(view.getFullYear(), view.getMonth() + 1, 1));
    const goToToday = () => {
        const today = new Date();
        setView(new Date(today.getFullYear(), today.getMonth(), 1));
        handleSelect(today);
    };

    // ── Build day cells ──────────────────────────────────────────────────────
    const buildDays = () => {
        const year        = view.getFullYear();
        const month       = view.getMonth();
        const totalDays   = new Date(year, month + 1, 0).getDate();
        const firstDayCol = new Date(year, month, 1).getDay();

        const todayStr    = new Date().toDateString();
        const selectedStr = selected?.toDateString();

        const cells = [];

        // Leading empty cells
        for (let i = 0; i < firstDayCol; i++) {
            cells.push(<span key={`pad-${i}`} aria-hidden="true" />);
        }

        for (let d = 1; d <= totalDays; d++) {
            const date       = new Date(year, month, d);
            const isSelected = date.toDateString() === selectedStr;
            const isToday    = date.toDateString() === todayStr;
            const disabled   = isDisabledDate(date);

            cells.push(
                <button
                    key={d}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleSelect(date)}
                    aria-label={`${d} ${MONTHS[month]} ${year}${isToday ? ", today" : ""}${isSelected ? ", selected" : ""}`}
                    className={[
                        "w-9 h-9 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                        // State: disabled
                        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
                        // State: selected
                        isSelected && "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark shadow-sm",
                        // State: today (not selected)
                        !isSelected && isToday && [
                            "ring-1 ring-border-accent-active-light dark:ring-border-accent-active-dark",
                            "text-text-primary-default-light dark:text-text-primary-default-dark",
                        ].join(" "),
                        // State: regular
                        !isSelected && !isToday && [
                            "text-text-primary-default-light dark:text-text-primary-default-dark",
                        ].join(" "),
                        // Hover (only non-disabled, non-selected)
                        !disabled && !isSelected && "hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                    ].filter(Boolean).join(" ")}
                >
                    {d}
                </button>
            );
        }

        return cells;
    };

    // ── Render ───────────────────────────────────────────────────────────────
    return (
        <div ref={containerRef} className={`relative ${className}`}>

            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block mb-2 font-bold text-sm text-text-primary-default-light dark:text-text-primary-default-dark"
                >
                    {label}
                </label>
            )}

            {/* ── Trigger Button ─────────────────────────────────────────── */}
            <button
                ref={triggerRef}
                id={name}
                type="button"
                disabled={isDisabled}
                onClick={() => setIsOpen((prev) => !prev)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className={[
                    "w-full px-4 py-2.5 flex items-center justify-between gap-3 border rounded-lg",
                    "bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark",
                    "outline-none transition-colors text-start",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !isDisabled && "cursor-pointer",
                    isOpen
                        ? "border-border-primary-active-light dark:border-border-primary-active-dark"
                        : "border-border-primary-default-light dark:border-border-primary-default-dark",
                ].join(" ")}
            >
                <span className={`text-sm truncate ${
                    selected
                        ? "text-text-primary-default-light dark:text-text-primary-default-dark"
                        : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                }`}>
                    {selected ? toDisplay(selected) : placeholder}
                </span>

                <CalendarIcon
                    className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                        isOpen
                            ? "text-text-accent-default-light dark:text-text-accent-default-dark"
                            : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    }`}
                />
            </button>

            {/* ── Calendar Dropdown (Portalized) ────────────────────────── */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    role="dialog"
                    aria-label="Date picker"
                    className={[
                        "z-[9999] w-72",
                        "rounded-xl border shadow-xl p-4",
                        "bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark",
                        "border-border-primary-default-light dark:border-border-primary-default-dark",
                        "max-h-[calc(100vh-2rem)] overflow-y-auto",
                    ].join(" ")}
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                >
                    {/* Month / Year navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={goToPrevMonth}
                            aria-label="Previous month"
                            className={[
                                "p-1.5 rounded-lg transition-colors",
                                "text-text-secondary-default-light dark:text-text-secondary-default-dark",
                                "hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                            ].join(" ")}
                        >
                            <ChevronLeft />
                        </button>

                        <span className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark select-none">
                            {MONTHS[view.getMonth()]} {view.getFullYear()}
                        </span>

                        <button
                            type="button"
                            onClick={goToNextMonth}
                            aria-label="Next month"
                            className={[
                                "p-1.5 rounded-lg transition-colors",
                                "text-text-secondary-default-light dark:text-text-secondary-default-dark",
                                "hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                            ].join(" ")}
                        >
                            <ChevronRight />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {WEEKDAYS.map((d) => (
                            <div
                                key={d}
                                className="text-center text-xs font-semibold py-1 text-text-secondary-default-light dark:text-text-secondary-default-dark select-none"
                            >
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {buildDays()}
                    </div>

                    {/* Footer: Today / Clear */}
                    <div className={[
                        "mt-3 pt-3 flex items-center",
                        "border-t border-border-primary-default-light dark:border-border-primary-default-dark",
                        selected ? "justify-between" : "justify-start",
                    ].join(" ")}>
                        <button
                            type="button"
                            onClick={goToToday}
                            className="text-xs font-medium text-text-accent-default-light dark:text-text-accent-default-dark hover:underline transition-colors"
                        >
                            Today
                        </button>

                        {selected && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-danger-default-light dark:hover:text-text-danger-default-dark transition-colors"
                            >
                                Clear
                            </button>
                        )}
                    </div>
                </div>,
                document.body
            )}

            {/* Error message */}
            {errorMessage && (
                <p className="mt-1 text-xs text-text-danger-default-light">{errorMessage}</p>
            )}
        </div>
    );
}