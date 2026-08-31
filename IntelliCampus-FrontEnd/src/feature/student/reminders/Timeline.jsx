import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import useArabicDigits from "../../../hooks/useArabicDigits";
import Section from "../../../components/ui/Section";
import { BellSlashIcon, EllipsisVerticalIcon, FileIcon, FileLinesIcon, ClipboardCheckIcon, BookIcon } from "../../../components/ui/icons";
import { addDays, format, isSameDay } from "date-fns";
import { ar as arLocale } from "date-fns/locale";

const categoryStyles = {
    assignments: {
        badge: "ASSIGNMENT",
        badgeColor: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-300",
        cardBorder: "border-red-200 dark:border-red-800/60",
        cardBg: "bg-red-50 dark:bg-red-950/40",
        icon: FileLinesIcon,
        iconBg: "bg-red-100 text-red-500 dark:bg-red-900/50 dark:text-red-300",
    },
    classes: {
        badge: "CLASS",
        badgeColor: "bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-300",
        cardBorder: "border-blue-200 dark:border-blue-800/60",
        cardBg: "bg-blue-50 dark:bg-blue-950/40",
        icon: BookIcon,
        iconBg: "bg-blue-100 text-blue-500 dark:bg-blue-900/50 dark:text-blue-300",
    },
    exams: {
        badge: "EXAM",
        badgeColor: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-300",
        cardBorder: "border-yellow-200 dark:border-yellow-800/60",
        cardBg: "bg-yellow-50 dark:bg-yellow-950/40",
        icon: ClipboardCheckIcon,
        iconBg: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/50 dark:text-yellow-300",
    },
    personal: {
        badge: "PERSONAL",
        badgeColor: "bg-purple-100 text-purple-600 dark:bg-purple-900/40 dark:text-purple-300",
        cardBorder: "border-purple-200 dark:border-purple-800/60",
        cardBg: "bg-purple-50 dark:bg-purple-950/40",
        icon: FileIcon,
        iconBg: "bg-purple-100 text-purple-500 dark:bg-purple-900/50 dark:text-purple-300",
    },
    default: {
        badge: "REMINDER",
        badgeColor: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
        cardBorder: "border-gray-200 dark:border-gray-700",
        cardBg: "bg-gray-50 dark:bg-gray-900/60",
        icon: EllipsisVerticalIcon,
        iconBg: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    }
};

const normalizeDate = (date) => {
    const normalized = new Date(date);
    normalized.setHours(0, 0, 0, 0);
    return normalized;
};

const sortByDate = (left, right) => new Date(left.dueAt) - new Date(right.dueAt);

