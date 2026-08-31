import Button from "./Button";
import { PaperPlaneIcon } from "./icons";

export default function CommentInput({
    inputRef,
    avatar,
    value,
    onChange,
    onKeyDown,
    onPost,
    disabled,
    placeholder = "Add a comment...",
}) {
    return (
        <div className="flex items-center gap-3">
            <img src={avatar || ""} alt="you" className="w-8 h-8 rounded-full" />
            <div className="flex items-center gap-2 flex-1">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder={placeholder}
                    className="flex-1 rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark px-4 py-2 text-sm text-text-primary-default-light dark:text-text-primary-default-dark outline-none transition-all focus:border-border-primary-hover-light dark:focus:border-border-primary-hover-dark focus:ring-2 focus:ring-bg-fill-accent-default-light/20 dark:focus:ring-bg-fill-accent-default-dark/30"
                />
                <Button
                    variant="text"
                    size="sm"
                    disabled={disabled}
                    onClick={onPost}
                    startIcon={<PaperPlaneIcon size={18} />}
                />
            </div>
        </div>
    );
}