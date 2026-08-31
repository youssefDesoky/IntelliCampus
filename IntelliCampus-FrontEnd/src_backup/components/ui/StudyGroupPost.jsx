import { useState, useEffect, useRef } from "react";
import { formatDistanceToNow } from "date-fns";
import { ar } from 'date-fns/locale';
import { useTranslation } from 'react-i18next';
import ArrowUpIcon from "./icons/ArrowUpIcon";
import CommentIcon from "./icons/CommentIcon";
import EllipsisVerticalIcon from "./icons/EllipsisVerticalIcon";
import PenSquareIcon from "./icons/PenSquareIcon";
import TrashIcon from "./icons/TrashIcon";
import { fetchSinglePost, addComment } from "../../feature/student/courses/courseDetail/community/communityService";
import { useError } from '../../contexts/ErrorContext.jsx';
import Dialog from './Dialog';

const DEFAULT_AVATAR = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999'%3E%3Cpath d='M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z'/%3E%3C/svg%3E";

const CONTENT_PREVIEW_LENGTH = 240;

export default function StudyGroupPost({ className = "", postData, courseId, courseTitle = null, onUpvote, onEdit, onDelete }) {
    const { i18n } = useTranslation();
    const [hasUpvoted, setHasUpvoted] = useState(postData.hasUpvoted || false);
    const [expanded, setExpanded] = useState(false);
    const [showComments, setShowComments] = useState(false);
    const [comments, setComments] = useState(postData.comments || []);
    const [commentText, setCommentText] = useState("");
    const [commentsLoading, setCommentsLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [menuOpen, setMenuOpen] = useState(false);
    const [editing, setEditing] = useState(false);
    const [editContent, setEditContent] = useState(postData.content || "");
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const menuRef = useRef(null);
    const editRef = useRef(null);
    const { showError } = useError();

    const content = postData.content || "";
    const isLongContent = content.length > CONTENT_PREVIEW_LENGTH;
    const canEdit = postData.canEdit || false;
    const canDelete = postData.canDelete || false;
    const hasMenu = canEdit || canDelete;

    useEffect(() => {
        setHasUpvoted(postData.hasUpvoted || false);
    }, [postData.hasUpvoted]);

    useEffect(() => {
        if (!menuOpen) return;
        const handleClick = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                setMenuOpen(false);
            }
        };
        const handleKey = (e) => {
            if (e.key === "Escape") setMenuOpen(false);
        };
        document.addEventListener("mousedown", handleClick);
        document.addEventListener("keydown", handleKey);
        return () => {
            document.removeEventListener("mousedown", handleClick);
            document.removeEventListener("keydown", handleKey);
        };
    }, [menuOpen]);

    useEffect(() => {
        if (!editing || !editRef.current) return;
        editRef.current.focus();
        const len = editRef.current.value.length;
        editRef.current.setSelectionRange(len, len);
    }, [editing]);

    const handleUpvote = () => {
        setHasUpvoted((prev) => !prev);
        onUpvote?.();
    };

    const handleToggleComments = async () => {
        if (showComments) {
            setShowComments(false);
            return;
        }
        if (!courseId) return;
        setShowComments(true);
        setCommentsLoading(true);
        try {
            const data = await fetchSinglePost(courseId, postData.id);
            const mapped = (data.comments || []).map(c => ({
                commentId: c.commentId,
                authorName: c.authorName,
                authorAvatar: c.authorProfileImage || c.authorAvatar || null,
                content: c.content,
                createdAt: c.createdAt,
                isRecommended: c.isRecommended || false,
                recommendationRank: c.recommendationRank || null,
                instructorRole: c.instructorRole || null,
            }));
            setComments(mapped);
        } catch (err) {
            showError(err.message);
        } finally {
            setCommentsLoading(false);
        }
    };

    const handleAddComment = async () => {
        if (!commentText.trim() || !courseId) return;
        setSubmitting(true);
        try {
            await addComment(courseId, postData.id, commentText);
            setCommentText("");
            const data = await fetchSinglePost(courseId, postData.id);
            const mapped = (data.comments || []).map(c => ({
                commentId: c.commentId,
                authorName: c.authorName,
                authorAvatar: c.authorProfileImage || c.authorAvatar || null,
                content: c.content,
                createdAt: c.createdAt,
                isRecommended: c.isRecommended || false,
                recommendationRank: c.recommendationRank || null,
                instructorRole: c.instructorRole || null,
            }));
            setComments(mapped);
        } catch (err) {
            showError(err.message);
        } finally {
            setSubmitting(false);
        }
    };

    const handleEditStart = () => {
        setMenuOpen(false);
        setEditContent(content);
        setEditing(true);
    };

    const handleEditSave = async () => {
        if (!editContent.trim() || !courseId) return;
        try {
            await onEdit?.(postData.id, editContent);
            setEditing(false);
        } catch (err) {
            showError(err.message);
        }
    };

    const handleEditCancel = () => {
        setEditing(false);
        setEditContent(content);
    };

    const handleEditKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleEditSave();
        }
        if (e.key === "Escape") {
            handleEditCancel();
        }
    };

    const handleDeleteConfirm = async () => {
        try {
            await onDelete?.(postData.id);
        } catch (err) {
            showError(err.message);
        }
    };

    return (
        <li
            aria-label="post-item"
            className={`flex flex-col gap-4 rounded-2xl p-5 sm:p-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark transition-shadow duration-200 hover:shadow-sm ${className}`}
        >
            <div aria-label="post-header" className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full shrink-0 ring-2 ring-border-primary-default-light dark:ring-border-primary-default-dark overflow-hidden">
                    {postData.senderAvatar ? (
                        <img
                            src={postData.senderAvatar}
                            alt={postData.sender}
                            className="w-full h-full object-cover"
                            onError={(e) => { e.target.onerror = null; e.target.src = DEFAULT_AVATAR; }}
                        />
                    ) : (
                        <img
                            src={DEFAULT_AVATAR}
                            alt={postData.sender}
                            className="w-full h-full object-cover"
                        />
                    )}
                </div>
                <div className="flex flex-col gap-1 min-w-0 flex-1">
                    <h3 className="font-semibold text-[15px] text-text-primary-default-light dark:text-text-primary-default-dark leading-tight">
                        {postData.sender}
                    </h3>
                    <div className="flex items-center gap-2 text-[13px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark min-w-0">
                        {courseTitle && (
                            <>
                                <span className="truncate max-w-[160px] sm:max-w-[220px] px-1.5 py-0.5 rounded-md bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark font-medium">
                                    {courseTitle}
                                </span>
                                <span className="w-1 h-1 rounded-full shrink-0 bg-text-tertiary-default-light dark:bg-text-tertiary-default-dark" />
                            </>
                        )}
                        <span className="shrink-0">{postData.createdAt ? formatDistanceToNow(new Date(postData.createdAt), { addSuffix: true, locale: i18n.language === 'ar' ? ar : undefined }) : ""}</span>
                    </div>
                </div>
                {hasMenu && (
                    <div className="relative shrink-0" ref={menuRef}>
                        <button
                            onClick={() => setMenuOpen((prev) => !prev)}
                            className="p-1.5 rounded-full text-text-tertiary-default-light dark:text-text-tertiary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                            aria-label="Post actions"
                        >
                            <EllipsisVerticalIcon size={18} />
                        </button>
                        {menuOpen && (
                            <div className="absolute end-0 top-full mt-1 z-50 min-w-[140px] rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-lg py-1">
                                {canEdit && (
                                    <button
                                        onClick={handleEditStart}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                                    >
                                        <PenSquareIcon size={16} />
                                        Edit
                                    </button>
                                )}
                                {canDelete && (
                                    <button
                                        onClick={() => { setMenuOpen(false); setShowDeleteConfirm(true); }}
                                        className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                                    >
                                        <TrashIcon size={16} />
                                        Delete
                                    </button>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div aria-label="post-content" className="flex flex-col gap-1.5">
                {editing ? (
                    <div className="flex flex-col gap-2">
                        <textarea
                            ref={editRef}
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            onKeyDown={handleEditKeyDown}
                            className="w-full rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-3 py-2 text-[15px] text-text-primary-default-light dark:text-text-primary-default-dark outline-none transition-colors resize-none focus:border-text-accent-default-light dark:focus:border-text-accent-default-dark"
                            rows={3}
                        />
                        <div className="flex items-center gap-2 self-end">
                            <button
                                onClick={handleEditCancel}
                                className="px-3 py-1.5 rounded-lg text-sm font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleEditSave}
                                disabled={!editContent.trim()}
                                className="px-3 py-1.5 rounded-lg text-sm font-semibold text-white bg-text-accent-default-light dark:bg-text-accent-default-dark hover:bg-text-accent-hover-light dark:hover:bg-text-accent-hover-dark disabled:opacity-50 transition-colors"
                            >
                                Save
                            </button>
                        </div>
                    </div>
                ) : (
                    <>
                        <p
                            className={`text-[15px] leading-relaxed text-text-secondary-default-light dark:text-text-secondary-default-dark whitespace-pre-wrap ${
                                isLongContent && !expanded ? "line-clamp-4" : ""
                            }`}
                        >
                            {content}
                        </p>
                        {isLongContent && (
                            <button
                                type="button"
                                onClick={() => setExpanded((prev) => !prev)}
                                className="self-start text-[13px] font-medium text-text-accent-default-light dark:text-text-accent-default-dark hover:text-text-accent-active-light dark:hover:text-text-accent-active-dark transition-colors duration-150"
                            >
                                {expanded ? "Show less" : "Show more"}
                            </button>
                        )}
                    </>
                )}
            </div>

            {showDeleteConfirm && (
                <Dialog
                    isOpen={showDeleteConfirm}
                    variant="warning"
                    title="Delete Post"
                    onClose={() => setShowDeleteConfirm(false)}
                    onConfirm={handleDeleteConfirm}
                    confirmText="Delete"
                    cancelText="Cancel"
                >
                    Are you sure you want to delete this post? This action cannot be undone.
                </Dialog>
            )}

            <div
                aria-label="post-actions"
                className="flex items-center gap-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-2 -mb-1"
            >
                <button
                    onClick={handleUpvote}
                    aria-pressed={hasUpvoted}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 ${
                        hasUpvoted
                            ? "text-text-accent-active-light dark:text-text-accent-active-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"
                            : "text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                    }`}
                >
                    <ArrowUpIcon className="w-4 h-4" />
                    <span>{postData.likes}</span>
                </button>
                <button
                    onClick={handleToggleComments}
                    className={`px-3 py-1.5 rounded-full flex items-center gap-1.5 text-sm font-medium transition-colors duration-150 ${
                        showComments
                            ? "text-text-accent-active-light dark:text-text-accent-active-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"
                            : "text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark"
                    }`}
                >
                    <CommentIcon className="w-4 h-4" />
                    <span>{comments.length}</span>
                </button>
            </div>

            {showComments && (
                <div className="border-t border-border-primary-default-light dark:border-border-primary-default-dark pt-4 space-y-3">
                    {commentsLoading ? (
                        <p className="text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark text-center py-4">
                            Loading comments...
                        </p>
                    ) : (
                        <>
                            {comments.length > 0 ? (
                                <ul className="flex flex-col gap-3">
                                    {comments.map((comment, idx) => (
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
                                            <div className="flex flex-col gap-0.5 rounded-2xl rounded-tl-sm bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-3 py-2 max-w-[85%]">
                                                <div className="flex items-center gap-1.5 flex-wrap mb-0.5">
                                                    <span className="text-[13px] font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                                        {comment.authorName || "Unknown"}
                                                    </span>
                                                    {comment.isRecommended && (
                                                        <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold leading-tight bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-300">
                                                            Recommended #{comment.recommendationRank}
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
                                <p className="text-[13px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark text-center py-2">
                                    No comments yet — start the conversation.
                                </p>
                            )}

                            <div className="flex items-center gap-2">
                                <input
                                    type="text"
                                    value={commentText}
                                    onChange={(e) => setCommentText(e.target.value)}
                                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddComment(); } }}
                                    placeholder="Write a comment..."
                                    disabled={submitting}
                                    className="flex-1 px-4 py-2 rounded-full border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-sm text-text-primary-default-light dark:text-text-primary-default-dark placeholder:text-text-tertiary-default-light dark:placeholder:text-text-tertiary-default-dark focus:outline-none focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark transition-colors duration-150"
                                />
                                <button
                                    onClick={handleAddComment}
                                    disabled={!commentText.trim() || submitting}
                                    className="w-9 h-9 shrink-0 rounded-full flex items-center justify-center bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-white hover:bg-bg-surface-accent-hover-light dark:hover:bg-bg-surface-accent-hover-dark disabled:opacity-40 transition-colors duration-150"
                                >
                                    <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" aria-hidden="true">
                                        <path d="M3 11l18-8-8 18-2-8-8-2z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </li>
    );
}
