import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";
import useArabicDigits from "../../hooks/useArabicDigits";
import { CalendarIcon, ClockIcon} from "../ui/icons";

// ─── Constants ────────────────────────────────────────────────────────────────

const HOURS_12 = Array.from({ length: 12 }, (_, i) => i + 1);
const ALL_MINS = Array.from({ length: 60 }, (_, i) => i);

const ITEM_H = 36;
const PAD_H  = ITEM_H * 2; // keeps selected row centered in the 5-row window

// ─── Date helpers ─────────────────────────────────────────────────────────────

function parseDateStr(v) {
    if (!v) return null;
    const [y, m, d] = v.split("-").map(Number);
    if (!y || !m || !d) return null;
    return new Date(y, m - 1, d);
}

function dateToISO(d) {
    if (!d) return "";
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function dateToDisplay(d, locale) {
    if (!d) return "";
    return d.toLocaleDateString(locale === "ar" ? "ar-SA" : "en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

// ─── Time helpers ─────────────────────────────────────────────────────────────

function parseTimeStr(v) {
    if (!v) return null;
    const [h, m] = v.split(":").map(Number);
    if (isNaN(h) || isNaN(m)) return null;
    return { h, m };
}

function h24to12(h24) {
    if (h24 === 0)   return { h: 12, period: "AM" };
    if (h24 < 12)    return { h: h24, period: "AM" };
    if (h24 === 12)  return { h: 12,  period: "PM" };
    return { h: h24 - 12, period: "PM" };
}

function h12to24(h12, period) {
    if (period === "AM") return h12 === 12 ? 0 : h12;
    return h12 === 12 ? 12 : h12 + 12;
}

/** Get today's date as YYYY-MM-DD. */
function getTodayISO() {
    const today = new Date();
    const y = today.getFullYear();
    const m = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
}

// ─── Parse "YYYY-MM-DDTHH:mm" (datetime-local format) ────────────────────────

function parseDTValue(v) {
    if (!v) return { date: null, time: null };
    const [datePart, timePart] = v.split("T");
    return { date: parseDateStr(datePart), time: parseTimeStr(timePart) };
}

// ─── Micro icons (no extra dependency) ───────────────────────────────────────

function ChevronLeft() {
    return (
        <svg className="w-3.5 h-3.5 rtl:scale-x-[-1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="15 18 9 12 15 6" />
        </svg>
    );
}

function ChevronRight() {
    return (
        <svg className="w-3.5 h-3.5 rtl:scale-x-[-1]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
        </svg>
    );
}

// ─── Scroll Column (shared by hour & minute) ──────────────────────────────────

function ScrollColumn({ items, selected, onSelect, convert }) {
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
            className="w-14 overflow-y-auto [&::-webkit-scrollbar]:hidden"
            style={{ height: ITEM_H * 5, scrollBehavior: "smooth", msOverflowStyle: "none", scrollbarWidth: "none" }}
        >
            <div style={{ height: PAD_H }} aria-hidden="true" />
            {items.map((item) => {
                const sel = item === selected;
                return (
                    <button
                        key={item}
                        type="button"
                        onClick={() => onSelect(item)}
                        style={{ height: ITEM_H }}
                        className={[
                            "w-full flex items-center justify-center text-sm font-medium rounded-lg transition-colors",
                            sel
                                ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark"
                                : "text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                        ].join(" ")}
                    >
                        {convert ? convert(String(item).padStart(2, "0")) : String(item).padStart(2, "0")}
                    </button>
                );
            })}
            <div style={{ height: PAD_H }} aria-hidden="true" />
        </div>
    );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DateTimeInput({
    label,
    name,
    errorMessage = "",
    className = "",
    isDisabled = false,
    value = "",
    onChange,
    minDate = getTodayISO(),
    maxDate,
}) {
    const { t, i18n } = useTranslation("common");
    const { convert: ar } = useArabicDigits();
    const isRTL = i18n.language === 'ar';
    const locale = isRTL ? "ar-SA" : "en";

    const months = useMemo(() =>
        Array.from({ length: 12 }, (_, i) =>
            new Date(2024, i, 1).toLocaleDateString(locale, { month: "long" })
        ), [locale]);

    const weekdays = useMemo(() =>
        Array.from({ length: 7 }, (_, i) =>
            new Date(2024, 0, i + 1).toLocaleDateString(locale, { weekday: "short" })
        ), [locale]);

    // ── Derive state from a datetime-local value string ──────────────────────
    const initState = (v) => {
        const { date, time } = parseDTValue(v);
        if (!time) {
            const now = new Date();
            const t = h24to12(now.getHours());
            return {
                date,
                hour:    t.h,
                minute:  now.getMinutes(),
                period:  t.period,
                hasTime: true,
            };
        }
        const t = h24to12(time.h);
        return {
            date,
            hour:    t.h,
            minute:  time.m,
            period:  t.period,
            hasTime: true,
        };
    };

    const [s, setS]               = useState(() => initState(value));
    const { date, hour, minute, period, hasTime } = s;

    const [activePanel, setPanel] = useState(null); // null | "date" | "time"
    const [viewMonth, setViewMonth] = useState(() => {
        const d = parseDTValue(value).date ?? new Date();
        return new Date(d.getFullYear(), d.getMonth(), 1);
    });

    const containerRef = useRef(null);
    const triggerRef   = useRef(null);
    const dropdownRef  = useRef(null);
    const [coords, setCoords] = useState({ top: 0, left: 0 });

    // ── Sync when external value changes ─────────────────────────────────────
    useEffect(() => {
        const next = initState(value);
        setS(next);
        if (next.date) {
            setViewMonth(new Date(next.date.getFullYear(), next.date.getMonth(), 1));
        }
    }, [value]);

    // ── Outside-click & Escape ────────────────────────────────────────────────
    useEffect(() => {
        const onOutside = (e) => {
            if (
                containerRef.current && !containerRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setPanel(null);
            }
        };
        const onKey = (e) => { if (e.key === "Escape") setPanel(null); };
        document.addEventListener("mousedown", onOutside);
        document.addEventListener("keydown", onKey);
        return () => {
            document.removeEventListener("mousedown", onOutside);
            document.removeEventListener("keydown", onKey);
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
        if (!activePanel) return;
        const id = requestAnimationFrame(updatePosition);
        window.addEventListener("scroll", updatePosition, true);
        window.addEventListener("resize", updatePosition);
        return () => {
            cancelAnimationFrame(id);
            window.removeEventListener("scroll", updatePosition, true);
            window.removeEventListener("resize", updatePosition);
        };
    }, [activePanel]);

    // ── Build & emit the combined "YYYY-MM-DDTHH:mm" string ──────────────────
    const buildISO = (d, h, m, p) => {
        if (!d) return "";
        const h24 = h12to24(h, p);
        return `${dateToISO(d)}T${String(h24).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
    };

    const emit = (d, h, m, p) =>
        onChange?.({ target: { name, value: buildISO(d, h, m, p) } });

    // ── Date handlers ─────────────────────────────────────────────────────────
    const handleDateSelect = (d) => {
        setS((prev) => ({ ...prev, date: d }));
        emit(d, hour, minute, period);
        setPanel("time"); // auto-advance so the user can pick the time right away
    };

    const isDateDisabled = (d) => {
        const min = parseDateStr(minDate);
        const max = parseDateStr(maxDate);
        const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
        if (min && dt < min) return true;
        if (max && dt > max) return true;
        return false;
    };

    // ── Time handlers ─────────────────────────────────────────────────────────
    const handleHour   = (h) => { setS((p) => ({ ...p, hour:   h, hasTime: true })); emit(date, h,    minute, period); };
    const handleMinute = (m) => { setS((p) => ({ ...p, minute: m, hasTime: true })); emit(date, hour, m,      period); };
    const handlePeriod = (p) => { setS((p2) => ({ ...p2, period: p, hasTime: true })); emit(date, hour, minute, p); };

    // ── Clear ─────────────────────────────────────────────────────────────────
    const handleClear = () => {
        setS(initState(""));
        setPanel(null);
        onChange?.({ target: { name, value: "" } });
    };

    // ── Display strings ───────────────────────────────────────────────────────
    const dateDisplay = date ? dateToDisplay(date, i18n.language) : "";
    const timeDisplay = hasTime
        ? `${ar(String(hour).padStart(2, "0"))}:${ar(String(minute).padStart(2, "0"))} ${isRTL ? (period === "AM" ? "ص" : "م") : period}`
        : "";

    // ── Calendar grid builder ─────────────────────────────────────────────────
    const buildCalendarDays = () => {
        const year  = viewMonth.getFullYear();
        const month = viewMonth.getMonth();
        const total = new Date(year, month + 1, 0).getDate();
        const first = new Date(year, month, 1).getDay();
        const todayStr    = new Date().toDateString();
        const selectedStr = date?.toDateString();

        const cells = [];
        for (let i = 0; i < first; i++) cells.push(<span key={`p${i}`} aria-hidden="true" />);

        for (let d = 1; d <= total; d++) {
            const dt         = new Date(year, month, d);
            const isSelected = dt.toDateString() === selectedStr;
            const isToday    = dt.toDateString() === todayStr;
            const disabled   = isDateDisabled(dt);

            cells.push(
                <button
                    key={d}
                    type="button"
                    disabled={disabled}
                    onClick={() => handleDateSelect(dt)}
                    className={[
                        "w-9 h-9 mx-auto flex items-center justify-center rounded-full text-sm font-medium transition-colors",
                        disabled ? "opacity-30 cursor-not-allowed" : "cursor-pointer",
                        isSelected && "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark",
                        !isSelected && isToday && "ring-1 ring-border-accent-active-light dark:ring-border-accent-active-dark text-text-primary-default-light dark:text-text-primary-default-dark",
                        !isSelected && !isToday && "text-text-primary-default-light dark:text-text-primary-default-dark",
                        !disabled && !isSelected && "hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                    ].filter(Boolean).join(" ")}
                >
                    {ar(d)}
                </button>
            );
        }
        return cells;
    };

    // ── Shared dropdown base classes ──────────────────────────────────────────
    const dropdownCls = [
        "rounded-xl border shadow-xl p-4",
        "bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark",
        "border-border-primary-default-light dark:border-border-primary-default-dark",
        "max-h-[calc(100vh-2rem)] overflow-y-auto",
    ].join(" ");

    const footerCls = "mt-3 pt-3 flex items-center justify-between border-t border-border-primary-default-light dark:border-border-primary-default-dark";

    return (
        <div ref={containerRef} className={`relative ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>

            {/* Label */}
            {label && (
                <label className="block mb-2 font-bold text-sm text-text-primary-default-light dark:text-text-primary-default-dark">
                    {label}
                </label>
            )}

            {/* ── Split Trigger ──────────────────────────────────────────── */}
            <div ref={triggerRef} className={[
                "flex border rounded-lg overflow-hidden transition-colors",
                "bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark",
                isDisabled && "opacity-50 pointer-events-none",
                activePanel
                    ? "border-border-primary-active-light dark:border-border-primary-active-dark"
                    : "border-border-primary-default-light dark:border-border-primary-default-dark",
            ].filter(Boolean).join(" ")}>

                {/* Date half */}
                <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setPanel((p) => p === "date" ? null : "date")}
                    className={[
                        "flex-1 min-w-0 flex items-center gap-2.5 px-4 py-2.5 outline-none transition-colors",
                        !isDisabled && "cursor-pointer",
                        activePanel === "date" && "bg-bg-surface-secondary-light dark:bg-bg-surface-secondary-dark",
                    ].filter(Boolean).join(" ")}
                >
                    <CalendarIcon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
activePanel === "date"
                                    ? "text-text-accent-default-light dark:text-text-accent-default-dark"
                                    : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    }`} />
                    <span dir="auto" className={`text-sm truncate ${
                        dateDisplay
                            ? "text-text-primary-default-light dark:text-text-primary-default-dark"
                            : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    }`}>
                        {dateDisplay || t("dateTime.selectDate")}
                    </span>
                </button>

                {/* Vertical divider */}
                <div className="w-px shrink-0 bg-border-primary-default-light dark:bg-border-primary-default-dark" />

                {/* Time half */}
                <button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => setPanel((p) => p === "time" ? null : "time")}
                    className={[
                        "flex-1 min-w-0 flex items-center gap-2.5 px-4 py-2.5 outline-none transition-colors",
                        !isDisabled && "cursor-pointer",
                        activePanel === "time" && "bg-bg-surface-secondary-light dark:bg-bg-surface-secondary-dark",
                    ].filter(Boolean).join(" ")}
                >
                    <ClockIcon className={`w-[18px] h-[18px] shrink-0 transition-colors ${
activePanel === "time"
                                    ? "text-text-accent-default-light dark:text-text-accent-default-dark"
                                    : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    }`} />
                    <span dir="auto" className={`text-sm truncate ${
                        timeDisplay
                            ? "text-text-primary-default-light dark:text-text-primary-default-dark"
                            : "text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    }`}>
                        {timeDisplay || t("dateTime.selectTime")}
                    </span>
                </button>
            </div>

            {/* ── Date Panel (Portalized) ────────────────────────────────── */}
            {activePanel === "date" && createPortal(
                <div
                    ref={dropdownRef}
                    className={dropdownCls}
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        zIndex: 9999,
                    }}
                >

                    {/* Month navigation */}
                    <div className="flex items-center justify-between mb-4">
                        <button
                            type="button"
                            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() - 1, 1))}
                            aria-label="Previous month"
                            className="p-1.5 rounded-lg transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark"
                        >
                            <ChevronLeft />
                        </button>
                        <span className="text-sm font-semibold select-none text-text-primary-default-light dark:text-text-primary-default-dark">
                            {months[viewMonth.getMonth()]} {ar(viewMonth.getFullYear())}
                        </span>
                        <button
                            type="button"
                            onClick={() => setViewMonth(new Date(viewMonth.getFullYear(), viewMonth.getMonth() + 1, 1))}
                            aria-label="Next month"
                            className="p-1.5 rounded-lg transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark"
                        >
                            <ChevronRight />
                        </button>
                    </div>

                    {/* Weekday headers */}
                    <div className="grid grid-cols-7 mb-1">
                        {weekdays.map((d) => (
                            <div key={d} className="text-center text-xs font-semibold py-1 select-none text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days */}
                    <div className="grid grid-cols-7 gap-y-1">
                        {buildCalendarDays()}
                    </div>

                    {/* Footer */}
                    <div className={footerCls}>
                        {date ? (
                            <button
                                type="button"
                                onClick={handleClear}
                                className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-danger-default-light dark:hover:text-text-danger-default-dark transition-colors"
                            >
                                {t("dateTime.clear")}
                            </button>
                        ) : <span />}
                        <button
                            type="button"
                            onClick={() => setPanel("time")}
                            className="flex items-center gap-1 text-xs font-medium text-text-accent-default-light dark:text-text-accent-default-dark hover:underline transition-colors"
                        >
                            {t("dateTime.selectTime")} <ChevronRight />
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* ── Time Panel (Portalized) ────────────────────────────────── */}
            {activePanel === "time" && createPortal(
                <div
                    ref={dropdownRef}
                    className={dropdownCls}
                    style={{
                        position: 'fixed',
                        top: `${coords.top}px`,
                        left: `${coords.left}px`,
                        zIndex: 9999,
                    }}
                >

                    <p className="text-[10px] font-semibold uppercase tracking-widest text-center mb-3 select-none text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t("dateTime.selectTime")}
                    </p>

                    <div className="flex items-start gap-1">

                        {/* Hour column */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider select-none text-text-secondary-default-light dark:text-text-secondary-default-dark">{t("dateTime.hour")}</span>
                            <ScrollColumn items={HOURS_12} selected={hour} onSelect={handleHour} convert={ar} />
                        </div>

                        <span className="text-lg font-bold select-none mt-[22px] text-text-secondary-default-light dark:text-text-secondary-default-dark">:</span>

                        {/* Minute column */}
                        <div className="flex flex-col items-center gap-1">
                            <span className="text-[10px] font-semibold uppercase tracking-wider select-none text-text-secondary-default-light dark:text-text-secondary-default-dark">{t("dateTime.minute")}</span>
                            <ScrollColumn items={ALL_MINS} selected={minute} onSelect={handleMinute} convert={ar} />
                        </div>

                        {/* Vertical divider */}
                        <div className="w-px self-stretch mx-2 mt-6 bg-border-primary-default-light dark:bg-border-primary-default-dark" />

                        {/* AM / PM */}
                        <div className="flex flex-col gap-2 mt-6">
                            {["AM", "PM"].map((p) => (
                                <button
                                    key={p}
                                    type="button"
                                    onClick={() => handlePeriod(p)}
                                    className={[
                                        "w-12 py-2.5 text-xs font-bold rounded-lg transition-colors",
                                        period === p
                                            ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark"
                                            : "text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-light dark:hover:bg-bg-surface-secondary-dark",
                                    ].join(" ")}
                                >
                                    {t(p === "AM" ? "dateTime.am" : "dateTime.pm")}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Footer */}
                    <div className={footerCls}>
                        <button
                            type="button"
                            onClick={() => setPanel("date")}
                            className="flex items-center gap-1 text-xs font-medium transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark"
                        >
                            <ChevronLeft /> {t("dateTime.backToDate")}
                        </button>
                        <button
                            type="button"
                            onClick={() => setPanel(null)}
                            className="text-xs font-medium text-text-accent-default-light dark:text-text-accent-default-dark hover:underline transition-colors"
                        >
                            {t("dateTime.done")}
                        </button>
                    </div>
                </div>,
                document.body
            )}

            {/* Error */}
            {errorMessage && (
                <p className="mt-1 text-xs text-red-500">{errorMessage}</p>
            )}
        </div>
    );
}