import { useState, useRef } from "react";
import { useTranslation } from 'react-i18next';
import Button from "./Button";
import TextArea from "./TextArea";
import { CloudUploadIcon, XIcon, FileIcon, TrashIcon, PaperPlaneIcon } from "./icons";
import { useError } from '../../contexts/ErrorContext.jsx';

const MAX_SIZE_MB = 50;

export default function QuickUpload({
    assignment,
    onClose,
    onSubmit,
    title,
    subtitle,
    noteEnabled = true,
    noteLabel,
    notePlaceholder,
    noteOptionalText,
    submitText,
    loadingText,
    maxSizeMb = MAX_SIZE_MB,
}) {
    const { t } = useTranslation('common');
    const resolvedTitle = title ?? t('labels.submitAssignment', 'Submit Assignment');
    const resolvedNoteLabel = noteLabel ?? t('labels.submissionNote', 'Submission Note');
    const resolvedNotePlaceholder = notePlaceholder ?? t('labels.submissionNotePlaceholder', 'Add a note to your instructor about this submission...');
    const resolvedNoteOptionalText = noteOptionalText ?? t('labels.optional', '(optional)');
    const resolvedSubmitText = submitText ?? t('labels.submitAssignment', 'Submit Assignment');
    const resolvedLoadingText = loadingText ?? t('status.loading', 'Loading...');
    const [files, setFiles] = useState([]);
    const [note, setNote] = useState("");
    const [dragOver, setDragOver] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { showError } = useError();
    const inputRef = useRef(null);

    const addFiles = (incoming) => {
        const valid = Array.from(incoming).filter((f) => {
            return f.size <= maxSizeMb * 1024 * 1024;
        });
        setFiles((prev) => [...prev, ...valid.map((f) => ({ file: f, name: f.name, size: f.size }))]);
    };

    const removeFile = (idx) => {
        setFiles((prev) => prev.filter((_, i) => i !== idx));
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    const handleSubmit = async () => {
        if (files.length === 0) return;
        setUploading(true);
        try {
            await onSubmit?.({ files, note });
            onClose?.();
        } catch (err) {
            showError(err.message || t('labels.failedToSubmit', 'Failed to submit assignment.'));
        } finally {
            setUploading(false);
        }
    };

    const getFileIconColor = (name) => {
        const ext = name?.split(".").pop()?.toLowerCase();
        const map = {
            pdf: "text-red-500", doc: "text-blue-500", docx: "text-blue-500",
            ppt: "text-orange-500", pptx: "text-orange-500",
            zip: "text-purple-500", sql: "text-yellow-600", figma: "text-pink-500",
        };
        return map[ext] || "text-text-secondary-default-light dark:text-text-secondary-default-dark";
    };

    return (
        <div className="relative w-full max-w-lg bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark shadow-xl">
            <div className="flex items-center justify-between p-5 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30">
                        <CloudUploadIcon size={20} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {resolvedTitle}
                        </h2>
                        {(subtitle || assignment?.title) && (
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                {subtitle || assignment?.title}
                            </p>
                        )}
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


                {noteEnabled && (
                    <div className="space-y-2">
                        <label className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wide">
                            {resolvedNoteLabel} <span className="text-text-tertiary-default-light dark:text-text-tertiary-default-dark font-normal normal-case">{resolvedNoteOptionalText}</span>
                        </label>
                        <TextArea
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder={resolvedNotePlaceholder}
                            className="w-full rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-3 text-sm text-text-primary-default-light dark:text-text-primary-default-dark placeholder:text-text-tertiary-default-light dark:placeholder:text-text-tertiary-default-dark focus:outline-none focus:ring-2 focus:ring-blue-500/40"
                        />
                    </div>
                )}

                {files.length > 0 && (
                    <div className="space-y-2">
                        <p className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wide">
                            {t('labels.selectedFiles', 'Selected Files')} ({files.length})
                        </p>
                        <div className="space-y-2 max-h-48 overflow-y-auto">
                            {files.map((f, idx) => (
                                <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                                    <div className="flex items-center gap-3 min-w-0 flex-1">
                                        <FileIcon size={18} className={getFileIconColor(f.name)} />
                                        <div className="min-w-0 flex-1">
                                            <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                                {f.name}
                                            </p>
                                            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                                {formatSize(f.size)}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeFile(idx)}
                                        className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/20 text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-red-600 dark:hover:text-red-400 transition-colors"
                                    >
                                        <TrashIcon size={14} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <div
                    onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                    onDragLeave={() => setDragOver(false)}
                    onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                    onClick={() => inputRef.current?.click()}
                    className={`flex flex-col items-center justify-center gap-3 border-2 border-dashed rounded-xl p-8 transition-colors ${
                        dragOver
                            ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                            : "border-border-tertiary-default-light dark:border-border-tertiary-default-dark hover:border-blue-400 hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                    }`}
                >
                    <CloudUploadIcon size={44} className="text-icon-accent-default-light dark:text-icon-accent-default-dark" />
                    <div className="text-center">
                        <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('fileUpload.dragDrop', 'Drag & drop files here')}
                        </p>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1">
                            {t('fileUpload.clickBrowse', 'or click to browse')}
                        </p>
                        <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-2">
                            {t('fileUpload.maxSize', 'Max: {{size}}MB per file', { size: maxSizeMb })}
                        </p>
                    </div>
                    <Button variant="secondary" size="sm" onClick={(e) => { e.stopPropagation(); inputRef.current?.click(); }}>
                        {t('labels.chooseFiles', 'Choose Files')}
                    </Button>
                    <input
                        ref={inputRef}
                        type="file"
                        multiple
                        className="hidden"
                        onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }}
                    />
                </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                    <Button variant="secondary" onClick={onClose}>
                    {t('cancel')}
                </Button>
                <Button
                    startIcon={uploading ? null : <PaperPlaneIcon size={16} />}
                    onClick={handleSubmit}
                    disabled={files.length === 0 || uploading}
                    loading={uploading}
                    loadingText={resolvedLoadingText}
                >
                    {uploading ? "" : resolvedSubmitText}
                </Button>
            </div>
        </div>
    );
}
