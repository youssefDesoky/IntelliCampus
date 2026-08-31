import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useOutletContext, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { fetchCourseGrades, getCourseWorkWeight } from "../../../feature/instructor/services/gradesApi";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { ChartBarIcon, FilePenIcon, BrainIcon, ExclamationIcon } from "../../../components/ui/icons";
import Button from "../../../components/ui/Button";
import Table from "../../../components/ui/Table";
import { CourseGradesSkeleton } from "../../../feature/instructor/SkeletonLoader";
import CourseWorkWeightModal from "../../../feature/instructor/components/CourseWorkWeightModal";

function GradeIcon({ type }) {
    const cls = {
        Quiz: "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark text-text-purple-accent-light dark:text-text-purple-accent-dark",
        Assignment: "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark text-text-blue-accent-light dark:text-text-blue-accent-dark",
        Exam: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-amber-accent-light dark:text-text-amber-accent-dark",
        Midterm: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-amber-accent-light dark:text-text-amber-accent-dark",
        Final: "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark text-text-amber-accent-light dark:text-text-amber-accent-dark",
    }[type] || "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark";

    const icon = {
        Quiz: <BrainIcon size={18} />,
        Assignment: <FilePenIcon size={18} />,
        Exam: <ChartBarIcon size={18} />,
        Midterm: <ChartBarIcon size={18} />,
        Final: <ChartBarIcon size={18} />,
    }[type] || <ChartBarIcon size={18} />;

    return <div className={`p-2.5 rounded-lg shrink-0 ${cls}`}>{icon}</div>;
}

function getGradeColor(percent) {
    if (percent == null) return "bg-bg-surface-tertiary-default-light dark:bg-bg-surface-tertiary-default-dark";
    if (percent >= 85) return "bg-green-500";
    if (percent >= 75) return "bg-blue-500";
    if (percent >= 65) return "bg-amber-500";
    if (percent >= 50) return "bg-orange-500";
    return "bg-red-500";
}

function getGradeTextColor(percent) {
    if (percent == null) return "text-text-tertiary-default-light dark:text-text-tertiary-default-dark";
    if (percent >= 85) return "text-green-600 dark:text-green-400";
    if (percent >= 75) return "text-blue-600 dark:text-blue-400";
    if (percent >= 65) return "text-amber-600 dark:text-amber-400";
    if (percent >= 50) return "text-orange-600 dark:text-orange-400";
    return "text-red-600 dark:text-red-400";
}

