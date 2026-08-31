import { useState, useRef } from "react";
import { CloudUploadIcon, PaperclipIcon, XIcon } from "./icons";

export default function FileUploadArea({ files, onFilesChange, maxSizeMb = 50 }) {
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef(null);

    const addFiles = (incoming) => {
        const valid = Array.from(incoming).filter((f) => f.size <= maxSizeMb * 1024 * 1024);
        onFilesChange?.([...files, ...valid]);
    };

    const removeFile = (idx) => {
        onFilesChange?.(files.filter((_, i) => i !== idx));
    };

    const formatSize = (bytes) => {
        if (bytes < 1024) return bytes + " B";
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
        return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    };

    return (
        <div className="space-y-3">
            {files.length > 0 && (
                <div className="flex flex-wrap gap-2">
                    {files.map((f, idx) => (
                        <div
                            key={idx}
                            className="group inline-flex items-center gap-2 ps-3 pe-1 py-1.5 rounded-full text-xs font-medium bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:border-border-accent-default-light dark:hover:border-border-accent-default-dark transition-colors"
                        >
                            <PaperclipIcon size={13} />
                            <span className="truncate max-w-[160px]" title={`${f.name} (${formatSize(f.size)})`}>{f.name}</span>
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); removeFile(idx); }}
                                className="p-1 rounded-full hover:bg-red-100 dark:hover:bg-red-900/20 text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-red-600 dark:hover:text-red-400 transition-colors"
                            >
                                <XIcon size={12} />
                            </button>
                        </div>
                    ))}
                </div>
            )}

            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }}
                onClick={() => inputRef.current?.click()}
                className={`flex items-center gap-3 border-2 border-dashed rounded-xl px-4 py-3 transition-colors cursor-pointer ${
                    dragOver
                        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/10"
                        : "border-border-tertiary-default-light dark:border-border-tertiary-default-dark hover:border-blue-400 hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                }`}
            >
                <CloudUploadIcon size={28} className="text-icon-accent-default-light dark:text-icon-accent-default-dark shrink-0" />
                <div className="min-w-0">
                    <p className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">Drag & drop files here <span className="font-normal text-text-secondary-default-light dark:text-text-secondary-default-dark">or click to browse</span></p>
                    <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">Max: {maxSizeMb}MB per file</p>
                </div>
            </div>

            <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => { addFiles(e.target.files); e.target.value = ""; }} />
        </div>
    );
}