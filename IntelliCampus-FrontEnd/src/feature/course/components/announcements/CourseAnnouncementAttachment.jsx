import { PaperclipIcon } from "../../../../components/ui/icons";

export default function CourseAnnouncementAttachment({ attachment, onPreview }) {
    return (
        <button
            type="button"
            onClick={onPreview}
            className="inline-flex appearance-none items-center gap-2 rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-hover-light dark:bg-bg-fill-primary-hover-dark px-3 py-1 text-sm text-text-primary-default-light dark:text-text-primary-default-dark hover:opacity-90"
        >
            <PaperclipIcon size={14} />
            <span>{attachment.name}</span>
        </button>
    );
}