export default function InstructorCourseGrades() {
    const { t } = useTranslation('instructor');
    const { courseId } = useOutletContext();
    const { showError } = useError();
    const navigate = useNavigate();
    const [showWeightsModal, setShowWeightsModal] = useState(false);

    const {
        data: grades,
        isLoading: loading,
        error,
        refetch: refetchGrades,
    } = useQuery({
        queryKey: ["instructorCourseGrades", courseId],
        queryFn: () => fetchCourseGrades(courseId),
        staleTime: 5 * 60 * 1000,
        enabled: !!courseId,
    });

    const {
        data: courseWorkWeight,
        refetch: refetchWeight,
    } = useQuery({
        queryKey: ["courseWorkWeight", courseId],
        queryFn: () => getCourseWorkWeight(courseId),
        staleTime: 5 * 60 * 1000,
        enabled: !!courseId,
    });

    useEffect(() => {
        if (error) showError(error.message || "Failed to load grades");
    }, [error, showError]);

    if (loading) {
        return <CourseGradesSkeleton />;
    }

    if (!grades) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('grades.noGrades')}</h3>
                <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    {t('grades.noGradesDesc')}
                </p>
            </div>
        );
    }

    const { assessments, students } = grades;

    const assessmentHeaders = assessments.map(a => a.title.length > 12 ? a.title.slice(0, 12) + "\u2026" : a.title);
    const columnClassNames = ["", ...assessments.map(() => "hidden lg:table-cell"), ""];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('grades.title')}
                </h2>
                <div className="flex items-center gap-2">
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => setShowWeightsModal(true)}
                        className="inline-flex items-center gap-2"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                            <path d="M19.14 12.94a7.07 7.07 0 0 0 .06-.94 7.07 7.07 0 0 0-.06-.94l2.03-1.58a.49.49 0 0 0 .12-.61l-1.92-3.32a.49.49 0 0 0-.59-.22l-2.39.96a6.93 6.93 0 0 0-1.62-.94l-.36-2.54a.48.48 0 0 0-.48-.41h-3.84a.48.48 0 0 0-.48.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 0 0-.59.22L2.74 8.87a.48.48 0 0 0 .12.61l2.03 1.58a7.07 7.07 0 0 0-.06.94c0 .32.02.64.06.94l-2.03 1.58a.49.49 0 0 0-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.49.37 1.03.7 1.62.94l.36 2.54c.05.24.26.41.48.41h3.84c.24 0 .44-.17.48-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6a3.6 3.6 0 1 1 0-7.2 3.6 3.6 0 0 1 0 7.2z"/>
                        </svg>
                        <span className="hidden sm:inline">{t('grades.weights')}</span>
                    </Button>
                    <Button
                        variant="secondary"
                        type="button"
                        onClick={() => navigate("complaints")}
                        className="inline-flex items-center gap-2"
                    >
                        <ExclamationIcon size={16} />
                        <span className="hidden sm:inline">{t('grades.viewComplaints')}</span>
                    </Button>
                </div>
            </div>

            <div>
                <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-4">{t('grades.assessmentPerformance')}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {assessments.map((a) => (
                        <div key={a.id} className="rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-4 hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2 min-w-0">
                                    <GradeIcon type={a.type} />
                                    <span className="text-xs font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark">{a.type}</span>
                                </div>
                                <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold shrink-0 ${
                                    a.average == null ? "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-tertiary-default-light dark:text-text-tertiary-default-dark" :
                                    a.average >= 85 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                                    a.average >= 75 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                                    a.average >= 65 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" :
                                    a.average >= 50 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" :
                                    "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                                }`}>
                                    {a.average != null ? `${a.average}%` : "—"}
                                </span>
                            </div>
                            <h4 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate mb-3">{a.title}</h4>
                            <div className="flex items-center justify-between text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mb-2.5">
                                <span>{a.maxScore} pts</span>
                                <span>{t('grades.submitted', { count: a.submissions })}</span>
                            </div>
                            {a.average != null && (
                                <div className="h-1.5 bg-bg-surface-tertiary-default-light dark:bg-bg-surface-tertiary-default-dark rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full transition-all duration-500 ${getGradeColor(a.average)}`}
                                        style={{ width: `${a.average}%` }}
                                    />
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            <div className="hidden sm:block">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('grades.students')}</h3>
                    {students.length > 0 && (
                        <span className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            {t('grades.studentCount', { count: students.length })}
                        </span>
                    )}
                </div>

                <Table
                    role="instructor"
                    headers={[t('grades.student'), ...assessmentHeaders, t('grades.overall')]}
                    data={students.map(s => {
                        const row = {
                            student: <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{s.name}</span>,
                        };
                        assessments.forEach((a, idx) => {
                            const match = s.assessments.find(sa => sa.assessmentId === a.id);
                            const score = match?.score;
                            row[`col_${idx}`] = (
                                <span className={`text-sm font-semibold ${getGradeTextColor(score)}`}>
                                    {score != null ? `${score}%` : "\u2014"}
                                </span>
                            );
                        });
                        row["Overall"] = (
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                                s.overall >= 85 ? "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300" :
                                s.overall >= 75 ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" :
                                s.overall >= 65 ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" :
                                s.overall >= 50 ? "bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300" :
                                "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"
                            }`}>
                                {s.grade}
                            </span>
                        );
                        return row;
                    })}
                    columnAlignments={["text-start", ...assessments.map(() => "text-center"), "text-center"]}
                    columnClassNames={columnClassNames}
                    wrapInSection={false}
                    showHeaderActions={false}
                    showPagination={false}
                    showSelectionColumn={false}
                    showActionsColumn={false}
                />
            </div>

            <CourseWorkWeightModal
                isOpen={showWeightsModal}
                onClose={() => setShowWeightsModal(false)}
                courseId={courseId}
                currentWeight={courseWorkWeight}
                onSaved={() => { refetchWeight(); refetchGrades(); }}
            />
        </div>
    );
}