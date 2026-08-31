import { useState } from "react";
import { useTranslation, Trans } from "react-i18next";
import BaseFormComponent from "../../../components/ui/BaseFormComponent";
import InputItem from "../../../components/form/InputItem";
import Button from "../../../components/ui/Button";
import { API_URL } from "../../../config/api";
import { useError } from "../../../contexts/ErrorContext.jsx";
import { useToast } from "../../../contexts/ToastContext.jsx";

export default function ChangeRetrievalMailForm({ isOpen, onClose }) {
    const { t } = useTranslation('student');
    const { showError } = useError();
    const { showToast } = useToast();
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [sendingCode, setSendingCode] = useState(false);
    const [codeSent, setCodeSent] = useState(false);
    const [newEmail, setNewEmail] = useState("");

    const handleClose = () => {
        setErrors({});
        setCodeSent(false);
        setNewEmail("");
        onClose();
    };

    const validateEmailFields = (currentPassword, newEmail, confirmEmail) => {
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
        return newErrors;
    };

    const handleSendCode = async (e) => {
        e.preventDefault();
        const form = e.currentTarget.closest("form");
        const formData = new FormData(form);
        const currentPassword = formData.get("currentPassword") || "";
        const confirmEmail = formData.get("confirmEmail") || "";

        const newErrors = validateEmailFields(currentPassword, newEmail, confirmEmail);
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSendingCode(true);
        try {
            const res = await fetch(`${API_URL}/api/auth/change-recovery-email/send-code`, {
                method: "POST",
                credentials: "include",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ currentPassword, newEmail }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                const message = body?.detail || body?.message || body?.title || `Failed to send code (${res.status})`;
                throw new Error(message);
            }

            setCodeSent(true);
            setErrors({});
            showToast({ type: "success", title: "Code Sent", message: "Check your new email for the 6-digit code." });
        } catch (err) {
            showError(err?.message || "Failed to send verification code.");
        } finally {
            setSendingCode(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const form = e.currentTarget;
        const formData = new FormData(form);
        const currentPassword = formData.get("currentPassword") || "";
        const confirmEmail = formData.get("confirmEmail") || "";
        const verificationCode = (formData.get("verificationCode") || "").trim();

        let newErrors = validateEmailFields(currentPassword, newEmail, confirmEmail);
        if (!codeSent) {
            newErrors.form = "Please send a verification code to your new email first.";
        }
        if (codeSent && !verificationCode) {
            newErrors.verificationCode = "Verification code is required.";
        } else if (verificationCode && !/^\d{6}$/.test(verificationCode)) {
            newErrors.verificationCode = "Enter the 6-digit code.";
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
                    verificationCode,
                }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => null);
                const message = body?.detail || body?.message || body?.title || `Failed to change recovery email (${res.status})`;
                throw new Error(message);
            }

            showToast({ type: "success", title: "Email Updated", message: "Your recovery email has been changed." });
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
            submitDisabled={submitting || !codeSent}
            submitLoading={submitting}
            maxWidth="max-w-md"
        >
            <div className="space-y-5">
                {errors.form && (
                    <div className="rounded-lg bg-red-50 dark:bg-red-950/40 px-3 py-2 text-xs font-semibold text-red-700 dark:text-red-300">
                        {errors.form}
                    </div>
                )}
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
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    errorMessage={errors.newEmail}
                />
                <InputItem
                    label={t("profile.confirmNewEmail")}
                    type="email"
                    name="confirmEmail"
                    placeholder={t("profile.reenterNewEmail")}
                    errorMessage={errors.confirmEmail}
                />

                <div className="flex flex-col gap-2">
                    <Button
                        type="button"
                        variant="secondary"
                        width="w-full"
                        disabled={sendingCode}
                        loading={sendingCode}
                        onClick={handleSendCode}
                    >
                        {codeSent ? t('profile.resendCode') : t('profile.sendCode')}
                    </Button>
                    {codeSent && (
                        <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <Trans t={t} i18nKey="profile.codeSentTo" values={{ email: newEmail || t('profile.yourNewEmail') }} components={{ strong: <strong /> }} />
                        </p>
                    )}
                </div>

                <InputItem
                    label="Verification Code"
                    type="text"
                    name="verificationCode"
                    placeholder="6-digit code"
                    maxLength={6}
                    errorMessage={errors.verificationCode}
                />
            </div>
        </BaseFormComponent>
    );
}