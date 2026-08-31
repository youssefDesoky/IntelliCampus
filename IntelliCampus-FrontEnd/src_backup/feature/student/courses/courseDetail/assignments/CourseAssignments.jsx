import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import QuickUpload from "../../../../../components/ui/QuickUpload";
import Section from "../../../../../components/ui/Section";
import BaseComponent from "../../../../../components/ui/BaseComponent";
import AssignmentCard from "./AssignmentCard";
import PaginationButtons from "../../../../../components/ui/PaginationButtons";
import ViewGrade from "./ViewGrade";
import ViewSubmission from "./ViewSubmission";
import ViewInstructions from "./ViewInstructions";
import ModelOverlay from "../../../../../components/ui/ModelOverlay";
import { fetchAssignmentsByCourse, submitAssignment, fetchAssignmentStats } from "../../assignmentsApi";
import { CourseAssignmentsSkeleton } from "./SkeletonLoader";


const PAGE_SIZE = 2;

export default function CourseAssignments() {
    const { t } = useTranslation('student');
    const { course } = useOutletContext();
    const [submitModal, setSubmitModal] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [upcomingPage, setUpcomingPage] = useState(1);
    const [gradeModal, setGradeModal] = useState(null);
    const [submissionModal, setSubmissionModal] = useState(null);
    const [instructionsModal, setInstructionsModal] = useState(null);
    const queryClient = useQueryClient();

    const normalizeAssignments = (assignmentsData) => {
        const raw = Array.isArray(assignmentsData) ? assignmentsData : (assignmentsData?.data ?? []);
        return raw.map((a) => {
            const due = a.dueDate ? new Date(a.dueDate) : null;
            const now = new Date();
            const daysLeft = due ? Math.max(0, Math.ceil((due - now) / (1000 * 60 * 60 * 24))) : null;

            const isSubmitted = Boolean(
                a.isSubmitted || a.submitted || a.submittedDate || a.submissionDate ||
                (a.status && String(a.status).toLowerCase().includes("submit")) ||
                a.submission || a.Submission || a.SubmissionDto
            );

            let status = "pending";
            if (a.status) {
                const s = String(a.status).toLowerCase();
                if (s.includes("graded")) status = "graded";
                else if (s.includes("submit")) status = "submitted";
                else status = s;
            } else {
                if (isSubmitted && (typeof a.score === "number" || a.score)) status = "graded";
                else if (isSubmitted) status = "submitted";
            }

            return {
                ...a,
                isSubmitted,
                status,
                daysLeft,
                submissions: (a.submission && Array.isArray(a.submission.files) ? a.submission.files :
                              a.Submission && Array.isArray(a.Submission.files) ? a.Submission.files :
                              a.Submission && Array.isArray(a.Submission.Files) ? a.Submission.Files :
                              a.submission && Array.isArray(a.submission.Files) ? a.submission.Files :
                              a.submissions) || [],
                submittedDate: a.submission?.submittedAt || a.Submission?.submittedAt || a.submission?.SubmittedAt || a.Submission?.SubmittedAt || a.submittedDate || a.SubmittedDate || null,
                submissionNote: a.submission?.note || a.Submission?.note || a.submission?.Note || a.Submission?.Note || a.submissionNote || null,
                feedback: a.grade?.feedback || a.Grade?.feedback || a.grade?.Feedback || a.Grade?.Feedback || a.feedback || null,
                gradedBy: a.grade?.gradedBy || a.Grade?.gradedBy || a.grade?.GradedBy || a.Grade?.GradedBy || a.gradedBy || null,
                gradedDate: a.grade?.gradedAt || a.Grade?.gradedAt || a.grade?.GradedAt || a.Grade?.GradedAt || a.gradedDate || null,
                score: (a.grade?.score ?? a.Grade?.score ?? a.grade?.Score ?? a.Grade?.Score ?? a.score) ?? undefined,
            };
        });
    };

    const { data: assignments = [], isLoading } = useQuery({
        queryKey: ["courseAssignments", course?.id],
        queryFn: () => fetchAssignmentsByCourse(course.id).then(normalizeAssignments),
        staleTime: 2 * 60 * 1000,
        enabled: !!course?.id,
    });

    const { data: stats = { pending: 0, submitted: 0, graded: 0, averageGrade: null } } = useQuery({
        queryKey: ["assignmentStats", course?.id],
        queryFn: () => fetchAssignmentStats(course.id),
        staleTime: 2 * 60 * 1000,
        enabled: !!course?.id,
        select: (data) => ({
            pending: data.pending || 0,
            submitted: data.submitted || 0,
            graded: data.graded || 0,
            averageGrade: data.averageGrade ?? null,
        }),
    });

    const upcomingAssignments = assignments.filter((a) => !a.isSubmitted && new Date(a.dueDate) > new Date()) || [];

        const pastAssignments = assignments.filter((a) => a.isSubmitted || (a.dueDate && new Date(a.dueDate) <= new Date())) || [];

    if (isLoading) {
        return <CourseAssignmentsSkeleton />;
    }

    const totalPages = Math.max(1, Math.ceil(pastAssignments.length / PAGE_SIZE));
    const validCurrentPage = Math.min(currentPage, totalPages);
    const start = (validCurrentPage - 1) * PAGE_SIZE;
    const pagedAssignments = pastAssignments.slice(start, start + PAGE_SIZE);

    const UPCOMING_PAGE_SIZE = 1;
    const upcomingTotalPages = Math.max(1, Math.ceil(upcomingAssignments.length / UPCOMING_PAGE_SIZE));
    const validUpcomingPage = Math.min(upcomingPage, upcomingTotalPages);
    const upcomingStart = (validUpcomingPage - 1) * UPCOMING_PAGE_SIZE;
    const pagedUpcoming = upcomingAssignments.slice(upcomingStart, upcomingStart + UPCOMING_PAGE_SIZE);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 flex flex-col min-w-0 gap-4">
                {/* Upcoming Assignments */}
                <Section className="flex flex-col !mb-0">
                    <div className="flex items-center justify-between mb-5 shrink-0">
                        <h2 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">
                            {t('courseAssignments.upcomingTitle')}
                        </h2>
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300">
                            {t('courseAssignments.pendingCount', { count: upcomingAssignments.length })}
                        </span>
                    </div>

                    <div className={`w-full min-w-0 space-y-3 ${upcomingAssignments.length === 1 ? "" : "min-h-[180px]"}`}>
                        {pagedUpcoming.length > 0 ? (
                            pagedUpcoming.map((assignment) => (
                                <AssignmentCard
                                    key={assignment.id}
                                    id={assignment.id}
                                    title={assignment.title}
                                    description={assignment.description}
                                    dueDate={assignment.dueDate}
                                    daysLeft={assignment.daysLeft}
                                    status={assignment.status}
                                    totalPoints={assignment.totalPoints}
                                    onSubmitAssignment={(data) => setSubmitModal(data)}
                                    onViewInstructions={(data) => setInstructionsModal(data)}
                                    attachments={assignment.attachments}
                                />
                            ))
                        ) : (
                            <div className="rounded-xl border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark py-8 text-center h-full flex items-center justify-center">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseAssignments.noUpcoming')}</p>
                            </div>
                        )}
                    </div>

                    {upcomingAssignments.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 shrink-0">
                            <p className="hidden sm:block text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('courseAssignments.showingUpcoming', { count: pagedUpcoming.length, total: upcomingAssignments.length })}
                            </p>
                            <PaginationButtons totalPages={upcomingTotalPages} currentPage={validUpcomingPage} setCurrentPage={setUpcomingPage} />
                        </div>
                    )}
                </Section>

                {/* Past Submissions */}
                <Section className="flex flex-col !mb-0">
                    <div className="mb-5 shrink-0">
                        <h3 className="text-xl font-bold text-text-primary-light dark:text-text-primary-dark">{t('courseAssignments.pastTitle')}</h3>
                    </div>

                    <div className={`overflow-y-auto w-full min-w-0 max-h-[400px] [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] ${pastAssignments.length === 1 ? "" : "min-h-[320px]"}`}>
                        {pagedAssignments.length ? (
                            <div className="space-y-3">
                            {pagedAssignments.map((assignment) => (
                                <AssignmentCard
                                    key={assignment.id}
                                    id={assignment.id}
                                    title={assignment.title}
                                    description={assignment.description}
                                    dueDate={assignment.dueDate}
                                    daysLeft={assignment.daysLeft}
                                    status={assignment.status}
                                    score={assignment.score}
                                    totalPoints={assignment.totalPoints}
                                    attachments={assignment.attachments}
                                    onSubmitAssignment={(data) => setSubmitModal(data)}
                                    onViewSubmission={(data) => {
                                        const payload = { ...data, submissions: assignment.submissions, submittedDate: assignment.submittedDate, submissionNote: assignment.submissionNote };
                                        setSubmissionModal(payload);
                                    }}
                                    onViewGrade={(data) => {
                                        const payload = { ...data, feedback: assignment.feedback, gradedBy: assignment.gradedBy, gradedDate: assignment.gradedDate, totalPoints: assignment.totalPoints };
                                        setGradeModal(payload);
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark py-8 text-center h-full flex items-center justify-center">
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('courseAssignments.noPast')}</p>
                        </div>
                    )}
                    </div>

                    {pastAssignments.length > 0 && (
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4 shrink-0">
                            <p className="hidden sm:block text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('courseAssignments.showingAssignments', { count: pagedAssignments.length, total: pastAssignments.length })}
                            </p>

                            <PaginationButtons totalPages={totalPages} currentPage={validCurrentPage} setCurrentPage={setCurrentPage} />
                        </div>
                    )}
                </Section>
            </div>

            {/* Sidebar */}
            <div className="hidden lg:block min-w-0">
                <BaseComponent
                    title={t('courseAssignments.statsTitle')}
                    description={t('courseAssignments.statsDesc')}
                    contentClassName="space-y-4"
                >
                    <div className="flex items-center justify-between p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('courseAssignments.statsPending')}
                        </span>
                        <span className="text-lg font-bold text-amber-600 dark:text-amber-400">{stats.pending}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('courseAssignments.statsSubmitted')}
                        </span>
                        <span className="text-lg font-bold text-blue-600 dark:text-blue-400">{stats.submitted}</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                        <span className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('courseAssignments.statsAvgGrade')}
                        </span>
                        <span className="text-lg font-bold text-green-600 dark:text-green-400">
                            {stats.averageGrade !== null ? Math.round(stats.averageGrade) : 0}%
                        </span>
                    </div>
                </BaseComponent>
            </div>

            {submitModal && (
                <ModelOverlay onClose={() => setSubmitModal(null)} maxWidth="max-w-lg">
                    <QuickUpload
                        assignment={submitModal}
                        onClose={() => setSubmitModal(null)}
                        onSubmit={async ({ files, note }) => {
                            const formData = new FormData();
                            formData.append("Note", note);
                            files.forEach((fileEntry) => {
                                formData.append("Files", fileEntry.file);
                            });

                            await submitAssignment(submitModal.id, formData);
                            queryClient.invalidateQueries({ queryKey: ["courseAssignments", course?.id] });
                            queryClient.invalidateQueries({ queryKey: ["assignmentStats", course?.id] });
                            queryClient.removeQueries({ queryKey: ["reminders"], exact: false });
                            queryClient.removeQueries({ queryKey: ["todayReminders"], exact: false });
                            queryClient.removeQueries({ queryKey: ["instructorReminders"], exact: false });
                            setSubmitModal(null);
                        }}
                    />
                </ModelOverlay>
            )}

            {gradeModal && (
                <ViewGrade
                    assignment={gradeModal}
                    onClose={() => setGradeModal(null)}
                />
            )}

            {submissionModal && (
                <ViewSubmission
                    assignment={submissionModal}
                    onClose={() => setSubmissionModal(null)}
                />
            )}

            {instructionsModal && (
                <ViewInstructions
                    assignment={instructionsModal}
                    onClose={() => setInstructionsModal(null)}
                />
            )}
        </div>
    );
}