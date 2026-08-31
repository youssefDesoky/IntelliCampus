import { useTranslation } from "react-i18next";

export default function CommunityStats({ posts = [], className = "" }) {
    const { t } = useTranslation('student');
    const totalPosts = posts.length;
    const totalComments = posts.reduce((sum, p) => sum + (p.comments?.length || 0), 0);
    const totalUpvotes = posts.reduce((sum, p) => sum + (p.upvoteCount || 0), 0);

    return (
        <div className={`p-4 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark ${className}`}>
            <h3 className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-3">
                {t('community.stats')}
            </h3>
            <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                    <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('community.questions')}</span>
                    <span className="font-medium">{totalPosts}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('community.comments')}</span>
                    <span className="font-medium">{totalComments}</span>
                </div>
                <div className="flex justify-between">
                    <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('community.upvotes')}</span>
                    <span className="font-medium">{totalUpvotes}</span>
                </div>
            </div>
        </div>
    );
}