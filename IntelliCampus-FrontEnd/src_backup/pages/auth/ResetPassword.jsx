import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { useSearchParams, Link } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import InputItem from "../../components/form/InputItem";
import Button from "../../components/ui/Button";
import { useToast } from "../../contexts/ToastContext.jsx";
import { resetPassword } from "../../api/auth";

export default function ResetPassword() {
    const { t } = useTranslation('auth');
    const { showToast } = useToast();
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");
    const [done, setDone] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!token) {
            setError(t('resetPassword.invalidToken'));
            return;
        }
        const newErrors = {};
        if (!newPassword.trim() || newPassword.length < 6)
            newErrors.newPassword = t('validation.minLength', { ns: 'common', min: 6 });
        if (newPassword !== confirmPassword) newErrors.confirmPassword = t('validation.passwordMismatch', { ns: 'common' });
        if (Object.keys(newErrors).length > 0) {
            setError(Object.values(newErrors).join(". "));
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            await resetPassword({ token, newPassword, confirmPassword });
            setDone(true);
            showToast({ type: "success", title: t('resetPassword.doneTitle'), message: t('resetPassword.toastSuccess') });
        } catch (err) {
            setError(err?.detail || err?.message || t('resetPassword.toastError'));
        } finally {
            setSubmitting(false);
        }
    };

    if (done) {
        return (
            <AuthLayout title={t('resetPassword.doneTitle')} subtitle={t('resetPassword.doneSubtitle')} bgImageName="FullLibNoPeople">
                <div className="text-center space-y-4">
                    <p className="text-green-700 dark:text-green-300">{t('resetPassword.doneMessage')}</p>
                    <Link to="/login" className="text-blue-500 hover:text-blue-600 text-md block">
                        {t('resetPassword.backToLogin')}
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title={t('resetPassword.title')} subtitle={t('resetPassword.subtitle')} bgImageName="FullLibNoPeople">
            <form onSubmit={handleSubmit} className="space-y-5 mb-12">
                {error && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">{error}</div>
                )}
                <InputItem
                    label={t('resetPassword.newPasswordLabel')}
                    type="password"
                    name="password"
                    placeholder={t('resetPassword.newPasswordPlaceholder')}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                />

                <InputItem
                    label={t('resetPassword.confirmLabel')}
                    type="password"
                    name="confirmPassword"
                    placeholder={t('resetPassword.confirmPlaceholder')}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                />

                <Button type="submit" width="w-full" disabled={submitting} loading={submitting}>
                    {t('resetPassword.submit')}
                </Button>
            </form>

            <div className="text-center space-y-2">
                <Link to="/login" className="text-blue-500 hover:text-blue-600 text-md block">
                    {t('resetPassword.backToLogin')}
                </Link>
            </div>
        </AuthLayout>
    );
}
