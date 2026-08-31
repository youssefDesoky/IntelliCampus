import { useMemo } from "react";
import { useTranslation } from 'react-i18next';
import useMediaQuery from "../../../../hooks/useMediaQuery";
import SearchBar from "../../../../components/ui/SearchBar";
import PageHeader from "../../../../components/ui/PageHeader";
import CircularProgress from "../../../../components/ui/CircularProgress";
import {
    FilterIcon,
    StarIcon,
    BookIcon,
    ClockIcon,
    ChartBarIcon,
    ChartLineIcon,
    SandClockIcon,
} from "../../../../components/ui/icons";

const MAX_CREDITS = 18;

function StatCard({ icon, value, label, colorClass, delay = 0 }) {
    const Icon = icon;
    return (
        <div
            className="relative flex flex-col items-center justify-center rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-3 sm:p-4 transition-all duration-300 hover:shadow-md hover:-translate-y-0.5"
            style={{ animationDelay: `${delay}ms` }}
        >
            <div
                className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-full mb-2 ${colorClass}`}
            >
                <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </div>
            <span className="text-xl sm:text-2xl font-bold text-text-primary-active-light dark:text-text-primary-active-dark tabular-nums">
                {value}
            </span>
            <span className="text-xs font-medium text-text-secondary-active-light dark:text-text-secondary-active-dark mt-0.5">
                {label}
            </span>
        </div>
    );
}

export default function CourseRegistrationHeader({
    selectedCourses = [],
    activeFilter = "all",
    onFilterChange,
    searchValue = "",
    onSearchChange,
}) {
    const { t } = useTranslation('student');
    const isSmall = useMediaQuery('(max-width: 639px)');

    const filterOptions = [
        { value: "all", label: t('registration.filterAll'), icon: FilterIcon },
        { value: "required", label: t('registration.filterRequired'), icon: StarIcon },
        { value: "elective", label: t('registration.filterElective'), icon: BookIcon },
    ];

    const selectedCredits = selectedCourses.reduce(
        (sum, c) => sum + (typeof c.creditHours === "number" ? c.creditHours : 0),
        0
    );
    const remainingCredits = Math.max(0, MAX_CREDITS - selectedCredits);
    const progressPercent = Math.min(100, (selectedCredits / MAX_CREDITS) * 100);

    const progressTextColor = useMemo(() => {
        if (progressPercent >= 100) return "text-text-danger-default-light dark:text-text-danger-default-dark";
        if (progressPercent >= 80) return "text-text-warning-default-light dark:text-text-warning-default-dark";
        if (progressPercent >= 50) return "text-text-success-default-light dark:text-text-success-default-dark";
        return "text-text-accent-default-light dark:text-text-accent-default-dark";
    }, [progressPercent]);

    return (
        <PageHeader
            title={t('registration.title')}
            subtitle={t('registration.subtitle')}
            headerDir="col"
        >
            <div className="flex flex-col gap-5 w-full">
                {/* Credit Summary Card */}
                <div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 sm:p-6">
                    <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6">
                        {/* Circular Progress */}
                        <div className="hidden sm:flex flex-col items-center gap-2 shrink-0">
                            <CircularProgress
                                size={isSmall ? 100 : 120}
                                progress={progressPercent}
                                strokeWidth={isSmall ? 8 : 10}
                                progressColor={progressTextColor}
                                circleColor="text-bg-fill-secondary-default-light dark:text-bg-fill-secondary-default-dark"
                                textColor={progressTextColor}
                            >
                                <div className="flex flex-col items-center">
                                    <span className="text-xl sm:text-2xl font-bold tabular-nums">
                                        {selectedCredits}
                                    </span>
                                    <span className="text-[10px] text-text-secondary-active-light dark:text-text-secondary-active-dark font-medium">
                                        / {MAX_CREDITS}
                                    </span>
                                </div>
                            </CircularProgress>
                            <span className="text-xs font-semibold text-text-secondary-active-light dark:text-text-secondary-active-dark uppercase tracking-wider">
                                {t('registration.credits')}
                            </span>
                        </div>

                        {/* Divider */}
                        <div className="hidden sm:block w-px h-24 bg-border-primary-default-light dark:bg-border-primary-default-dark" />

                        {/* Stat Cards */}
                        <div className="flex-1 grid grid-cols-3 gap-3 w-full">
                            <StatCard
                                icon={ChartBarIcon}
                                value={selectedCredits}
                                label={t('registration.selected')}
                                colorClass="bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark"
                                delay={0}
                            />
                            <StatCard
                                icon={SandClockIcon}
                                value={remainingCredits}
                                label={t('registration.remaining')}
                                colorClass={
                                    remainingCredits <= 3
                                        ? "bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark"
                                        : "bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark"
                                }
                                delay={100}
                            />
                            <StatCard
                                icon={ChartLineIcon}
                                value={MAX_CREDITS}
                                label={t('registration.maximum')}
                                colorClass="bg-bg-fill-secondary-active-light dark:bg-bg-fill-secondary-active-dark"
                                delay={200}
                            />
                        </div>
                    </div>
                </div>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
                    {/* Desktop Filters */}
                    <div className="hidden sm:flex flex-wrap items-center gap-2 p-1 rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                        {filterOptions.map((option) => {
                            const isActive = activeFilter === option.value;
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => onFilterChange(option.value)}
                                    className={`relative flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark shadow-sm"
                                            : "text-text-secondary-active-light dark:text-text-secondary-active-dark hover:text-text-primary-active-light dark:hover:text-text-primary-active-dark hover:bg-bg-fill-secondary-active-light dark:hover:bg-bg-fill-secondary-active-dark"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                    <span>{option.label}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile Filters */}
                    <div className="flex sm:hidden items-center gap-1 p-1 rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark w-full">
                        {filterOptions.map((option) => {
                            const isActive = activeFilter === option.value;
                            const Icon = option.icon;
                            return (
                                <button
                                    key={option.value}
                                    onClick={() => onFilterChange(option.value)}
                                    className={`relative flex flex-1 items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-medium transition-all duration-200 ${
                                        isActive
                                            ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark shadow-sm"
                                            : "text-text-secondary-active-light dark:text-text-secondary-active-dark hover:text-text-primary-active-light dark:hover:text-text-primary-active-dark hover:bg-bg-fill-secondary-active-light dark:hover:bg-bg-fill-secondary-active-dark"
                                    }`}
                                >
                                    <Icon className="w-4 h-4" />
                                </button>
                            );
                        })}
                    </div>

                    <SearchBar
                        placeholder={t('registration.searchPlaceholder')}
                        value={searchValue}
                        onChange={(e) => onSearchChange(e.target.value)}
                        className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark w-full md:max-w-md rounded-xl border-border-primary-default-light dark:border-border-primary-default-dark focus-within:ring-2 focus-within:ring-border-primary-focus-light dark:focus-within:ring-border-primary-focus-dark transition-shadow"
                    />
                </div>
            </div>
        </PageHeader>
    );
}