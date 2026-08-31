import { useMemo, useState } from "react";
import { useTranslation } from 'react-i18next';
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useOutletContext } from "react-router-dom";

import Section from "../../../../../components/ui/Section";
import BaseComponent from "../../../../../components/ui/BaseComponent";
import Button from "../../../../../components/ui/Button";
import PaginationButtons from "../../../../../components/ui/PaginationButtons";
import { CalendarDaysIcon, ClockIcon, PlayIcon, EyeIcon, ChartBarIcon, StarIcon, BrainIcon, CheckIcon } from "../../../../../components/ui/icons";
import { fetchCourseQuizzesOverview } from "../../../services/quizzesApi";
import { CourseQuizzesSkeleton } from "./SkeletonLoader";
import useArabicDigits from "../../../../../hooks/useArabicDigits";

const PAGE_SIZE = 2;
const ACTIVE_PAGE_SIZE = 1;

function getQuizStatusStyle(status) {
    if (status === "Completed") {
        return "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800";
    }

    if (status === "Missed") {
        return "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800";
    }

    return "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800";
}

function translateQuizStatus(status, t) {
    switch (status) {
        case "Completed": return t('quizzes.completed');
        case "Missed": return t('quizzes.missed');
        case "Active": return t('quizzes.active');
        case "Submitted": return t('quizzes.submitted');
        default: return status;
    }
}

