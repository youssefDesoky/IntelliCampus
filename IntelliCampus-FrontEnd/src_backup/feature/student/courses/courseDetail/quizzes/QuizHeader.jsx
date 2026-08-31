import { useTranslation } from 'react-i18next';
import Button from "../../../../../components/ui/Button";
import { CheckIcon, ClockIcon, ExclamationIcon } from "../../../../../components/ui/icons";

function TimerDisplay({ timeLeft, formatTime, totalSeconds }) {
	const { t } = useTranslation('student');
	const progress = totalSeconds > 0 ? (timeLeft / totalSeconds) * 100 : 0;
	const isUrgent = timeLeft < 60;
	const isWarning = timeLeft >= 60 && timeLeft < 120;

	const ringColor = isUrgent
		? "stroke-red-500"
		: isWarning
			? "stroke-amber-500"
			: "stroke-bg-fill-accent-default-light dark:stroke-bg-fill-accent-default-dark";
	const textColor = isUrgent
		? "text-red-600 dark:text-red-400"
		: isWarning
			? "text-amber-600 dark:text-amber-400"
			: "text-text-primary-default-light dark:text-text-primary-default-dark";

	const circumference = 2 * Math.PI * 16;
	const offset = circumference - (progress / 100) * circumference;

	const borderColor = isUrgent
		? "border-red-200 dark:border-red-800"
		: isWarning
			? "border-amber-200 dark:border-amber-800"
			: "border-border-primary-default-light dark:border-border-primary-default-dark";

	return (
		<div className={`flex items-center gap-1.5 sm:px-2.5 sm:py-1.5 sm:rounded-xl sm:border ${borderColor} ${isUrgent ? "text-red-600 dark:text-red-400" : isWarning ? "text-amber-600 dark:text-amber-400" : "text-text-primary-default-light dark:text-text-primary-default-dark"}`}>
			<div className="relative inline-flex items-center justify-center">
				<svg className="transform -rotate-90 w-8 h-8" viewBox="0 0 36 36">
					<circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
						className="text-gray-200 dark:text-gray-700" />
					<circle cx="18" cy="18" r="16" fill="none" stroke="currentColor" strokeWidth="2.5"
						strokeLinecap="round"
						strokeDasharray={circumference}
						strokeDashoffset={offset}
						className={`transition-all duration-1000 ease-linear ${ringColor}`}
					/>
				</svg>
				<div className="absolute inset-0 flex items-center justify-center">
					<ClockIcon size={11} className={isUrgent ? "text-red-500" : isWarning ? "text-amber-500" : "text-text-secondary-default-light dark:text-text-secondary-default-dark"} />
				</div>
			</div>
			<div className="flex flex-col">
				<span className={`font-mono text-sm font-bold tabular-nums leading-tight ${textColor} ${isUrgent ? "animate-pulse" : ""}`}>
					{formatTime(timeLeft)}
				</span>
				<span className="text-[9px] text-text-secondary-default-light dark:text-text-secondary-default-dark font-medium leading-none">
					{t('quizzes.remaining')}
				</span>
			</div>
		</div>
	);
}

function SegmentedProgress({ questions, answers, currentPage, pageSize }) {
	const { t } = useTranslation('student');
	if (!questions || questions.length === 0) return null;

	return (
		<div className="flex items-center gap-0.5 sm:gap-1">
			{questions.map((q, idx) => {
				const ans = answers[q.id];
				const isAnswered = q.type === "Written"
					? typeof ans === "string" && ans.trim().length > 0
					: ans !== undefined && ans !== null && String(ans).length > 0;
				const isCurrentPage = Math.ceil((idx + 1) / pageSize) === currentPage;

				return (
					<div
						key={q.id}
						className={`h-1 sm:h-1.5 flex-1 rounded-full transition-all duration-300 ${
							isAnswered
								? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark"
								: isCurrentPage
									? "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark ring-1 ring-inset ring-text-secondary-default-light/40 dark:ring-text-secondary-default-dark/40"
									: "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark opacity-40"
						}`}
						title={isAnswered ? t('quizzes.questionAnswered', { num: idx + 1 }) : t('quizzes.question', { num: idx + 1 })}
					/>
				);
			})}
		</div>
	);
}

