import { useTranslation } from 'react-i18next';
import TextArea from "../../../../../components/ui/TextArea";
import { ClipboardCheckIcon, CheckIcon, XIcon } from "../../../../../components/ui/icons";
import useArabicDigits from "../../../../../hooks/useArabicDigits";

export function TypeBadge({ type }) {
	const normalizedType = type === "Written" ? "Written" : type;
	const label = type === "Written" ? "Written" : type;
	const styles = {
		TF: "bg-sky-50 text-sky-700 dark:bg-sky-900/20 dark:text-sky-300 border border-sky-100 dark:border-sky-800",
		MCQ: "bg-violet-50 text-violet-700 dark:bg-violet-900/20 dark:text-violet-300 border border-violet-100 dark:border-violet-800",
		Written: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-300 border border-emerald-100 dark:border-emerald-800",
	};

	return (
		<span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${styles[normalizedType] || styles.Written}`}>
			{label}
		</span>
	);
}

function OptionButton({ label, text, selected, correct, showCorrect, disabled, onClick }) {
	let containerClasses = "group relative flex items-center gap-4 w-full rounded-xl border p-4 text-start transition-all duration-200 ";
	let circleClasses = "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold transition-colors ";
	let textClasses = "font-medium ";

	if (showCorrect) {
		if (correct) {
			containerClasses += "border-green-500 bg-green-50/60 dark:bg-green-900/15 ring-1 ring-green-500/30 ";
			circleClasses += "bg-green-500 text-white ";
			textClasses += "text-green-700 dark:text-green-300 ";
		} else if (selected && !correct) {
			containerClasses += "border-red-500 bg-red-50/60 dark:bg-red-900/15 ring-1 ring-red-500/30 ";
			circleClasses += "bg-red-500 text-white ";
			textClasses += "text-red-700 dark:text-red-300 ";
		} else {
			containerClasses += "border-border-primary-default-light dark:border-border-primary-default-dark opacity-50 ";
			circleClasses += "bg-bg-surface-secondary-default-light text-text-secondary-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-secondary-default-dark ";
			textClasses += "text-text-primary-default-light dark:text-text-primary-default-dark ";
		}
	} else {
		if (selected) {
			containerClasses += "border-bg-fill-accent-default-light bg-bg-surface-accent-default-light/10 dark:border-bg-fill-accent-default-dark dark:bg-bg-surface-accent-default-dark/10 ring-1 ring-bg-fill-accent-default-light dark:ring-bg-fill-accent-default-dark ";
			circleClasses += "bg-bg-fill-accent-default-light text-white dark:bg-bg-fill-accent-default-dark ";
			textClasses += "text-text-primary-default-light dark:text-text-primary-default-dark ";
		} else {
			containerClasses += "border-border-primary-default-light hover:border-text-secondary-default-light dark:border-border-primary-default-dark dark:hover:border-text-secondary-default-dark hover:shadow-sm ";
			circleClasses += "bg-bg-surface-secondary-default-light text-text-secondary-default-light dark:bg-bg-surface-secondary-default-dark dark:text-text-secondary-default-dark ";
			textClasses += "text-text-primary-default-light dark:text-text-primary-default-dark ";
		}
	}

	return (
		<button type="button" disabled={disabled} onClick={onClick} className={containerClasses}>
			<span className={circleClasses}>{label}</span>
			<span className={textClasses}>{text}</span>
			{showCorrect && correct && <CheckIcon size={18} className="ms-auto text-green-500 shrink-0" />}
			{showCorrect && selected && !correct && <XIcon size={18} className="ms-auto text-red-500 shrink-0" />}
			{!showCorrect && selected && <CheckIcon size={18} className="ms-auto text-bg-fill-accent-default-light dark:text-bg-fill-accent-default-dark shrink-0" />}
		</button>
	);
}

function QuestionControls({ question, questionType, answer, onAnswerChange, writtenWordCount, showCorrectAnswer, correctAnswer, feedback }) {
	const { t } = useTranslation('student');
	const { convert: ar } = useArabicDigits();
	const type = questionType || question.type;
	const disabled = !onAnswerChange;

	if (type === "TF") {
		const correctIsTrue = correctAnswer === true || correctAnswer === "true";
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				<OptionButton
					label={t('quizzes.trueAbbr')}
					text={t('quizzes.trueOption')}
					selected={answer === true}
					correct={showCorrectAnswer && correctIsTrue}
					showCorrect={showCorrectAnswer}
					disabled={disabled}
					onClick={() => onAnswerChange(true)}
				/>
				<OptionButton
					label={t('quizzes.falseAbbr')}
					text={t('quizzes.falseOption')}
					selected={answer === false}
					correct={showCorrectAnswer && !correctIsTrue}
					showCorrect={showCorrectAnswer}
					disabled={disabled}
					onClick={() => onAnswerChange(false)}
				/>
			</div>
		);
	}

	if (type === "MCQ") {
		return (
			<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
				{question.options?.map((option, optionIndex) => (
					<OptionButton
						key={option}
						label={String.fromCharCode(65 + optionIndex)}
						text={option}
						selected={answer === option}
						correct={showCorrectAnswer && option === correctAnswer}
						showCorrect={showCorrectAnswer}
						disabled={disabled}
						onClick={() => onAnswerChange(option)}
					/>
				))}
			</div>
		);
	}

	if (type === "Written Question" || type === "Written") {
		return (
			<div className="space-y-3">
				<TextArea
					value={answer || ""}
					onChange={(e) => onAnswerChange && onAnswerChange(e.target.value)}
					placeholder={t('quizzes.writeAnswerPlaceholder')}
					readOnly={disabled}
					className={`w-full rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark px-4 py-3 focus:ring-2 focus:ring-bg-fill-accent-default-light/20 dark:focus:ring-bg-fill-accent-default-dark/30 ${disabled ? "opacity-70" : ""}`}
				/>
				<div className="flex items-center justify-between text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
					<span>{t('quizzes.writeAnswerHint')}</span>
					<span className="font-medium">{ar(writtenWordCount)} {t('quizzes.words')}</span>
				</div>
				{feedback && (
					<div className={`rounded-lg border px-4 py-3 text-sm ${showCorrectAnswer ? "border-green-200 bg-green-50 text-green-800 dark:border-green-900 dark:bg-green-900/20 dark:text-green-200" : "border-red-200 bg-red-50 text-red-800 dark:border-red-900 dark:bg-red-900/20 dark:text-red-200"}`}>
						{feedback}
					</div>
				)}
			</div>
		);
	}

	return null;
}

export default function QuestionCard({ question, questionType, answer, onAnswerChange, writtenWordCount, children, scoreState, showCorrectAnswer, correctAnswer, feedback }) {
	const { t } = useTranslation('student');
	const { convert: ar } = useArabicDigits();
	return (
		<div className="rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 sm:p-6 shadow-sm transition-all hover:shadow-md">
			<div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between mb-5">
				<div className="space-y-2 min-w-0 flex-1">
					<div className="flex items-center gap-2 flex-wrap">
						<TypeBadge type={question.type} />
						<div className="inline-flex items-center gap-1.5 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
							<ClipboardCheckIcon size={13} />
							<span>{ar(question.points)} {t('quizzes.points')}</span>
						</div>
					</div>
					<h3 className="text-base sm:text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark leading-relaxed">
						{question.prompt}
					</h3>
				</div>

				{scoreState && <div className="shrink-0">{scoreState}</div>}
			</div>

			{children ?? (
				<QuestionControls
					question={question}
					questionType={questionType}
					answer={answer}
					onAnswerChange={onAnswerChange}
					writtenWordCount={writtenWordCount}
					showCorrectAnswer={showCorrectAnswer}
					correctAnswer={correctAnswer}
					feedback={feedback}
				/>
			)}
		</div>
	);
}
