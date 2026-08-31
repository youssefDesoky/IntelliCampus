import { useState, useCallback } from "react";
import { useTranslation } from 'react-i18next';
import PageHeader from "./PageHeader";
import Button from "./Button";
import ImportDialog from "./ImportDialog";
import { ImportIcon, PlusIcon } from "./icons";
import { fetchBylaws } from "../../feature/admin/services/adminBylawsApi";
import { uploadStudents } from "../../feature/admin/services/adminImportsApi";
import { useError } from '../../contexts/ErrorContext.jsx';

export default function UserHeader({ role, setIsUserFormOpen, onImportComplete }) {
    const { t } = useTranslation('common');
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [bylaws, setBylaws] = useState([]);
    const [selectedBylaw, setSelectedBylaw] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingBylaws, setIsLoadingBylaws] = useState(false);
    const { showError } = useError();
    const roleSingular = role === 'student' ? t('labels.student', 'Student') : role === 'admin' ? t('labels.admin', 'Admin') : t('labels.instructor', 'Instructor');
    const rolePlural = role === 'student' ? t('labels.students', 'Students') : role === 'admin' ? t('labels.admins', 'Admins') : t('labels.instructors', 'Instructors');

    const openImport = useCallback(() => {
        setIsImportOpen(true);
        if (role === "student") {
            setIsLoadingBylaws(true);
            fetchBylaws()
                .then(result => {
                    const data = Array.isArray(result) ? result : (result?.data ?? []);
                    const options = data.map(b => ({ value: b.bylawId, label: b.name }));
                    setBylaws(options);
                })
                .catch(console.error)
                .finally(() => setIsLoadingBylaws(false));
        }
    }, [role]);

    const handleImport = async (file) => {
        if (role !== "student") {
            setIsImportOpen(false);
            return;
        }

        setIsUploading(true);
        try {
            const result = await uploadStudents(file, selectedBylaw?.value);
            if (result.failCount > 0) {
                const msg = [
                    `✅ ${result.successCount} imported, ❌ ${result.failCount} failed`,
                    ...result.errors.slice(0, 20),
                ].join("\n");
                showError(msg);
            } else {
                showError(`✅ Successfully imported ${result.successCount} students`);
            }
            if (onImportComplete) onImportComplete(result);
        } catch (err) {
            showError(err.message);
        } finally {
            setIsUploading(false);
            setIsImportOpen(false);
        }
    };

    const bylawSelector = role === "student" && (
        <div>
            <label className="block text-sm font-medium mb-2">{t('labels.applyBylaw', 'Apply Bylaw to All Imported Students')}</label>
            <select
                className="w-full rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark px-3 py-2 bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-sm"
                value={selectedBylaw?.value || ""}
                onChange={(e) => {
                    const val = e.target.value;
                    const match = bylaws.find(b => String(b.value) === val);
                    setSelectedBylaw(match || null);
                }}
            >
                <option value="">{t('labels.noBylaw', 'No Bylaw')}</option>
                {bylaws.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <>
            <PageHeader title={t('labels.manageRole', 'Manage {{role}}', { role: rolePlural })} subtitle={t('labels.administerRoleRecords', 'Administer {{role}} records and information', { role: roleSingular.toLowerCase() })} >
                <div className="flex items-center gap-2">
                    <Button 
                        variant="secondary"
                        onClick={openImport}
                    >
                        <ImportIcon size={24} />
                        <span className="hidden sm:inline">{t('labels.importRole', 'Import {{role}}', { role: rolePlural })}</span>
                    </Button>
                    
                    <Button 
                        variant="primary"
                        onClick={() => setIsUserFormOpen(true)}
                    >
                        <PlusIcon size={24} />
                        <span className="hidden sm:inline">{t('labels.addRole', 'Add {{role}}', { role: roleSingular })}</span>
                    </Button>
                </div>
            </PageHeader>

            {isImportOpen && (
                <ImportDialog
                    title={t('labels.importRole', 'Import {{role}}', { role: rolePlural })}
                    subtitle={
                        isLoadingBylaws
                            ? t('labels.loadingBylaws', 'Loading bylaws...')
                            : t('labels.importDescription', 'Upload a file to import records into the system.')
                    }
                    onClose={() => setIsImportOpen(false)}
                    onImport={handleImport}
                >
                    {bylawSelector}
                </ImportDialog>
            )}
        </>
    );
}
