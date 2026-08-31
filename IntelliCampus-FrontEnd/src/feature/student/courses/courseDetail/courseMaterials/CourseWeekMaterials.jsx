import { useTranslation } from 'react-i18next';
import Button from "../../../../../components/ui/Button";
import { FileLinesIcon, DownloadIcon, FileSlashIcon } from "../../../../../components/ui/icons";

import CourseWeekMaterialContent from "./CourseWeekMaterialContent";
import { getMaterialDownloadUrl } from "../../../../course/services/materialsApi";
import { getLocalizedField } from '../../../../../utils/getLocalizedField';

function downloadAllMaterials(materials) {
    materials.forEach((material, idx) => {
        const url = material.materialId ? getMaterialDownloadUrl(material.materialId) : material.fileUrl;
        if (url) {
            // Create a temporary link and click it
            const link = document.createElement('a');
            link.href = url;
            link.download = material.title || `material-${idx+1}`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    });
}

export default function CourseWeekMaterials({ folder, highlighted = false, highlightedMaterialId }) {
    const { t, i18n } = useTranslation('student');
    const materials = folder.materials || [];

    return (
        <div
            id={`material-folder-${folder.materialFolderId}`}
            className={`bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border overflow-hidden hover:shadow-lg dark:hover:shadow-shadow-dark ${highlighted ? "ring-2 ring-indigo-500 ring-offset-2 ring-offset-bg-light dark:ring-offset-bg-dark border-indigo-400 dark:border-indigo-700" : "border-border-primary-default-light dark:border-border-primary-default-dark"}`}
        >
            <div className="p-4 md:p-8 bg-linear-to-r from-bg-surface-secondary-default-light/50 to-transparent dark:from-bg-surface-secondary-default-dark/50 border-b border-border-tertiary-default-light dark:border-border-tertiary-default-dark">
                <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between gap-3 min-w-0">
                        <h3 className="text-xl md:text-2xl font-bold truncate text-text-primary-default-light dark:text-text-primary-default-dark min-w-0">
                            {getLocalizedField(folder, 'name', i18n.language)}
                        </h3>
                        {materials.length > 0 && (
                            <button
                                onClick={() => downloadAllMaterials(materials)}
                                className="group flex shrink-0 items-center gap-2 px-3 py-2 text-sm font-semibold rounded-lg text-white bg-linear-to-r from-indigo-500 to-indigo-600 dark:from-indigo-600 dark:to-indigo-500 hover:from-indigo-600 hover:to-indigo-700 dark:hover:from-indigo-500 dark:hover:to-indigo-400 shadow-md hover:shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 active:scale-95"
                                aria-label={t('courseMaterials.downloadAllAria')}
                            >
                                <DownloadIcon size={18} className="group-hover:animate-bounce" />
                                <span className="hidden sm:inline">{t('courseMaterials.downloadAll')}</span>
                            </button>
                        )}
                    </div>
                    {getLocalizedField(folder, 'description', i18n.language) && (
                        <p className="text-base text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-3xl">
                            {getLocalizedField(folder, 'description', i18n.language)}
                        </p>
                    )}
                </div>
            </div>

            <div className="p-2 md:p-4">
                {materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                        <div className="w-16 h-16 rounded-full bg-bg-surface-tertiary-default-light dark:bg-bg-surface-tertiary-default-dark flex items-center justify-center mb-4">
                            <FileSlashIcon size={24} className="text-icon-tertiary-default-light dark:text-icon-tertiary-default-dark" />
                        </div>
                        <h4 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                            {t('courseMaterials.noMaterials')}
                        </h4>
                        <p className="text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md">
                            {t('courseMaterials.noMaterialsDesc')}
                        </p>
                    </div>
                ) : (
                    <ul className="flex flex-col divide-y divide-border-tertiary-default-light dark:divide-border-tertiary-default-dark">
                        {materials.map((material, index) => (
                            <CourseWeekMaterialContent 
                                key={material.materialId || index} 
                                material={material}
                                isFirst={index === 0}
                                highlighted={material.materialId === highlightedMaterialId}
                            />
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}