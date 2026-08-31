import { useTranslation } from "react-i18next";
import ModelOverlay from "../../../../../components/ui/ModelOverlay";
import Button from "../../../../../components/ui/Button";
import { XIcon, FileIcon, DownloadIcon, ClockIcon, InfoIcon } from "../../../../../components/ui/icons";

export default function ViewInstructions({ assignment, onClose }) {
    const { t } = useTranslation('student');
    return (
        <ModelOverlay onClose={onClose} maxWidth="max-w-2xl">
            <div className="w-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
                <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30">
                            <InfoIcon size={20} className="text-amber-600 dark:text-amber-400" />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('viewInstructions.title')}
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
                    {assignment.dueDate && (
                        <div className="flex items-center gap-2 text-sm p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                            <ClockIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                            <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {t('viewInstructions.dueDate')}
                            </span>
                            <span className="font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                {assignment.dueDate}
                            </span>
                            {assignment.daysLeft && (
                                <span className="text-amber-600 dark:text-amber-400 font-medium">
                                    {t('viewInstructions.daysLeft', { count: assignment.daysLeft })}
                                </span>
                            )}
                        </div>
                    )}

                    {assignment.description && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('viewInstructions.description')}
                            </h3>
                            <div className="p-4 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed">
                                    {assignment.description}
                                </p>
                            </div>
                        </div>
                    )}

                    {assignment.fullInstructions && (
                        <div className="space-y-2">
                            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('viewInstructions.instructions')}
                            </h3>
                            <div className="p-4 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed whitespace-pre-wrap">
                                    {assignment.fullInstructions}
                                </p>
                            </div>
                        </div>
                    )}

                    {assignment.attachments && assignment.attachments.length > 0 && (
                        <div className="space-y-3">
                            <div className="flex items-center gap-2">
                                <FileIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                    {t('viewInstructions.attachments', { count: assignment.attachments.length })}
                                </h3>
                            </div>
                            <div className="space-y-2">
                                {assignment.attachments.map((attachment, idx) => (
                                    <div key={idx} className="flex items-center justify-between p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                                        <div className="flex items-center gap-3 min-w-0 flex-1">
                                            <FileIcon size={16} className="text-text-secondary-default-light dark:text-text-secondary-default-dark flex-shrink-0" />
                                            <span className="text-sm text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                                {attachment.name}
                                            </span>
                                            {attachment.size && (
                                                <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-nowrap">
                                                    ({attachment.size})
                                                </span>
                                            )}
                                        </div>
                                        <Button
                                            variant="secondary"
                                            size="sm"
                                            startIcon={<DownloadIcon size={14} />}
                                            onClick={() => {
                                                if (attachment.url) {
                                                    const a = document.createElement("a");
                                                    a.href = attachment.url;
                                                    a.download = attachment.name;
                                                    a.click();
                                                }
                                            }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ModelOverlay>
    );
}
