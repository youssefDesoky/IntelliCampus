import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useOutletContext, useRouteLoaderData } from "react-router-dom";
import { fetchCourseAnnouncements, createCourseAnnouncement, updateCourseAnnouncement } from "../../../course/components/announcements";
import CourseAnnouncementCard from "../../../course/components/announcements/CourseAnnouncementCard";
import Button from "../../../../components/ui/Button";
import TextArea from "../../../../components/ui/TextArea";
import { PlusIcon, XIcon } from "../../../../components/ui/icons";
import BaseFormComponent from "../../../../components/ui/BaseFormComponent";
import { useError } from '../../../../contexts/ErrorContext.jsx';
import useArabicDigits from "../../../../hooks/useArabicDigits";
import { CourseAnnouncementsSkeleton } from "../../SkeletonLoader";

export default function InstructorCourseAnnouncements() {
    const { t } = useTranslation('instructor');
    const { convert: ar } = useArabicDigits();
    const user = useRouteLoaderData("root");
    const outletContext = useOutletContext();
    const courseId = outletContext?.courseId;
    const isInactive = outletContext?.course?.isInactive;
    const { showError } = useError();
    const [showCreateForm, setShowCreateForm] = useState(false);
    const [content, setContent] = useState("");
    const [attachments, setAttachments] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [editingAnnouncement, setEditingAnnouncement] = useState(null);
    const fileInputRef = useRef(null);

    const queryClient = useQueryClient();

    const { data: announcements = [], isLoading: loading } = useQuery({
        queryKey: ["instructorCourseAnnouncements", courseId],
        queryFn: () => fetchCourseAnnouncements(courseId),
        staleTime: 5 * 60 * 1000,
        enabled: !!courseId,
        select: (data) => {
            if (Array.isArray(data)) return data;
            if (data?.data && Array.isArray(data.data)) return data.data;
            return [];
        },
    });

    const handleAddAttachment = (event) => {
        const selectedFiles = Array.from(event.target.files || []);
        if (selectedFiles.length > 0) {
            setAttachments((prev) => [...prev, ...selectedFiles]);
        }
        event.target.value = "";
    };

    const handleRemoveAttachment = (index) => {
        setAttachments((prev) => prev.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const text = content.trim();
        if (!text) {
            showError(t('announcements.errorEmpty'));
            return;
        }

        setIsSubmitting(true);

        try {
            if (editingAnnouncement) {
                await updateCourseAnnouncement(courseId, editingAnnouncement.id, text, attachments);
            } else {
                await createCourseAnnouncement(courseId, text, attachments);
            }

            setContent("");
            setAttachments([]);
            setEditingAnnouncement(null);
            setShowCreateForm(false);
            queryClient.invalidateQueries({ queryKey: ["instructorCourseAnnouncements", courseId] });
        } catch (err) {
            showError(editingAnnouncement
                ? t('announcements.errorFailedUpdate', { message: err.message })
                : t('announcements.errorFailedCreate', { message: err.message }));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleEditClick = (announcement) => {
        setEditingAnnouncement(announcement);
        setContent(announcement.content);
        setAttachments([]);
        setShowCreateForm(true);
    };

    const handleCloseForm = () => {
        setShowCreateForm(false);
        setContent("");
        setAttachments([]);
        setEditingAnnouncement(null);
    };

    const handleDeleteAnnouncement = (announcementId) => {
        queryClient.invalidateQueries({ queryKey: ["instructorCourseAnnouncements", courseId] });
    };

    const handlePinAnnouncement = (announcementId) => {
        queryClient.invalidateQueries({ queryKey: ["instructorCourseAnnouncements", courseId] });
    };

    const handleUnpinAnnouncement = (announcementId) => {
        queryClient.invalidateQueries({ queryKey: ["instructorCourseAnnouncements", courseId] });
    };

    // Sort announcements: pinned first, then by date descending
    const sortedAnnouncements = [...announcements].sort((a, b) => {
        if (a.isPinned === b.isPinned) {
            return new Date(b.date) - new Date(a.date);
        }
        return a.isPinned ? -1 : 1;
    });

    if (loading) {
        return <CourseAnnouncementsSkeleton />;
    }

    return (
        <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('announcements.title')}
                </h2>
                {!isInactive && (
                    <Button
                        type="button"
                        variant="primary"
                        onClick={() => setShowCreateForm(true)}
                        startIcon={<PlusIcon size={18} />}
                    >
                        <span className="hidden sm:inline">{t('announcements.addNew')}</span>
                    </Button>
                )}
            </div>

            {/* Create/Edit Announcement Form Modal */}
            <BaseFormComponent
                isOpen={showCreateForm}
                title={editingAnnouncement ? t('announcements.editTitle') : t('announcements.createTitle')}
                description={editingAnnouncement ? t('announcements.editDesc') : t('announcements.createDesc')}
                onClose={handleCloseForm}
                onSubmit={handleSubmit}
                submitText={editingAnnouncement ? t('announcements.update') : t('announcements.post')}
                submitDisabled={isSubmitting || !content.trim()}
                submitLoading={isSubmitting}
                maxWidth="max-w-2xl"
                contentClassName="space-y-4"
            >
                <div>
                    <label className="block text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                        {t('announcements.content')}
                    </label>
                    <TextArea
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        placeholder={t('announcements.contentPlaceholder')}
                        disabled={isSubmitting}
                        className="w-full px-3 py-2 border rounded-lg border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark placeholder-text-secondary-default-light dark:placeholder-text-secondary-default-dark outline-none focus:border-border-primary-focus-light dark:focus:border-border-primary-focus-dark disabled:opacity-50"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                        {t('announcements.attachments')}
                    </label>
                    <input
                        ref={fileInputRef}
                        type="file"
                        multiple
                        onChange={handleAddAttachment}
                        disabled={isSubmitting}
                        className="hidden"
                    />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isSubmitting}
                        className="w-full flex items-center justify-between rounded-2xl border border-border-primary-default-light bg-bg-surface-secondary-default-light px-4 py-3 text-sm text-text-primary-default-light dark:text-text-primary-default-dark dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark transition-colors"
                    >
                        <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {attachments.length > 0
                                ? ar(t('announcements.filesSelected', { count: attachments.length }))
                                : t('common:labels.noFileChosen', 'No file chosen')}
                        </span>
                        <span className="rounded-lg bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark px-3 py-1.5 text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('common:labels.chooseFiles')}
                        </span>
                    </button>
                    <p className="mt-2 text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('announcements.multiFileHint')}
                    </p>

                    {attachments.length > 0 && (
                        <div className="mt-2 space-y-2">
                            {attachments.map((file, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark rounded-lg"
                                >
                                    <span className="text-sm text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                        {file.name}
                                    </span>
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveAttachment(index)}
                                        disabled={isSubmitting}
                                        className="p-1 hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark rounded disabled:opacity-50"
                                    >
                                        <XIcon size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </BaseFormComponent>

            {/* Announcements List */}
            {announcements.length === 0 ? (
                <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                    <h3 className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('announcements.noAnnouncements')}</h3>
                    <p className="mt-2 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">
                        {t('announcements.noAnnouncementsDesc')}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {sortedAnnouncements.map((announcement) => (
                        <CourseAnnouncementCard
                            key={announcement.id}
                            announcement={announcement}
                            currentUser={user}
                            courseId={courseId}
                            onDelete={handleDeleteAnnouncement}
                            onEdit={handleEditClick}
                            onPin={handlePinAnnouncement}
                            onUnpin={handleUnpinAnnouncement}
                            userRole="instructor"
                            isReadOnly={isInactive}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
