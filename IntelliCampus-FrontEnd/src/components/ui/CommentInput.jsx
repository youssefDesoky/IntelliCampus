import Button from "./Button";
import { PaperPlaneIcon } from "./icons";
import { useTranslation } from 'react-i18next';

export default function CommentInput({
    inputRef,
    avatar,
    value,
    onChange,
    onKeyDown,
    onPost,
    disabled,
    placeholder,
}) {
    const { t, i18n } = useTranslation('common');
    const isRtl = i18n.language?.startsWith('ar');
    const resolvedPlaceholder = placeholder ?? t('labels.addComment', 'Add a comment...');
    return (
        <div className="flex items-center gap-3">
            {avatar && <img src={avatar} alt="" className="w-8 h-8 rounded-full object-cover ring-2 ring-border-primary-hover-light dark:ring-border-primary-hover-dark" />}
            <div className="flex items-center gap-2 flex-1">
                <input
                    ref={inputRef}
                    value={value}
                    onChange={onChange}
                    onKeyDown={onKeyDown}
                    placeholder={resolvedPlaceholder}
                    className="flex-1 rounded-full border border-border-primary-hover-light dark:border-border-primary-hover-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark px-4 py-2 text-sm text-text-primary-default-light dark:text-text-primary-default-dark outline-none transition-all focus:border-border-accent-default-light dark:focus:border-border-accent-default-dark focus:ring-2 focus:ring-bg-fill-accent-default-light/20 dark:focus:ring-bg-fill-accent-default-dark/30"
                    dir={isRtl ? 'rtl' : 'ltr'}
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