import Section from "../../../../../components/ui/Section";

export default function QuizSummaryBase({
	title,
	subtitle,
	children,
	className = "",
}) {
	return (
		<Section className={className}>
			<div className="overflow-hidden rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-sm">
				<div className="border-b border-border-primary-default-light dark:border-border-primary-default-dark px-5 py-4 sm:px-6 sm:py-5">
					{title && (
						<h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{title}</h3>
					)}
					{subtitle && (
						<p className="mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{subtitle}</p>
					)}
				</div>

				<div className="px-5 py-5 sm:px-6">
					{children}
				</div>
			</div>
		</Section>
	);
}
