import { useEffect } from "react";
import { useLocation, useOutletContext } from "react-router-dom";
import { useTranslation } from 'react-i18next';
import CourseWeekMaterials from "../../../feature/student/courses/courseDetail/courseMaterials/CourseWeekMaterials";



export default function CourseMaterials() {
    const { t } = useTranslation('student');
    const { course } = useOutletContext();
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const folderId = searchParams.get("folderId");
    const materialId = searchParams.get("materialId");

    useEffect(() => {
        const id = materialId || folderId;
        if (!id) return;

        const timer = window.setTimeout(() => {
            const target = document.getElementById(materialId ? `material-${materialId}` : `material-folder-${folderId}`);
            target?.scrollIntoView({ behavior: "smooth", block: "center" });
            target?.classList.add("animate-pulse");
            setTimeout(() => target?.classList.remove("animate-pulse"), 2000);
        }, 300);

        return () => window.clearTimeout(timer);
    }, [folderId, materialId]);

    if (!course?.folders || course.folders.length === 0) {
        return (
            <div className="flex flex-col flex-1 items-center justify-center min-h-[60vh] text-center">
                <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                    {t('courseMaterials.noMaterials')}
                </h3>
                <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md">
                    {t('courseMaterials.noMaterialsDesc')}
                </p>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            {course.folders.map((folder) => (
                <CourseWeekMaterials 
                    key={folder.materialFolderId}
                    folder={folder}
                    highlighted={String(folder.materialFolderId) === String(folderId)}
                    highlightedMaterialId={materialId ? Number(materialId) : undefined}
                />
            ))}
        </div>
    );
}