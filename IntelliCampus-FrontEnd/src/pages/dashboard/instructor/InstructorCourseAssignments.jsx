import { useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";

import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import Dialog from "../../../components/ui/Dialog";
import MaterialPreview from "../../../components/ui/MaterialPreview";
import DateTimeInput from "../../../components/form/DateTimeInput";
import NumberInput from "../../../components/form/NumberInput";
import { PlusIcon, TrashIcon, EyeIcon, DownloadIcon, XIcon, FilePenIcon, CalendarDaysIcon, ChartBarIcon, UsersIcon, ClockIcon, ClipboardCheckIcon, PaperclipIcon } from "../../../components/ui/icons";
import FileUploadArea from "../../../components/ui/FileUploadArea";

import {
    fetchInstructorAssignmentsByCourse,
    createInstructorAssignment,
    deleteInstructorAssignment,
    updateInstructorAssignment,
    fetchAssignmentSubmissions,
    gradeAssignmentSubmission,
} from "../../../feature/instructor/components/assignments/instructorAssignmentsApi";
import { CourseAssignmentsSkeleton } from "../../../feature/instructor/SkeletonLoader";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../utils/getLocalizedField';
import useArabicDigits from '../../../hooks/useArabicDigits';

function formatDueDate(value, locale) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "—";
    
    return new Intl.DateTimeFormat(locale, {
        year: "numeric",
        month: "short",
        day: "2-digit",
    }).format(date);
}

function formatDueTime(value, locale) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    
    return new Intl.DateTimeFormat(locale, {
        hour: "2-digit",
        minute: "2-digit",
    }).format(date);
}

