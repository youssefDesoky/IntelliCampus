import { useMemo } from "react";
import { useTranslation } from "react-i18next";

const RANK_BADGES = ["🥇", "🥈", "🥉"];

export default function CommunityTopContributes({ posts = [], className = "" }) {
    const { t } = useTranslation('student');

    const topUsers = useMemo(() => {
        const map = {};
        for (const post of posts) {
            const author = post.authorName || t('studyGroup.unknown');
            map[author] = map[author] || { name: author, posts: 0, comments: 0 };
            map[author].posts += 1;
            for (const comment of (post.comments || [])) {
                const ca = comment.authorName || t('studyGroup.unknown');
                map[ca] = map[ca] || { name: ca, posts: 0, comments: 0 };
                map[ca].comments += 1;
            }
        }
        return Object.values(map)
            .sort((a, b) => (b.posts + b.comments) - (a.posts + a.comments))
            .slice(0, 5);
    }, [posts, t]);

    return (
        <div className={`rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark p-5 sm:p-6 ${className}`}>
            <div className="mb-4 flex items-center justify-between gap-3">
                <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('community.topContributors')}
                </h3>
                <span className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{t('community.users', { count: topUsers.length })}</span>
            </div>

            {topUsers.length === 0 ? (
                <div className="rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-4 py-6 text-center">
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('community.noContributions')}
                    </p>
                    <p className="mt-0.5 text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                        {t('community.startDiscussion')}
                    </p>
                </div>
            ) : (
                <ul className="space-y-2">
                    {topUsers.map((user, i) => {
                        const total = user.posts + user.comments;
                        const maxTotal = topUsers[0].posts + topUsers[0].comments;
                        const barWidth = maxTotal > 0 ? (total / maxTotal) * 100 : 0;
                        const rankBadge = RANK_BADGES[i];

                        return (
                            <li key={i}>
                                <div className="flex items-center gap-3">
                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-xs font-bold text-white">
                                        {rankBadge || <span className="text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{i + 1}</span>}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <div className="flex items-center justify-between gap-2">
                                            <span className="truncate text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                                {user.name}
                                            </span>
                                            <span className="shrink-0 text-xs font-semibold text-text-accent-default-light dark:text-text-accent-default-dark">
                                                {total}
                                            </span>
                                        </div>
                                        <div className="mt-1 flex items-center gap-2 text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                            <span>{t('community.posts', { count: user.posts })}</span>
                                            <span className="h-1 w-1 rounded-full bg-text-tertiary-default-light dark:bg-text-tertiary-default-dark" />
                                            <span>{t('community.comments', { count: user.comments })}</span>
                                        </div>
                                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                            <div
                                                className="h-full rounded-full bg-text-accent-default-light dark:bg-text-accent-default-dark transition-all"
                                                style={{ width: `${barWidth}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            )}
        </div>
    );
}