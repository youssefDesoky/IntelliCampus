import { useState, useCallback } from "react";
import PageHeader from "./PageHeader";
import Button from "./Button";
import ImportDialog from "./ImportDialog";
import { ImportIcon, PlusIcon } from "./icons";
import { fetchBylaws } from "../../feature/admin/services/adminBylawsApi";
import { uploadStudents } from "../../feature/admin/services/adminImportsApi";
import { useError } from '../../contexts/ErrorContext.jsx';

const roleLabels = {
    student: { plural: "Students", singular: "Student" },
    instructor: { plural: "Instructors", singular: "Instructor" },
    admin: { plural: "Admins", singular: "Admin" },
};

export default function UserHeader({ role, setIsUserFormOpen, onImportComplete }) {
    const [isImportOpen, setIsImportOpen] = useState(false);
    const [bylaws, setBylaws] = useState([]);
    const [selectedBylaw, setSelectedBylaw] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoadingBylaws, setIsLoadingBylaws] = useState(false);
    const { showError } = useError();
    const labels = roleLabels[role] || roleLabels.student;

    const openImport = useCallback(() => {
        setIsImportOpen(true);
        if (role === "student") {
            setIsLoadingBylaws(true);
            fetchBylaws()
                .then(data => {
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
            <label className="block text-sm font-medium mb-2">Apply Bylaw to All Imported Students</label>
            <select
                className="w-full rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark px-3 py-2 bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark text-sm"
                value={selectedBylaw?.value || ""}
                onChange={(e) => {
                    const val = e.target.value;
                    const match = bylaws.find(b => String(b.value) === val);
                    setSelectedBylaw(match || null);
                }}
            >
                <option value="">No Bylaw</option>
                {bylaws.map(b => (
                    <option key={b.value} value={b.value}>{b.label}</option>
                ))}
            </select>
        </div>
    );

    return (
        <>
            <PageHeader title={`Manage ${labels.plural}`} subtitle={`Administer ${labels.singular.toLowerCase()} records and information`} >
                <div className="flex items-center gap-2">
                    <Button 
                        variant="secondary"
                        onClick={openImport}
                    >
                        <ImportIcon size={24} />
                        <span className="hidden sm:inline">Import {labels.plural}</span>
                    </Button>
                    
                    <Button 
                        variant="primary"
                        onClick={() => setIsUserFormOpen(true)}
                    >
                        <PlusIcon size={24} />
                        <span className="hidden sm:inline">Add {labels.singular}</span>
                    </Button>
                </div>
            </PageHeader>

            {isImportOpen && (
                <ImportDialog
                    title={`Import ${labels.plural}`}
                    subtitle={
                        isLoadingBylaws
                            ? "Loading bylaws..."
                            : `Upload a file to bulk-import ${labels.singular.toLowerCase()} records.`
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
