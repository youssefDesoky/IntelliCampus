import { useState } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../../components/ui/Button";
import ModelOverlay from "../../../../../components/ui/ModelOverlay";
import MaterialPreview from "../../../../../components/ui/MaterialPreview";
import { useError } from "../../../../../contexts/ErrorContext.jsx";
import { 
    ClockIcon, 
    FileIcon, 
    DownloadIcon, 
    CheckIcon, 
    EyeIcon, 
    ChartBarIcon,
    XIcon
} from "../../../../../components/ui/icons";

const AssignmentCard = ({ id, title, description, dueDate, daysLeft, status, score, totalPoints, attachments, onSubmitAssignment, onViewInstructions, onViewSubmission, onViewGrade }) => {
    const { t } = useTranslation('student');
    const { showError } = useError();
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const downloadAttachment = async (attachment) => {
        try {
            const res = await fetch(`/api/assignments/attachments/${attachment.id}/download`);
            if (!res.ok) throw new Error("Download failed");
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = attachment.name;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
        } catch {
            showError(t('assignmentCard.downloadFailed'));
        }
    };

    const getFileType = (name) => {
        const ext = name?.split(".").pop()?.toLowerCase();
        if (["png", "jpg", "jpeg", "gif", "webp", "svg", "bmp"].includes(ext)) return 3;
        if (["mp4", "webm", "mov", "avi", "mkv"].includes(ext)) return 1;
        if (["mp3", "wav", "ogg", "m4a"].includes(ext)) return 2;
        return 0;
    };

    const getRelativeUrl = (url) => {
        try {
            const u = new URL(url);
            return u.pathname + u.search;
        } catch {
            return url;
        }
    };

    const isUrgent = daysLeft <= 2;
    const statusColors = {
        pending: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",
        submitted: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",
        graded: "bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300"
    };

    return (
        <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl p-5 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-row items-start justify-between gap-3 mb-3">
                <div className="flex-1">
                    <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-1">
                        {title}
                    </h3>
                    {description && (
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark line-clamp-2">
                            {description}
                        </p>
                    )}
                </div>
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap shrink-0 ${statusColors[status] || statusColors.pending}`}>
                    {status === "pending" && (isUrgent ? t('assignmentCard.dueSoon') : t('assignments.pending'))}
                    {status === "submitted" && t('assignments.submitted')}
                    {status === "graded" && t('assignments.graded')}
                </span>
            </div>

            <div className="flex flex-wrap items-center gap-4 mb-4 text-sm">
                <div className="flex items-center gap-1 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                    <ClockIcon size={16} />
                    <span className={isUrgent && status === "pending" ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                        {isUrgent && status === "pending" ? t('assignmentCard.dueUrgent', { daysLeft }) : t('assignmentCard.dueIn', { daysLeft })}
                    </span>
                </div>
                {totalPoints && (
                    <div className="flex items-center gap-1 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        <span className="font-medium">{t('assignmentCard.points', { totalPoints })}</span>
                    </div>
                )}
                {score !== undefined && score !== null && totalPoints && (
                    <div className="flex items-center gap-1 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        <span className="font-semibold text-green-600 dark:text-green-400">{t('assignmentCard.score', { score, totalPoints })}</span>
                    </div>
                )}
            </div>

            {/* Attachments Section */}
            {attachments && attachments.length > 0 && (
                <div className="mb-4 p-3 bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                        <FileIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                        <h4 className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase">
                            {t('assignmentCard.attachments', { count: attachments.length })}
                        </h4>
                    </div>
                    <div className="space-y-2">
                        {attachments.map((attachment, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded hover:bg-border-primary-default-light dark:hover:bg-border-primary-default-dark transition-colors">
                                <div className="flex items-center gap-2 min-w-0 flex-1">
                                    <FileIcon size={14} className="text-text-secondary-default-light dark:text-text-secondary-default-dark shrink-0" />
                                    <span className="text-xs text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                        {attachment.name}
                                    </span>
                                    {attachment.size && (
                                        <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap shrink-0">
                                            ({attachment.size})
                                        </span>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setPreviewAttachment(attachment)}
                                    className="ms-2 p-1 hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark rounded transition-colors shrink-0"
                                    title={t('assignmentCard.viewFile')}
                                >
                                    <EyeIcon size={14} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => downloadAttachment(attachment)}
                                    className="ms-1 p-1 hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark rounded transition-colors shrink-0"
                                    title={t('assignmentCard.downloadFile')}
                                >
                                    <DownloadIcon size={14} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
                {status === "pending" && (
                    <>
                        <Button
                            className="w-full sm:flex-1"
                            startIcon={<CheckIcon size={16} />}
                            onClick={() => onSubmitAssignment && onSubmitAssignment({ id, title, dueDate, status })}
                        >
                            {t('assignments.submitAssignment')}
                        </Button>
                        <Button 
                            variant="secondary"
                            className="w-full sm:flex-1"
                            startIcon={<EyeIcon size={16} />}
                            onClick={() => onViewInstructions && onViewInstructions({ title, description, dueDate, daysLeft, status, attachments })}
                        >
                            {t('assignments.viewInstructions')}
                        </Button>
                    </>
                )}
                {status === "submitted" && (
                    <>
                        {daysLeft > 0 ? (
                            <Button
                                className="w-full sm:flex-1"
                                startIcon={<CheckIcon size={16} />}
                                onClick={() => onSubmitAssignment && onSubmitAssignment({ id, title, dueDate, status })}
                            >
                                {t('assignmentCard.resubmitAssignment')}
                            </Button>
                        ) : null}
                        <Button
                            className={daysLeft > 0 ? "w-full sm:flex-1" : "w-full"}
                            variant="secondary"
                            startIcon={<EyeIcon size={16} />}
                            onClick={() => onViewSubmission && onViewSubmission({ title, description, dueDate, daysLeft, status, score, attachments })}
                        >
                            {t('assignmentCard.viewSubmission')}
                        </Button>
                    </>
                )}
                {status === "graded" && (
                    <>
                        <Button
                            className="w-full sm:flex-1"
                            startIcon={<ChartBarIcon size={16} />}
                            onClick={() => onViewGrade && onViewGrade({ title, description, dueDate, daysLeft, status, score, totalPoints, attachments })}
                        >
                            {t('assignmentCard.viewGrade', { score, totalPoints })}
                        </Button>
                        <Button
                            className="w-full sm:flex-1"
                            variant="secondary"
                            startIcon={<EyeIcon size={16} />}
                            onClick={() => onViewSubmission && onViewSubmission({ title, description, dueDate, daysLeft, status, score, attachments })}
                        >
                            {t('assignmentCard.viewSubmission')}
                        </Button>
                    </>
                )}
            </div>

            {previewAttachment && (
                <ModelOverlay onClose={() => setPreviewAttachment(null)} maxWidth="max-w-4xl">
                    <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
                        <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                            <div className="flex items-center gap-3 min-w-0">
                                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                                    <EyeIcon size={20} className="text-blue-600 dark:text-blue-400" />
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">{previewAttachment.name}</h2>
                                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('assignmentCard.preview')}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => downloadAttachment(previewAttachment)}
                                    className="p-2 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark text-text-primary-default-light dark:text-text-primary-default-dark transition-colors"
                                    title="Download"
                                >
                                    <DownloadIcon size={20} />
                                </button>
                                <button
                                    onClick={() => setPreviewAttachment(null)}
                                    className="p-2 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark"
                                >
                                    <XIcon size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="p-0">
                            <MaterialPreview
                                type={getFileType(previewAttachment.name)}
                                title={previewAttachment.name}
                                viewUrl={getRelativeUrl(previewAttachment.url)}
                                downloadUrl={getRelativeUrl(previewAttachment.url)}
                            />
                        </div>
                    </div>
                </ModelOverlay>
            )}
        </div>
    );
};

export default AssignmentCard;
