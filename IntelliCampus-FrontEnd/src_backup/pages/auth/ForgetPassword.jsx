import { useState } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import InputItem from "../../components/form/InputItem";
import Button from "../../components/ui/Button";
import Turnstile from "../../components/ui/Turnstile";
import { forgotPassword } from "../../api/auth";

export default function ForgetPassword() {
    const { t } = useTranslation('auth');
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email.trim()) {
            setError("Email is required");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            await forgotPassword({ email, turnstileToken });
            setSent(true);
        } catch (err) {
            setError(err?.detail || err?.message || "Request failed. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <AuthLayout
            title={t('forgotPassword.title')}
            subtitle={t('forgotPassword.subtitle')}
            bgImageName="FrontLibNoPepole"
        >
            {sent ? (
                <div className="space-y-6 text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6">
                        <p className="text-green-700 dark:text-green-300">
                            {t('forgotPassword.successMessage')}
                        </p>
                    </div>
                    <Link to="/login" className="text-blue-500 hover:text-blue-600 text-md block">
                        {t('forgotPassword.backToLogin')}
                    </Link>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-5 mb-12">
                    {error && (
                        <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">{error}</div>
                    )}
                    <InputItem
                        label={t('forgotPassword.emailLabel')}
                        type="email"
                        name="email"
                        placeholder={t('forgotPassword.emailPlaceholder')}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    >
                    </InputItem>
                    <div className="flex justify-center">
                        <Turnstile onVerify={setTurnstileToken} />
                    </div>
                    <Button type="submit" width="w-full" disabled={submitting} loading={submitting}>
                        {t('forgotPassword.submit')}
                    </Button>
                </form>
            )}

            <div className="text-center space-y-2">
                <Link to="/login" className="text-blue-500 hover:text-blue-600 text-md block">
                    {t('forgotPassword.rememberedPassword')}
                </Link>
                <Link to="/get-credentials" className="text-gray-500 hover:text-gray-600 text-sm block">
                    {t('forgotPassword.dontKnowEmail')}
                </Link>
            </div>
        </AuthLayout>
    );
}