export default function Timeline({ className, reminders = {}, selectedCategory, selectedDate, onEditReminder, onDeleteReminder }) {
    const { t, i18n } = useTranslation("student");
    const { convert: ar } = useArabicDigits();
    const locale = i18n.language === 'ar' ? arLocale : undefined;
    const [activeMenuId, setActiveMenuId] = useState(null);

    const getCategoryLabel = (cat) => {
        if (cat === "classes") return t("reminders.categoryClasses");
        if (cat === "exams") return t("reminders.categoryExams");
        if (cat === "assignments") return t("reminders.categoryAssignments");
        if (cat === "personal") return t("reminders.categoryPersonal");
        return cat?.toUpperCase() || "";
    };

    const getSubtitle = (dateStr) => {
        const target = new Date(dateStr);
        const now = new Date();
        const diffMs = target - now;

        if (diffMs > 0 && diffMs <= 1000 * 60 * 60 * 24) {
            const hoursLeft = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60)));
            return ar(t("reminders.dueIn", { hours: hoursLeft, count: hoursLeft }));
        }

        return target.toLocaleString(i18n.language === 'ar' ? "ar-SA" : "en-US", {
            weekday: "short",
            hour: "numeric",
            minute: "2-digit",
        });
    };

    const getRelativeDayLabel = (baseDate, targetDate) => {
        if (isSameDay(baseDate, new Date())) {
            if (isSameDay(targetDate, baseDate)) return t("reminders.today");
            if (isSameDay(targetDate, addDays(baseDate, 1))) return t("reminders.tomorrow");
        }

        const localeStr = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
        return ar(targetDate.toLocaleDateString(localeStr, { weekday: 'short', month: 'short', day: 'numeric' }));
    };

    useEffect(() => {
        const handleOutsideClick = (event) => {
            if (!(event.target instanceof Element)) return;
            if (!event.target.closest("[data-personal-actions-menu]")) {
                setActiveMenuId(null);
            }
        };

        document.addEventListener("pointerdown", handleOutsideClick);
        return () => document.removeEventListener("pointerdown", handleOutsideClick);
    }, []);

    const selectedValue = selectedCategory?.value || "all";
    const selectedCategoryLabel = selectedCategory?.label || t("reminders.allCategories");
    const selectedDay = normalizeDate(selectedDate || new Date());
    const nextDay = addDays(selectedDay, 1);
    const weekEnd = addDays(selectedDay, 7);

    const allReminders = [
        ...(reminders.selectedDay || []),
        ...(reminders.nextDay || []),
        ...(reminders.week || []),
    ].sort(sortByDate);

    const filteredItems = selectedValue === "all"
        ? allReminders
        : allReminders.filter((item) => item.category === selectedValue);

    const selectedDayItems = filteredItems.filter((item) => isSameDay(new Date(item.dueAt), selectedDay)).sort(sortByDate);
    const nextDayItems = filteredItems.filter((item) => isSameDay(new Date(item.dueAt), nextDay)).sort(sortByDate);
    const weekItems = filteredItems.filter((item) => {
        const reminderDay = normalizeDate(item.dueAt);
        return reminderDay > nextDay && reminderDay <= weekEnd;
    }).sort(sortByDate);

    const groups = [
        {
            key: "selectedDay",
            title: `${t("reminders.selectedDay")} • ${getRelativeDayLabel(selectedDay, selectedDay)}`,
            subtitle: t("reminders.dayReminders"),
            color: "bg-blue-500",
            items: selectedDayItems,
        },
        {
            key: "nextDay",
            title: `${t("reminders.nextDayTitle")} • ${getRelativeDayLabel(selectedDay, nextDay)}`,
            subtitle: t("reminders.followingDayReminders"),
            color: "bg-gray-400",
            items: nextDayItems,
        },
        {
            key: "week",
            title: `${t("reminders.thisWeek")} • ${ar(addDays(selectedDay, 2).toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }))} - ${ar(weekEnd.toLocaleDateString(i18n.language === 'ar' ? 'ar-SA' : 'en-US', { weekday: 'short', month: 'short', day: 'numeric' }))}`,
            subtitle: t("reminders.weekReminders"),
            color: "bg-gray-300",
            items: weekItems,
        },
    ];

    return (
        <Section className={`${className} flex flex-col bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 md:p-6 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark`}>
            {/* Header */}
            <div className="mb-6 flex items-center justify-between gap-3">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t("reminders.timeline")}
                </h2>
                <span className="text-xs font-semibold text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                    {t("reminders.category_label", { label: selectedCategoryLabel })}
                </span>
            </div>

            {/* Timeline groups */}
            <div className="flex flex-col gap-8 flex-1">
                {filteredItems.length === 0 && (
                    <div className="flex-1 flex flex-col items-center justify-center w-full h-full rounded-xl border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark px-4 py-8 text-center text-sm text-text-secondary-active-light dark:text-text-secondary-active-dark">
                        <BellSlashIcon size={48} className="mb-4 opacity-40" />
                        {t("reminders.noRemindersRange")}
                    </div>
                )}

                {groups.map((group) => {
                    if (group.items.length === 0) return null;

                    return (
                    <div key={group.key}>
                        {/* Group header */}
                        <div className="flex items-center gap-3 mb-4">
                            <span className={`w-2.5 h-2.5 ${group.color} rounded-full shrink-0`} />
                            <div className="min-w-0">
                                <p className="font-semibold text-sm text-gray-700 dark:text-gray-200 whitespace-nowrap">
                                    {group.title}
                                </p>
                                <p className="text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark whitespace-nowrap">
                                    {group.subtitle}
                                </p>
                            </div>
                            <div className="h-px bg-gray-200 dark:bg-gray-700 w-full" />
                        </div>

                        {/* Cards */}
                        <div className="flex flex-col gap-4 ps-1">
                            {group.items.map((item) => {
                                const visual = categoryStyles[item.category] || categoryStyles.default;
                                const Icon = visual.icon;
                                const dueDate = new Date(item.dueAt);
                                const localeStr = i18n.language === 'ar' ? 'ar-SA' : 'en-US';
                                const fullTime = dueDate.toLocaleTimeString(localeStr, { hour: 'numeric', minute: '2-digit', hour12: true });
                                const meridiemLabel = fullTime.replace(/[\d\s:,-]/g, '').trim();
                                const timeLabel = fullTime.replace(meridiemLabel, '').trim();
                                const itemKey = item.id || item.title;
                                const isPersonal = item.category === "personal";
                                const completed = item.submissionState === "completed";
                                return (
                                    <div
                                        key={itemKey}
                                        className="flex flex-col md:grid md:grid-cols-[64px_minmax(0,1fr)] gap-1 md:gap-4 items-start w-full"
                                    >
                                        <div className="flex md:block items-center gap-1 pt-0 md:pt-3 text-end leading-tight">
                                            <p className="text-xs md:text-sm font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark">
                                                {timeLabel}
                                            </p>
                                            <p className="text-[10px] md:text-[11px] uppercase tracking-wide text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                                {meridiemLabel}
                                            </p>
                                        </div>

                                        <div
                                            className={`flex items-center justify-between gap-2 md:gap-3 p-3 md:p-4 rounded-xl border w-full transition-shadow md:hover:shadow-sm ${
                                                completed
                                                    ? "border-green-300 dark:border-green-700 bg-green-50 dark:bg-green-950/40"
                                                    : `${visual.cardBorder} ${visual.cardBg}`
                                            }`}
                                        >
                                        {/* Left: icon + info */}
                                        <div className="flex items-center gap-2 md:gap-3 min-w-0">
                                            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-lg flex items-center justify-center shrink-0 ${
                                                completed
                                                    ? "bg-green-100 text-green-500 dark:bg-green-900/50 dark:text-green-300"
                                                    : visual.iconBg
                                            }`}>
                                                <Icon size={14} />
                                            </div>
                                            <div className="min-w-0">
                                                <h3 className={`font-semibold text-sm truncate ${completed ? "text-green-700 dark:text-green-300 line-through opacity-70" : "text-gray-800 dark:text-gray-100"}`}>
                                                    {item.title}
                                                </h3>
                                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                    <span className="block md:inline truncate">{getSubtitle(item.dueAt)}</span>
                                                    <span className="hidden md:inline mx-1.5">•</span>
                                                    <span className="block md:inline truncate">{item.location || t("reminders.noLocation")}</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Right: badge + menu */}
                                        <div className="flex items-center gap-1 md:gap-2 shrink-0">
                                            {completed ? (
                                                <span className="px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-md bg-green-100 text-green-600 dark:bg-green-900/40 dark:text-green-300">
                                                    {t("reminders.completed")}
                                                </span>
                                            ) : (
                                                <span className={`px-2 md:px-3 py-0.5 md:py-1 text-[10px] md:text-xs font-bold rounded-md ${visual.badgeColor}`}>
                                                    {getCategoryLabel(item.category)}
                                                </span>
                                            )}
                                            {isPersonal && (
                                                <div className="relative z-20" data-personal-actions-menu>
                                                    <button
                                                        type="button"
                                                        className="relative z-20 inline-flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-lg text-gray-400 transition-colors touch-manipulation md:hover:bg-black/5 dark:md:hover:bg-white/10 active:bg-black/5 dark:active:bg-white/10"
                                                        data-cursor="clickable"
                                                        aria-label={t("reminders.openActions")}
                                                        onPointerUp={(event) => {
                                                            event.preventDefault();
                                                            event.stopPropagation();
                                                            setActiveMenuId((prev) => (prev === itemKey ? null : itemKey));
                                                        }}
                                                    >
                                                        <EllipsisVerticalIcon size={14} />
                                                    </button>

                                                    {activeMenuId === itemKey && (
                                                        <div className="absolute end-0 top-full mt-2 min-w-28 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-lg p-1 z-50 pointer-events-auto">
                                                            <button
                                                                type="button"
                                                                className="w-full text-start px-3 py-2 text-sm rounded-md touch-manipulation md:hover:bg-black/5 dark:md:hover:bg-white/10 active:bg-black/5 dark:active:bg-white/10 text-text-primary-default-light dark:text-text-primary-default-dark"
                                                                onPointerUp={(event) => {
                                                                    event.preventDefault();
                                                                    event.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    onEditReminder?.(item);
                                                                }}
                                                            >
                                                                {t("reminders.edit")}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                className="w-full text-start px-3 py-2 text-sm rounded-md touch-manipulation md:hover:bg-red-50 dark:md:hover:bg-red-900/30 active:bg-red-50 dark:active:bg-red-900/30 text-red-600 dark:text-red-400"
                                                                onPointerUp={(event) => {
                                                                    event.preventDefault();
                                                                    event.stopPropagation();
                                                                    setActiveMenuId(null);
                                                                    onDeleteReminder?.(item);
                                                                }}
                                                            >
                                                                {t("reminders.delete")}
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    );
                })}
            </div>
        </Section>
    );
}