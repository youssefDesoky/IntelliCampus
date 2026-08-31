import { useState, useEffect, useRef, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import { useOutletContext, useSearchParams } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import { useError } from "../../../../../contexts/ErrorContext.jsx";

import PaginationButtons from "../../../../../components/ui/PaginationButtons";
import QuestionCard from "./QuestionCard";
import QuizHeader from "./QuizHeader";
import QuizSummary from "./QuizSummary";
import { fetchPracticeQuiz, submitPracticeQuiz } from "../../../services/quizzesApi";
import { Grid2ColIcon, XIcon } from "../../../../../components/ui/icons";
import { CourseQuizPracticeSkeleton } from "./SkeletonLoader";

const PAGE_SIZE = 3;

export default function CourseQuizPractice() {
	const { t } = useTranslation('student');
	const { course } = useOutletContext();
	const courseId = course?.id;
	const isReadOnly = course?.isReadOnly;
	const [searchParams] = useSearchParams();
	const reviewMode = searchParams.get("review") || null;
	const selectedQuizId = searchParams.get("quizId");
	const { showError } = useError();
	const queryClient = useQueryClient();
	const [practiceQuizData, setPracticeQuizData] = useState(null);
	const [isQuizLoading, setIsQuizLoading] = useState(true);
	const submissionLockRef = useRef(false);

	const [currentPage, setCurrentPage] = useState(1);
	const [answers, setAnswers] = useState({});
	const [isSubmitted, setIsSubmitted] = useState(Boolean(reviewMode));
	const [submissionResult, setSubmissionResult] = useState(null);
	const [timeLeft, setTimeLeft] = useState(720);
	const [quizStarted, setQuizStarted] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false);

	const loadPracticeQuiz = useCallback(async () => {
		if (!courseId) return;
		try {
			setIsQuizLoading(true);
			const data = await fetchPracticeQuiz(courseId, selectedQuizId);
			setPracticeQuizData(data);
		} catch (err) {
			showError(err.message || t('quizzes.loadFailed'));
		} finally {
			setIsQuizLoading(false);
		}
	}, [courseId, selectedQuizId]);

	useEffect(() => {
		loadPracticeQuiz();
	}, [loadPracticeQuiz]);

	useEffect(() => {
		if (practiceQuizData?.durationSeconds) {
			setTimeLeft(practiceQuizData.durationSeconds);
		}
	}, [practiceQuizData?.durationSeconds]);

	const quizQuestions = practiceQuizData?.questions || [];
	const quizTitle = practiceQuizData?.title || t('quizzes.practiceTitle');
	const courseName = practiceQuizData?.courseName || course?.title || course?.name;
	const isBackendSubmitted = Boolean(practiceQuizData?.previousSubmission) || Boolean(reviewMode);
	const quizSummary = practiceQuizData?.questionsSummary || { total: 0, tf: 0, mcq: 0, written: 0 };
	const totalDuration = practiceQuizData?.durationSeconds || 720;

	const answeredCount = quizQuestions.filter((q) => {
		const answer = answers[q.id];
		if (q.type === "Written") return typeof answer === "string" && answer.trim().length > 0;
		return answer !== undefined && answer !== null && String(answer).length > 0;
	}).length;

	const writtenQuestion = quizQuestions.find((q) => q.type === "Written");
	const writtenWordCount = writtenQuestion && answers[writtenQuestion.id] ? answers[writtenQuestion.id].trim().split(/\s+/).length : 0;
	const progressPercent = quizSummary.total ? Math.round((answeredCount / quizSummary.total) * 100) : 0;
	const pageSize = practiceQuizData?.pageSize || PAGE_SIZE;
	const totalPages = Math.max(1, Math.ceil(quizSummary.total / pageSize));
	const visibleQuestions = quizQuestions.slice((currentPage - 1) * pageSize, currentPage * pageSize);
	const currentQuestionStart = (currentPage - 1) * pageSize + 1;
	const currentQuestionEnd = Math.min(currentPage * pageSize, quizSummary.total);
	const currentQuestionLabel = totalPages > 1 ? `${currentQuestionStart}-${currentQuestionEnd}` : String(currentQuestionStart);

	const tfAnswered = quizQuestions.filter((q) => q.type === "TF" && answers[q.id] !== undefined && answers[q.id] !== null).length;
	const mcqAnswered = quizQuestions.filter((q) => q.type === "MCQ" && answers[q.id] !== undefined && answers[q.id] !== null).length;
	const writtenAnswered = quizQuestions.filter((q) => q.type === "Written" && answers[q.id] && answers[q.id].trim().length > 0).length;

	const tfPercent = quizSummary.tf ? Math.round((tfAnswered / quizSummary.tf) * 100) : 0;
	const mcqPercent = quizSummary.mcq ? Math.round((mcqAnswered / quizSummary.mcq) * 100) : 0;
	const writtenPercent = quizSummary.written ? Math.round((writtenAnswered / quizSummary.written) * 100) : 0;

	const backendResult = submissionResult || practiceQuizData?.previousSubmission || null;
	const tfSummary = backendResult?.byType?.TF || { answered: tfAnswered, total: quizSummary.tf };
	const mcqSummary = backendResult?.byType?.MCQ || { answered: mcqAnswered, total: quizSummary.mcq };
	const writtenSummary = backendResult?.byType?.Written || { answered: writtenAnswered, total: quizSummary.written };

	const questionResultsMap = {};
	if (backendResult?.questionResults) {
		for (const r of backendResult.questionResults) {
			questionResultsMap[r.questionId] = r;
		}
	}

	useEffect(() => {
		if (reviewMode && practiceQuizData?.previousSubmission?.answers) {
			setAnswers(practiceQuizData.previousSubmission.answers);
		}
	}, [reviewMode, practiceQuizData]);

	const handleSubmitQuiz = useCallback(async () => {
		if (submissionLockRef.current) return;
		if (isReadOnly) {
			showError("This course is inactive. Quiz submission is not available.");
			return;
		}
		submissionLockRef.current = true;
		setIsSubmitted(true);

		try {
			if (!courseId) return;
			const payload = await submitPracticeQuiz(courseId, {
				quizId: practiceQuizData?.quizId,
				answers,
			});
			setSubmissionResult(payload);
			queryClient.invalidateQueries({ queryKey: ["reminders"] });
			queryClient.removeQueries({ queryKey: ["todayReminders"], exact: false });
			queryClient.invalidateQueries({ queryKey: ["courseQuizzes", courseId] });
		} catch {
			// submission failed — user will see the error via quizError or a UI notification
		}
	}, [answers, courseId, practiceQuizData?.quizId]);

	useEffect(() => {
		if (isSubmitted || isBackendSubmitted || reviewMode || !quizStarted) return;
		const timerId = setInterval(() => {
			setTimeLeft((remaining) => {
				if (remaining <= 1) {
					clearInterval(timerId);
					void handleSubmitQuiz();
					return 0;
				}
				return remaining - 1;
			});
		}, 1000);

		return () => clearInterval(timerId);
	}, [handleSubmitQuiz, isBackendSubmitted, isSubmitted, quizStarted, reviewMode]);

	function formatTime(seconds) {
		const minutes = Math.floor(seconds / 60);
		const remainingSeconds = seconds % 60;
		return minutes + ":" + String(remainingSeconds).padStart(2, "0");
	}

	function handlePageChange(page) {
		setCurrentPage(Math.max(1, Math.min(totalPages, page)));
	}

	if (isQuizLoading) {
		return <CourseQuizPracticeSkeleton />;
	}

	return (
		<div className="max-w-7xl mx-auto relative">
			<QuizHeader
				title={quizTitle}
				courseName={courseName}
				timeLeft={timeLeft}
				formatTime={formatTime}
				answeredCount={answeredCount}
				totalCount={quizSummary.total}
				currentQuestion={currentQuestionLabel}
				onSubmit={handleSubmitQuiz}
				hideControls={Boolean(reviewMode)}
				score={backendResult}
				totalDuration={totalDuration}
				questions={quizQuestions}
				answers={answers}
				currentPage={currentPage}
				pageSize={pageSize}
			/>

			<div className="flex gap-6 items-start">
				{/* Main question area */}
				<div className="flex-1 min-w-0 space-y-5">
					{visibleQuestions.map((question, index) => {
						const questionNumber = (currentPage - 1) * pageSize + index + 1;
						const result = questionResultsMap[question.id];
						return (
							<QuestionCard
								key={question.id}
								question={question}
								questionType={question.type}
								answer={answers[question.id]}
								onAnswerChange={reviewMode ? null : (value) => setAnswers((state) => ({ ...state, [question.id]: value }))}
								writtenWordCount={writtenWordCount}
								showCorrectAnswer={reviewMode === "graded"}
								correctAnswer={question.correctAnswer}
								feedback={result?.feedback}
								scoreState={reviewMode && result ? (
									<div className="flex items-center gap-2">
										<span className={"inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold " + (result.isCorrect ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300")}>
											{result.isCorrect ? t('quizzes.correct') : t('quizzes.incorrect')}
										</span>
										<span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
											{t('quizzes.scorePts', { earned: result.earnedPoints, total: result.points })}
										</span>
									</div>
								) : (
									<span className="text-xs font-semibold uppercase tracking-wide text-text-secondary-default-light dark:text-text-secondary-default-dark">
										Q{questionNumber}
									</span>
								)}
							/>
						);
					})}

					{/* Pagination */}
					<div className="flex items-center justify-center pt-2 pb-6">
						<PaginationButtons totalPages={totalPages} currentPage={currentPage} setCurrentPage={handlePageChange} />
					</div>
				</div>

				{/* Desktop sidebar - hidden on smaller screens */}
				<div className="hidden xl:block w-80 shrink-0">
					<QuizSummary
						backendResult={backendResult}
						totalCount={quizSummary.total}
						progressPercent={progressPercent}
						tfSummary={tfSummary}
						mcqSummary={mcqSummary}
						writtenSummary={writtenSummary}
						tfPercent={tfPercent}
						mcqPercent={mcqPercent}
						writtenPercent={writtenPercent}
						questions={quizQuestions}
						answers={answers}
						currentPage={currentPage}
						pageSize={pageSize}
						onNavigate={handlePageChange}
						reviewMode={reviewMode}
						questionResultsMap={questionResultsMap}
					/>
				</div>
			</div>

			{/* Mobile floating nav toggle button */}
			<button
				onClick={() => setSidebarOpen(true)}
				className="xl:hidden fixed bottom-6 end-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 active:scale-95"
				aria-label={t('quizzes.navigatorAria')}
			>
				<Grid2ColIcon size={18} />
				<span className="text-sm font-semibold">{answeredCount}/{quizSummary.total}</span>
			</button>

			{/* Mobile sidebar overlay */}
			{sidebarOpen && (
				<div className="fixed inset-0 z-50 xl:hidden">
					<div
						className="absolute inset-0 bg-black/40 backdrop-blur-sm"
						onClick={() => setSidebarOpen(false)}
					/>
					<div className="absolute end-0 top-0 bottom-0 w-full max-w-sm bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-2xl overflow-y-auto">
						<div className="flex items-center justify-between p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
							<h2 className="text-sm font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
								{t('quizzes.navigatorTitle')}
							</h2>
							<button
								onClick={() => setSidebarOpen(false)}
								className="p-2 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark"
							>
								<XIcon size={18} />
							</button>
						</div>
						<div className="p-4">
							<QuizSummary
								backendResult={backendResult}
								totalCount={quizSummary.total}
								progressPercent={progressPercent}
								tfSummary={tfSummary}
								mcqSummary={mcqSummary}
								writtenSummary={writtenSummary}
								tfPercent={tfPercent}
								mcqPercent={mcqPercent}
								writtenPercent={writtenPercent}
								questions={quizQuestions}
								answers={answers}
								currentPage={currentPage}
								pageSize={pageSize}
								onNavigate={(page) => {
									handlePageChange(page);
									setSidebarOpen(false);
								}}
								reviewMode={reviewMode}
								questionResultsMap={questionResultsMap}
							/>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
