import { useTranslation } from "react-i18next";
import { CheckIcon, SandClockIcon } from "../../../../../components/ui/icons";

const PERFORMANCE_CONFIG = [
    {
        min: 85,
        panelClass: "hover:border-emerald-200 dark:hover:border-emerald-800/60 hover:bg-emerald-50/40 dark:hover:bg-emerald-950/20",
        metricToneClass: "text-emerald-700 dark:text-emerald-300",
        progressClass: "bg-linear-to-r from-emerald-400 to-emerald-500",
        chipClass: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",
    },
    {
        min: 75,
        panelClass: "hover:border-sky-200 dark:hover:border-sky-800/60 hover:bg-sky-50/40 dark:hover:bg-sky-950/20",
        metricToneClass: "text-sky-700 dark:text-sky-300",
        progressClass: "bg-linear-to-r from-sky-400 to-blue-500",
        chipClass: "bg-sky-100 dark:bg-sky-900/30 text-sky-700 dark:text-sky-300",
    },
    {
        min: 65,
        panelClass: "hover:border-amber-200 dark:hover:border-amber-800/60 hover:bg-amber-50/40 dark:hover:bg-amber-950/20",
        metricToneClass: "text-amber-700 dark:text-amber-300",
        progressClass: "bg-linear-to-r from-amber-400 to-orange-500",
        chipClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
    },
    {
        min: 50,
        panelClass: "hover:border-orange-200 dark:hover:border-orange-800/60 hover:bg-orange-50/40 dark:hover:bg-orange-950/20",
        metricToneClass: "text-orange-700 dark:text-orange-300",
        progressClass: "bg-linear-to-r from-orange-400 to-rose-500",
        chipClass: "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300",
    },
    {
        min: 0,
        panelClass: "hover:border-rose-200 dark:hover:border-rose-800/60 hover:bg-rose-50/40 dark:hover:bg-rose-950/20",
        metricToneClass: "text-rose-700 dark:text-rose-300",
        progressClass: "bg-linear-to-r from-rose-400 to-red-500",
        chipClass: "bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300",
    },
];

function getPerformanceConfig(percentage) {
    if (percentage === null) {
        return {
            panelClass: "hover:border-border-primary-default-light dark:hover:border-border-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark",
            metricToneClass: "text-text-secondary-default-light dark:text-text-secondary-default-dark",
            progressClass: "bg-linear-to-r from-amber-400 to-orange-500",
            chipClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        };
    }

    return PERFORMANCE_CONFIG.find((tier) => percentage >= tier.min) || PERFORMANCE_CONFIG[PERFORMANCE_CONFIG.length - 1];
}

export default function GradeListItem({ item = {}, toPercent }) {
    const { t } = useTranslation('student');

    const STATUS_CONFIG = {
        Graded: {
            label: t('gradeListItem.graded'),
            icon: CheckIcon,
            badgeClass: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border-emerald-200/70 dark:border-emerald-800/60",
        },
        Upcoming: {
            label: t('gradeListItem.upcoming'),
            icon: SandClockIcon,
            badgeClass: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border-amber-200/70 dark:border-amber-800/60",
        },
    };

    const statusInfo = STATUS_CONFIG[item.status] || STATUS_CONFIG.Upcoming;
    const StatusIcon = statusInfo.icon;
    
    const isGraded = item.status === "Graded";
    const calculatedPercentage = isGraded && item.maxScore ? toPercent(item.score, item.maxScore) : null;
    const progressValue = calculatedPercentage ?? 0;
    const isComplete = isGraded && calculatedPercentage !== null;
    const performanceInfo = getPerformanceConfig(calculatedPercentage);

    return (
        <article
            className={`group relative overflow-hidden rounded-2xl border border-border-primary-default-light bg-bg-surface-primary-default-light p-4 shadow-sm transition-all duration-200 sm:p-5 dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark ${performanceInfo.panelClass} ${!isGraded ? "opacity-90" : ""}`}
        >
            <div className="relative">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<h3 className="truncate text-base font-semibold tracking-tight text-text-primary-light dark:text-text-primary-dark sm:text-lg">
						{item.title || t('gradeListItem.untitled')}
					</h3>
					<span className="ms-auto" />
					<span
						className={`inline-flex w-fit items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold tracking-wide ${statusInfo.badgeClass}`}
						role="status"
					>
						<StatusIcon size={13} className="shrink-0" aria-hidden="true" />
						{statusInfo.label}
					</span>
				</div>

				<div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
					<span>{item.date || t('gradeListItem.dateTbd')}</span>
				</div>
			</div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-3">
                    <div className="rounded-xl border border-border-primary-default-light/70 bg-bg-surface-secondary-default-light/60 px-3 py-3 dark:border-border-primary-default-dark/70 dark:bg-bg-surface-secondary-default-dark/60">
                        <dt className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('gradeListItem.score')}
                        </dt>
                        <dd className="mt-1 truncate text-sm font-semibold text-text-primary-light dark:text-text-primary-dark">
                            {isGraded && item.maxScore ? `${item.score}/${item.maxScore}` : t('gradeListItem.tbd')}
                        </dd>
                    </div>

                    <div className="rounded-xl border border-border-primary-default-light/70 bg-bg-surface-secondary-default-light/60 px-3 py-3 dark:border-border-primary-default-dark/70 dark:bg-bg-surface-secondary-default-dark/60">
                        <dt className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('gradeListItem.weight')}
                        </dt>
                        <dd className={`mt-1 truncate text-sm font-semibold ${performanceInfo.metricToneClass}`}>
                            {item.weight ? `${item.weight}%` : "—"}
                        </dd>
                    </div>

                    <div className="rounded-xl border border-border-primary-default-light/70 bg-bg-surface-secondary-default-light/60 px-3 py-3 dark:border-border-primary-default-dark/70 dark:bg-bg-surface-secondary-default-dark/60">
                        <dt className="truncate text-[11px] font-medium uppercase tracking-[0.18em] text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('gradeListItem.percentage')}
                        </dt>
                        <dd className={`mt-1 truncate text-sm font-semibold ${isComplete ? "text-text-primary-light dark:text-text-primary-dark" : "text-text-secondary-default-light dark:text-text-secondary-default-dark"}`}>
                            {calculatedPercentage !== null ? `${calculatedPercentage}%` : "—"}
                        </dd>
                    </div>
                </div>

                <div className="mt-4">
                    <div className="mb-2 flex items-center justify-between text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        <span>{t('gradeListItem.progress')}</span>
                        <span>{calculatedPercentage !== null ? `${calculatedPercentage}%` : t('gradeListItem.pending')}</span>
                    </div>

                    <div className="h-2 overflow-hidden rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                        <div
                            className={`h-full rounded-full ${performanceInfo.progressClass} transition-all duration-300`}
                            style={{ width: `${progressValue}%` }}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
}