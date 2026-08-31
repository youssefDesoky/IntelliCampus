import { useTranslation } from "react-i18next";
import ModelOverlay from "../../../../../components/ui/ModelOverlay";
import Button from "../../../../../components/ui/Button";
import { XIcon, FileIcon, DownloadIcon, EyeIcon, CheckIcon } from "../../../../../components/ui/icons";

export default function ViewSubmission({ assignment, onClose }) {
    const { t } = useTranslation('student');
    const submissionFiles = assignment.submissions || [];

    const getFileIcon = (filename) => {
        const ext = filename?.split(".").pop()?.toLowerCase();
        const iconMap = {
            pdf: "text-red-500",
            doc: "text-blue-500",
            docx: "text-blue-500",
            xls: "text-green-500",
            xlsx: "text-green-500",
            ppt: "text-orange-500",
            pptx: "text-orange-500",
            zip: "text-purple-500",
            rar: "text-purple-500",
            sql: "text-yellow-600",
            figma: "text-pink-500",
        };
        return iconMap[ext] || "text-text-secondary-default-light dark:text-text-secondary-default-dark";
    };

    return (
        <ModelOverlay onClose={onClose} maxWidth="max-w-2xl">
            <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
                <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                            <EyeIcon size={20} className="text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('viewSubmission.title')}
                            </h2>
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {assignment.title}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    >
                        <XIcon size={18} />
                    </button>
                </div>

                <div className="p-5 space-y-5">
                    {assignment.submittedDate && (
                        <div className="flex items-center gap-2 text-sm bg-green-50 dark:bg-green-900/10 p-3 rounded-lg">
                            <CheckIcon size={16} className="text-green-600 dark:text-green-400" />
                            <span className="text-green-700 dark:text-green-300 font-medium">{t('assignments.submitted')}</span>
                            <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('viewSubmission.submittedOn', { date: assignment.submittedDate })}
                            </span>
                        </div>
                    )}

                    {submissionFiles.length > 0 ? (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FileIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                    {t('viewSubmission.submittedFiles', { count: submissionFiles.length })}
                                </h3>
                            </div>
                            <div className="grid gap-3">
                                {submissionFiles.map((file, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-4 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <FileIcon size={20} className={`flex-shrink-0 ${getFileIcon(file.name)}`} />
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                                    {file.name}
                                                </p>
                                                {file.size && (
                                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                        {file.size}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            startIcon={<DownloadIcon size={14} />}
                                            onClick={async () => {
                                                if (!file.id) return;
                                                try {
                                                    const res = await fetch(`/api/assignments/submissions/${file.id}/download`);
                                                    if (!res.ok) throw new Error();
                                                    const blob = await res.blob();
                                                    const url = window.URL.createObjectURL(blob);
                                                    const a = document.createElement("a");
                                                    a.href = url;
                                                    a.download = file.name;
                                                    document.body.appendChild(a);
                                                    a.click();
                                                    document.body.removeChild(a);
                                                    window.URL.revokeObjectURL(url);
                                                } catch { /* ignore */ }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="rounded-xl border border-dashed border-border-primary-default-light dark:border-border-primary-default-dark p-8 text-center">
                            <FileIcon size={40} className="mx-auto mb-3 text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('viewSubmission.noFiles')}
                            </p>
                        </div>
                    )}

                    {assignment.submissionNote && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('assignments.submissionNote')}
                            </h3>
                            <div className="p-4 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed">
                                    {assignment.submissionNote}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModelOverlay>
    );
}
