import { useState } from "react";
import { useTranslation } from "react-i18next";
import { DownloadIcon, EyeIcon, FileLinesIcon, PlayIcon, TrashIcon, VoiceIcon, ImageIcon, FileIcon, XIcon } from "../../../../components/ui/icons";
import Dialog from "../../../../components/ui/Dialog";
import ModelOverlay from "../../../../components/ui/ModelOverlay";
import MaterialPreview from "../../../../components/ui/MaterialPreview";
import { getMaterialDownloadUrl } from "../../../course/services/materialsApi";
// Normalise the material type coming from the backend
function getMaterialType(material) {
    const t = material.type ?? material.materialType;
    if (typeof t === "number") return t;
    if (typeof t === "string") {
        const lower = t.toLowerCase();
        if (lower === "document" || lower === "pdf" || lower === "doc") return 0;
        if (lower === "video") return 1;
        if (lower === "audio") return 2;
        if (lower === "image") return 3;
    }
    return 4;
}

function getTypeLabel(type, t) {
    return type === 0 ? t('materials.typeDocument') : type === 1 ? t('materials.typeVideo') : type === 2 ? t('materials.typeAudio') : type === 3 ? t('materials.typeImage') : t('materials.typeOther');
}

export default function InstructorWeekMaterialContent({ material, isFirst, onDelete, isInactive }) {
    const { t } = useTranslation('instructor');
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [showViewer, setShowViewer] = useState(false);
    const type = getMaterialType(material);
    const downloadUrl = material.materialId ? getMaterialDownloadUrl(material.materialId) : "#";
    const viewUrl = material.fileUrl || downloadUrl;

    return (
        <>
            <li className={`flex flex-col md:flex-row md:items-center justify-between p-4 ${!isFirst ? 'border-t' : ''} border-border-tertiary-default-light dark:border-border-tertiary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-all duration-200 group`}>
                <div className="flex items-start md:items-center gap-3 w-full md:w-auto">
                    <div className={`p-3 rounded-lg shrink-0 ${
                        type === 0 ? 
                            "bg-bg-surface-purple-default-light dark:bg-bg-surface-purple-default-dark" :
                        type === 1 ? 
                            "bg-bg-surface-blue-default-light dark:bg-bg-surface-blue-default-dark" : 
                        type === 2 ? 
                            "bg-bg-surface-green-default-light dark:bg-bg-surface-green-default-dark" : 
                        type === 3 ? 
                            "bg-bg-surface-amber-default-light dark:bg-bg-surface-amber-default-dark" :
                        "bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark"
                    }`}>
                        {
                            type === 0 ? (
                                <FileLinesIcon size={20} className="text-text-purple-accent-light dark:text-text-purple-accent-dark" />
                            ) :
                            type === 1 ? (
                                <PlayIcon size={20} className="text-text-blue-accent-light dark:text-text-blue-accent-dark" />
                            ) : 
                            type === 2 ? (
                                <VoiceIcon size={20} className="text-text-green-accent-light dark:text-text-green-accent-dark" />
                            ) : 
                            type === 3 ? (
                                <ImageIcon size={20} className="text-text-amber-accent-light dark:text-text-amber-accent-dark" />
                            ) : (
                                <FileIcon size={20} className="text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark" />
                            )
                        }
                    </div>
                    <div className="flex-1 min-w-0">
                        <h4 className="text-[16px] font-semibold truncate text-text-primary-default-light dark:text-text-primary-default-dark group-hover:text-text-accent-default-light dark:group-hover:text-text-accent-default-dark transition-colors">
                            {/* TODO: i18n - backend returns English only */}
                            {material.title}
                        </h4>
                        <div className="flex items-center justify-between mt-1">
                            <div className="flex items-center gap-3">
                                <span className="text-sm font-medium px-2 py-1 rounded bg-bg-surface-tertiary-default-light dark:bg-bg-surface-tertiary-default-dark text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                    {getTypeLabel(type, t)}
                                </span>
                                {material.fileSize != null && (
                                    <p className="text-sm font-medium text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                        {(material.fileSize / (1024 * 1024)).toFixed(1)} MB
                                    </p>
                                )}
                            </div>
                            {/* Mobile action buttons */}
                            <div className="flex items-center gap-1 md:hidden">
                                <button onClick={() => setShowViewer(true)} className="p-2 rounded-lg hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-accent-default-light dark:hover:text-icon-accent-default-dark transition-all duration-200" aria-label={type === 1 ? t('materials.playVideo') : type === 2 ? t('materials.playAudio') : t('materials.viewDocument')}>
                                    {
                                        type === 1 ? (
                                            <PlayIcon size={18} />
                                        ) : 
                                        type === 2 ? (
                                            <VoiceIcon size={18} />
                                        ) : 
                                        type === 3 ? (
                                            <ImageIcon size={18} />
                                        ) : (
                                            <EyeIcon size={18} />
                                        )
                                    }
                                </button>
                                <a href={downloadUrl} download className="p-2 rounded-lg hover:bg-bg-surface-success-hover-light dark:hover:bg-bg-surface-success-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-success-default-light dark:hover:text-icon-success-default-dark transition-all duration-200" aria-label={t('materials.download')}>
                                    <DownloadIcon size={18} />
                                </a>
                                {!isInactive && (
                                    <button 
                                        onClick={() => setShowDeleteDialog(true)}
                                        className="p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-red-500 dark:hover:text-red-400 transition-all duration-200" 
                                        aria-label={t('materials.delete')}
                                    >
                                        <TrashIcon size={18} />
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Desktop action buttons */}
                <div className="hidden md:flex items-center gap-2 md:ms-4">
                    <button onClick={() => setShowViewer(true)} className="p-3 rounded-lg hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-accent-default-light dark:hover:text-icon-accent-default-dark transition-all duration-200" aria-label={type === 1 ? t('materials.playVideo') : type === 2 ? t('materials.playAudio') : t('materials.viewDocument')}>
                        {
                            type === 1 ? (
                                <PlayIcon size={20} />
                            ) : 
                            type === 2 ? (
                                <VoiceIcon size={20} />
                            ) : 
                            type === 3 ? (
                                <ImageIcon size={20} />
                            ) : (
                                <EyeIcon size={20} />
                            )
                        }
                    </button>
                    <a href={downloadUrl} download className="p-3 rounded-lg hover:bg-bg-surface-success-hover-light dark:hover:bg-bg-surface-success-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-success-default-light dark:hover:text-icon-success-default-dark transition-all duration-200" aria-label={t('materials.download')}>
                        <DownloadIcon size={20} />
                    </a>
                    {!isInactive && (
                        <button 
                            onClick={() => setShowDeleteDialog(true)}
                            className="p-3 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30 text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-red-500 dark:hover:text-red-400 transition-all duration-200" 
                            aria-label={t('materials.delete')}
                        >
                            <TrashIcon size={20} />
                        </button>
                    )}
                </div>
            </li>

            {/* Material Viewer Overlay */}
            {showViewer && (
                <ModelOverlay onClose={() => setShowViewer(false)} maxWidth="max-w-5xl">
                    <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                            {/* TODO: i18n - backend returns English only */}
                            <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate pe-4">{material.title}</h3>
                            <div className="flex items-center gap-2 shrink-0">
                                <a href={downloadUrl} download className="p-2 rounded-lg hover:bg-bg-surface-success-hover-light dark:hover:bg-bg-surface-success-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-success-default-light dark:hover:text-icon-success-default-dark transition-all duration-200" aria-label={t('materials.download')}>
                                    <DownloadIcon size={20} />
                                </a>
                                <button onClick={() => setShowViewer(false)} className="p-2 rounded-lg hover:bg-bg-surface-danger-default-light dark:hover:bg-bg-surface-danger-default-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-red-500 transition-all duration-200" aria-label={t('materials.close')}>
                                    <XIcon size={20} />
                                </button>
                            </div>
                        </div>
                        <div className="flex-1 min-h-0 p-1">
                            {/* TODO: i18n - backend returns English only */}
                            <MaterialPreview type={type} title={material.title} viewUrl={viewUrl} downloadUrl={downloadUrl} />
                        </div>
                    </div>
                </ModelOverlay>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog
                isOpen={showDeleteDialog}
                variant="warning"
                title={t('materials.deleteMaterial')}
                onClose={() => setShowDeleteDialog(false)}
                onConfirm={() => {
                    onDelete(material.materialId);
                    setShowDeleteDialog(false);
                }}
                confirmText={t('materials.delete')}
                cancelText={t('materials.cancel')}
            >
                {t('materials.deleteConfirm', { title: material.title })}
            </Dialog>
        </>
    );
}
