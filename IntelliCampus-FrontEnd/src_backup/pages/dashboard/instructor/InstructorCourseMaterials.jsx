import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { useTranslation } from "react-i18next";
import InstructorWeekMaterials from "../../../feature/instructor/components/courseMaterials/InstructorWeekMaterials";
import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import { PlusIcon, XIcon } from "../../../components/ui/icons";
import { createFolder, createMaterial, deleteMaterial, deleteFolder, updateFolder } from "../../../feature/course/services/materialsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function InstructorCourseMaterials() {
    const { t } = useTranslation('instructor');
    const { course, courseId, refreshMaterials } = useOutletContext();
    const [showAddFolder, setShowAddFolder] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    const [newFolderDescription, setNewFolderDescription] = useState("");
    const { showError } = useError();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleUpload = async (folderId, files) => {
        const failedFiles = [];
        for (const file of files) {
            try {
                const formData = new FormData();
                formData.append("file", file);
                formData.append("Title", file.name);
                if (folderId != null) {
                    formData.append("FolderId", folderId);
                }
                formData.append("CourseId", courseId);

                await createMaterial(formData);
            } catch (err) {
                failedFiles.push({ name: file.name, error: err.message });
            }
        }
        if (failedFiles.length > 0) {
            showError(
                `Failed to upload: ${failedFiles.map((f) => `${f.name} (${f.error})`).join(", ")}`
            );
        }
        // Refresh from API to get the updated list
        await refreshMaterials();
    };

    const handleDeleteMaterial = async (materialId) => {
        try {
            await deleteMaterial(materialId);
            await refreshMaterials();
        } catch (err) {
        }
    };

    const handleDeleteFolder = async (folderId) => {
        try {
            await deleteFolder(folderId);
            await refreshMaterials();
        } catch (err) {
        }
    };

    const handleEditFolder = async (folderId, name, description) => {
        try {
            await updateFolder(folderId, { name, description });
            await refreshMaterials();
        } catch (err) {
        }
    };

    const handleAddFolder = async () => {
        if (!newFolderName.trim()) return;
        setIsSubmitting(true);
        try {
            await createFolder({
                name: newFolderName.trim(),
                description: newFolderDescription.trim() || null,
                courseId,
            });
            setNewFolderName("");
            setNewFolderDescription("");
            setShowAddFolder(false);
            await refreshMaterials();
        } catch (err) {
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleCancel = () => {
        setNewFolderName("");
        setNewFolderDescription("");
        setShowAddFolder(false);
    };

    const displayFolders = course.folders || [];

    return (
        <div className="flex flex-col flex-1">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                    {t('materials.title')}
                </h2>
                <Button
                    variant="primary"
                    onClick={() => setShowAddFolder(true)}
                    startIcon={<PlusIcon size={18} />}
                >
                    <span className="hidden sm:inline">{t('materials.addFolder')}</span>
                </Button>
            </div>

            {/* Add Folder Popup */}
            {showAddFolder && (
                <ModelOverlay onClose={handleCancel}>
                    <div className="w-full max-w-lg bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark overflow-hidden shadow-xl">
                        <div className="flex items-center justify-between px-6 py-4 border-b border-border-tertiary-default-light dark:border-border-tertiary-default-dark bg-linear-to-r from-bg-surface-secondary-default-light/50 to-transparent dark:from-bg-surface-secondary-default-dark/50">
                            <h3 className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                                {t('materials.addFolder')}
                            </h3>
                            <button
                                onClick={handleCancel}
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
                                    value={newFolderName}
                                    onChange={(e) => setNewFolderName(e.target.value)}
                                    placeholder={`e.g. Week ${displayFolders.length + 1} - ${course.title}`}
                                    autoFocus
                                    className="w-full px-3 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark outline-none focus:border-border-primary-focus-light dark:focus:border-border-primary-focus-dark transition-colors"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-1.5">
                                    {t('materials.description')}
                                </label>
                                <TextArea
                                    value={newFolderDescription}
                                    onChange={(e) => setNewFolderDescription(e.target.value)}
                                    placeholder={t('materials.descriptionPlaceholder')}
                                    className="w-full px-3 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark outline-none focus:border-border-primary-focus-light dark:focus:border-border-primary-focus-dark transition-colors"
                                />
                            </div>

                            <div className="flex items-center justify-end gap-3 pt-2">
                                <Button variant="secondary" onClick={handleCancel}>
                                    {t('materials.cancel')}
                                </Button>
                                <Button
                                    variant="primary"
                                    onClick={handleAddFolder}
                                    disabled={!newFolderName.trim() || isSubmitting}
                                >
                                    <PlusIcon size={18} />
                                    {isSubmitting ? t('materials.creating') : t('materials.addFolder')}
                                </Button>
                            </div>
                        </div>
                    </div>
                </ModelOverlay>
            )}

            {/* Folder List */}
            {displayFolders.length === 0 ? (
                <div className="flex flex-1 flex-col items-center justify-center min-h-[60vh] text-center">
                    <h3 className="text-xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                        {t('materials.noFolders')}
                    </h3>
                    <p className="text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md">
                        {t('materials.noFoldersDesc')}
                    </p>
                </div>
            ) : (
                displayFolders.map((folder) => (
                    <InstructorWeekMaterials
                        key={folder.materialFolderId}
                        folder={folder}
                        onUpload={handleUpload}
                        onDeleteMaterial={handleDeleteMaterial}
                        onDeleteFolder={handleDeleteFolder}
                        onEditFolder={handleEditFolder}
                    />
                ))
            )}
        </div>
    );
}
