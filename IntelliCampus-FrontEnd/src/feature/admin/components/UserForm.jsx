import { useState, useEffect, useMemo } from "react";
import { useTranslation } from "react-i18next";
import Button from "../../../components/ui/Button";
import TextArea from "../../../components/ui/TextArea";
import { PlusIcon, FilePenIcon } from "../../../components/ui/icons";
import InputItem from "../../../components/form/InputItem";
import Select from 'react-select';
import countryList from 'react-select-country-list';
import { EXCLUDED_COUNTRIES } from "../utils/validation";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";

const adminRoleOptions = [
    { value: 'Post Grad Affairs Admin', label: 'Post Grad Affairs Admin' },
    { value: 'Under Grad Affairs Admin', label: 'Under Grad Affairs Admin' },
];

export default function UserForm({ role, method = "post", onClose, onSubmit, initialData = {}, children, isOpen = true }) {
    const { t, i18n } = useTranslation('admin');
    const roleLabel = t(role === "admin" ? "role.admin" : role === "student" ? "role.student" : "role.instructor");
    const isEdit = method === "put";
    const roleIdField = `${role}Id`;

    const options = useMemo(() => countryList().getData().filter(c => !EXCLUDED_COUNTRIES.includes(c.value)), []);

    const [selectedNationality, setSelectedNationality] = useState(() => {
        const initialNationality = initialData.nationality;
        if (initialNationality) {
            const match = options.find(n => n.value === initialNationality || n.label === initialNationality);
            return match || options[0];
        }
        return options.find(n => n.value === "EG") || options[0];
    });

    useEffect(() => {
        const initialNationality = initialData.nationality;
        if (initialNationality) {
            const match = options.find(n => n.value === initialNationality || n.label === initialNationality);
            if (match) setSelectedNationality(match);
        } else if (options.length > 0) {
            setSelectedNationality(options.find(n => n.value === "EG") || options[0]);
        }
    }, [initialData.nationality, options]);

    const [selectedAdminRole, setSelectedAdminRole] = useState(() => {
        if (initialData.role) {
            return adminRoleOptions.find(o => o.value === initialData.role) || adminRoleOptions[0];
        }
        return adminRoleOptions[0];
    });

    const handleNationalityChange = (option) => {
        setSelectedNationality(option);
    };

    const handleAdminRoleChange = (option) => {
        setSelectedAdminRole(option);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        const form = e.target;
        const formData = Object.fromEntries(new FormData(form));
        if (formData.level) formData.level = Number(formData.level);
        // Add selected nationality to formData
        if (selectedNationality) {
            formData.nationality = selectedNationality.value;
        }
        if (onSubmit) onSubmit(formData);
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t('userForm.title', { context: isEdit ? 'edit' : 'create', role: roleLabel })}
            description={t(isEdit ? 'userForm.description.edit' : 'userForm.description.create', { role: roleLabel.toLowerCase() })}
            onClose={onClose}
            onSubmit={handleSubmit}
            submitText={t(isEdit ? 'userForm.submit.edit' : 'userForm.submit.create', { role: roleLabel })}
        >
            <div className="space-y-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputItem label={t('userForm.fullName')} type="text" id="fullName" name="fullName" placeholder={t('userForm.fullNamePlaceholder')} defaultValue={initialData.fullName || ""} required />

                    {role !== "student" && role !== "admin" && (
                        <InputItem label={t('userForm.instructorId', { role: roleLabel })} type="text" id={roleIdField} name={roleIdField} placeholder={t('userForm.instructorIdPlaceholder', { role: roleLabel.toLowerCase() })} defaultValue={initialData[roleIdField] || ""} required />
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputItem label={t('userForm.nationalId')} type="text" id="nationalId" name="nationalId" placeholder={t('userForm.nationalIdPlaceholder')} defaultValue={initialData.nationalId || ""} required />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {role === "admin" ? (
                        <div className="flex flex-col w-full">
                            <label className="block font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark mb-1" htmlFor="role">
                                {t('userForm.role')}
                            </label>
                            <Select
                                id="role"
                                name="role"
                                options={adminRoleOptions}
                                value={selectedAdminRole}
                                onChange={handleAdminRoleChange}
                                classNamePrefix="react-select"
                                placeholder={t('userForm.selectRole')}
                                isRtl={i18n.language === 'ar'}
                            />
                        </div>
                    ) : (
                        <div className="flex flex-col w-full">
                            <label className="block font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark mb-1" htmlFor="nationality">
                                {t('userForm.nationality')}
                            </label>
                            <Select
                                id="nationality"
                                name="nationality"
                                options={options}
                                value={selectedNationality}
                                onChange={handleNationalityChange}
                                classNamePrefix="react-select"
                                placeholder={t('userForm.selectNationality')}
                                isRtl={i18n.language === 'ar'}
                            />
                        </div>
                    )}

                    <InputItem label={t('userForm.phoneNumber')} type="tel" id="phoneNumber" name="phoneNumber" placeholder={t('userForm.phoneNumberPlaceholder')} defaultValue={initialData.phoneNumber || initialData.phone || ""} required />
                </div>

                {children}

                <div>
                    <label htmlFor="address">{t('userForm.address')}</label>
                    <TextArea
                        id="address"
                        name="address"
                        className="mt-1 block w-full px-3 py-2 border border-border-primary-default-light dark:border-border-primary-default-dark focus:border-border-primary-active-light dark:focus:border-border-primary-active-dark rounded-md focus:outline-none"
                        placeholder={t('userForm.addressPlaceholder')}
                        defaultValue={initialData.address || ""}
                        required
                    />
                </div>
            </div>
        </BaseFormComponent>
    );
}