export default function CourseQuizzes() {
    const { t } = useTranslation('student');
    const { convert: ar, isRTL } = useArabicDigits();
    const { course } = useOutletContext();
    const isReadOnly = course?.isReadOnly;
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(1);
    const [activePage, setActivePage] = useState(1);

    function toPercent(score, maxScore) {
        if (!maxScore) return 0;
        return Math.round((score / maxScore) * 100);
    }

    function formatDate(value) {
        if (!value) return t('quizzes.tbd');
        const date = new Date(value);
        if (Number.isNaN(date.getTime())) return t('quizzes.tbd');
        return date.toLocaleString(isRTL ? 'ar-SA' : 'en-US');
    }

    function formatDuration(minutes) {
        const numericMinutes = Number(minutes);
        if (Number.isNaN(numericMinutes)) return ar(t('quizzes.minutes', { count: 0 }));
        return ar(t('quizzes.minutes', { count: numericMinutes }));
    }

    function QuizCard({ quiz, isUpcoming, onStartQuiz, onViewResults, onReviewResults }) {
        const scoreLabel = quiz.maxScore ? ar(t('quizzes.scoreTotal', { score: quiz.score, maxScore: quiz.maxScore })) : t('quizzes.tbd');
        const scorePercent = quiz.maxScore ? toPercent(quiz.score, quiz.maxScore) : 0;
        const isHighScore = scorePercent >= 80;
        const isMidScore = scorePercent >= 50 && scorePercent < 80;

        return (
            <div className="group bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl p-5 hover:shadow-lg hover:border-bg-fill-accent-default-light/30 dark:hover:border-bg-fill-accent-default-dark/30 transition-all duration-200">
                <div className="flex flex-row items-start justify-between gap-3 mb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <BrainIcon size={16} className="text-bg-fill-accent-default-light dark:text-bg-fill-accent-default-dark shrink-0" />
                            <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                {/* TODO: i18n - backend returns English only */}
                                {quiz.title}
                            </h3>
                        </div>
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark line-clamp-2 ms-7">
                            {isUpcoming
                                ? t('quizzes.upcomingMessage')
                                : quiz.status === "Missed"
                                    ? t('quizzes.missedMessage')
                                    : quiz.status === "Completed" || quiz.status === "Submitted"
                                        ? scorePercent >= 0
                                            ? `${ar(t('quizzes.youScored', { label: scoreLabel, percent: scorePercent }))} ${isHighScore ? t('quizzes.greatWork') : isMidScore ? t('quizzes.keepPracticing') : t('quizzes.needsReview')}`
                                            : t('quizzes.reminder')
                                        : t('quizzes.reminder')}
                        </p>
                    </div>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 ${getQuizStatusStyle(quiz.status)}`}>
                        {quiz.status === "Completed" && <CheckIcon size={11} />}
                        {translateQuizStatus(quiz.status, t)}
                    </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4 sm:grid-cols-3">
                    <div className="col-span-2 sm:col-span-1 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-3">
                        <div className="flex items-center gap-2 text-text-secondary-default-light dark:text-text-secondary-default-dark text-xs font-semibold uppercase tracking-wide mb-2">
                            <CalendarDaysIcon size={14} />
                            {t('quizzes.deadline')}
                        </div>
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                            {quiz.dueDate}
                        </p>
                    </div>

                    <div className="rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-3">
                        <div className="flex items-center gap-2 text-text-secondary-default-light dark:text-text-secondary-default-dark text-xs font-semibold uppercase tracking-wide mb-2">
                            <ClockIcon size={14} />
                            {t('quizzes.duration')}
                        </div>
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                            {quiz.duration}
                        </p>
                    </div>

                    <div className="rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-3">
                        <div className="flex items-center gap-2 text-text-secondary-default-light dark:text-text-secondary-default-dark text-xs font-semibold uppercase tracking-wide mb-2">
                            <StarIcon size={14} />
                            {t('quizzes.scoreLabel')}
                        </div>

                        <div className="flex flex-row justify-between items-center">
                            <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                {scoreLabel}
                            </p>
                            <p className={`text-xs font-bold ${isHighScore ? "text-green-600 dark:text-green-400" : isMidScore ? "text-amber-600 dark:text-amber-400" : "text-text-secondary-default-light dark:text-text-secondary-default-dark"}`}>
                                {quiz.maxScore ? ar(t('quizzes.scorePercent', { percent: scorePercent })) : t('quizzes.tbd')}
                            </p>
                        </div>
                        {quiz.maxScore > 0 && (
                            <div className="mt-2 h-1.5 w-full rounded-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden">
                                <div
                                    className={`h-full rounded-full transition-all ${isHighScore ? "bg-green-500" : isMidScore ? "bg-amber-500" : "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark"}`}
                                    style={{ width: `${scorePercent}%` }}
                                />
                            </div>
                        )}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                    {isUpcoming ? (
                        <Button className="w-full sm:flex-1 shadow-sm hover:shadow-md transition-shadow" startIcon={<PlayIcon size={16} />} onClick={() => onStartQuiz && onStartQuiz(quiz)}>
                            {t('quizzes.start')}
                        </Button>
                    ) : quiz.status === "Completed" ? (
                        <Button className="w-full sm:flex-1" variant="secondary" startIcon={<ChartBarIcon size={16} />} onClick={() => onViewResults && onViewResults(quiz)}>
                            {t('quizzes.viewResults')}
                        </Button>
                    ) : quiz.status === "Submitted" ? (
                        <Button className="w-full sm:flex-1" variant="secondary" startIcon={<EyeIcon size={16} />} onClick={() => onReviewResults && onReviewResults(quiz)}>
                            {t('quizzes.reviewResults')}
                        </Button>
                    ) : quiz.status === "Missed" ? (
                        <Button className="w-full sm:flex-1" variant="secondary" startIcon={<EyeIcon size={16} />} onClick={() => onReviewResults && onReviewResults(quiz)}>
                            {t('quizzes.viewExam')}
                        </Button>
                    ) : (
                        <Button variant="secondary" className="w-full sm:flex-1" onClick={() => onReviewResults && onReviewResults(quiz)}>
                            {t('quizzes.viewDetails')}
                        </Button>
                    )}
                </div>
            </div>
        );
    }

    const { data: overview = null, isLoading } = useQuery({
        queryKey: ["courseQuizzes", course?.id],
        queryFn: async () => {
            const res = await fetchCourseQuizzesOverview(course.id);
            return res?.data?.[0] ?? null;
        },
        staleTime: 2 * 60 * 1000,
        enabled: !!course?.id,
    });

    const activeQuizzes = useMemo(() => {
        const items = overview?.upcoming || [];
        return items
            .filter((quiz) => String(quiz.status || "").toLowerCase() === "active")
            .map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                score: 0,
                maxScore: Number(quiz.maxScore || 0),
                dueDate: formatDate(quiz.dueDate),
                duration: formatDuration(quiz.durationMinutes),
                status: "Active",
            }));
    }, [overview]);

    const historyQuizzes = useMemo(() => {
        const history = (overview?.history || []).map((quiz) => ({
            id: quiz.id,
            title: quiz.title,
            score: Number(quiz.score || 0),
            maxScore: Number(quiz.maxScore || 0),
            dueDate: formatDate(quiz.dueDate),
            duration: formatDuration(quiz.durationMinutes),
            status: quiz.status || "Completed",
        }));

        const missed = (overview?.upcoming || [])
            .filter((quiz) => String(quiz.status || "").toLowerCase() === "missed")
            .map((quiz) => ({
                id: quiz.id,
                title: quiz.title,
                score: 0,
                maxScore: Number(quiz.maxScore || 0),
                dueDate: formatDate(quiz.dueDate),
                duration: formatDuration(quiz.durationMinutes),
                status: "Missed",
            }));

        return [...history, ...missed];
    }, [overview]);

    const completedCount = Number(overview?.stats?.completed || 0);
    const missedCount = Number(overview?.stats?.missed || 0);
    const averageScore = Number(overview?.stats?.averageScore || 0);

    const totalPages = Math.max(1, Math.ceil(historyQuizzes.length / PAGE_SIZE));
    const validCurrentPage = Math.min(currentPage, totalPages);
    const pagedQuizzes = useMemo(() => {
        const start = (validCurrentPage - 1) * PAGE_SIZE;
        return historyQuizzes.slice(start, start + PAGE_SIZE);
    }, [historyQuizzes, validCurrentPage]);

    const activeTotalPages = Math.max(1, Math.ceil(activeQuizzes.length / ACTIVE_PAGE_SIZE));
    const validActivePage = Math.min(activePage, activeTotalPages);
    const pagedActive = useMemo(() => {
        const start = (validActivePage - 1) * ACTIVE_PAGE_SIZE;
        return activeQuizzes.slice(start, start + ACTIVE_PAGE_SIZE);
    }, [activeQuizzes, validActivePage]);

    if (isLoading) {
        return <CourseQuizzesSkeleton />;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col min-w-0 gap-4">

                {!isReadOnly && (
                <Section className="flex flex-col !mb-0">
                    <div className="flex items-center justify-between mb-5 shrink-0">
                        <div className="flex items-center gap-2">
                            <BrainIcon size={20} className="text-bg-fill-accent-default-light dark:text-bg-fill-accent-default-dark" />
                            <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('quizzes.activeQuizzes')}
                            </h2>
                        </div>
                        {activeQuizzes.length > 0 && (
                            <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-bold">
                                {ar(activeQuizzes.length)}
                            </span>
                        )}
                    </div>

                    <div className={`w-full min-w-0 space-y-3 ${activeQuizzes.length === 1 ? "" : "min-h-[180px]"}`}>
                        {pagedActive.length > 0 ? (
                            pagedActive.map((quiz) => (
                                <QuizCard key={quiz.id} quiz={quiz} isUpcoming onStartQuiz={!isReadOnly ? () => navigate(`practice?quizId=${quiz.id}`) : undefined} />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark py-8 text-center h-full flex items-center justify-center">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.noActiveQuizzes')}</p>
                            </div>
                        )}
                    </div>

                    {activeQuizzes.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 shrink-0">
                            <p className="hidden sm:block text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {ar(t('quizzes.showingActive', { current: pagedActive.length, total: activeQuizzes.length }))}
                            </p>
                            <PaginationButtons totalPages={activeTotalPages} currentPage={validActivePage} setCurrentPage={setActivePage} />
                        </div>
                    )}
                </Section>
                )}

                <Section className={`flex flex-col !mb-0 ${isReadOnly ? 'flex-1' : ''}`}>
                    <div className="mb-5 shrink-0">
                        <h3 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t('quizzes.quizHistory')}</h3>
                    </div>

                    <div className={`overflow-y-auto w-full min-w-0 ${isReadOnly ? 'flex-1' : 'max-h-[400px]'} [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${historyQuizzes.length === 1 ? "" : "min-h-[320px]"}`}>
                        {pagedQuizzes.length ? (
                            <div className="space-y-3">
                                {pagedQuizzes.map((quiz) => (
                                    <QuizCard
                                        key={quiz.id}
                                        quiz={quiz}
                                        isUpcoming={false}
                                        onViewResults={() => navigate(`practice?quizId=${quiz.id}&review=graded`)}
                                        onReviewResults={() => navigate(`practice?quizId=${quiz.id}&review=graded`)}
                                        onStartQuiz={!isReadOnly ? () => navigate(`practice?quizId=${quiz.id}`) : undefined}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="rounded-xl border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark py-8 text-center h-full flex items-center justify-center">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.noQuizHistory')}</p>
                            </div>
                        )}
                    </div>

                    {historyQuizzes.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 shrink-0">
                            <p className="hidden sm:block text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {ar(t('quizzes.showingQuizzes', { current: pagedQuizzes.length, total: historyQuizzes.length }))}
                            </p>

                            <PaginationButtons totalPages={totalPages} currentPage={validCurrentPage} setCurrentPage={setCurrentPage} />
                        </div>
                    )}
                </Section>
            </div>

            <div className="hidden lg:block space-y-6">
                <BaseComponent title={t('quizzes.quizStats')} contentClassName="px-5 py-5 sm:px-6 space-y-4">
                    <div className="flex items-center justify-between p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.completed')}</span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">{ar(completedCount)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.active')}</span>
                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{ar(activeQuizzes.length)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.missed')}</span>
                        <span className="text-lg font-bold text-red-600 dark:text-red-400">{ar(missedCount)}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.averageScore')}</span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{ar(Math.round(averageScore))}%</span>
                    </div>
                </BaseComponent>
            </div>
        </div>
    );
}
