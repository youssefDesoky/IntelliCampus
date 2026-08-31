import { useState, useRef } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../../components/ui/Button";
import TextArea from "../../../../components/ui/TextArea";
import Dialog from "../../../../components/ui/Dialog";
import ModelOverlay from "../../../../components/ui/ModelOverlay";
import InstructorWeekMaterialContent from "./InstructorWeekMaterialContent";
import { CloudUploadIcon, DownloadIcon, FilePenIcon, TrashIcon, XIcon, FileSlashIcon } from "../../../../components/ui/icons";
import { useError } from '../../../../contexts/ErrorContext.jsx';
import { getMaterialDownloadUrl } from "../../../course/services/materialsApi";
import { getLocalizedField } from '../../../../utils/getLocalizedField';
    // Download all materials logic
    function downloadAllMaterials(materials) {
        materials.forEach((material, idx) => {
            const url = material.materialId ? getMaterialDownloadUrl(material.materialId) : material.fileUrl;
            if (url) {
                const link = document.createElement('a');
                link.href = url;
                link.download = material.title || `material-${idx+1}`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }
        });
    }

export default function InstructorWeekMaterials({ folder, onUpload, onDeleteMaterial, onDeleteFolder, onEditFolder, isInactive }) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editName, setEditName] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [isEditSubmitting, setIsEditSubmitting] = useState(false);
    const fileInputRef = useRef(null);
    const { t, i18n } = useTranslation('instructor');
    const materials = folder.materials || [];
    const { showError } = useError();

    const handleDragOver = (e) => {
        e.preventDefault();
        setIsDragOver(true);
    };

    const handleDragLeave = () => {
        setIsDragOver(false);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            setIsUploading(true);
            onUpload?.(folder.materialFolderId, files).finally(() => setIsUploading(false));
        }
    };

    const handleFileSelect = (e) => {
        const files = Array.from(e.target.files);
        if (files.length > 0) {
            setIsUploading(true);
            onUpload?.(folder.materialFolderId, files).finally(() => setIsUploading(false));
        }
        e.target.value = "";
    };

    const openEditModal = () => {
        setEditName(getLocalizedField(folder, 'name', i18n.language) || "");
        setEditDescription(getLocalizedField(folder, 'description', i18n.language) || "");
        setShowEditModal(true);
    };

    const handleEditSubmit = async () => {
        if (!editName.trim()) return;
        setIsEditSubmitting(true);
        try {
            await onEditFolder?.(folder.materialFolderId, editName.trim(), editDescription.trim() || null);
            setShowEditModal(false);
        } catch (err) {
            showError(err.message);
        } finally {
            setIsEditSubmitting(false);
        }
    };

    return (
        <>
        <div className="mt-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden hover:shadow-lg dark:hover:shadow-shadow-dark">
            {/* Hidden file input — always in the DOM */}
            <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                onChange={handleFileSelect}
                accept=".pdf,.ppt,.pptx,.mp4,.mkv,.avi,.mov,.webm,.mp3,.wav,.ogg,.flac,.aac,.doc,.docx,.xls,.xlsx,.txt,.rtf,.jpg,.jpeg,.png,.gif,.svg,.webp,.bmp,.zip,.rar"
            />
            {/* Week Header */}
            <div className="p-4 md:p-8 bg-linear-to-r from-bg-surface-secondary-default-light/50 to-transparent dark:from-bg-surface-secondary-default-dark/50 border-b border-border-tertiary-default-light dark:border-border-tertiary-default-dark">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold truncate text-text-primary-default-light dark:text-text-primary-default-dark min-w-0">
                            {getLocalizedField(folder, 'name', i18n.language)}
                        </h3>
                        <div className="flex shrink-0 items-center gap-2">
                            {!isInactive && onEditFolder && (
                                <button
                                    onClick={openEditModal}
                                    className="p-2.5 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark hover:text-icon-accent-default-light dark:hover:text-icon-accent-default-dark hover:border-border-accent-default-light dark:hover:border-border-accent-default-dark hover:bg-bg-surface-accent-default-light/10 dark:hover:bg-bg-surface-accent-default-dark/10 transition-all duration-200 active:scale-95"
                                    aria-label={t('materials.editFolder')}
                                    title={t('materials.editFolder')}
                                >
                                    <FilePenIcon size={18} />
                                </button>
                            )}
                            {!isInactive && onDeleteFolder && (
                                <button
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="p-2.5 rounded-lg bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark hover:text-red-500 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 hover:bg-red-50 dark:hover:bg-red-950/30 transition-all duration-200 active:scale-95"
                                    aria-label={t('materials.deleteFolder')}
                                    title={t('materials.deleteFolder')}
                                >
                                    <TrashIcon size={18} />
                                </button>
                            )}
                            {materials.length > 0 && (
                                <button
                                    onClick={() => downloadAllMaterials(materials)}
                                    className="group flex items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-white bg-linear-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 hover:from-indigo-600 hover:to-indigo-700 dark:hover:from-indigo-500 dark:hover:to-indigo-400 shadow-md hover:shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95"
                                    aria-label={t('materials.downloadAll')}
                                >
                                    <DownloadIcon size={18} className="group-hover:animate-bounce" />
                                    <span className="hidden sm:inline">{t('materials.downloadAll')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                    {getLocalizedField(folder, 'description', i18n.language) && (
                        <p className="text-base text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-3xl">
                            {getLocalizedField(folder, 'description', i18n.language)}
                        </p>
                    )}
                </div>
            </div>

            {/* Materials List */}
            <div className="p-2 md:p-4">
                {materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-bg-surface-tertiary-default-light dark:bg-bg-surface-tertiary-default-dark flex items-center justify-center mb-4">
                            <FileSlashIcon size={24} className="text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark" />
                        </div>
                        <h4 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                            {t('materials.noMaterials')}
                        </h4>
                        <p className="text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-lg mb-6">
                            {t('materials.noMaterialsDesc')}
                        </p>
                        {!isInactive && (
                            <div
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => !isUploading && fileInputRef.current?.click()}
                                className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200 w-full
                                    ${isDragOver
                                        ? "border-border-accent-default-light dark:border-border-accent-default-dark bg-bg-surface-accent-default-light/10 dark:bg-bg-surface-accent-default-dark/10"
                                        : isUploading
                                            ? "border-border-tertiary-default-light dark:border-border-tertiary-default-dark opacity-50"
                                            : "border-border-tertiary-default-light dark:border-border-tertiary-default-dark hover:border-border-primary-focus-light dark:hover:border-border-primary-focus-dark hover:bg-bg-surface-secondary-default-light/50 dark:hover:bg-bg-surface-secondary-default-dark/50"
                                    }`}
                            >
                                {isUploading ? (
                                    <svg className="animate-spin h-7 w-7 mb-2 text-icon-accent-default-light dark:text-icon-accent-default-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                                    </svg>
                                ) : (
                                    <CloudUploadIcon size={28} className={`mb-2 ${isDragOver ? "text-text-accent-default-light dark:text-text-accent-default-dark" : "text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark"}`} />
                                )}
                                <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                                    {isUploading ? t('materials.uploading') : (isDragOver ? t('materials.dropFiles') : t('materials.dragDropPrompt'))}
                                </p>
                                <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-1">
                                    {isUploading ? t('materials.uploadingWait') : t('materials.browseFiles')}
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <ul className="flex flex-col divide-y divide-border-tertiary-default-light dark:divide-border-tertiary-default-dark">
                        {materials.map((material, index) => (
                            <InstructorWeekMaterialContent
                                key={material.materialId || index}
                                material={material}
                                isFirst={index === 0}
                                onDelete={(materialId) => onDeleteMaterial?.(materialId)}
                                isInactive={isInactive}
                            />
                        ))}
                    </ul>
                )}
            </div>

            {/* Upload Zone for folders with existing materials */}
            {!isInactive && materials.length > 0 && (
                <div className="px-4 md:px-6 pb-4">
                    <div
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={() => !isUploading && fileInputRef.current?.click()}
                        className={`relative flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl transition-all duration-200
                            ${isDragOver
                                ? "border-border-accent-default-light dark:border-border-accent-default-dark bg-bg-surface-accent-default-light/10 dark:bg-bg-surface-accent-default-dark/10"
                                : isUploading
                                    ? "border-border-tertiary-default-light dark:border-border-tertiary-default-dark opacity-50"
                                    : "border-border-tertiary-default-light dark:border-border-tertiary-default-dark hover:border-border-primary-focus-light dark:hover:border-border-primary-focus-dark hover:bg-bg-surface-secondary-default-light/50 dark:hover:bg-bg-surface-secondary-default-dark/50"
                            }`}
                    >
                        {isUploading ? (
                            <svg className="animate-spin h-7 w-7 mb-2 text-icon-accent-default-light dark:text-icon-accent-default-dark" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                        ) : (
                            <CloudUploadIcon size={28} className={`mb-2 ${isDragOver ? "text-text-accent-default-light dark:text-text-accent-default-dark" : "text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark"}`} />
                        )}
                        <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {isUploading ? t('materials.uploading') : (isDragOver ? t('materials.dropFilesDrag') : t('materials.dropFiles'))}
                        </p>
                        <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-1">
                            {isUploading ? t('materials.uploadingWait') : t('materials.browseFiles')}
                        </p>
                    </div>
                </div>
            )}

            {/* Footer */}
            {materials.length > 0 && (
                <div className="px-6 md:px-8 py-3 border-t border-border-tertiary-default-light dark:border-border-tertiary-default-dark bg-bg-surface-secondary-default-light/30 dark:bg-bg-surface-secondary-default-dark/30">
                    <p className="text-sm text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                        {t('materials.fileCount', { count: materials.length })}
                    </p>
                </div>
            )}
        </div>

        {/* Delete Folder Confirmation Dialog */}
        <Dialog
            isOpen={showDeleteDialog}
            variant="warning"
            title={t('materials.deleteFolder')}
            onClose={() => setShowDeleteDialog(false)}
            onConfirm={() => {
                onDeleteFolder?.(folder.materialFolderId);
                setShowDeleteDialog(false);
            }}
            confirmText={t('materials.delete')}
            cancelText={t('materials.cancel')}
        >
            {materials.length > 0
                ? t('materials.deleteFolderConfirmWithMaterials', { folderName: getLocalizedField(folder, 'name', i18n.language), count: materials.length })
                : t('materials.deleteFolderConfirm', { folderName: getLocalizedField(folder, 'name', i18n.language) })}
        </Dialog>

        {/* Edit Folder Modal */}
        {showEditModal && (
            <ModelOverlay onClose={() => setShowEditModal(false)}>
                <div className="w-full max-w-lg bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden shadow-xl">
                    <div className="flex items-center justify-between px-6 py-4 border-b border-border-tertiary-default-light dark:border-border-tertiary-default-dark bg-linear-to-r from-bg-surface-secondary-default-light/50 to-transparent dark:from-bg-surface-secondary-default-dark/50">
                        <h3 className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('materials.editFolder')}
                        </h3>
                        <button
                            onClick={() => setShowEditModal(false)}
                            className="p-2 rounded-lg text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark hover:text-icon-primary-default-light dark:hover:text-icon-primary-default-dark transition-all"
                        >
                            <XIcon size={20} />
                        </button>
                    </div>

                    <div className="p-6 flex flex-col gap-4">
                        <div>
                            <label className="block text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-1.5">
                                {t('materials.folderName')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                value={editName}
                                onChange={(e) => setEditName(e.target.value)}
                                autoFocus
                                className="w-full px-3 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark outline-none focus:border-border-primary-focus-light dark:focus:border-border-primary-focus-dark transition-colors"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-1.5">
                                {t('materials.description')}
                            </label>
                            <TextArea
                                value={editDescription}
                                onChange={(e) => setEditDescription(e.target.value)}
                                className="w-full px-3 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark outline-none focus:border-border-primary-focus-light dark:focus:border-border-primary-focus-dark transition-colors"
                            />
                        </div>

                        <div className="flex items-center justify-end gap-3 pt-2">
                            <Button variant="secondary" onClick={() => setShowEditModal(false)}>
                                {t('materials.cancel')}
                            </Button>
                            <Button
                                variant="primary"
                                onClick={handleEditSubmit}
                                disabled={!editName.trim() || isEditSubmitting}
                            >
                                <FilePenIcon size={18} />
                                {isEditSubmitting ? t('materials.saving') : t('materials.saveChanges')}
                            </Button>
                        </div>
                    </div>
                </div>
            </ModelOverlay>
        )}
        </>
    );
}
