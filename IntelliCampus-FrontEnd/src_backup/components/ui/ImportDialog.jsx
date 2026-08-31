import { useState, useRef, useCallback } from "react";
import BaseFormComponent from "./BaseFormComponent";
import { CloudUploadIcon, FileIcon, TrashIcon, CheckIcon } from "./icons";
import { useError } from '../../contexts/ErrorContext.jsx';

const ACCEPTED_EXTENSIONS = [".csv", ".xlsx", ".xls", ".json"];

function formatFileSize(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const EXT_COLORS = {
    ".csv": { bg: "bg-emerald-500/10 dark:bg-emerald-400/10", text: "text-emerald-600 dark:text-emerald-400", border: "border-emerald-500/20 dark:border-emerald-400/20" },
    ".xlsx": { bg: "bg-blue-500/10 dark:bg-blue-400/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20 dark:border-blue-400/20" },
    ".xls": { bg: "bg-blue-500/10 dark:bg-blue-400/10", text: "text-blue-600 dark:text-blue-400", border: "border-blue-500/20 dark:border-blue-400/20" },
    ".json": { bg: "bg-amber-500/10 dark:bg-amber-400/10", text: "text-amber-600 dark:text-amber-400", border: "border-amber-500/20 dark:border-amber-400/20" },
};

export default function ImportDialog({
    title = "Import Data",
    subtitle,
    acceptedFormats = ACCEPTED_EXTENSIONS,
    onClose,
    onImport,
    children,
}) {
    const [file, setFile] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const { showError } = useError();
    const fileInputRef = useRef(null);

    const acceptString = acceptedFormats.join(",");
    const fileExt = file ? `.${file.name.split(".").pop().toLowerCase()}` : null;
    const extStyle = fileExt ? (EXT_COLORS[fileExt] ?? EXT_COLORS[".csv"]) : null;

    const validateFile = useCallback((f) => {
        const ext = `.${f.name.split(".").pop().toLowerCase()}`;
        if (!acceptedFormats.includes(ext)) {
            showError(`Unsupported format. Accepted: ${acceptedFormats.join(", ")}`);
            return false;
        }
        return true;
    }, [acceptedFormats, showError]);

    const handleFile = useCallback((f) => {
        if (validateFile(f)) setFile(f);
    }, [validateFile]);

    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); };
    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
        const droppedFile = e.dataTransfer.files?.[0];
        if (droppedFile) handleFile(droppedFile);
    };
    const handleInputChange = (e) => {
        const selected = e.target.files?.[0];
        if (selected) handleFile(selected);
    };
    const handleRemoveFile = () => {
        setFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };
    const handleSubmit = () => {
        if (!file || !onImport) return;
        onImport(file);
    };

    return (
        <BaseFormComponent
            isOpen
            title={title}
            description={subtitle || "Upload a file to import records into the system."}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText="Import"
            submitDisabled={!file}
            maxWidth="max-w-4xl"
            contentClassName="py-2"
        >
            <div className="ic-dialog-enter w-full overflow-hidden rounded-2xl bg-bg-surface-secondary-default-light shadow-2xl dark:bg-bg-surface-secondary-default-dark">
                {children && <div className="px-7 pt-5">{children}</div>}
                <div className="p-7">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !file && fileInputRef.current?.click()}
                        className={[
                            "relative overflow-hidden rounded-xl border transition-all duration-200",
                            !file ? "" : "",
                            isDragging
                                ? "border-border-accent-default-light dark:border-border-accent-default-dark bg-bg-surface-accent-default-light/30 dark:bg-bg-surface-accent-default-dark/20"
                                : file
                                    ? "border-border-success-default-light dark:border-border-success-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark"
                                    : "border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light hover:border-border-accent-default-light dark:bg-bg-surface-primary-default-dark dark:hover:border-border-accent-default-dark",
                        ].join(" ")}
                    >
                        {!file && (
                            <div
                                className="ic-dropzone-dot-bg pointer-events-none absolute inset-0 text-text-secondary-default-light dark:text-text-secondary-default-dark"
                                style={{ opacity: isDragging ? 0.06 : 0.04 }}
                            />
                        )}

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept={acceptString}
                            onChange={handleInputChange}
                            className="hidden"
                        />

                        {!file ? (
                            <div className="relative flex flex-col items-center justify-center gap-5 px-8 py-12">
                                <div
                                    className={[
                                        "relative flex h-14 w-14 items-center justify-center rounded-2xl transition-all duration-200",
                                        isDragging
                                            ? "scale-110 bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark"
                                            : "bg-bg-surface-accent-default-light/60 dark:bg-bg-surface-accent-default-dark/60",
                                    ].join(" ")}
                                >
                                    <CloudUploadIcon
                                        size={26}
                                        className={`transition-colors duration-200 ${isDragging ? "text-text-accent-active-light dark:text-text-accent-active-dark" : "text-text-accent-default-light dark:text-text-accent-default-dark"}`}
                                    />
                                </div>

                                <div className="space-y-1 text-center">
                                    <p className="text-[14px] font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                        {isDragging ? "Drop to upload" : "Drop your file here"}
                                    </p>
                                    <p className="text-[13px] text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                        or <span className="font-medium text-text-accent-active-light underline underline-offset-2 transition-opacity hover:opacity-80 dark:text-text-accent-active-dark">browse files</span>
                                    </p>
                                </div>

                                <div className="flex flex-wrap items-center justify-center gap-2">
                                    {acceptedFormats.map((fmt, i) => {
                                        const c = EXT_COLORS[fmt] ?? EXT_COLORS[".csv"];
                                        return (
                                            <span
                                                key={fmt}
                                                className={`ic-fade-up ic-pill-${i + 1} rounded-lg border px-2.5 py-1.25 text-[11px] font-semibold tracking-wide ${c.bg} ${c.text} ${c.border}`}
                                            >
                                                {fmt.toUpperCase()}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>
                        ) : (
                            <div className="ic-file-in flex items-center gap-4 p-5">
                                <div className={`shrink-0 flex h-13 w-11 flex-col items-center justify-center gap-0.5 rounded-lg border ${extStyle.bg} ${extStyle.border}`}>
                                    <FileIcon size={16} className={extStyle.text} />
                                    <span className={`text-[9px] font-black uppercase leading-none tracking-widest ${extStyle.text}`}>
                                        {fileExt?.slice(1)}
                                    </span>
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-[13px] font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                        {file.name}
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-[12px] text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                            {formatFileSize(file.size)}
                                        </span>
                                        <span className="h-0.75 w-0.75 rounded-full bg-text-secondary-default-light opacity-30 dark:bg-text-secondary-default-dark" />
                                        <span className="ic-check-pop flex items-center gap-1 text-[12px] font-medium text-text-success-default-light dark:text-text-success-default-dark">
                                            <CheckIcon className="h-3 w-3" />
                                            Ready
                                        </span>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={(e) => { e.stopPropagation(); handleRemoveFile(); }}
                                    aria-label="Remove file"
                                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-text-secondary-default-light transition-colors hover:bg-red-50 hover:text-text-danger-default-light dark:text-text-secondary-default-dark dark:hover:bg-red-950/30 dark:hover:text-text-danger-default-dark"
                                >
                                    <TrashIcon className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>


                </div>
            </div>
        </BaseFormComponent>
    );
}
