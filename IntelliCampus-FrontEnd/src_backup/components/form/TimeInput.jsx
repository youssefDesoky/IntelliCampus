import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import { ClockIcon } from "../ui/icons";

// ─── Constants ────────────────────────────────────────────────────────────────
const HOURS   = Array.from({ length: 12 }, (_, i) => i + 1);   // 1 – 12
const MINUTES = Array.from({ length: 60 }, (_, i) => i);        // 0 – 59
const ITEM_H  = 36;   // px – height of each row
const PAD_H   = ITEM_H * 2; // top/bottom padding so selected row centers in the 180px window

// ─── Helpers ──────────────────────────────────────────────────────────────────
function parseTime(v) {
    if (!v) return null;
    const [h, m] = v.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return { h, m };
}

function to12h(h24) {
    if (h24 === 0)   return { h: 12, period: "AM" };
    if (h24 < 12)    return { h: h24, period: "AM" };
    if (h24 === 12)  return { h: 12,  period: "PM" };
    return { h: h24 - 12, period: "PM" };
}

// ─── Scroll Column ────────────────────────────────────────────────────────────
function ScrollColumn({ items, selected, onSelect }) {
    const ref = useRef(null);

    useEffect(() => {
        if (!ref.current) return;
        const idx = items.indexOf(selected);
        if (idx === -1) return;
        ref.current.scrollTop = idx * ITEM_H;
    }, [selected, items]);

    return (
        <div
            ref={ref}
            className="w-14 overflow-y-auto snap-y snap-mandatory [&::-webkit-scrollbar]:hidden"
            style={{
                height: ITEM_H * 5,        // show 5 rows at a time
                scrollBehavior: "smooth",
                msOverflowStyle: "none",
                scrollbarWidth: "none",
            }}
        >
            <div style={{ height: PAD_H }} aria-hidden="true" />

            {items.map((item) => {
                const isSelected = item === selected;
                return (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onSelect(item)}
                        style={{ height: ITEM_H }}
                        className={[
                            "w-full flex items-center justify-center text-sm font-medium rounded-lg transition-all snap-center outline-none",
                            isSelected
                                ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark font-bold scale-105 shadow-sm"
                                : [
                                    "text-text-primary-default-light dark:text-text-primary-default-dark",
                                    "hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                                  ].join(" "),
                        ].join(" ")}
                    >
                        {String(item).padStart(2, "0")}
                    </button>
                );
            })}

            <div style={{ height: PAD_H }} aria-hidden="true" />
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function TimeInput({
    label,
    name,
    errorMessage = "",
    placeholder = "Select a time",
    className = "",
    isDisabled = false,
    value = "",
    onChange,
}) {
    const initFromValue = (v) => {
        const parsed = parseTime(v);
        if (!parsed) {
            return { hour: 12, minute: 0, period: "PM", hasValue: false };
        }
        const { h, period } = to12h(parsed.h);
        return { hour: h, minute: parsed.m, period, hasValue: true };
    };

    const [isOpen, setIsOpen]   = useState(false);
    const [state, setState]     = useState(() => initFromValue(value));
    const [coords, setCoords]   = useState({ top: 0, left: 0 }); 
    const { hour, minute, period, hasValue } = state;

    const containerRef = useRef(null);
    const triggerRef   = useRef(null);
    const dropdownRef  = useRef(null); 

    useEffect(() => {
        setState(initFromValue(value));
    }, [value]);

    useEffect(() => {
        if (!isOpen || !triggerRef.current) return;

        const updatePosition = () => {
            const rect = triggerRef.current.getBoundingClientRect();
            let top = rect.bottom + window.scrollY;
            let left = rect.left + window.scrollX;

            if (dropdownRef.current) {
                const ddRect = dropdownRef.current.getBoundingClientRect();
                const spaceBelow = window.innerHeight - rect.bottom;
                const spaceAbove = rect.top;
                if (spaceBelow < ddRect.height && spaceAbove > ddRect.height) {
                    top = rect.top - ddRect.height + window.scrollY;
                }
                if (rect.left + ddRect.width > window.innerWidth) {
                    left = Math.max(8, window.innerWidth - ddRect.width - 8) + window.scrollX;
                }
                if (rect.left < 8) left = 8 + window.scrollX;
            }

            setCoords({ top, left });
        };

        const id = requestAnimationFrame(updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);

        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [isOpen]);

    useEffect(() => {
        const onOutside = (e) => {
            if (!containerRef.current?.contains(e.target) && !dropdownRef.current?.contains(e.target)) {
                setIsOpen(false);
            }
        };
        const onKey = (e) => {
            if (e.key === "Escape") {
                setIsOpen(false);
                triggerRef.current?.focus();
            }
        };
        document.addEventListener("mousedown", onOutside);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onOutside);
            document.removeEventListener("keydown", onKey);
        };
    }, []);

    const emit = (h, m, p) => {
        const to24h = (h12, period) => {
            if (period === "AM") return h12 === 12 ? 0 : h12;
            return h12 === 12 ? 12 : h12 + 12;
        };
        const toISO = (h24, m) => `${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
        onChange?.({ target: { name, value: toISO(to24h(h, p), m) } });
    };

    const handleHour = (h) => {
        setState((s) => ({ ...s, hour: h, hasValue: true }));
        emit(h, minute, period);
    };
    const handleMinute = (m) => {
        setState((s) => ({ ...s, minute: m, hasValue: true }));
        emit(hour, m, period);
    };
    const handlePeriod = (p) => {
        setState((s) => ({ ...s, period: p, hasValue: true }));
        emit(hour, minute, p);
    };
    const handleClear = () => {
        setState((s) => ({ ...s, hasValue: false }));
        onChange?.({ target: { name, value: "" } });
    };

    const displayValue = hasValue
        ? `${String(hour).padStart(2, "0")}:${String(minute).padStart(2, "0")} ${period}`
        : "";

    return (
        <div ref={containerRef} className={`relative inline-block w-full ${className}`}>

            {/* Label */}
            {label && (
                <label
                    htmlFor={name}
                    className="block mb-2 font-bold text-sm text-text-primary-default-light dark:text-text-primary-default-dark"
                >
                    {label}
                </label>
            )}

            {/* Trigger */}
            <button
                ref={triggerRef}
                id={name}
                type="button"
                disabled={isDisabled}
                onClick={() => setIsOpen((o) => !o)}
                aria-haspopup="dialog"
                aria-expanded={isOpen}
                className={[
                    "w-full px-4 py-2.5 flex items-center justify-between gap-3 border rounded-lg",
                    "bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark",
                    "outline-none transition-all text-start",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    !isDisabled && "cursor-pointer",
                    isOpen
                        ? "border-border-accent-active-light dark:border-border-accent-active-dark shadow-sm"
                        : "border-border-primary-default-light dark:border-border-primary-default-dark",
                ].join(" ")}
            >
                <span className={`text-sm ${
                    displayValue
                        ? "text-text-primary-default-light dark:text-text-primary-default-dark font-medium"
                        : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                }`}>
                    {displayValue || placeholder}
                </span>

                <ClockIcon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
                    isOpen
                        ? "text-text-accent-default-light dark:text-text-accent-default-dark"
                        : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                }`} />
            </button>

            {/* Time Picker Dropdown (Portalized) */}
            {isOpen && createPortal(
                <div
                    ref={dropdownRef}
                    role="dialog"
                    aria-label="Time picker"
                    style={{
                        position: "absolute",
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                    }}
                    className={[
                        "z-[9999] mt-2 w-max select-none", 
                        "rounded-xl border shadow-2xl p-4 animate-in fade-in-50 slide-in-from-top-2 duration-150",
                        "bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark",
                        "border-border-primary-default-light dark:border-border-primary-default-dark",
                        "max-h-[calc(100vh-2rem)] overflow-y-auto",
                    ].join(" ")}
                >
                    {/* Heading */}
                    <p className="text-[10px] font-bold uppercase tracking-widest text-center text-text-secondary-default-light dark:text-text-secondary-default-dark mb-3">
                        Select Time
                    </p>

                    {/* Columns */}
                    <div className="flex items-start gap-1 relative">
                        
                        {/* Center Row Highlight Track Container */}
                        <div 
                            style={{ top: `calc(${PAD_H}px + 14px)` }}
                            className={[
                                "absolute start-0 end-[72px] h-[36px] pointer-events-none rounded-md border -z-0",
                                "bg-bg-surface-secondary-light/40 dark:bg-bg-surface-secondary-dark/20",
                                "border-border-primary-default-light/60 dark:border-border-primary-default-dark/40"
                            ].join(" ")}
                        />

                        {/* Hour column */}
                        <div className="flex flex-col items-center gap-1 z-10">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                Hr
                            </span>
                            <div className="relative">
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[50px] bg-gradient-to-b from-bg-fill-primary-default-light dark:from-bg-fill-primary-default-dark to-transparent"
                                />
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[50px] bg-gradient-to-t from-bg-fill-primary-default-light dark:from-bg-fill-primary-default-dark to-transparent"
                                />
                                <ScrollColumn items={HOURS} selected={hour} onSelect={handleHour} />
                            </div>
                        </div>

                        {/* Colon separator */}
                        <span className="text-lg font-bold text-text-secondary-default-light dark:text-text-secondary-default-dark mt-[22px] z-10 px-0.5">
                            :
                        </span>

                        {/* Minute column */}
                        <div className="flex flex-col items-center gap-1 z-10">
                            <span className="text-[10px] font-semibold uppercase tracking-wider text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                Min
                            </span>
                            <div className="relative">
                                <div
                                    className="pointer-events-none absolute inset-x-0 top-0 z-20 h-[50px] bg-gradient-to-b from-bg-fill-primary-default-light dark:from-bg-fill-primary-default-dark to-transparent"
                                />
                                <div
                                    className="pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[50px] bg-gradient-to-t from-bg-fill-primary-default-light dark:from-bg-fill-primary-default-dark to-transparent"
                                />
                                <ScrollColumn items={MINUTES} selected={minute} onSelect={handleMinute} />
                            </div>
                        </div>

                        {/* Vertical divider */}
                        <div className="w-px self-stretch bg-border-primary-default-light dark:bg-border-primary-default-dark mx-2 mt-5 z-10" />

                        {/* AM / PM toggle */}
                        <div className="flex flex-col gap-1.5 mt-[21px] z-10">
                            {["AM", "PM"].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => handlePeriod(p)}
                                    className={[
                                        "w-12 py-2 text-xs font-bold rounded-lg transition-all outline-none",
                                        period === p
                                            ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark shadow-sm"
                                            : [
                                                "text-text-secondary-default-light dark:text-text-secondary-default-dark",
                                                "hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                                              ].join(" "),
                                    ].join(" ")}
                                >
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={[
                        "mt-3 pt-3 flex items-center border-t",
                        "border-border-primary-default-light dark:border-border-primary-default-dark",
                        hasValue ? "justify-between" : "justify-end",
                    ].join(" ")}>
                        {hasValue && (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-danger-default-light dark:hover:text-text-danger-default-dark transition-colors"
                            >
                                Clear
                            </button>
                        )}
                        <button
                            type="button"
                            onClick={() => setIsOpen(false)}
                            className="text-xs font-bold text-text-accent-default-light dark:text-text-accent-default-dark hover:underline transition-colors"
                        >
                            Done
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Error */}
            {errorMessage && (
                <p className="mt-1 text-xs text-text-danger-default-light">{errorMessage}</p>
            )}
        </div>
    ); 
}