function formatCommentDate(value) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const day = date.getDate();
    const month = date.toLocaleString("en-US", { month: "short" });
    return `${day} ${month}`;
}

export default function CourseAnnouncementCommentItem({ comment }) {
    return (
        <div className="flex items-start gap-3">
            <img src={comment.sender?.avatar} alt={comment.sender?.name} className="w-8 h-8 rounded-full" />
            <div className="min-w-0">
                <div className="flex items-center gap-2">
                    <span className="font-semibold text-sm text-text-primary-default-light dark:text-text-primary-default-dark">{comment.sender?.name}</span>
                    <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">• {formatCommentDate(comment.date)}</span>
                </div>
                <p className="mt-1 whitespace-pre-line text-sm text-text-primary-default-light dark:text-text-primary-default-dark">{comment.content}</p>
            </div>
        </div>
    );
}
