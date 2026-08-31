import { useState } from "react";
import { useTranslation } from "react-i18next";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import InputItem from "../../../components/form/InputItem";
import { API_URL } from "../../../config/api";
import { useError } from "../../../contexts/ErrorContext.jsx";

export default function ChangeRetrievalMailForm({ isOpen, onClose }) {
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
        const currentPassword = formData.get("currentPassword") || "";
        const newEmail = formData.get("newEmail") || "";
        const confirmEmail = formData.get("confirmEmail") || "";

        const newErrors = {};
        if (!currentPassword.trim()) newErrors.currentPassword = t("profile.currentPasswordRequired");
        if (!newEmail.trim()) {
            newErrors.newEmail = t("profile.newEmailRequired");
        } else if (!/\S+@\S+\.\S+/.test(newEmail)) {
            newErrors.newEmail = t("profile.invalidEmail");
        }
        if (!confirmEmail.trim()) {
            newErrors.confirmEmail = t("profile.confirmEmailRequired");
        } else if (newEmail && confirmEmail !== newEmail) {
            newErrors.confirmEmail = t("profile.emailsMismatch");
        }

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/change-recovery-email`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    currentPassword,
                    newEmail,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                const message = body?.detail || body?.message || body?.title || `Failed to change recovery email (${res.status})`;
                throw new Error(message);
            }

            handleClose();
        } catch (err) {
            showError(err?.message || t("profile.changeRecoveryEmailFailed"));
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <BaseFormComponent
            isOpen={isOpen}
            title={t("profile.changeRetrievalMail")}
            description={t("profile.changeRetrievalMailDescription")}
            onClose={handleClose}
            onSubmit={handleSubmit}
            submitText={t("profile.changeEmail")}
            submitDisabled={submitting}
            submitLoading={submitting}
            maxWidth="max-w-md"
        >
            <div className="space-y-5">
                <InputItem
                    label={t("profile.currentPassword")}
                    type="password"
                    name="currentPassword"
                    placeholder={t("profile.enterCurrentPassword")}
                    errorMessage={errors.currentPassword}
                />
                <InputItem
                    label={t("profile.newRecoveryEmail")}
                    type="email"
                    name="newEmail"
                    placeholder={t("profile.enterNewEmail")}
                    errorMessage={errors.newEmail}
                />
                <InputItem
                    label={t("profile.confirmNewEmail")}
                    type="email"
                    name="confirmEmail"
                    placeholder={t("profile.reenterNewEmail")}
                    errorMessage={errors.confirmEmail}
                />
            </div>
        </BaseFormComponent>
    );
}
