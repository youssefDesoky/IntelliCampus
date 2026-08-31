import { DownloadIcon, FileIcon } from "./icons";

const OFFICE_EXTENSIONS = ["doc", "docx", "xls", "xlsx", "ppt", "pptx"];
const BROWSER_NATIVE_EXTENSIONS = ["pdf", "txt", "html", "htm", "xml", "json", "csv", "svg"];

/** Extract file extension from a title or URL */
function getFileExtension(name) {
    const ext = (name || "").split(".").pop()?.toLowerCase();
    return ext || "";
}

/**
 * Determine how to preview the file:
 *  - "image" | "video" | "audio"  → native HTML element
 *  - "iframe"  → browser renders natively (PDF, text…)
 *  - "office"  → Microsoft Office Online viewer
 *  - "none"    → can't preview
 */
function getPreviewMode(type, ext) {
    if (type === 3) return "image";
    if (type === 1) return "video";
    if (type === 2) return "audio";
    if (BROWSER_NATIVE_EXTENSIONS.includes(ext)) return "iframe";
    if (OFFICE_EXTENSIONS.includes(ext)) return "office";
    return "none";
}

/** Renders a "cannot preview" fallback */
function NoPreview({ ext, downloadUrl }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
            <FileIcon size={48} className="text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark" />
            <p className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">Preview not available</p>
            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-sm">
                This file type (.{ext || "unknown"}) cannot be previewed in the browser. Please download it instead.
            </p>
            <a
                href={downloadUrl}
                download
                className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark font-semibold hover:opacity-90 transition-opacity"
            >
                <DownloadIcon size={18} /> Download File
            </a>
        </div>
    );
}

/**
 * Universal material preview component.
 *
 * @param {{ type: number, title: string, viewUrl: string, downloadUrl: string }} props
 */
export default function MaterialPreview({ type, title, viewUrl, downloadUrl }) {
    const ext = getFileExtension(title);
    const mode = getPreviewMode(type, ext);

    switch (mode) {
        case "image":
            return <img src={viewUrl} alt={title} className="w-full h-full object-contain max-h-[80vh]" />;
        case "video":
            return <video src={viewUrl} controls className="w-full h-full max-h-[80vh]" />;
        case "audio":
            return (
                <div className="flex items-center justify-center p-8">
                    <audio src={viewUrl} controls className="w-full max-w-lg" />
                </div>
            );
        case "iframe": {
            const ext = getFileExtension(title);
            if (ext === "pdf") {
                return <embed src={viewUrl} type="application/pdf" className="w-full h-[80vh] rounded-b-xl" />;
            }
            return <iframe src={viewUrl} title={title} className="w-full h-[80vh] border-0 rounded-b-xl" />;
        }
        case "office": {
            const fullUrl = `${window.location.origin}${viewUrl}`;
            const officeViewerUrl = `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullUrl)}`;
            return <iframe src={officeViewerUrl} title={title} className="w-full h-[80vh] border-0 rounded-b-xl" />;
        }
        default:
            return <NoPreview ext={ext} downloadUrl={downloadUrl} />;
    }
}