export default function InstructorCourseAssignments() {
    const { t, i18n } = useTranslation('instructor');
    const { convert: ar } = useArabicDigits();
    const outlet = useOutletContext();
    const courseId = outlet.courseId || outlet.course?.id;
    const isInactive = outlet.course?.isInactive;
    
    const { showError } = useError();
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [instructions, setInstructions] = useState("");
    const [dueDate, setDueDate] = useState("");
    const [totalPoints, setTotalPoints] = useState(100);
    const [assignmentFiles, setAssignmentFiles] = useState([]);
    const [existingAttachments, setExistingAttachments] = useState([]);
    const [editingAssignmentId, setEditingAssignmentId] = useState(null);
    
    const [isSubmissionsOpen, setIsSubmissionsOpen] = useState(false);
    const [previewFile, setPreviewFile] = useState(null);
    const [selectedSubmission, setSelectedSubmission] = useState(null);
    const [selectedAssignmentId, setSelectedAssignmentId] = useState(null);
    const [selectedAssignmentTotalPoints, setSelectedAssignmentTotalPoints] = useState(null);
    const [gradeModal, setGradeModal] = useState(null);
    const [gradeScore, setGradeScore] = useState("");
    const [deletingAssignment, setDeletingAssignment] = useState(null);
    const [gradeFeedback, setGradeFeedback] = useState("");
    const [isGrading, setIsGrading] = useState(false);
    const [gradeResult, setGradeResult] = useState(null);
    
    const {
        data: rawAssignments = [],
        isLoading,
        error,
    } = useQuery({
        queryKey: ["instructorCourseAssignments", courseId],
        queryFn: async () => {
            const data = await fetchInstructorAssignmentsByCourse(courseId);
            return (Array.isArray(data) ? data : []).map((item) => ({
                id: item.id,
                title: item.title,
                titleAr: item.titleAr,
                description: item.description,
                descriptionAr: item.descriptionAr,
                fullInstructions: item.fullInstructions,
                dueDate: item.dueDate,
                totalPoints: item.totalPoints,
                attachments: item.attachments || [],
            }));
        },
        staleTime: 2 * 60 * 1000,
        enabled: !!courseId,
    });

    const assignments = useMemo(() => rawAssignments.map((item) => ({
        id: item.id,
        title: item.title,
        titleAr: item.titleAr,
        description: getLocalizedField(item, 'description', i18n.language),
        fullInstructions: item.fullInstructions,
        dueDate: item.dueDate,
        totalPoints: item.totalPoints,
        attachments: item.attachments || [],
    })), [rawAssignments, i18n.language]);

    useEffect(() => {
        if (error) showError(error.message || "Failed to load assignments.");
    }, [error, showError]);

    const normalizeSubmission = (s) => ({
        id: s.id,
        status: s.status,
        submittedAt: s.submittedAt || s.SubmittedAt || s.SubmittedDate || null,
        note: s.note || s.Note || null,
        files: s.files || s.Files || [],
        student: s.studentName || s.studentFullName || (typeof s.student === 'object' ? (s.student.fullName || s.student.name) : s.student) || null,
        score: s.score ?? s.Score ?? null,
        feedback: s.feedback ?? s.Feedback ?? null,
        grade: s.grade ?? null,
    });

    const {
        data: submissions = [],
        isLoading: isLoadingSubmissions,
    } = useQuery({
        queryKey: ["assignmentSubmissions", selectedAssignmentId],
        queryFn: async () => {
            const data = await fetchAssignmentSubmissions(selectedAssignmentId);
            return (Array.isArray(data) ? data : []).map(normalizeSubmission);
        },
        enabled: !!selectedAssignmentId && isSubmissionsOpen,
        staleTime: 30_000,
    });

    const sortedAssignments = useMemo(() => [...assignments].sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)), [assignments]);
    
    const handleCloseForm = () => {
        setIsFormOpen(false);
        setTitle("");
        setDescription("");
        setInstructions("");
        setDueDate("");
        setTotalPoints(100);
        setAssignmentFiles([]);
        setExistingAttachments([]);
        setEditingAssignmentId(null);
    };
    
    const handleCreateAssignment = async () => {
        if (!courseId) {
            showError("No course context found.");
            return;
        }
        
        if (!title.trim() || !dueDate) {
            showError("Title and due date are required.");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const attachments = [];
            for (const file of assignmentFiles) {
                const form = new FormData();
                form.append("file", file);
                const res = await fetch("/api/assignments/upload-attachment", { method: "POST", body: form });
                if (!res.ok) throw new Error("Failed to upload file.");
                const uploaded = await res.json();
                attachments.push(uploaded);
            }

            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                fullInstructions: instructions.trim() || null,
                dueDate: new Date(dueDate).toISOString(),
                totalPoints: Number(totalPoints),
                courseId: Number(courseId),
                attachments,
            };
            
            const created = await createInstructorAssignment(payload);
            
            queryClient.setQueryData(["instructorCourseAssignments", courseId], (prev = []) => [
                {
                    id: created.id,
                    title: created.title,
                    description: created.description,
                    fullInstructions: created.fullInstructions,
                    dueDate: created.dueDate,
                    totalPoints: created.totalPoints,
                    attachments: created.attachments || [],
                },
                ...prev,
            ]);
            
            handleCloseForm();
        } catch (err) {
            showError(err.message || "Failed to create assignment.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const handleUpdateAssignment = async () => {
        if (!editingAssignmentId) return;
        
        if (!courseId) {
            showError("No course context found.");
            return;
        }
        
        if (!title.trim() || !dueDate) {
            showError("Title and due date are required.");
            return;
        }
        
        setIsSubmitting(true);
        
        try {
            const attachments = [...existingAttachments];
            for (const file of assignmentFiles) {
                const form = new FormData();
                form.append("file", file);
                const res = await fetch("/api/assignments/upload-attachment", { method: "POST", body: form });
                if (!res.ok) throw new Error("Failed to upload file.");
                const uploaded = await res.json();
                attachments.push(uploaded);
            }

            const payload = {
                title: title.trim(),
                description: description.trim() || null,
                fullInstructions: instructions.trim() || null,
                dueDate: new Date(dueDate).toISOString(),
                totalPoints: Number(totalPoints),
                courseId: Number(courseId),
                attachments,
            };
            
            const updated = await updateInstructorAssignment(editingAssignmentId, payload);
            
            queryClient.setQueryData(["instructorCourseAssignments", courseId], (prev = []) => prev.map((a) => (String(a.id) === String(editingAssignmentId) ? {
                id: updated.id,
                title: updated.title,
                description: updated.description,
                fullInstructions: updated.fullInstructions,
                dueDate: updated.dueDate,
                totalPoints: updated.totalPoints,
                attachments: updated.attachments || [],
            } : a)));
            
            handleCloseForm();
        } catch (err) {
            showError(err.message || "Failed to update assignment.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const openSubmissions = (assignment) => {
        setSelectedSubmission(null);
        setSelectedAssignmentId(assignment.id);
        setSelectedAssignmentTotalPoints(assignment.totalPoints || 100);
        setIsSubmissionsOpen(true);
    };
    
    const refreshSubmissions = () => {
        if (!selectedAssignmentId) return Promise.resolve();
        return queryClient.invalidateQueries({ queryKey: ["assignmentSubmissions", selectedAssignmentId] });
    };

    const closeSubmissions = () => {
        setIsSubmissionsOpen(false);
        setSelectedAssignmentId(null);
        setSelectedSubmission(null);
    };
    
    const getPrimarySubmissionFile = (submission) => submission?.files?.[0] || null;
    
    const openFilePreview = (file, submission) => {
        if (!file) return;
        setPreviewFile(file);
        setSelectedSubmission(submission || null);
    };
    
    const closeFilePreview = () => {
        setPreviewFile(null);
        setSelectedSubmission(null);
    };

    const downloadFile = async (url, name, fileId) => {
        try {
            const res = await fetch(`/api/assignments/submissions/${fileId}/download`);
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch {
            showError("Failed to download file.");
        }
    };

    const handleGradeSubmit = async () => {
        if (!gradeModal || !selectedAssignmentId) return;

        const score = Number(gradeScore);
        if (!gradeScore || isNaN(score) || score < 0) {
            showError("Please enter a valid score.");
            return;
        }

        setIsGrading(true);
        try {
            const response = await gradeAssignmentSubmission(selectedAssignmentId, {
                studentAssignmentId: Number(gradeModal.id),
                score,
                feedback: gradeFeedback.trim() || null,
            });
            setGradeResult("success");

            const fb = gradeFeedback.trim() || null;
            queryClient.setQueryData(["assignmentSubmissions", selectedAssignmentId], (prev = []) =>
                prev.map((s) =>
                    String(s.id) === String(gradeModal.id)
                        ? {
                              ...s,
                              grade: (response?.grade) || { score, totalPoints: selectedAssignmentTotalPoints, feedback: fb },
                              score: (response?.score) != null ? response.score : score,
                              feedback: (response?.feedback) != null ? response.feedback : fb,
                          }
                        : s
                )
            );

            queryClient.invalidateQueries({ queryKey: ["courseAssignments", courseId] });
            queryClient.invalidateQueries({ queryKey: ["assignmentStats", courseId] });
            await queryClient.invalidateQueries({ queryKey: ["instructorCourseAssignments", courseId] });
            await refreshSubmissions();
            setGradeModal(null);
            setGradeScore("");
            setGradeFeedback("");
        } catch (err) {
            setGradeResult("error");
            showError(err.message || "Failed to grade submission.");
        } finally {
            setIsGrading(false);
        }
    };
    
    const handleDeleteClick = (assignment) => {
        setDeletingAssignment(assignment);
    };

    const handleDeleteConfirm = async () => {
        if (!deletingAssignment) return;
        try {
            await deleteInstructorAssignment(deletingAssignment.id);
            queryClient.setQueryData(["instructorCourseAssignments", courseId], (prev = []) => prev.filter((a) => String(a.id) !== String(deletingAssignment.id)));
        } catch (err) {
            showError(err.message || "Failed to delete assignment.");
        } finally {
            setDeletingAssignment(null);
        }
    };
    
    if (isLoading) {
        return <CourseAssignmentsSkeleton />;
    }
    
    return (
        <div className="flex flex-col flex-1">
        <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                {t('assignments.title')}
            </h2>
            {!isInactive && (
                <Button
                    type="button"
                    variant="primary"
                    onClick={() => setIsFormOpen(true)}
                    startIcon={<PlusIcon size={18} />}
                >
                    <span className="hidden sm:inline">{t('assignments.create')}</span>
                </Button>
            )}
        </div>

        <BaseFormComponent
        isOpen={isFormOpen}
        title={editingAssignmentId ? t('assignments.edit') : t('assignments.create')}
        description={t('assignments.formDesc')}
        onClose={handleCloseForm}
        onSubmit={editingAssignmentId ? handleUpdateAssignment : handleCreateAssignment}
        submitText={editingAssignmentId ? t('assignments.update') : t('assignments.create')}
        submitDisabled={isSubmitting || !title.trim() || !dueDate || !courseId}
        submitLoading={isSubmitting}
        maxWidth="max-w-2xl"
        contentClassName="space-y-4"
        >
        <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('assignments.titleLabel')}</label>
        <input
        type="text"
        value={title}
        onChange={(event) => setTitle(event.target.value)}
        placeholder={t('assignments.titlePlaceholder')}
        className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark"
        />
        </div>
        
        <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('assignments.descriptionLabel')}</label>
        <TextArea
        value={description}
        onChange={(event) => setDescription(event.target.value)}
        placeholder={t('assignments.descriptionPlaceholder')}
        className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark"
        />
        </div>
        
        <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('assignments.instructionsLabel')}</label>
        <TextArea
        value={instructions}
        onChange={(event) => setInstructions(event.target.value)}
        placeholder={t('assignments.instructionsPlaceholder')}
        className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark"
        />
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <DateTimeInput label={t('assignments.dueDate')} value={dueDate} onChange={(event) => setDueDate(event.target.value)} />
        
        <NumberInput label={t('assignments.totalPoints')} min={1} value={totalPoints} onChange={(event) => setTotalPoints(event.target.value)} />
        </div>

        <div className="space-y-2">
        <label className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('assignments.attachments')}</label>
        {(existingAttachments.length > 0 || assignmentFiles.length > 0) && (
            <div className="flex flex-wrap gap-2 mb-2">
            {existingAttachments.map((att, i) => (
                <span key={att.id ?? i} className="group inline-flex items-center gap-1.5 ps-3 pe-1 py-1.5 rounded-full text-xs font-medium bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:border-border-accent-default-light dark:hover:border-border-accent-default-dark transition-colors">
                <PaperclipIcon size={13} />
                <span className="truncate max-w-[160px]" title={att.name}>{att.name}</span>
                <button
                    type="button"
                    onClick={() => setExistingAttachments(existingAttachments.filter((_, idx) => idx !== i))}
                    className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-red-600 dark:hover:text-red-400 transition-colors"
                >
                    <XIcon size={12} />
                </button>
                </span>
            ))}
            </div>
        )}
        <FileUploadArea files={assignmentFiles} onFilesChange={setAssignmentFiles} />
        </div>
        </BaseFormComponent>
        
        {sortedAssignments.length === 0 ? (
            <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('assignments.empty')}</h3>
                <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    {t('assignments.emptyDesc')}
                </p>
            </div>
        ) : (
            <div className="space-y-4">
            {sortedAssignments.map((assignment) => (
                <div
                key={assignment.id}
                className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl p-5 hover:shadow-lg transition-shadow duration-200"
                >
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 justify-between">
                        <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                            {getLocalizedField(assignment, 'title', i18n.language)}
                        </h3>
                        {assignment.totalPoints && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark text-white whitespace-nowrap shrink-0">
                            <ChartBarIcon size={14} />
                            {ar(t('assignments.points', { count: assignment.totalPoints }))}
                        </span>
                        )}
                    </div>
                    {assignment.description && (
                        <p className="mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark line-clamp-2">
                        {getLocalizedField(assignment, 'description', i18n.language)}
                        </p>
                    )}
                    </div>
                </div>

                <div className="flex flex-col gap-1 mt-3 text-sm">
                    <div className="flex items-center gap-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    <CalendarDaysIcon size={16} />
                    <span>{ar(formatDueDate(assignment.dueDate, i18n.language))}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    <ClockIcon size={16} />
                    <span>{ar(formatDueTime(assignment.dueDate, i18n.language))}</span>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-2 mt-4 pt-4 border-t border-border-tertiary-default-light dark:border-border-tertiary-default-dark">
                    <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    startIcon={<EyeIcon size={16} />}
                    className="flex-1 sm:flex-none sm:w-auto justify-center"
                    onClick={() => openSubmissions(assignment)}
                    >
                    <span className="hidden sm:inline">{t('assignments.submissions')}</span>
                    </Button>
                    {!isInactive && (
                        <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        startIcon={<FilePenIcon size={16} />}
                        className="flex-1 sm:flex-none sm:w-auto justify-center"
                        onClick={() => {
                            setEditingAssignmentId(assignment.id);
                            setTitle(assignment.title || "");
                            setDescription(assignment.description || "");
                            setInstructions(assignment.fullInstructions || "");
                            try {
                                const dt = new Date(assignment.dueDate);
                                const tzOffset = dt.getTimezoneOffset() * 60000;
                                const localISO = new Date(dt - tzOffset).toISOString().slice(0, 16);
                                setDueDate(localISO);
                            } catch {
                                setDueDate(assignment.dueDate || "");
                            }
                            setTotalPoints(assignment.totalPoints || 100);
                            setExistingAttachments(assignment.attachments || []);
                            setIsFormOpen(true);
                        }}
                        >
                        <span className="hidden sm:inline">{t('assignments.editBtn')}</span>
                        </Button>
                    )}
                    {!isInactive && (
                        <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        startIcon={<TrashIcon size={16} />}
                        className="flex-1 sm:flex-none sm:w-auto justify-center text-text-danger-default-light dark:text-text-danger-default-dark"
                        onClick={() => handleDeleteClick(assignment)}
                        >
                        <span className="hidden sm:inline">{t('assignments.deleteBtn')}</span>
                        </Button>
                    )}
                </div>
                </div>
            ))}
            </div>
        )}
        
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
            {t('assignments.submissions')}
            </h2>
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
            {t('assignments.submissionsDesc')}
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
                <p>{t('assignments.loadingSubmissions')}</p>
            ) : submissions.length === 0 ? (
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('assignments.noSubmissions')}</p>
            ) : (
                <div className="space-y-3">
                {submissions.map((s) => {
                    const primaryFile = getPrimarySubmissionFile(s);
                    const hasFile = Boolean(primaryFile);
                    
                    return (
                        <div key={s.id} className="p-3 border rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border-border-primary-default-light dark:border-border-primary-default-dark">
                        <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                        <div>
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">{typeof s.student === 'string' ? s.student : `Student ${s.id}`}</p>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{s.submittedAt}</p>
                        </div>
                        {s.grade ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-fill-success-default-light/20 dark:bg-bg-fill-success-default-dark/20 text-bg-fill-success-default-light dark:text-bg-fill-success-default-dark border border-bg-fill-success-default-light/30 dark:border-bg-fill-success-default-dark/30">
                                {s.grade.score}/{s.grade.totalPoints}
                            </span>
                        ) : (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-bg-fill-warning-default-light/20 dark:bg-bg-fill-warning-default-dark/20 text-bg-fill-warning-default-light dark:text-bg-fill-warning-default-dark border border-bg-fill-warning-default-light/30 dark:border-bg-fill-warning-default-dark/30">
                                {t('assignments.pending')}
                            </span>
                        )}
                        </div>
                        <div className="flex items-center gap-2">
                        <button
                        type="button"
                        className={`p-2 rounded-lg transition-colors ${hasFile ? "hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-text-primary-default-light dark:text-text-primary-default-dark" : "opacity-40 text-text-secondary-default-light dark:text-text-secondary-default-dark"}`}
                        onClick={() => openFilePreview(primaryFile, s)}
                        disabled={!hasFile}
                        title={hasFile ? t('assignments.previewSubmission') : t('assignments.noFile')}
                        >
                        <EyeIcon size={16} />
                        </button>
                        {hasFile ? (
                            <button
                            onClick={() => downloadFile(primaryFile.url, primaryFile.name, primaryFile.id)}
                            className="p-2 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-text-primary-default-light dark:text-text-primary-default-dark transition-colors"
                            title={t('assignments.downloadSubmission')}
                            >
                            <DownloadIcon size={16} />
                            </button>
                        ) : (
                            <span
                            className="p-2 rounded-lg opacity-40 text-text-secondary-default-light dark:text-text-secondary-default-dark"
                            title={t('assignments.noFile')}
                            >
                            <DownloadIcon size={16} />
                            </span>
                        )}
                        {!isInactive && (
                        <button
                        type="button"
                        className="p-2 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-green-600 dark:text-green-400 transition-colors"
                        onClick={() => {
            setGradeScore(s.grade?.score?.toString() ?? s.score ?? "");
            setGradeFeedback(s.grade?.feedback ?? s.feedback ?? "");
            setGradeModal(s);
                        }}
                        title={t('assignments.gradeSubmitTooltip')}
                        >
                        <ClipboardCheckIcon size={16} />
                        </button>
                        )}
                        </div>
                        </div>
                        
                        {s.note && (
                            <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{s.note}</p>
                        )}
                        </div>
                    );
                })}
                </div>
            )}
            </div>
            </div>
            </ModelOverlay>
        )}
        
        {gradeModal && (
            <ModelOverlay onClose={() => { setGradeModal(null); setGradeScore(""); setGradeFeedback(""); }} maxWidth="max-w-lg">
            <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30">
            <ClipboardCheckIcon size={20} className="text-green-600 dark:text-green-400" />
            </div>
            <div>
            <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
            {t('assignments.gradeSubmission')}
            </h2>
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
            {typeof gradeModal.student === 'string' ? gradeModal.student : `Student ${gradeModal.id}`}
            </p>
            </div>
            </div>
            <button
            onClick={() => { setGradeModal(null); setGradeScore(""); setGradeFeedback(""); }}
            className="p-2 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark"
            >
            <XIcon size={18} />
            </button>
            </div>

            <div className="p-5 space-y-4">
            <NumberInput
            label={t('assignments.score', { max: selectedAssignmentTotalPoints })}
            value={gradeScore}
            onChange={(e) => setGradeScore(e.target.value)}
            placeholder={`0 \u2013 ${selectedAssignmentTotalPoints}`}
            min={0}
            max={selectedAssignmentTotalPoints}
            required
            />

            <div className="space-y-2">
            <label className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
            {t('assignments.feedback')}
            </label>
            <TextArea
            value={gradeFeedback}
            onChange={(e) => setGradeFeedback(e.target.value)}
            placeholder={t('assignments.feedbackPlaceholder')}
            className="w-full rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light outline-none transition-colors focus:border-border-accent-default-light focus:ring-2 focus:ring-border-accent-default-light/20 dark:focus:ring-border-accent-default-dark/20 dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-text-primary-default-dark"
            />
            </div>

            <div className="flex gap-3 pt-2">
            <Button
            variant="secondary"
            className="flex-1"
            onClick={() => { setGradeModal(null); setGradeScore(""); setGradeFeedback(""); }}
            >
            {t('assignments.cancel')}
            </Button>
            <Button
            variant="primary"
            className="flex-1"
            onClick={handleGradeSubmit}
            loading={isGrading}
            disabled={!gradeScore}
            >
            {t('assignments.submitGrade')}
            </Button>
            </div>
            </div>
            </div>
            </ModelOverlay>
        )}

        {previewFile && (
            <ModelOverlay onClose={closeFilePreview} maxWidth="max-w-4xl">
            <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
            <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
            <EyeIcon size={20} className="text-blue-600 dark:text-blue-400" />
            </div>
            <div>
            <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
            {t('assignments.preview')}
            </h2>
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
            {previewFile.name}
            </p>
            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
            {typeof selectedSubmission?.student === 'string' ? selectedSubmission.student : t('assignments.selectedSubmission')}
            </p>
            </div>
            </div>
            <div className="flex items-center gap-2">
            {!isInactive && (
            <button
            type="button"
            className="p-2 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-green-600 dark:text-green-400 transition-colors"
            onClick={() => {
                const sub = selectedSubmission;
                if (sub) {
                    setGradeScore(sub.score ?? "");
                    setGradeFeedback(sub.feedback ?? "");
                    setGradeModal(sub);
                    closeFilePreview();
                }
            }}
            title={t('assignments.gradeSubmitTooltip')}
            >
            <ClipboardCheckIcon size={20} />
            </button>
            )}
            <button onClick={() => downloadFile(previewFile.url, previewFile.name, previewFile.id)} className="p-2 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg">
            <DownloadIcon size={20} />
            </button>
            <button onClick={closeFilePreview} className="p-2 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg">
            <XIcon size={20} />
            </button>
            </div>
            </div>
            <div className="p-5 space-y-5">
            <MaterialPreview title={previewFile.name} viewUrl={previewFile.url} downloadUrl={previewFile.url} />
            
            {selectedSubmission?.note && (
                <div className="border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-4">
                <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">{t('assignments.studentNote')}</h3>
                <p className="text-sm text-text-primary-default-light dark:text-text-primary-default-dark whitespace-pre-wrap bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-3 rounded-lg">
                {selectedSubmission.note}
                </p>
                </div>
            )}
            </div>
            </div>
            </ModelOverlay>
        )}
            <Dialog
                isOpen={deletingAssignment !== null}
                variant="warning"
                title={t('assignments.deleteTitle')}
                onClose={() => setDeletingAssignment(null)}
                onConfirm={handleDeleteConfirm}
                confirmText={t('assignments.deleteBtn')}
                cancelText={t('assignments.cancel')}
            >
                {t('assignments.deleteConfirm', { title: deletingAssignment?.title })}
            </Dialog>

        <Dialog
            isOpen={gradeResult === "success"}
            variant="success"
            title={t('assignments.gradedSuccess')}
            onClose={() => setGradeResult(null)}
            autoCloseDuration={2000}
        >
            {t('assignments.gradedMessage')}
        </Dialog>
        <Dialog
            isOpen={gradeResult === "error"}
            variant="error"
            title={t('assignments.gradingFailed')}
            onClose={() => setGradeResult(null)}
        >
            {t('assignments.gradingFailedMessage')}
        </Dialog>
        </div>
    );
}
