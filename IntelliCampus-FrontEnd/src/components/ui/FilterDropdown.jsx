import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FilterIcon, AngleDownIcon } from "./icons";

export default function FilterDropdown({
    label,
    options = [],
    selectedValues = [],
    onChange,
    disabled = false,
    hint,
    className = "",
    headerLabel,
    dropdownAlign = "left",
}) {
    const { t, i18n } = useTranslation("ui");
    const isRTL = i18n.language === 'ar';
    const toArabicDigits = (str) => isRTL ? String(str).replace(/\d/g, d => '٠١٢٣٤٥٦٧٨٩'[d]) : str;
    const [isOpen, setIsOpen] = useState(false);
    const ref = useRef(null);

    useEffect(() => {
        if (!isOpen) return;
        const handler = (e) => {
            if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
        };
        const onEscape = (e) => { if (e.key === "Escape") setIsOpen(false); };
        document.addEventListener("mousedown", handler);
        document.addEventListener("keydown", onEscape);
        return () => {
            document.removeEventListener("mousedown", handler);
            document.removeEventListener("keydown", onEscape);
        };
    }, [isOpen]);

    const toggle = (value) => {
        const next = selectedValues.includes(value)
            ? selectedValues.filter((v) => v !== value)
            : [...selectedValues, value];
        onChange(next);
    };

    const clear = () => onChange([]);

    return (
        <div ref={ref} className={`relative ${className}`} dir={isRTL ? 'rtl' : 'ltr'}>
            <button
                type="button"
                onClick={() => setIsOpen((p) => !p)}
                disabled={disabled}
                aria-expanded={isOpen}
                aria-haspopup="menu"
                className="inline-flex w-full gap-2 items-center rounded-md border border-border-primary-default-light bg-bg-surface-primary-default-light p-2 text-sm font-medium text-text-secondary-active-light transition-colors hover:bg-bg-fill-primary-hover-light disabled:opacity-60 dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark dark:text-text-secondary-active-dark dark:hover:bg-bg-fill-primary-hover-dark"
            >
                <FilterIcon size={18} className="shrink-0" />
                <span className="flex-1 text-center">{label}{selectedValues.length > 0 ? ` (${toArabicDigits(selectedValues.length)})` : ""}</span>
                <AngleDownIcon size={18} className={`shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} />
            </button>

            {isOpen && (
                <div
                    role="menu"
                    className={`absolute ${dropdownAlign === "right" ? "right-0 left-auto" : "left-0 right-auto"} sm:left-1/2 sm:right-auto translate-x-0 sm:-translate-x-1/2 top-[calc(100%+8px)] z-20 w-56 rounded-xl border border-border-primary-default-light bg-bg-surface-primary-default-light p-3 shadow-lg dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark`}
                >
                    <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-text-tertiary-default-light dark:text-text-tertiary-default-dark" dir={isRTL ? 'rtl' : 'ltr'}>
                        {headerLabel || t("filter.title", { name: label?.toLowerCase() })}
                    </p>

                    <div className="space-y-1" dir={isRTL ? 'rtl' : 'ltr'}>
                        {options.map((option) => {
                            const isActive = selectedValues.includes(option.value);
                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    role="menuitemcheckbox"
                                    aria-checked={isActive}
                                    onClick={() => toggle(option.value)}
                                    className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${
                                        isActive
                                            ? "bg-bg-fill-accent-default-light text-text-accent-active-light dark:bg-bg-fill-accent-default-dark dark:text-text-accent-active-dark"
                                            : "text-text-secondary-active-light hover:bg-bg-fill-primary-hover-light dark:text-text-secondary-active-dark dark:hover:bg-bg-fill-primary-hover-dark"
                                    }`}
                                >
                                    <span>{option.label}</span>
                                    <span className="text-xs">{isActive ? t("filter.selected") : ""}</span>
                                </button>
                            );
                        })}
                    </div>

                    <div className="mt-3 flex justify-end">
                        <button
                            type="button"
                            onClick={clear}
                            disabled={selectedValues.length === 0}
                            className="rounded-md border border-border-primary-default-light px-3 py-1.5 text-xs font-medium text-text-secondary-active-light transition-colors hover:bg-bg-fill-primary-hover-light disabled:opacity-50 dark:border-border-primary-default-dark dark:text-text-secondary-active-dark dark:hover:bg-bg-fill-primary-hover-dark"
                        >
                            {t("filter.clear")}
                        </button>
                    </div>

                    <p className="mt-2 text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark" dir={isRTL ? 'rtl' : 'ltr'}>
                        {hint ?? t("filter.hint")}
                    </p>
                </div>
            )}
        </div>
    );
}
