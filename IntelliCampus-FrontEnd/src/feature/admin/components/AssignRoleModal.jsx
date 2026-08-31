import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import ModelOverlay from "../../../components/ui/ModelOverlay";
import Button from "../../../components/ui/Button";
import { XIcon } from "../../../components/ui/icons";
import { fetchUserRoles, assignUserRoles, fetchAssignableRoles } from "../services/adminAccountsApi";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function AssignRoleModal({ userId, userName, onClose, onRolesUpdated }) {
    const queryClient = useQueryClient();
    const { t } = useTranslation('admin');
    const { showError } = useError();
    const [selectedRoles, setSelectedRoles] = useState([]);
    const [isSaving, setIsSaving] = useState(false);

    const { data: availableRoles = [], isLoading: rolesLoading } = useQuery({
        queryKey: ["assignableRolesV2"],
        queryFn: fetchAssignableRoles,
        staleTime: 2 * 60 * 1000,
    });

    const { data: userRoles = [], isLoading: userRolesLoading } = useQuery({
        queryKey: ["userRoles", userId],
        queryFn: () => fetchUserRoles(userId),
        staleTime: 2 * 60 * 1000,
    });

    useEffect(() => {
        setSelectedRoles(userRoles);
    }, [userRoles]);

    const isLoading = rolesLoading || userRolesLoading;

    const toggleRole = (roleValue) => {
        setSelectedRoles(prev =>
            prev.includes(roleValue)
                ? prev.filter(r => r !== roleValue)
                : [...prev, roleValue]
        );
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await assignUserRoles(userId, selectedRoles);
            queryClient.invalidateQueries({ queryKey: ["userRoles", userId] });
            onRolesUpdated?.();
            onClose();
        } catch (err) {
            showError(err.message);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <ModelOverlay onClose={onClose} maxWidth="max-w-lg">
            <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl shadow-2xl w-full flex flex-col max-h-[80vh]">
                <div className="flex items-center justify-between p-6 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                    <div>
                        <h2 className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t('assignRole.title')}</h2>
                        <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1">{userName}</p>
                    </div>
                    <button onClick={onClose} className="p-1.5 rounded-lg text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-accent-default-light dark:hover:bg-bg-surface-accent-default-dark transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto flex-1 form-scrollbar">
                    {isLoading ? (
                        <p className="text-center py-8 text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('assignRole.loadingRoles')}</p>
                    ) : (
                        <div className="space-y-4">
                            {availableRoles.map(role => {
                                const isSelected = selectedRoles.includes(role.value);
                                return (
                                    <label
                                        key={role.value}
                                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                                            isSelected
                                                ? 'border-border-accent-active-light dark:border-border-accent-active-dark bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark'
                                                : 'border-border-primary-default-light dark:border-border-primary-default-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark'
                                        }`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected}
                                            onChange={() => toggleRole(role.value)}
                                            className="rounded accent-bg-fill-accent-default-light dark:accent-bg-fill-accent-default-dark"
                                        />
                                        <div className="flex flex-col">
                                            <span className={`text-sm font-medium ${isSelected ? 'text-text-accent-active-light dark:text-text-accent-active-dark' : 'text-text-primary-default-light dark:text-text-primary-default-dark'}`}>
                                                {role.label}
                                            </span>
                                            {role.group && (
                                                <span className={`text-xs capitalize ${isSelected ? 'text-text-accent-active-light/80 dark:text-text-accent-active-dark/80' : 'text-text-secondary-default-light dark:text-text-secondary-default-dark'}`}>
                                                    {role.group}
                                                </span>
                                            )}
                                        </div>
                                    </label>
                                );
                            })}
                        </div>
                    )}
                </div>

                <div className="flex justify-end gap-3 p-4 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                    <Button variant="secondary" size="sm" onClick={onClose}>{t('manageExams.cancel')}</Button>
                    <Button variant="primary" size="sm" onClick={handleSave} disabled={isLoading || isSaving}>
                        {isSaving ? t('roomForm.saving') : t('assignRole.saveRoles')}
                    </Button>
                </div>
            </div>
        </ModelOverlay>
    );
}
