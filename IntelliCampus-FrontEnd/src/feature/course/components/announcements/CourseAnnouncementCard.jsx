import { useState, useRef, useEffect, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import Button from "../../../../components/ui/Button";
import DropdownMenu from "../../../../components/ui/DropdownMenu";
import { CommentsIcon, DownloadIcon, EllipsisVerticalIcon, XIcon, PinIcon, LinkIcon, FilePenIcon, TrashIcon } from "../../../../components/ui/icons";
import CommentInput from "../../../../components/ui/CommentInput";
import ModelOverlay from "../../../../components/ui/ModelOverlay";
import MaterialPreview from "../../../../components/ui/MaterialPreview";
import CourseAnnouncementAttachment from "./CourseAnnouncementAttachment";
import CourseAnnouncementCommentItem from "./CourseAnnouncementCommentItem";
import { createAnnouncementComment, deleteCourseAnnouncement, pinCourseAnnouncement, unpinCourseAnnouncement } from "./announcementsApi";
import { useError } from '../../../../contexts/ErrorContext.jsx';
import { getLocalizedField } from '../../../../utils/getLocalizedField';
import useArabicDigits from '../../../../hooks/useArabicDigits';

function formatAnnouncementDate(value, i18n, arFn) {
    const date = new Date(value);

    if (Number.isNaN(date.getTime())) {
        return value;
    }

    const locale = i18n?.language?.startsWith('ar') ? 'ar-EG' : 'en-US';
    const day = date.getDate();
    const month = date.toLocaleString(locale, { month: "short" });
    return `${arFn ? arFn(day) : day} ${month}`;
}

export default function CourseAnnouncementCard({
    announcement,
    currentUser,
    courseId,
    onDelete,
    onEdit,
    onPin,
    onUnpin,
    userRole = "student", // "student" or "instructor"
    isReadOnly = false
}) {
    const { t, i18n } = useTranslation('instructor');
    const { convert: ar } = useArabicDigits();
    const [showComments, setShowComments] = useState(false);
    const [showActionsMenu, setShowActionsMenu] = useState(false);
    const [actionsMenuStyle, setActionsMenuStyle] = useState({});
    const [previewAttachment, setPreviewAttachment] = useState(null);
    const [comments, setComments] = useState(announcement.comments || []);
    const [commentCount, setCommentCount] = useState(announcement.commentCount ?? (announcement.comments || []).length);
    const [newComment, setNewComment] = useState("");
    const [posting, setPosting] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [isPinning, setIsPinning] = useState(false);
    const cardRef = useRef(null);
    const actionsButtonRef = useRef(null);
    const inputRef = useRef(null);
    const location = useLocation();
    const { showError } = useError();

    const isHighlighted = location.hash === `#announcement-${announcement.id}`;
    const isInstructor = userRole === "instructor";
    const canManageAnnouncements = isInstructor;

    const closeAttachmentPreview = useCallback(() => {
        setPreviewAttachment(null);
    }, []);

    useEffect(() => {
        const nextComments = announcement.comments || [];
        setComments(nextComments);
        setCommentCount(announcement.commentCount ?? nextComments.length);
    }, [announcement.id, announcement.commentCount, announcement.comments]);

    const getAnnouncementLink = useCallback(() => {
        const baseUrl = window.location.href.split('#')[0];
        return `${baseUrl}#announcement-${announcement.id}`;
    }, [announcement.id]);

    const copyAnnouncementLink = useCallback(async () => {
        const link = getAnnouncementLink();

        if (navigator.clipboard?.writeText) {
            await navigator.clipboard.writeText(link);
        } else {
            const textarea = document.createElement("textarea");
            textarea.value = link;
            textarea.setAttribute("readonly", "true");
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        }
    }, [getAnnouncementLink]);

    useEffect(() => {
        const targetHash = `#announcement-${announcement.id}`;
        const isTargeted = location.hash === targetHash;

        if (isTargeted) {
            cardRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }, [announcement.id, location.hash]);

    useEffect(() => {
        if (!showActionsMenu) return;

        const handlePointerDown = (event) => {
            const isClickOnThisMenu = event.target.closest("[data-announcement-actions-menu]");
            const isClickOnThisButton = actionsButtonRef.current?.contains(event.target);

            if (isClickOnThisMenu || isClickOnThisButton) {
                return;
            }

            setShowActionsMenu(false);
        };

        const handleKeyDown = (event) => {
            if (event.key === "Escape") {
                setShowActionsMenu(false);
            }
        };

        document.addEventListener("pointerdown", handlePointerDown);
        document.addEventListener("keydown", handleKeyDown);

        return () => {
            document.removeEventListener("pointerdown", handlePointerDown);
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [showActionsMenu]);

    useEffect(() => {
        if (showComments && inputRef.current) {
            inputRef.current.focus();
        }
    }, [showComments]);

    const handlePostComment = useCallback(async () => {
        const text = newComment.trim();
        if (!text || posting) {
            return;
        }

        setPosting(true);

        try {
            const response = await createAnnouncementComment(courseId, announcement.id, text);

            if (Array.isArray(response?.comments)) {
                setComments(response.comments);
                setCommentCount(
                    typeof response.commentCount === "number"
                        ? response.commentCount
                        : response.comments.length,
                );
            } else {
                const createdComment = response?.comment ?? response;

                if (createdComment) {
                    setComments((currentComments) => [...currentComments, createdComment]);
                }

                if (typeof response?.commentCount === "number") {
                    setCommentCount(response.commentCount);
                } else {
                    setCommentCount((currentCount) => currentCount + 1);
                }
            }

            setNewComment("");
        } catch (error) {
            showError(error.message);
        } finally {
            setPosting(false);
        }
    }, [announcement.id, courseId, newComment, posting]);

    const handleDeleteAnnouncement = useCallback(async () => {
        if (!window.confirm(t('announcements.deleteConfirm'))) {
            return;
        }

        setIsDeleting(true);

        try {
            await deleteCourseAnnouncement(courseId, announcement.id);
            onDelete?.(announcement.id);
        } catch (error) {
            showError(t('announcements.failedDelete'));
        } finally {
            setIsDeleting(false);
        }
    }, [courseId, announcement.id, onDelete]);

    const handlePinAnnouncement = useCallback(async () => {
        setIsPinning(true);

        try {
            await pinCourseAnnouncement(courseId, announcement.id);
            onPin?.(announcement.id);
        } catch (error) {
            showError(t('announcements.failedPin'));
        } finally {
            setIsPinning(false);
            setShowActionsMenu(false);
        }
    }, [courseId, announcement.id, onPin]);

    const handleUnpinAnnouncement = useCallback(async () => {
        setIsPinning(true);

        try {
            await unpinCourseAnnouncement(courseId, announcement.id);
            onUnpin?.(announcement.id);
        } catch (error) {
            showError(t('announcements.failedUnpin'));
        } finally {
            setIsPinning(false);
            setShowActionsMenu(false);
        }
    }, [courseId, announcement.id, onUnpin]);

    return (
        <div
            ref={cardRef}
            id={`announcement-${announcement.id}`}
            data-announcement-id={announcement.id}
            className={`course-announcement-card scroll-mt-24 border-2 rounded-2xl overflow-hidden flex flex-col transition-all duration-300 ${
                isHighlighted
                    ? "is-highlighted border-border-accent-default-light bg-surface-accent-default-light shadow-lg shadow-blue-400/20 dark:border-border-accent-default-dark dark:bg-surface-accent-default-dark"
                    : "border-border-primary-default-light bg-bg-fill-secondary-default-light dark:border-border-primary-default-dark dark:bg-bg-fill-secondary-default-dark"
            }`}
        >
            <div className="p-2 md:p-4 space-y-2">
                {/* Pinned Badge - Only visible for instructors */}
                {isInstructor && announcement.isPinned && (
                    <div className="flex items-center gap-2 text-xs font-semibold text-border-accent-default-light dark:text-border-accent-default-dark mb-2">
                        <PinIcon size={14} />
                        <span>Pinned</span>
                    </div>
                )}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <img src={announcement.sender?.avatar || ""} alt={announcement.sender?.name || t('announcements.user')} className="w-10 h-10 rounded-full ring-2 ring-border-primary-active-light dark:ring-border-primary-active-dark" />
                        <div className="flex flex-col">
                            <h3 className="font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{getLocalizedField(announcement.sender, 'name', i18n.language) || announcement.sender?.name || t('announcements.unknown')}</h3>
                            <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{formatAnnouncementDate(announcement.date, i18n, ar)}</p>
                        </div>
                    </div>

                    {/* Actions Menu - Visible for students and instructors */}
                    <div className="relative shrink-0">
                            <Button
                                ref={actionsButtonRef}
                                type="button"
                                variant="text"
                                aria-label={t('announcements.announcementActions')}
                                aria-haspopup="menu"
                                aria-expanded={showActionsMenu}
                                data-announcement-actions-button="true"
                                className="h-9 w-9 rounded-full"
                                startIcon={<EllipsisVerticalIcon size={18} />}
                                onPointerUp={(event) => {
                                    event.preventDefault();
                                    event.stopPropagation();

                                    const button = actionsButtonRef.current;
                                    if (button) {
                                        const rect = button.getBoundingClientRect();
                                        const isRtl = document.dir === 'rtl';
                                        setActionsMenuStyle({
                                            top: rect.bottom + 8,
                                            ...(isRtl
                                                ? { right: window.innerWidth - rect.left, transform: 'translateX(100%)' }
                                                : { left: rect.right, transform: 'translateX(-100%)' }
                                            ),
                                        });
                                    }

                                    setShowActionsMenu((prev) => !prev);
                                }}
                            />

                            {showActionsMenu && (
                                <DropdownMenu
                                    portal={true}
                                    style={actionsMenuStyle}
                                    data-announcement-actions-menu="true"
                                    role="menu"
                                >
                                    {canManageAnnouncements ? (
                                        <>
                                            <Button
                                                type="button"
                                                variant="text"
                                                role="menuitem"
                                                size="sm"
                                                className="w-full justify-start"
                                                startIcon={<PinIcon size={16} />}
                                                onClick={() => {
                                                    announcement.isPinned ? handleUnpinAnnouncement() : handlePinAnnouncement();
                                                }}
                                                disabled={isPinning}
                                            >
                                                {isPinning ? "..." : announcement.isPinned ? t('announcements.unpin') : t('announcements.pin')}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="text"
                                                role="menuitem"
                                                size="sm"
                                                className="w-full justify-start"
                                                startIcon={<FilePenIcon size={16} />}
                                                onClick={() => {
                                                    onEdit?.(announcement);
                                                    setShowActionsMenu(false);
                                                }}
                                            >
                                                Edit
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="text"
                                                role="menuitem"
                                                size="sm"
                                                className="w-full justify-start"
                                                startIcon={<LinkIcon size={16} />}
                                                onClick={async () => {
                                                    await copyAnnouncementLink();
                                                    setShowActionsMenu(false);
                                                }}
                                            >
                                                {t('announcements.copyLink')}
                                            </Button>
                                            <Button
                                                type="button"
                                                variant="text"
                                                role="menuitem"
                                                size="sm"
                                                className="w-full justify-start text-text-danger-default-light dark:text-text-danger-default-dark"
                                                startIcon={<TrashIcon size={16} />}
                                                onClick={() => {
                                                    handleDeleteAnnouncement();
                                                    setShowActionsMenu(false);
                                                }}
                                                disabled={isDeleting}
                                            >
                                                {isDeleting ? t('announcements.deleting') : t('announcements.delete')}
                                            </Button>
                                        </>
                                    ) : (
                                        <Button
                                            type="button"
                                            variant="text"
                                            role="menuitem"
                                            size="sm"
                                            className="w-full justify-start"
                                            startIcon={<LinkIcon size={16} />}
                                            onClick={async () => {
                                                await copyAnnouncementLink();
                                                setShowActionsMenu(false);
                                            }}
                                        >
                                            {t('announcements.copyLink')}
                                        </Button>
                                    )}
                                </DropdownMenu>
                            )}
                        </div>
                </div>

                <p className="whitespace-pre-line wrap-break-word text-text-primary-default-light dark:text-text-primary-default-dark">{announcement.content}</p>

                {/* Attachments */}
                {announcement.attachments?.length ? (
                    <div className="flex flex-wrap gap-2">
                        {announcement.attachments.map((attachment) =>
                            attachment.fileType === "image" ? (
                                <button
                                    key={attachment.id}
                                    type="button"
                                    onClick={() => setPreviewAttachment(attachment)}
                                    className="w-full max-w-md rounded-lg overflow-hidden border border-border-primary-default-light dark:border-border-primary-default-dark hover:opacity-90 transition-opacity"
                                >
                                    <img
                                        src={attachment.url}
                                        alt={attachment.name}
                                        className="w-full h-48 object-cover"
                                    />
                                </button>
                            ) : (
                                <CourseAnnouncementAttachment
                                    key={attachment.id}
                                    attachment={attachment}
                                    onPreview={() => setPreviewAttachment(attachment)}
                                />
                            )
                        )}
                    </div>
                ) : null}
            </div>

            {/* Comments Section */}
            <div className="border-t p-2 border-border-primary-default-light dark:border-border-primary-default-dark">
                <Button
                    variant="text"
                    size="sm"
                    startIcon={<CommentsIcon size={18} />}
                    onPointerUp={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setShowComments((v) => !v);
                    }}
                >
                    {showComments
                        ? t('announcements.hideComments')
                        : commentCount > 0
                            ? ar(t('announcements.viewComments', { count: commentCount }))
                            : t('announcements.addComment')}
                </Button>
            </div>

            {showComments && (
                <div className="p-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                    {(comments && comments.length > 0) ? (
                        <div className="flex flex-col gap-3">
                            {comments.map((c) => (
                                <CourseAnnouncementCommentItem key={c.id} comment={c} />
                            ))}
                        </div>
                    ) : null}

                    {!isReadOnly && (
                    <div className={comments.length > 0 ? "mt-3 pt-3 border-t border-border-primary-default-light dark:border-border-primary-default-dark" : "mt-0 pt-0"}>
                        <CommentInput
                            inputRef={inputRef}
                            avatar={currentUser?.avatar || announcement.sender?.avatar || ""}
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault();
                                    handlePostComment();
                                }
                            }}
                            onPost={handlePostComment}
                            disabled={posting || !newComment.trim()}
                        />
                    </div>
                    )}
                </div>
            )}

            {/* Attachment Preview Modal */}
            {previewAttachment && (
                <ModelOverlay onClose={closeAttachmentPreview} maxWidth="max-w-5xl">
                    <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between p-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                            <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate pe-4">
                                {previewAttachment.name}
                            </h3>
                            <div className="flex items-center gap-2 shrink-0">
                                <a
                                    href={previewAttachment.url}
                                    download={previewAttachment.name}
                                    className="p-2 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg"
                                >
                                    <DownloadIcon size={20} />
                                </a>
                                <button
                                    type="button"
                                    onClick={closeAttachmentPreview}
                                    className="p-2 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded-lg"
                                >
                                    <XIcon size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 overflow-auto">
                            <MaterialPreview
                                type={previewAttachment.fileType === "image" ? 3 : previewAttachment.fileType === "video" ? 1 : previewAttachment.fileType === "audio" ? 2 : 0}
                                title={previewAttachment.name}
                                viewUrl={previewAttachment.url}
                                downloadUrl={previewAttachment.url}
                            />
                        </div>
                    </div>
                </ModelOverlay>
            )}
        </div>
    );
}
