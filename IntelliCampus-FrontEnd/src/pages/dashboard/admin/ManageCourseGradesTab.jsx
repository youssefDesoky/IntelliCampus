import { useState } from "react";
import { useTranslation } from 'react-i18next';
import Button from "../../../components/ui/Button";
import ImportDialog from "../../../components/ui/ImportDialog";
import Dialog from "../../../components/ui/Dialog";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { uploadCourseGrades } from "../../../feature/admin/services/adminCoursesApi";

export default function ManageCourseGradesTab({ courseId, courseName }) {
    const { t } = useTranslation('admin');
    const [isUploadOpen, setIsUploadOpen] = useState(false);
    const [uploading, setUploading] = useState(false);
    const { showError } = useError();
    const [uploadResult, setUploadResult] = useState(null);
    const handleUpload = async (file) => {
        setUploading(true);
        try {
            const result = await uploadCourseGrades(courseId, file);
            const msg = result?.successCount !== undefined
                ? t('courseGradesTab.result', { successCount: result.successCount, failCount: result.failCount || 0 })
                : t('courseGradesTab.resultSuccess');
            setUploadResult(msg);
            setIsUploadOpen(false);
        } catch (err) {
            showError(err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark p-6">
                <div className="flex flex-col items-center text-center py-8">
                    <div className="w-16 h-16 rounded-full bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-text-accent-active-light dark:text-text-accent-active-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                        </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-2">
                        {t('courseGradesTab.uploadTitle')}
                    </h3>
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark max-w-md mb-6">
                        {t('courseGradesTab.uploadDescription', { courseName: courseName })}
                    </p>
                    <Button variant="primary" onClick={() => setIsUploadOpen(true)} disabled={uploading}>
                        {uploading ? t('courseGradesTab.uploading') : t('courseGradesTab.uploadButton')}
                    </Button>
                </div>
            </div>

            {isUploadOpen && (
                <ImportDialog
                    title={t('courseGradesTab.uploadDialogTitle')}
                    subtitle={t('courseGradesTab.uploadDialogSubtitle')}
                    onClose={() => setIsUploadOpen(false)}
                    onImport={handleUpload}
                />
            )}

            <Dialog
                isOpen={uploadResult !== null}
                variant="success"
                title={t('courseGradesTab.successTitle')}
                onClose={() => setUploadResult(null)}
                confirmText={t('courseGradesTab.ok')}
                showCloseButton={true}
            >
                {uploadResult}
            </Dialog>
        </div>
    );
}
