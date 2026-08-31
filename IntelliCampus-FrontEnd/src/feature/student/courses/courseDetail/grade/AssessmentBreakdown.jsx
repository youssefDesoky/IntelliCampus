import { useTranslation } from "react-i18next";
import BaseComponent from "../../../../../components/ui/BaseComponent";
import useArabicDigits from "../../../../../hooks/useArabicDigits";

export default function AssessmentBreakdown({ groups = [] }) {
	const { t } = useTranslation('student');
	const { convert: ar } = useArabicDigits();

	const getTier = (percent) => {
		if (percent >= 85) return { progressClass: "bg-linear-to-r from-emerald-400 to-emerald-500", metricClass: "text-emerald-600 dark:text-emerald-400" };
		if (percent >= 75) return { progressClass: "bg-linear-to-r from-sky-400 to-blue-500", metricClass: "text-sky-700 dark:text-sky-300" };
		if (percent >= 65) return { progressClass: "bg-linear-to-r from-amber-400 to-orange-500", metricClass: "text-amber-700 dark:text-amber-300" };
		if (percent >= 50) return { progressClass: "bg-linear-to-r from-orange-400 to-rose-500", metricClass: "text-orange-700 dark:text-orange-300" };
		return { progressClass: "bg-linear-to-r from-rose-400 to-red-500", metricClass: "text-rose-700 dark:text-rose-300" };
	};

	return (
		<BaseComponent
			title={t('grades.assessmentBreakdown')}
			description={t('assessmentBreakdown.description')}
			subtitle={t('assessmentBreakdown.subtitle')}
			className="h-full flex flex-col"
			contentClassName="px-5 py-5 sm:px-6 space-y-3 flex-1 flex flex-col"
		>
			{groups.length === 0 ? (
				<div className="flex-1 flex flex-col items-center justify-center text-center">
					<p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
						{t('assessmentBreakdown.empty')}
					</p>
				</div>
			) : (
				groups.map((group) => {
					const percent = group.percent || 0;
					const tier = getTier(percent);

					return (
						<div key={group.category} className="flex items-centers gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark hover:bg-bg-surface-tertiary-default-light dark:hover:bg-bg-surface-tertiary-default-dark transition-colors">
							<div className="flex-1">
								<div className="flex items-center justify-between mb-2">
									<p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{group.category}</p>
									<span className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('assessmentBreakdown.weight', { weight: ar(group.totalWeight) })}</span>
								</div>
								<div className="h-1.5 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-full overflow-hidden">
									<div className={`h-full rounded-full transition-all ${tier.progressClass}`} style={{ width: percent + "%" }} />
								</div>
								<div className="flex items-center justify-between mt-2 gap-2">
									<span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
										{group.totalMaxScore ? `${ar(group.totalScore)}/${ar(group.totalMaxScore)}` : t('assessmentBreakdown.notGraded')}
									</span>
									<span className={`text-xs font-semibold ${tier.metricClass}`}>
										{ar(percent)}%
									</span>
								</div>
							</div>
						</div>
					);
				})
			)}
		</BaseComponent>
	);
}
