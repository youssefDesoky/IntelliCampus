import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery } from "@tanstack/react-query";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import Button from "../../../components/ui/Button";
import NumberInput from "../../../components/form/NumberInput";
import { PlusIcon, TrashIcon, XIcon } from "../../../components/ui/icons";
import { fetchSpecializations, createSpecialization, deleteSpecialization } from "../services/adminDepartmentsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function DepartmentSpecializationsForm({ department, onClose, onUpdate }) {
    const { t } = useTranslation('admin');
    const { showError } = useError();
    const [newName, setNewName] = useState("");
    const [newNameAr, setNewNameAr] = useState("");
    const [newMaxCapacity, setNewMaxCapacity] = useState("");
    const [adding, setAdding] = useState(false);

    const departmentId = department?.id ?? department?.departmentId;

    const { data: specializations = [], isLoading: loading, refetch } = useQuery({
        queryKey: ["departmentSpecializations", departmentId],
        queryFn: async () => {
            try {
                const data = await fetchSpecializations(departmentId);
                return Array.isArray(data) ? data : [];
            } catch (err) {
                showError(err.message);
                return [];
            }
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!departmentId,
    });

    const handleAdd = async () => {
        const name = newName.trim();
        const nameAr = newNameAr.trim();
        if (!name) return;
        try {
            setAdding(true);
            const maxCap = newMaxCapacity ? parseInt(newMaxCapacity) : null;
            await createSpecialization(departmentId, { name, nameAr: nameAr || null, maxCapacity: maxCap });
            refetch();
            setNewName("");
            setNewNameAr("");
            setNewMaxCapacity("");
            onUpdate?.();
        } catch (err) {
            showError(err.message);
        } finally {
            setAdding(false);
        }
    };

    const handleDelete = async (specId) => {
        try {
            await deleteSpecialization(departmentId, specId);
            refetch();
            onUpdate?.();
        } catch (err) {
            showError(err.message);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            handleAdd();
        }
    };

    return (
        <ModelOverlay onClose={onClose} maxWidth="max-w-lg">
            <div className="relative z-50 w-full rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)] flex flex-col max-h-[75vh]">
                <div className="shrink-0 flex items-center justify-between gap-4 border-b border-border-primary-default-light px-3 sm:px-6 py-4 dark:border-border-primary-default-dark">
                    <div className="min-w-0 truncate">
                        <h3 className="text-xl font-semibold truncate text-text-primary-default-light dark:text-text-primary-default-dark">
                            {t('manageDepartments.setSpecializations')}
                        </h3>
                        <p className="mt-1 text-sm truncate text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {department?.departmentName || departmentId}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={onClose}
                        className="rounded-lg border border-border-primary-default-light bg-bg-surface-secondary-default-light p-2 text-icon-secondary-default-light transition-colors hover:bg-bg-surface-secondary-hover-light dark:border-border-primary-default-dark dark:bg-bg-surface-secondary-default-dark dark:text-icon-secondary-default-dark dark:hover:bg-bg-surface-secondary-hover-dark"
                        aria-label="Close"
                    >
                        <XIcon size={20} />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    {loading ? (
                        <p className="text-center py-8 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                            {t('manageBylaws.loadingSpecializations')}
                        </p>
                    ) : (
                        <>
                            <div className="space-y-4 mb-6">
                                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        onKeyDown={handleKeyDown}
                                        placeholder={t('deptSpecializationsForm.namePlaceholder')}
                                        className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md focus:outline-none focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-sm"
                                    />
                                    <div dir="rtl">
                                        <input
                                            type="text"
                                            value={newNameAr}
                                            onChange={(e) => setNewNameAr(e.target.value)}
                                            onKeyDown={handleKeyDown}
                                            placeholder={t('deptSpecializationsForm.nameArPlaceholder')}
                                            className="w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark rounded-md focus:outline-none focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-sm"
                                        />
                                    </div>
                                    <NumberInput
                                        value={newMaxCapacity}
                                        onChange={(e) => setNewMaxCapacity(e.target.value)}
                                        placeholder={t('deptSpecializationsForm.maxCapacityPlaceholder')}
                                        min="0"
                                        className="w-full"
                                    />
                                </div>
                                <div className="flex justify-end">
                                    <Button
                                        variant="primary"
                                        onClick={handleAdd}
                                        disabled={!newName.trim() || adding}
                                        loading={adding}
                                        className="w-full sm:w-auto"
                                    >
                                        <PlusIcon size={18} />
                                        {t('deptSpecializationsForm.addSpecialization')}
                                    </Button>
                                </div>
                            </div>

                            {specializations.length === 0 ? (
                                <p className="text-center py-8 text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                    {t('deptSpecializationsForm.noSpecializations')}
                                </p>
                            ) : (
                                <ul className="space-y-2">
                                    {specializations.map((spec) => {
                                        const specId = spec.id ?? spec.specializationId;
                                        return (
                                            <li
                                                key={specId}
                                                className="flex items-center justify-between px-3 py-2 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark"
                                            >
                                                <div className="flex flex-col text-start">
                                                    <span className="text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark">
                                                        {spec.name}
                                                    </span>
                                                    {spec.nameAr && (
                                                        <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark" dir="rtl">
                                                            {spec.nameAr}
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => handleDelete(specId)}
                                                    className="p-1 rounded-md text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:bg-bg-status-error-light dark:hover:bg-bg-status-error-dark hover:text-text-status-error-light dark:hover:text-text-status-error-dark transition-colors"
                                                    aria-label={t('deptSpecializationsForm.delete', { name: spec.name })}
                                                >
                                                    <TrashIcon size={16} />
                                                </button>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </>
                    )}
                </div>

                <div className="shrink-0 flex justify-end border-t border-border-primary-default-light px-3 sm:px-6 py-4 dark:border-border-primary-default-dark">
                    <Button variant="secondary" onClick={onClose}>
                        {t('manageCourses.close')}
                    </Button>
                </div>
            </div>
        </ModelOverlay>
    );
}
