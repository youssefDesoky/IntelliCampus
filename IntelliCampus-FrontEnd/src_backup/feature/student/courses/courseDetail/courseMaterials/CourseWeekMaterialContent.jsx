import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { DownloadIcon, EyeIcon, FileLinesIcon, PlayIcon, VoiceIcon, ImageIcon, FileIcon, XIcon } from "../../../../../components/ui/icons";
import ModelOverlay from "../../../../../components/ui/ModelOverlay";
import MaterialPreview from "../../../../../components/ui/MaterialPreview";
import { getMaterialDownloadUrl } from "../../../../course/services/materialsApi";

// Normalise the material type coming from the backend (could be a string or number)
function getMaterialType(material) {
    const typeVal = material.type ?? material.materialType;
    if (typeof typeVal === "number") return typeVal;
    if (typeof typeVal === "string") {
        const lower = typeVal.toLowerCase();
        if (lower === "document" || lower === "pdf" || lower === "doc") return 0;
        if (lower === "video") return 1;
        if (lower === "audio") return 2;
        if (lower === "image") return 3;
    }
    return 4; // Other
}

export default function CourseWeekMaterialContent({ material, isFirst, highlighted = false }) {
    const { t } = useTranslation('student');
    const [showViewer, setShowViewer] = useState(false);
    const type = getMaterialType(material);
    const downloadUrl = material.materialId ? getMaterialDownloadUrl(material.materialId) : "#";
    const viewUrl = material.fileUrl || downloadUrl;
    return (
        <>
        <li id={`material-${material.materialId}`} className={`flex flex-col md:flex-row md:items-center justify-between p-4 ${!isFirst ? 'border-t' : ''} border-border-tertiary-default-light dark:border-border-tertiary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark transition-all duration-200 group ${highlighted ? 'ring-2 ring-indigo-500 ring-offset-2 ring-offset-bg-light dark:ring-offset-bg-dark bg-indigo-50/50 dark:bg-indigo-900/20' : ''}`}>
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
                        {material.title}
                    </h4>
                    <div className="flex items-center justify-between mt-1">
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-medium px-2 py-1 rounded bg-bg-surface-tertiary-default-light dark:bg-bg-surface-tertiary-default-dark text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                {type === 0 ? t('courseMaterials.typeDocument') : type === 1 ? t('courseMaterials.typeVideo') : type === 2 ? t('courseMaterials.typeAudio') : type === 3 ? t('courseMaterials.typeImage') : t('courseMaterials.typeOther')}
                            </span>
                        </div>
                        <div className="flex items-center gap-2 md:hidden">
                            <button onClick={() => setShowViewer(true)} className="p-2 rounded-lg hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-accent-default-light dark:hover:text-icon-accent-default-dark transition-all duration-200" aria-label={type === 1 ? t('courseMaterials.playVideo') : type === 2 ? t('courseMaterials.playAudio') : t('courseMaterials.viewDocument')}>
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
                            <a href={downloadUrl} download className="p-2 rounded-lg hover:bg-bg-surface-success-hover-light dark:hover:bg-bg-surface-success-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-success-default-light dark:hover:text-icon-success-default-dark transition-all duration-200" aria-label={t('courseMaterials.download')}>
                                <DownloadIcon size={18} />
                            </a>
                        </div>
                    </div>
                </div>
            </div>

            <div className="hidden md:flex items-center gap-2 md:ms-4">
                <button onClick={() => setShowViewer(true)} className="p-3 rounded-lg hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-accent-default-light dark:hover:text-icon-accent-default-dark transition-all duration-200" aria-label={type === 1 ? t('courseMaterials.playVideo') : type === 2 ? t('courseMaterials.playAudio') : t('courseMaterials.viewDocument')}>
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
                <a href={downloadUrl} download className="p-3 rounded-lg hover:bg-bg-surface-success-hover-light dark:hover:bg-bg-surface-success-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-success-default-light dark:hover:text-icon-success-default-dark transition-all duration-200" aria-label={t('courseMaterials.download')}>
                    <DownloadIcon size={20} />
                </a>
            </div>
        </li>

        {/* Material Viewer Overlay */}
        {showViewer && (
            <ModelOverlay onClose={() => setShowViewer(false)} maxWidth="max-w-5xl">
                <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden">
                    <div className="flex items-center justify-between p-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                        <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate pe-4">{material.title}</h3>
                        <div className="flex items-center gap-2 shrink-0">
                            <a href={downloadUrl} download className="p-2 rounded-lg hover:bg-bg-surface-success-hover-light dark:hover:bg-bg-surface-success-hover-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-icon-success-default-light dark:hover:text-icon-success-default-dark transition-all duration-200" aria-label={t('courseMaterials.download')}>
                                <DownloadIcon size={20} />
                            </a>
                            <button onClick={() => setShowViewer(false)} className="p-2 rounded-lg hover:bg-bg-surface-danger-default-light dark:hover:bg-bg-surface-danger-default-dark text-icon-primary-default-light dark:text-icon-primary-default-dark hover:text-red-500 transition-all duration-200" aria-label={t('courseMaterials.close')}>
                                <XIcon size={20} />
                            </button>
                        </div>
                    </div>
                    <div className="flex-1 min-h-0 p-1">
                        <MaterialPreview type={type} title={material.title} viewUrl={viewUrl} downloadUrl={downloadUrl} />
                    </div>
                </div>
            </ModelOverlay>
        )}
        </>
    );
}