import { useTranslation } from 'react-i18next';
import { getLocalizedField } from '../../../../utils/getLocalizedField';
import useArabicDigits from '../../../../hooks/useArabicDigits';

function formatCommentDate(value, i18n, arFn) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const locale = i18n?.language?.startsWith('ar') ? 'ar-EG' : 'en-US';
    const day = date.getDate();
    const month = date.toLocaleString(locale, { month: "short" });
    return `${arFn ? arFn(day) : day} ${month}`;
}

export default function CourseAnnouncementCommentItem({ comment }) {
    const { i18n } = useTranslation();
    const { convert: ar } = useArabicDigits();
    return (
        <div className="flex items-start gap-3">
            <img src={comment.sender?.avatar} alt={getLocalizedField(comment.sender, 'name', i18n.language) || comment.sender?.name || ""} className="w-8 h-8 rounded-full ring-2 ring-border-primary-active-light dark:ring-border-primary-active-dark" />
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary-default-light dark:text-text-primary-default-dark">{getLocalizedField(comment.sender, 'name', i18n.language) || comment.sender?.name}</span>
                    <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">• {formatCommentDate(comment.date, i18n, ar)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-text-primary-default-light dark:text-text-primary-default-dark">{comment.content}</p>
            </div>
        </div>
    );
}
