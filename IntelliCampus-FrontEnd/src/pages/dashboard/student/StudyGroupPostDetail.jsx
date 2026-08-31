import { useTranslation } from 'react-i18next';
import { useEffect, useState } from "react";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ar } from 'date-fns/locale';
import { fetchSinglePost, addComment, toggleUpvote } from "../../../feature/student/courses/courseDetail/community/communityService";
import { useError } from '../../../contexts/ErrorContext.jsx';
import ArrowUpIcon from "../../../components/ui/icons/ArrowUpIcon";
import CommentIcon from "../../../components/ui/icons/CommentIcon";
import { StudyGroupPostDetailSkeleton } from "../../../feature/student/studyGroup/SkeletonLoader";
import { getLocalizedField } from '../../../utils/getLocalizedField';
import useArabicDigits from '../../../hooks/useArabicDigits';
import CommentInput from "../../../components/ui/CommentInput";

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

export default function StudyGroupPostDetail() {
    const { t, i18n } = useTranslation('student');
    const { convert: ar } = useArabicDigits();
    const { courseId, postId } = useParams();
    const { course } = useOutletContext();
    const isReadOnly = course?.isReadOnly;
    const navigate = useNavigate();
    const { showError } = useError();
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [commentText, setCommentText] = useState("");
    const [hasUpvoted, setHasUpvoted] = useState(false);

    function mapPost(raw) {
        return {
            id: raw.postId,
            sender: getLocalizedField(raw, 'authorName', i18n.language) || raw.authorName,
            senderAvatar: raw.authorProfileImage || raw.authorAvatar || null,
            content: raw.content,
            createdAt: raw.createdAt,
            likes: raw.upvoteCount || 0,
            hasUpvoted: raw.isUpvoted || raw.hasUpvoted || false,
            comments: (raw.comments || []).map(c => ({
                commentId: c.commentId,
                authorName: getLocalizedField(c, 'authorName', i18n.language) || c.authorName,
                authorAvatar: c.authorProfileImage || c.authorAvatar || null,
                content: c.content,
                createdAt: c.createdAt,
                isRecommended: c.isRecommended || false,
                recommendationRank: c.recommendationRank || null,
                instructorRole: c.instructorRole || null,
            })),
        };
    }

    useEffect(() => {
        if (!courseId || !postId) return;
        let ignore = false;
        async function load() {
            try {
                const data = await fetchSinglePost(courseId, postId);
                if (!ignore) {
                    const mapped = mapPost(data);
                    setPost(mapped);
                    setHasUpvoted(mapped.hasUpvoted);
                }
            } catch (err) {
                if (!ignore) showError(err.message);
            } finally {
                if (!ignore) setLoading(false);
            }
        }
        load();
        return () => { ignore = true; };
    }, [courseId, postId]);

    const handleAddComment = async () => {
        if (!commentText.trim() || !courseId || !postId) return;
        try {
            await addComment(courseId, postId, commentText);
            setCommentText("");
            const data = await fetchSinglePost(courseId, postId);
            setPost(mapPost(data));
        } catch (err) {
            showError(err.message);
        }
    };

    const handleUpvote = async () => {
        if (!courseId || !postId) return;
        try {
            await toggleUpvote(courseId, postId);
            setHasUpvoted(prev => !prev);
            const data = await fetchSinglePost(courseId, postId);
            const mapped = mapPost(data);
            setPost(mapped);
            setHasUpvoted(mapped.hasUpvoted);
        } catch (err) {
            showError(err.message);
        }
    };

    if (loading) {
        return <StudyGroupPostDetailSkeleton />;
    }

    if (!post) {
        return (
            <div className="py-10 text-center">
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('studyGroup.postNotFound')}</p>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto space-y-6">
            <button
                onClick={() => navigate(-1)}
                className="text-sm font-medium text-text-accent-default-light dark:text-text-accent-default-dark hover:underline"
            >
                &larr; {t('studyGroup.back')}
            </button>

            <div className="rounded-2xl p-5 sm:p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-11 h-11 rounded-full shrink-0 ring-2 ring-border-primary-default-light dark:ring-border-primary-default-dark overflow-hidden">
                        {post.senderAvatar ? (
                            <img
                                src={post.senderAvatar}
                                alt={post.sender}
                                className="w-full h-full object-cover"
                                onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                            />
                        ) : (
                            <img
                                src={DEFAULT_AVATAR}
                                alt={post.sender}
                                className="w-full h-full object-cover"
                            />
                        )}
                    </div>
                    <div>
                        <h3 className="font-semibold text-[15px] text-text-primary-default-light dark:text-text-primary-default-dark">
                            {post.sender}
                        </h3>
                        <span className="text-[13px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            {post.createdAt ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: i18n.language === 'ar' ? ar : undefined }) : ""}
                        </span>
                    </div>
                </div>

                <p className="text-[15px] leading-relaxed text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-pre-wrap">
                    {post.content}
                </p>

                <div className="flex items-center gap-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-3 mt-4">
                    <button
                        onClick={isReadOnly ? undefined : handleUpvote}
                        aria-pressed={hasUpvoted}
                        className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 ${
                            hasUpvoted
                                ? "bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white shadow-sm"
                                : `text-text-secondary-default-light dark:text-text-secondary-default-dark${isReadOnly ? '' : ' hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark'}`
                        }`}
                    >
                        <ArrowUpIcon className="w-4 h-4" />
                        <span>{ar(post.likes)}</span>
                    </button>
                    <button
                        className="px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark"
                    >
                        <CommentIcon className="w-4 h-4" />
                        <span>{ar(post.comments.length)}</span>
                    </button>
                </div>
            </div>

            <div className="rounded-2xl p-5 sm:p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                <h4 className="font-semibold text-sm text-text-primary-default-light dark:text-text-primary-default-dark mb-4">
                    {t('studyGroup.comments')} ({ar(post.comments.length)})
                </h4>

                {post.comments.length > 0 ? (
                    <ul className="flex flex-col gap-3 mb-4">
                        {post.comments.map((comment, idx) => (
                            <li key={comment.commentId || idx} className="flex items-start gap-2">
                                <div className="w-7 h-7 rounded-full shrink-0 overflow-hidden">
                                    {comment.authorAvatar ? (
                                        <img
                                            src={comment.authorAvatar}
                                            alt={comment.authorName}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                                        />
                                    ) : (
                                        <img
                                            src={DEFAULT_AVATAR}
                                            alt={comment.authorName}
                                            className="w-full h-full object-cover"
                                        />
                                    )}
                                </div>
                                <div className="flex flex-col gap-0.5 rounded-2xl rounded-ss-sm bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-3 py-2 max-w-[85%]">
                                    <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                        <span className="text-[13px] font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                            {comment.authorName || t('studyGroup.unknown')}
                                        </span>
                                        {comment.isRecommended && (
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                {t('studyGroup.recommendedRank', { rank: comment.recommendationRank })}
                                            </span>
                                        )}
                                        {comment.instructorRole && (
                                            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-300">
                                                {comment.instructorRole}
                                            </span>
                                        )}
                                    </div>
                                    <span className="text-[14px] text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-pre-wrap">
                                        {comment.content}
                                    </span>
                                </div>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p className="text-[13px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark text-center py-2 mb-4">
                        {t('studyGroup.noComments')}
                    </p>
                )}

                {!isReadOnly && (
                <CommentInput
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
                    onPost={handleAddComment}
                    disabled={false}
                    placeholder={t('studyGroup.writeComment')}
                />
                )}
            </div>
        </div>
    );
}