export default function QuizHeader({
	title,
	courseName,
	timeLeft,
	formatTime,
	answeredCount,
	totalCount,
	currentQuestion,
	onSubmit,
	hideControls = false,
	score,
	totalDuration,
	questions = [],
	answers = {},
	currentPage,
	pageSize,
}) {
	const { t } = useTranslation('student');
	const isUrgent = timeLeft < 60 && !hideControls;
	const isWarning = timeLeft >= 60 && timeLeft < 120 && !hideControls;

	return (
		<div className="sticky top-0 z-40 mb-4 sm:mb-6">
			{/* Urgent/Warning banner */}
			{isUrgent && (
				<div className="mb-2 rounded-xl px-4 py-2 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 flex items-center gap-2 text-xs font-semibold text-red-700 dark:text-red-300 animate-pulse">
					<ExclamationIcon size={14} />
					<span>{t('quizzes.urgentRemaining')}</span>
				</div>
			)}
			{isWarning && !isUrgent && (
				<div className="mb-2 rounded-xl px-4 py-2 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 flex items-center gap-2 text-xs font-semibold text-amber-700 dark:text-amber-300">
					<ExclamationIcon size={14} />
					<span>{t('quizzes.lessThan2Remaining')}</span>
				</div>
			)}

			{/* Main header card */}
			<div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light/90 dark:bg-bg-surface-primary-default-dark/90 backdrop-blur-md shadow-sm overflow-hidden">
				<div className="px-4 sm:px-6 py-3 sm:py-4">
					{/* Mobile: stacked layout. Desktop: single row. */}
					<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
						{/* Left: Title area */}
						<div className="min-w-0">
							<h1 className="text-base sm:text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark truncate leading-snug sm:leading-tight">
								{title}
							</h1>
						</div>

						{/* Right: Timer + Submit / Score */}
						<div className="flex items-center gap-3 w-full sm:w-auto shrink-0">
							{hideControls && score ? (
								<div className="flex items-center gap-3 px-4 py-2 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
									<div className="text-end">
										<p className="text-[10px] font-semibold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
											{t('quizzes.scoreLabel')}
										</p>
										<p className="text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 leading-none">
											{score.percentage}%
										</p>
									</div>
									<div className="h-8 w-px bg-emerald-200 dark:bg-emerald-800" />
									<div className="text-sm font-semibold text-emerald-700 dark:text-emerald-300">
										{score.score}
										<span className="text-emerald-500 font-normal">/{score.maxScore}</span>
									</div>
								</div>
							) : !hideControls ? (
								<>
									<div className="flex-[2] flex justify-start sm:block sm:flex-initial">
										<TimerDisplay
											timeLeft={timeLeft}
											formatTime={formatTime}
											totalSeconds={totalDuration || 720}
										/>
									</div>
									<div className="flex-1 sm:flex-initial">
										<Button
											startIcon={<CheckIcon size={14} />}
											onClick={onSubmit}
											className="shadow-sm w-full sm:w-auto"
										>
											{t('quizzes.submit')}
										</Button>
									</div>
								</>
							) : null}
						</div>
					</div>
				</div>

				{/* Segmented progress bar */}
				<div className="px-4 sm:px-6 pb-3 sm:pb-4">
					<SegmentedProgress
						questions={questions}
						answers={answers}
						currentPage={currentPage}
						pageSize={pageSize}
					/>
					<div className="flex items-center justify-between mt-2">
						<span className="text-[11px] sm:text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
							<span className="font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
								{answeredCount ?? "—"}
							</span>{" "}
							{t('quizzes.of')}{" "}
							<span className="font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
								{totalCount ?? "—"}
							</span>{" "}
							{t('quizzes.answered')}
						</span>
						{currentQuestion && (
							<span className="text-[11px] sm:text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
								{t('quizzes.viewing')}{" "}
								<span className="font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
									{currentQuestion}
								</span>
							</span>
						)}
					</div>
				</div>
			</div>
		</div>
	);
}
