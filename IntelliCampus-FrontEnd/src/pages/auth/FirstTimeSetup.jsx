import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useNavigate } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import InputItem from "../../components/form/InputItem";
import Button from "../../components/ui/Button";
import { useToast } from "../../contexts/ToastContext.jsx";
import { sendVerificationCode, firstTimeSetup } from "../../api/auth";

export default function FirstTimeSetup() {
    const { t } = useTranslation('auth');
    const { showToast } = useToast();
    const navigate = useNavigate();
    const [step, setStep] = useState(1); // 1 = enter email, 2 = verify + new password
    const [recoveryEmail, setRecoveryEmail] = useState("");
    const [verificationCode, setVerificationCode] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [codeSent, setCodeSent] = useState(false);

    const handleSendCode = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!recoveryEmail.trim() || !/\S+@\S+\.\S+/.test(recoveryEmail))
            newErrors.recoveryEmail = t('validation.invalidEmail', { ns: 'common' });
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);
        try {
            await sendVerificationCode({ recoveryEmail });
            setCodeSent(true);
            setStep(2);
            showToast({ type: "success", title: t('firstTimeSetup.codeSentTitle'), message: t('firstTimeSetup.codeSentMessage') });
        } catch (err) {
            setErrors({ form: err?.detail || err?.message || t('firstTimeSetup.sendCodeFailed') });
        } finally {
            setSubmitting(false);
        }
    };

    const handleSetup = async (e) => {
        e.preventDefault();
        const newErrors = {};
        if (!verificationCode.trim()) newErrors.verificationCode = t('validation.required', { ns: 'common', field: t('firstTimeSetup.verificationCodeLabel') });
        if (!newPassword.trim()) newErrors.newPassword = t('validation.required', { ns: 'common', field: t('resetPassword.newPasswordLabel') });
        else if (newPassword.length < 6) newErrors.newPassword = t('validation.minLength', { ns: 'common', min: 6 });
        if (newPassword !== confirmPassword) newErrors.confirmPassword = t('validation.passwordMismatch', { ns: 'common' });
        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setSubmitting(true);
        try {
            await firstTimeSetup({
                recoveryEmail,
                verificationCode,
                newPassword,
                confirmPassword,
            });
            showToast({ type: "success", title: t('firstTimeSetup.doneTitle'), message: t('firstTimeSetup.doneMessage') });
            setTimeout(() => navigate("/login"), 1000);
        } catch (err) {
            setErrors({ form: err?.detail || err?.message || t('firstTimeSetup.setupFailed') });
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title={t(step === 1 ? 'firstTimeSetup.title' : 'firstTimeSetup.step2Title')}
            subtitle={t(step === 1 ? 'firstTimeSetup.subtitle' : 'firstTimeSetup.step2Subtitle')}
            bgImageName="FullLibNoPeople"
        >
            {step === 1 && (
                <form onSubmit={handleSendCode} className="space-y-5 mb-12">
                    {errors.form && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">{errors.form}</div>
                    )}
                    <InputItem
                        label={t('firstTimeSetup.emailLabel')}
                        type="email"
                        name="recoveryEmail"
                        placeholder={t('firstTimeSetup.emailPlaceholder')}
                        value={recoveryEmail}
                        onChange={(e) => setRecoveryEmail(e.target.value)}
                        errorMessage={errors.recoveryEmail}
                    />
                    <Button type="submit" width="w-full" disabled={submitting} loading={submitting}>
                        {t('firstTimeSetup.sendCode')}
                    </Button>
                </form>
            )}

            {step === 2 && (
                <form onSubmit={handleSetup} className="space-y-5 mb-12">
                    {errors.form && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">{errors.form}</div>
                    )}
                    <InputItem
                        label={t('firstTimeSetup.verificationCodeLabel')}
                        type="text"
                        name="verificationCode"
                        placeholder={t('firstTimeSetup.verificationCodePlaceholder')}
                        value={verificationCode}
                        onChange={(e) => setVerificationCode(e.target.value)}
                        errorMessage={errors.verificationCode}
                    />
                    <InputItem
                        label={t('resetPassword.newPasswordLabel')}
                        type="password"
                        name="newPassword"
                        placeholder={t('resetPassword.newPasswordPlaceholder')}
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        errorMessage={errors.newPassword}
                    />
                    <InputItem
                        label={t('resetPassword.confirmLabel')}
                        type="password"
                        name="confirmPassword"
                        placeholder={t('resetPassword.confirmPlaceholder')}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        errorMessage={errors.confirmPassword}
                    />
                    <Button type="submit" width="w-full" disabled={submitting} loading={submitting}>
                        {t('firstTimeSetup.completeSetup')}
                    </Button>
                </form>
            )}
        </AuthLayout>
    );
}
