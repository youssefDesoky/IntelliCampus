import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import InputItem from "../../../components/form/InputItem";
import { useError } from "../../../contexts/ErrorContext.jsx";
import { changePassword } from "../services/profileApi";

export default function ChangePasswordForm({ isOpen, onClose }) {
    const navigate = useNavigate();
    const { t } = useTranslation('student');
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
        const oldPassword = formData.get("oldPassword") || "";
        const newPassword = formData.get("newPassword") || "";
        const confirmPassword = formData.get("confirmPassword") || "";

        const newErrors = {};
        if (!oldPassword.trim()) newErrors.oldPassword = t("profile.currentPasswordRequired");
        if (!newPassword.trim()) {
            newErrors.newPassword = t("profile.newPasswordRequired");
        } else if (newPassword.length < 6) {
            newErrors.newPassword = t("profile.passwordMinLength");
        }
        if (!confirmPassword.trim()) {
            newErrors.confirmPassword = t("profile.confirmPasswordRequired");
        } else if (newPassword && confirmPassword !== newPassword) {
            newErrors.confirmPassword = t("profile.passwordsMismatch");
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);
        try {
            await changePassword(oldPassword, newPassword);
            handleClose();
            navigate("/login");
        } catch (err) {
            showError(err?.message || t("profile.changePasswordFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t("profile.changePassword")}
            description={t("profile.changePasswordDescription")}
            onClose={handleClose}
            onSubmit={handleSubmit}
            submitText={t("profile.changePassword")}
            submitDisabled={submitting}
            submitLoading={submitting}
            maxWidth="max-w-md"
        >
            <div className="space-y-5">
                <InputItem
                    label={t("profile.currentPassword")}
                    type="password"
                    name="oldPassword"
                    placeholder={t("profile.enterCurrentPassword")}
                    errorMessage={errors.oldPassword}
                />
                <InputItem
                    label={t("profile.newPassword")}
                    type="password"
                    name="newPassword"
                    placeholder={t("profile.enterNewPassword")}
                    errorMessage={errors.newPassword}
                />
                <InputItem
                    label={t("profile.confirmPassword")}
                    type="password"
                    name="confirmPassword"
                    placeholder={t("profile.reenterNewPassword")}
                    errorMessage={errors.confirmPassword}
                />
            </div>
        </BaseFormComponent>
    );
}
