import { useTranslation } from "react-i18next";
import Section from "../../../components/ui/Section";

export default function Categories({ className, reminders = [], selectedCategory, onSelectCategory, categories: categoriesProp }) {
    const { t } = useTranslation("student");

    const defaultCategories = [
        { value: "classes", label: t("reminders.categoryClasses"), dotColor: "bg-blue-500", rowBg: "bg-blue-50" },
        { value: "exams", label: t("reminders.categoryExams"), dotColor: "bg-yellow-500", rowBg: "bg-yellow-50" },
        { value: "assignments", label: t("reminders.categoryAssignments"), dotColor: "bg-red-500", rowBg: "bg-red-50" },
        { value: "personal", label: t("reminders.categoryPersonal"), dotColor: "bg-purple-500", rowBg: "bg-purple-50" },
    ];

    const categories = categoriesProp || defaultCategories;

    const counts = reminders.reduce((acc, reminder) => {
        const key = reminder.category;
        acc[key] = (acc[key] || 0) + 1;
        return acc;
    }, {});

    return (
        <Section className={`${className} bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark`}>
            <div className="mb-4 flex items-center justify-between gap-2">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    {t("reminders.categories")}
                </h2>
                
                <button
                    type="button"
                    onClick={() => onSelectCategory?.({ value: "all", label: t("reminders.categoryLabelAll") })}
                    className="text-xs font-medium text-text-accent-default-light dark:text-text-accent-default-dark hover:underline"
                >
                    {t("reminders.showAll")}
                </button>
            </div>

            <div className="flex flex-col gap-2">
                {categories.map((category) => (
                    <button
                        key={category.value}
                        type="button"
                        onClick={() => onSelectCategory?.({ value: category.value, label: category.label })}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl ${category.rowBg} dark:bg-white/5 border transition-colors ${selectedCategory?.value === category.value ? "border-border-primary-active-light dark:border-border-primary-active-dark" : "border-transparent hover:border-border-primary-default-light dark:hover:border-border-primary-default-dark"}`}
                    >
                        <div className="flex items-center gap-3">
                            <span className={`w-2.5 h-2.5 rounded-full ${category.dotColor} shrink-0`} />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                                {category.label}
                            </span>
                        </div>
                        <span className="text-sm font-semibold text-gray-500 dark:text-gray-400">
                            {counts[category.value] || 0}
                        </span>
                    </button>
                ))}
            </div>
        </Section>
    );
}