import { useState } from "react";
import { useTranslation } from "react-i18next";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import InputItem from "../../../components/form/InputItem";
import TextArea from "../../../components/ui/TextArea";
import { useError } from "../../../contexts/ErrorContext.jsx";
import { updateProfile } from "../services/profileApi";

export default function EditProfileForm({ isOpen, onClose, user, onSaved }) {
    const { t } = useTranslation('instructor');
    const { showError } = useError();
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);

    const handleClose = () => {
        setErrors({});
        onClose();
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const fullName = formData.get("fullName") || "";
        const phoneNumber = formData.get("phoneNumber") || "";
        const address = formData.get("address") || "";

        const egyptianPhoneRegex = /^01[0125]\d{8}$/;

        const newErrors = {};
        if (!fullName.trim()) newErrors.fullName = t('profile.errorNameRequired');
        if (!phoneNumber.trim()) {
            newErrors.phoneNumber = t('profile.errorPhoneRequired');
        } else if (!egyptianPhoneRegex.test(phoneNumber.trim())) {
            newErrors.phoneNumber = t('profile.errorPhoneInvalid');
        }
        if (!address.trim()) newErrors.address = t('profile.errorAddressRequired');

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);
        try {
            await updateProfile({
                fullName: fullName.trim() || null,
                phoneNumber: phoneNumber.trim() || null,
                address: address.trim() || null,
            });

            onSaved?.();
            handleClose();
        } catch (err) {
            showError(err?.message || t('profile.errorUpdateFailed'));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t('profile.edit')}
            description={t('profile.editDesc')}
            onClose={handleClose}
            onSubmit={handleSubmit}
            submitText={t('profile.saveChanges')}
            submitDisabled={submitting}
            submitLoading={submitting}
            maxWidth="max-w-md"
        >
            <div className="space-y-5">
                <InputItem
                    label={t('profile.fullNameEn')}
                    type="text"
                    name="fullName"
                    placeholder={t('profile.fullNameEnPlaceholder')}
                    defaultValue={user?.name || user?.fullName || ""}
                    errorMessage={errors.fullName}
                />
                <InputItem
                    label={t('profile.phoneNumber')}
                    type="tel"
                    name="phoneNumber"
                    placeholder={t('profile.phonePlaceholder')}
                    defaultValue={user?.phone || user?.phoneNumber || ""}
                    errorMessage={errors.phoneNumber}
                />
                <div>
                    <label htmlFor="address" className="block mb-2 font-bold text-sm text-text-primary-default-light dark:text-text-primary-default-dark">{t('profile.address')}</label>
                    <TextArea
                        name="address"
                        placeholder={t('profile.addressPlaceholder')}
                        defaultValue={user?.address || ""}
                        className="w-full px-4 py-2.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark focus:ring-2 focus:ring-border-accent-active-light dark:focus:ring-border-accent-active-dark focus:border-border-accent-active-light outline-none transition-all placeholder:text-text-secondary-default-light dark:placeholder:text-text-secondary-default-dark"
                    />
                    {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                </div>
            </div>
        </BaseFormComponent>
    );
}
