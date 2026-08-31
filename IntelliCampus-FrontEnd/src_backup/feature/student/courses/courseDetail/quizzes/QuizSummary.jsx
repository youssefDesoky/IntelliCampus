import { useTranslation } from 'react-i18next';
import { BookIcon, BrainIcon, CheckIcon, FilePenIcon, Grid2ColIcon, XIcon } from "../../../../../components/ui/icons";

function StatRow({ icon, label, value, percent, barColor }) {
	return (
		<div className="flex items-center gap-3">
			<div className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark">
				{icon}
			</div>
			<div className="flex-1 min-w-0">
				<div className="flex items-center justify-between mb-1">
					<p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{label}</p>
					<p className="text-xs font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{value}</p>
				</div>
				<div className="h-1.5 w-full rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
					<div className={`h-full rounded-full ${barColor}`} style={{ width: `${percent}%` }} />
				</div>
			</div>
		</div>
	);
}

export default function QuizSummary({
	backendResult,
	totalCount,
	progressPercent,
	tfSummary,
	mcqSummary,
	writtenSummary,
	tfPercent,
	mcqPercent,
	writtenPercent,
	questions = [],
	answers = {},
	currentPage,
	pageSize,
	onNavigate,
	reviewMode,
	questionResultsMap = {},
}) {
	const { t } = useTranslation('student');
	return (
		<div className="space-y-4 xl:sticky xl:top-40 xl:self-start">
			{backendResult && (
				<div className="rounded-2xl border border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 to-emerald-100/50 dark:from-emerald-900/20 dark:to-emerald-900/10 p-5 text-center">
					<p className="text-[10px] uppercase tracking-widest font-bold text-emerald-700 dark:text-emerald-300 mb-2">
						{t('quizzes.yourScore')}
					</p>
					<p className="text-4xl font-extrabold text-emerald-600 dark:text-emerald-400 tracking-tight">
						{backendResult.percentage}%
					</p>
					<p className="text-sm font-medium text-emerald-700 dark:text-emerald-300 mt-1">
						{backendResult.score} <span className="text-emerald-500">/ {backendResult.maxScore}</span> {t('quizzes.points')}
					</p>
					<div className="mt-3 h-2 w-full rounded-full bg-emerald-200/50 dark:bg-emerald-800/50 overflow-hidden">
						<div
							className="h-full rounded-full bg-emerald-500 transition-all duration-700"
							style={{ width: `${backendResult.percentage}%` }}
						/>
					</div>
				</div>
			)}

			<div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-sm overflow-hidden">
				<div className="flex items-center justify-between p-4 pb-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
					<h3 className="text-sm font-bold text-text-primary-default-light dark:text-text-primary-default-dark flex items-center gap-2">
						<Grid2ColIcon size={15} />
						{t('quizzes.questionNavigator')}
					</h3>
					<span className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">
						{questions.length} {t('quizzes.questions')}
					</span>
				</div>
				<div className="p-4">
					<div className="grid grid-cols-5 gap-2">
						{questions.map((q, idx) => {
							const qNum = idx + 1;
							const isAnswered = (() => {
								const ans = answers[q.id];
								if (q.type === "Written") return typeof ans === "string" && ans.trim().length > 0;
								return ans !== undefined && ans !== null && String(ans).length > 0;
							})();
							const isCurrent = Math.ceil(qNum / pageSize) === currentPage;
							const result = questionResultsMap[q.id];

							let btnClass = "h-9 w-9 rounded-lg text-xs font-bold flex items-center justify-center transition-all duration-150 relative ";
							if (reviewMode && result) {
								if (result.isCorrect) {
									btnClass += "bg-green-100 text-green-700 border border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800";
								} else {
									btnClass += "bg-red-100 text-red-700 border border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800";
								}
							} else if (isAnswered) {
								btnClass += "bg-bg-fill-accent-default-light text-white dark:bg-bg-fill-accent-default-dark";
							} else {
								btnClass += "bg-bg-surface-secondary-default-light text-text-secondary-default-light border border-border-primary-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-secondary-default-dark dark:border-border-primary-default-dark";
							}

							if (isCurrent && !reviewMode) {
								btnClass += " ring-2 ring-offset-1 ring-bg-fill-accent-default-light dark:ring-bg-fill-accent-default-dark dark:ring-offset-bg-surface-primary-default-dark";
							} else if (isCurrent && reviewMode) {
								btnClass += " ring-2 ring-offset-1 ring-text-primary-default-light dark:ring-text-primary-default-dark dark:ring-offset-bg-surface-primary-default-dark";
							}

							return (
								<button
									key={q.id}
									onClick={() => onNavigate && onNavigate(Math.ceil(qNum / pageSize))}
									className={btnClass}
									title={t('quizzes.question', { num: qNum })}
								>
									{qNum}
									{reviewMode && result && (
										<span className="absolute -top-1 -end-1">
											{result.isCorrect ? (
												<CheckIcon size={8} className="text-green-500" />
											) : (
												<XIcon size={8} className="text-red-500" />
											)}
										</span>
									)}
								</button>
							);
						})}
					</div>
					<div className="mt-4 flex flex-wrap items-center gap-3 text-[11px] text-text-secondary-default-light dark:text-text-secondary-default-dark">
						<span className="flex items-center gap-1.5">
							<span className="w-2.5 h-2.5 rounded-sm bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark" />
							{t('quizzes.legendAnswered')}
						</span>
						<span className="flex items-center gap-1.5">
							<span className="w-2.5 h-2.5 rounded-sm bg-bg-surface-secondary-default-light border border-border-primary-default-light dark:bg-bg-surface-secondary-default-dark dark:border-border-primary-default-dark" />
							{t('quizzes.unanswered')}
						</span>
						{reviewMode && (
							<>
								<span className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-200 dark:bg-green-900/30 dark:border-green-800" />
									{t('quizzes.correct')}
								</span>
								<span className="flex items-center gap-1.5">
									<span className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200 dark:bg-red-900/30 dark:border-red-800" />
									{t('quizzes.incorrect')}
								</span>
							</>
						)}
					</div>
				</div>
			</div>

			<div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-sm p-4 space-y-3.5">
				<h3 className="text-sm font-bold text-text-primary-default-light dark:text-text-primary-default-dark flex items-center gap-2">
					<BookIcon size={15} />
					{t('quizzes.summary')}
				</h3>
				<StatRow
					icon={<BookIcon size={14} />}
					label={t('quizzes.totalQuestions')}
					value={`${totalCount}`}
					percent={progressPercent}
					barColor="bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark"
				/>
				<StatRow
					icon={<CheckIcon size={14} />}
					label={t('quizzes.trueFalse')}
					value={`${tfSummary.answered}/${tfSummary.total}`}
					percent={tfPercent}
					barColor="bg-sky-500"
				/>
				<StatRow
					icon={<BrainIcon size={14} />}
					label={t('quizzes.multipleChoice')}
					value={`${mcqSummary.answered}/${mcqSummary.total}`}
					percent={mcqPercent}
					barColor="bg-violet-500"
				/>
				<StatRow
					icon={<FilePenIcon size={14} />}
					label={t('quizzes.written')}
					value={`${writtenSummary.answered}/${writtenSummary.total}`}
					percent={writtenPercent}
					barColor="bg-emerald-500"
				/>
			</div>

		</div>
	);
}
