import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import DateTimeInput from "../../../components/form/DateTimeInput";
import NumberInput from "../../../components/form/NumberInput";
import Dialog from "../../../components/ui/Dialog";
import { PlusIcon, TrashIcon, EyeIcon, FilePenIcon, ClockIcon, SandClockIcon, ChartBarIcon, CalendarDaysIcon, XIcon, PenSquareIcon, ListIcon } from "../../../components/ui/icons";

import ModelOverlay from "../../../components/ui/ModelOverlay";
import { createQuiz, fetchQuizzesByCourse, updateQuiz, deleteQuiz, fetchQuizSubmissions, gradeQuizSubmission } from "../../../feature/instructor/components/quiz/instructorQuizApi";
import ManageQuizQuestions from "../../../feature/instructor/components/quiz/ManageQuizQuestions";
import { CourseQuizzesSkeleton } from "../../../feature/instructor/SkeletonLoader";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';
import useArabicDigits from '../../../hooks/useArabicDigits';

function formatDate(value, locale) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(date);
}

function formatTime(value, locale) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default function InstructorCourseQuizzes() {
    const { t, i18n } = useTranslation('instructor');
    const { convert: ar } = useArabicDigits();
    const outlet = useOutletContext() || {};
    const params = useParams();
    const courseId = outlet.courseId || outlet.course?.id || params.courseId;
    const isInactive = outlet.course?.isInactive;

    const [manageQuiz, setManageQuiz] = useState(null);

    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingQuiz, setEditingQuiz] = useState(null);
    const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
    const [submissions, setSubmissions] = useState([]);
    const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [selectedQuiz, setSelectedQuiz] = useState(null);
    const [gradingScores, setGradingScores] = useState({});
    const [isGrading, setIsGrading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [maxGrade, setMaxGrade] = useState("");
    const [startDate, setStartDate] = useState("");
    const [durationMinutes, setDurationMinutes] = useState("");
    const [deletingQuiz, setDeletingQuiz] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const { showError } = useError();
    const { showToast } = useToast();

    const queryClient = useQueryClient();

    const {
        data: quizzes = [],
        isLoading: loading,
        error,
    } = useQuery({
        queryKey: ["instructorCourseQuizzes", courseId],
        queryFn: async () => {
            const res = await fetchQuizzesByCourse(courseId);
            const courseData = res?.data?.[0];
            return [
                ...(courseData?.upcoming || []).map(q => ({ ...q, deadline: q.dueDate })),
                ...(courseData?.history || []).map(q => ({ ...q, deadline: q.dueDate }))
            ];
        },
        staleTime: 2 * 60 * 1000,
        enabled: !!courseId,
    });

    useEffect(() => {
        if (error) showError(error.message || t('quizzes.errorLoad', 'Failed to load quizzes'));
    }, [error, showError, t]);

    const resetForm = () => {
        setTitle("");
        setDescription("");
        setMaxGrade("");
        setStartDate("");
        setDurationMinutes("");
        setEditingQuiz(null);
    };

    const openCreate = () => {
        resetForm();
        setIsFormOpen(true);
    };

    const handleEdit = (quiz) => {
        setEditingQuiz(quiz);
        setTitle(quiz.title || "");
        setDescription(quiz.description || "");
        setMaxGrade(String(quiz.maxScore || ""));
        setStartDate(quiz.startDate ? quiz.startDate.substring(0, 16) : "");
        setDurationMinutes(String(quiz.durationMinutes || ""));
        setIsFormOpen(true);
    };

    const openSubmissions = async (quiz) => {
        setSubmissions([]);
        setSelectedQuiz(quiz);
        setIsSubmissionsOpen(true);
        setIsLoadingSubmissions(true);
        try {
            const data = await fetchQuizSubmissions(courseId, quiz.id);
            const normalized = (Array.isArray(data) ? data : []).map((s) => ({
                id: s.studentId ?? s.id,
                status: s.status ?? 'submitted',
                submittedAt: s.submittedAt || null,
                note: s.note || null,
                student: s.studentName || s.studentFullName || (typeof s.student === 'object' ? (getLocalizedField(s.student, 'fullName', i18n.language) || s.student.name) : s.student) || null,
                score: s.score,
                totalScore: s.maxScore ?? s.totalScore ?? quiz.maxScore,
                answers: s.answerDetails || [],
            }));
            setSubmissions(normalized);
        } catch (err) {
            showError(err.message || t('quizzes.errorLoadSubmissions', 'Failed to load submissions.'));
        } finally {
            setIsLoadingSubmissions(false);
        }
    };

    const closeSubmissions = () => {
        setIsSubmissionsOpen(false);
        setSubmissions([]);
        setSelectedQuiz(null);
        setSelectedSubmission(null);
        setGradingScores({});
    };

    const openSubmissionDetail = (submission) => {
        setSelectedSubmission(submission);
        const scores = {};
        (submission.answers || []).forEach((a, i) => {
            if (a.type === "Written") {
                scores[i] = a.score !== undefined && a.score !== null ? String(a.score) : "";
            }
        });
        setGradingScores(scores);
    };

    const closeSubmissionDetail = () => {
        setSelectedSubmission(null);
        setGradingScores({});
    };

    const handleGradeChange = (questionIndex, value) => {
        setGradingScores(prev => ({ ...prev, [questionIndex]: value }));
    };

    const handleSaveGrade = async () => {
        if (!selectedSubmission || !selectedQuiz) return;
        setIsGrading(true);
        try {
            const gradedAnswers = (selectedSubmission.answers || []).map((a, i) => ({
                questionId: a.questionId,
                score: gradingScores[i] !== undefined && gradingScores[i] !== "" ? Number(gradingScores[i]) : a.score,
            }));
            await gradeQuizSubmission(courseId, selectedQuiz.id, selectedSubmission.id, { answers: gradedAnswers });
            setSubmissions(prev => prev.map(s =>
                s.id === selectedSubmission.id
                    ? { ...s, answers: s.answers.map((a, i) => ({ ...a, score: gradingScores[i] !== undefined && gradingScores[i] !== "" ? Number(gradingScores[i]) : a.score })) }
                    : s
            ));
            closeSubmissionDetail();
        } catch (err) {
            showError(err.message || t('quizzes.errorSaveGrade', 'Failed to save grade.'));
        } finally {
            setIsGrading(false);
        }
    };

    const isQuizPast = (quiz) => {
        const start = new Date(quiz.startDate).getTime();
        const duration = quiz.durationMinutes * 60000;
        return Date.now() > start + duration;
    };

    const handleSave = async () => {
        if (!title.trim()) { showError(t('quizzes.errorTitleEmpty', 'Enter quiz title.')); return; }
        if (!maxGrade.trim()) { showError(t('quizzes.errorMaxPointsEmpty', 'Enter max points for the quiz.')); return; }
        if (!startDate) { showError(t('quizzes.errorStartDateEmpty', 'Select a start date.')); return; }
        if (!durationMinutes.trim()) { showError(t('quizzes.errorDurationEmpty', 'Enter quiz duration in minutes.')); return; }

        const start = new Date(startDate);
        const due = new Date(start.getTime() + Number(durationMinutes) * 60000);
        const pad = (n) => String(n).padStart(2, "0");
        const dueDate = `${due.getFullYear()}-${pad(due.getMonth() + 1)}-${pad(due.getDate())}T${pad(due.getHours())}:${pad(due.getMinutes())}`;

        setIsSaving(true);
        try {
            const payload = { 
                title: title.trim(), 
                description: description.trim() || null,
                maxGrade: Number(maxGrade),
                startDate: startDate,
                dueDate: dueDate,
                durationMinutes: Number(durationMinutes)
            };

            if (editingQuiz) {
                await updateQuiz(courseId, editingQuiz.id, payload);
                showToast({ type: "success", title: "Updated", message: "Quiz has been updated." });
            } else {
                await createQuiz({ ...payload, courseId: Number(courseId) });
                showToast({ type: "success", title: "Created", message: "Quiz has been created." });
            }

            setIsFormOpen(false);
            resetForm();
            queryClient.invalidateQueries({ queryKey: ["instructorCourseQuizzes", courseId] });
        } catch (err) {
            showError(err.message || t('quizzes.errorSave', 'Failed to save quiz.'));
        } finally { setIsSaving(false); }
    };

    const handleDeleteConfirm = async () => {
        if (!deletingQuiz) return;
        try {
            await deleteQuiz(courseId, deletingQuiz.id);
            setDeletingQuiz(null);
            showToast({ type: "success", title: "Deleted", message: "Quiz has been deleted." });
            queryClient.invalidateQueries({ queryKey: ["instructorCourseQuizzes", courseId] });
        } catch (err) {
            showError(err.message || t('quizzes.errorDelete', 'Failed to delete quiz.'));
        }
    };

    return (
        <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t('quizzes.title')}</h2>
                {!isInactive && <Button type="button" variant="primary" onClick={openCreate} startIcon={<PlusIcon size={18} />}><span className="hidden sm:inline">{t('quizzes.create')}</span></Button>}
            </div>

            {loading ? (
                <CourseQuizzesSkeleton />
            ) : quizzes.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                    <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('quizzes.noQuizzes')}</h3>
                    <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('quizzes.noQuizzesDesc')}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {quizzes.map((quiz) => (
                        <div key={quiz.id} className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 justify-between">
                                        <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                            {getLocalizedField(quiz, 'title', i18n.language)}</h3>
                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark whitespace-nowrap shrink-0">
                                            <ChartBarIcon size={14} />
                                            {ar(t('quizzes.pts', { count: quiz.maxScore }))}
                                        </span>
                                    </div>
                                    {quiz.description && (
                                        <p className="mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark line-clamp-2">{getLocalizedField(quiz, 'description', i18n.language)}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex flex-col gap-1 mt-3 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                <div className="flex items-center gap-1.5">
                                    <CalendarDaysIcon size={16} />
                                    <span>{ar(formatDate(quiz.startDate, i18n.language))}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <ClockIcon size={16} />
                                    <span>{ar(formatTime(quiz.startDate, i18n.language))}</span>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    <SandClockIcon size={16} />
                                    <span>{ar(t('quizzes.minutes', { count: quiz.durationMinutes }))}</span>
                                </div>
                            </div>

                            <div className="flex flex-row items-center gap-2 mt-4 pt-4 border-t border-border-tertiary-default-light dark:border-border-tertiary-default-dark">
                                <Button type="button" variant="secondary" size="sm" startIcon={<EyeIcon size={16} />} className="flex-1 sm:flex-none sm:w-auto justify-center" onClick={() => openSubmissions(quiz)}>
                                    <span className="hidden sm:inline">{t('quizzes.submissions')}</span>
                                </Button>
                                {!isInactive && (
                                    <Button type="button" variant="secondary" size="sm" startIcon={<ListIcon size={16} />} className="flex-1 sm:flex-none sm:w-auto justify-center" onClick={() => setManageQuiz(quiz)}>
                                        <span className="hidden sm:inline">{t('quizzes.manageQuestions')}</span>
                                    </Button>
                                )}
                                {!isInactive && (
                                    <Button type="button" variant="secondary" size="sm" startIcon={<FilePenIcon size={16} />} className="flex-1 sm:flex-none sm:w-auto justify-center" onClick={() => handleEdit(quiz)}>
                                        <span className="hidden sm:inline">{t('quizzes.editBtn')}</span>
                                    </Button>
                                )}
                                {!isInactive && (
                                    <Button type="button" variant="secondary" size="sm" startIcon={<TrashIcon size={16} />} className="flex-1 sm:flex-none sm:w-auto justify-center text-text-danger-default-light dark:text-text-danger-default-dark" onClick={() => setDeletingQuiz(quiz)}>
                                        <span className="hidden sm:inline">{t('quizzes.deleteBtn')}</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            <ManageQuizQuestions isOpen={manageQuiz !== null} onClose={() => setManageQuiz(null)} courseId={courseId} quiz={manageQuiz} />

            {isSubmissionsOpen && (
                <ModelOverlay onClose={closeSubmissions} maxWidth="max-w-3xl">
                    <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <EyeIcon size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                        {t('quizzes.submissions')}
                                    </h2>
                                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                        {t('quizzes.submissionsDesc')}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeSubmissions}
                                className="p-2 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark"
                            >
                                <XIcon size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-4">
                            {isLoadingSubmissions ? (
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.loadingSubmissions')}</p>
                            ) : submissions.length === 0 ? (
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.noSubmissions')}</p>
                            ) : (
                                <div className="space-y-3">
                                    {submissions.map((s) => (
                                        <div key={s.id} className="p-3 border rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-border-primary-default-light dark:border-border-primary-default-dark">
                                            <div className="flex items-center justify-between gap-3">
                                                <div>
                                                    <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{s.student || t('quizzes.studentFallback', { id: s.id })}</p>
                                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{ar(s.submittedAt)}</p>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {s.score !== undefined && s.score !== null && (
                                                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark text-white whitespace-nowrap">
                                                            {ar(s.score)} / {ar(s.totalScore)}
                                                        </span>
                                                    )}
                                                   {!isInactive && (
                                                        <button
                                                            type="button"
                                                            onClick={() => openSubmissionDetail(s)}
                                                            className="p-1.5 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-text-secondary-default-light dark:text-text-secondary-default-dark transition-colors"
                                                            title={t('quizzes.gradeSubmitTooltip')}
                                                        >
                                                            <PenSquareIcon size={16} />
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                            {s.note && (
                                                <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{s.note}</p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </ModelOverlay>
            )}

            {selectedSubmission && (
                <ModelOverlay onClose={closeSubmissionDetail} maxWidth="max-w-2xl">
                    <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl max-h-[85vh] flex flex-col">
                        <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <PenSquareIcon size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                        {t('quizzes.gradeSubmission')}
                                    </h2>
                                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                        {selectedSubmission.student}
                                    </p>
                                </div>
                            </div>
                            <button
                                onClick={closeSubmissionDetail}
                                className="p-2 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark"
                            >
                                <XIcon size={18} />
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto no-scrollbar p-5 space-y-4">
                            {(selectedSubmission.answers || []).length === 0 ? (
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.noAnswers')}</p>
                            ) : (
                                (selectedSubmission.answers || []).map((answer, qi) => (
                                    <div key={qi} className="p-4 border rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-border-primary-default-light dark:border-border-primary-default-dark space-y-3">
                                        <div className="flex items-center justify-between gap-2 flex-wrap">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${answer.type === "TF" ? "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-default-light dark:text-text-blue-default-dark" : answer.type === "MCQ" ? "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-default-light dark:text-text-purple-default-dark" : "bg-bg-surface-green-default-light dark:bg-bg-surface-green-default-dark text-text-green-default-light dark:text-text-green-default-dark"}`}>
                                                    {answer.type || "Q"}
                                                </span>
                                                <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                    {ar(t('quizzes.questionLabel', { number: qi + 1 }))} &middot; {ar(t('quizzes.pts', { count: answer.points || 0 }))}
                                                </span>
                                            </div>
                                        </div>

                                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{answer.prompt}</p>

                                        {answer.type === "Written" ? (
                                            <div className="space-y-2">
                                                <div>
                                                    <label className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.studentAnswer')}</label>
                                                    <div className="mt-1 p-3 rounded-lg bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark whitespace-pre-wrap">
                                                        {answer.studentAnswer || t('quizzes.noAnswer')}
                                                    </div>
                                                </div>
                                                {answer.correctAnswer && (
                                                    <div>
                                                        <label className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.modelAnswer')}</label>
                                                        <div className="mt-1 text-sm text-text-primary-default-light dark:text-text-primary-default-dark">
                                                            {answer.correctAnswer}
                                                        </div>
                                                    </div>
                                                )}
                                                <div className="flex items-center gap-3 pt-1">
                                                    <label className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.pointsLabel')}</label>
                                                    <input
                                                        type="number"
                                                        min="0"
                                                        max={answer.points || 999}
                                                        value={gradingScores[qi] !== undefined ? gradingScores[qi] : ""}
                                                        onChange={e => handleGradeChange(qi, e.target.value)}
                                                        placeholder={String(answer.points || 0)}
                                                        className="w-24 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark px-3 py-1.5 text-sm text-text-primary-default-light dark:text-text-primary-default-dark outline-none focus:border-border-accent-default-light dark:focus:border-border-accent-default-dark"
                                                    />
                                                    <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">/ {answer.points || "?"}</span>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('quizzes.studentAnswer')}</span>
                                                    {answer.type === "TF" ? (
                                                        <span className={`text-sm font-semibold ${answer.studentAnswer === answer.correctAnswer ? "text-text-success-default-light dark:text-text-success-default-dark" : "text-text-danger-default-light dark:text-text-danger-default-dark"}`}>
                                                            {answer.studentAnswer === "true" ? t('questions.true') : answer.studentAnswer === "false" ? t('questions.false') : answer.studentAnswer || t('quizzes.noAnswer')}
                                                        </span>
                                                    ) : (
                                                        <span className={`text-sm font-semibold ${answer.studentAnswer === answer.correctAnswer ? "text-text-success-default-light dark:text-text-success-default-dark" : "text-text-danger-default-light dark:text-text-danger-default-dark"}`}>
                                                            {answer.studentAnswer ? `${answer.studentAnswer}. ${answer.options?.[answer.studentAnswer?.charCodeAt(0) - 65] || ""}` : t('quizzes.noAnswer')}
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="flex items-center gap-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                    <span>{t('quizzes.correctAnswerLabel')} </span>
                                                    {answer.type === "TF" ? (
                                                        <span className="font-semibold text-text-success-default-light dark:text-text-success-default-dark">
                                                            {answer.correctAnswer === "true" ? t('questions.true') : t('questions.false')}
                                                        </span>
                                                    ) : (
                                                        <span className="font-semibold text-text-success-default-light dark:text-text-success-default-dark">
                                                            {answer.correctAnswer}. {answer.options?.[answer.correctAnswer?.charCodeAt(0) - 65] || ""}
                                                        </span>
                                                    )}
                                                </div>
                                                {answer.autoScore !== undefined && (
                                                    <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                        {t('quizzes.autoGrade', { score: answer.autoScore, points: answer.points })}
                                                    </span>
                                                )}
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="shrink-0 flex items-center justify-between gap-3 p-5 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                            <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('quizzes.totalScore', { score: selectedSubmission.score !== undefined && selectedSubmission.score !== null ? selectedSubmission.score : "?", totalScore: selectedSubmission.totalScore || "?" })}
                            </span>
                            <div className="flex gap-3">
                                <Button variant="secondary" type="button" onClick={closeSubmissionDetail} width="flex-1 sm:w-auto">{t('quizzes.cancel')}</Button>
                                <Button variant="primary" type="button" onClick={handleSaveGrade} width="flex-1 sm:w-auto" loading={isGrading} disabled={isGrading}>
                                    {t('quizzes.saveGrade')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModelOverlay>
            )}

            <BaseFormComponent
                isOpen={isFormOpen}
                title={editingQuiz ? t('quizzes.edit') : t('quizzes.create')}
                description={editingQuiz ? t('quizzes.editDesc') : t('quizzes.createDesc')}
                onClose={() => { setIsFormOpen(false); resetForm(); }}
                onSubmit={handleSave}
                submitText={editingQuiz ? t('quizzes.saveChanges') : t('quizzes.create')}
                submitDisabled={isSaving}
                submitLoading={isSaving}
            >
                <div className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('quizzes.titleLabel')} <span className="text-red-500">*</span>
                        </label>
                        <input
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder={t('quizzes.titlePlaceholder')}
                            className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('quizzes.description')}
                        </label>
                        <div className="relative">
                            <TextArea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder={t('quizzes.descriptionPlaceholder')}
                                className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark"
                            />
                            <span className="absolute bottom-3 end-3 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {description.length}/500
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div>
                            <label className="block text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{t('quizzes.maxPoints')}</label>
                            <NumberInput value={maxGrade} onChange={(e) => setMaxGrade(e.target.value)} placeholder={t('quizzes.maxPointsPlaceholder')} min="1" className="mt-1" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{t('quizzes.duration')}</label>
                            <NumberInput value={durationMinutes} onChange={(e) => setDurationMinutes(e.target.value)} placeholder={t('quizzes.durationPlaceholder')} min="1" className="mt-1" />
                        </div>
                    </div>
                    <DateTimeInput label={t('quizzes.startDate')} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
                </div>
            </BaseFormComponent>

            <Dialog
                isOpen={deletingQuiz !== null}
                variant="warning"
                title={t('quizzes.deleteTitle')}
                onClose={() => setDeletingQuiz(null)}
                onConfirm={handleDeleteConfirm}
                confirmText={t('quizzes.deleteBtn')}
                cancelText={t('quizzes.cancel')}
            >
                {t('quizzes.deleteConfirm', { title: deletingQuiz?.title })}
            </Dialog>
        </div>
    );
}
