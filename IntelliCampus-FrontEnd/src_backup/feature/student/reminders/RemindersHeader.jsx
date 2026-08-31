import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { PlusIcon, FilterIcon } from "../../../components/ui/icons";
import PageHeader from "../../../components/ui/PageHeader";

const countsFromReminders = (reminders) => {
    if (!reminders || !Array.isArray(reminders)) return {};
    return reminders.reduce((acc, r) => {
        acc[r.category] = (acc[r.category] || 0) + 1;
        return acc;
    }, {});
};

export default function RemindersHeader({ setIsFormOpen, selectedCategory, onSelectCategory, reminders, categories: categoriesProp }) {
    const { t } = useTranslation("student");
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const menuRef = useRef(null);
    const counts = countsFromReminders(reminders);

    const defaultCategories = [
        { value: "all", label: t("reminders.categoryLabelAll"), dotColor: "bg-gray-500" },
        { value: "classes", label: t("reminders.categoryClasses"), dotColor: "bg-blue-500" },
        { value: "exams", label: t("reminders.categoryExams"), dotColor: "bg-yellow-500" },
        { value: "assignments", label: t("reminders.categoryAssignments"), dotColor: "bg-red-500" },
        { value: "personal", label: t("reminders.categoryPersonal"), dotColor: "bg-purple-500" },
    ];

    const categories = categoriesProp || defaultCategories;

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setIsFilterOpen(false);
            }
        };
        document.addEventListener("pointerdown", handleClickOutside);
        return () => document.removeEventListener("pointerdown", handleClickOutside);
    }, []);

    return (
        <PageHeader
            title={t("reminders.title")}
            subtitle={t("reminders.subtitle")}
        >
            <div className="flex items-center gap-2">
                {/* Mobile filter dropdown */}
                <div className="relative md:hidden" ref={menuRef}>
                    <button
                        type="button"
                        onClick={() => setIsFilterOpen((prev) => !prev)}
                        className="flex items-center justify-center h-9 w-9 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark text-gray-600 dark:text-gray-300 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark"
                    >
                        <FilterIcon size={16} />
                    </button>

                    {isFilterOpen && (
                        <div className="absolute end-0 top-full mt-1 min-w-40 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-lg p-1 z-50">
                            {categories.map((cat) => (
                                <button
                                    key={cat.value}
                                    type="button"
                                    onClick={() => {
                                        onSelectCategory?.({ value: cat.value, label: cat.label });
                                        setIsFilterOpen(false);
                                    }}
                                    className={`flex items-center justify-between w-full px-3 py-2 rounded-md text-sm touch-manipulation ${
                                        selectedCategory?.value === cat.value
                                            ? 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200'
                                            : 'text-gray-600 dark:text-gray-400 hover:bg-black/5 dark:hover:bg-white/10'
                                    }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span className={`w-2 h-2 rounded-full ${cat.dotColor}`} />
                                        <span>{cat.label}</span>
                                    </div>
                                    {counts[cat.value] > 0 && (
                                        <span className="text-xs text-gray-400">{counts[cat.value]}</span>
                                    )}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setIsFormOpen(true)}
                    className="flex items-center justify-center h-9 w-9 md:w-auto md:px-4 rounded-lg border border-border-accent-default-light dark:border-border-accent-default-dark bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark font-medium text-sm transition-colors"
                >
                    <PlusIcon size={16}/>
                    <span className="hidden md:inline ms-2">{t("reminders.addReminder")}</span>
                </button>
            </div>
        </PageHeader>
    );
}
