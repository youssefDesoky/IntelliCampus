import { useState, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { Link } from "react-router-dom";
import AuthLayout from "../../layout/AuthLayout";
import InputItem from "../../components/form/InputItem";
import SelectBox from "../../components/ui/SelectBox";
import Button from "../../components/ui/Button";
import Turnstile from "../../components/ui/Turnstile";
import ModelOverlay from "../../components/ui/ModelOverlay";
import { useToast } from "../../contexts/ToastContext.jsx";
import { fetchPublicFaculties, getCredentials } from "../../api/auth";
import { validateNationalId, validatePhoneNumber } from "../../feature/admin/utils/validation";

export default function GetCredentials() {
    const { t } = useTranslation('auth');
    const { showToast } = useToast();
    const [faculties, setFaculties] = useState([]);
    const [selectedFaculty, setSelectedFaculty] = useState(null);
    const [nationalId, setNationalId] = useState("");
    const [phone, setPhone] = useState("");
    const [errors, setErrors] = useState({});
    const [submitting, setSubmitting] = useState(false);
    const [turnstileToken, setTurnstileToken] = useState(null);
    const [result, setResult] = useState(null);
    const [showTurnstileModal, setShowTurnstileModal] = useState(false);

    useEffect(() => {
        fetchPublicFaculties()
            .then((data) => {
                const options = data.map((f) => ({ value: f.facultyId, label: f.facultyName }));
                setFaculties(options);
            })
            .catch(() => {});
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = {};

        const nationalIdErr = validateNationalId(nationalId);
        if (nationalIdErr) newErrors.nationalId = nationalIdErr;

        const phoneErr = validatePhoneNumber(phone);
        if (phoneErr) newErrors.phone = phoneErr;

        if (!selectedFaculty) newErrors.faculty = t('validation.required', { ns: 'common', field: t('getCredentials.facultyLabel') });

        setErrors(newErrors);
        if (Object.keys(newErrors).length > 0) return;

        setShowTurnstileModal(true);
    };

    const handleTurnstileVerify = (token) => {
        if (!token) return;
        setTurnstileToken(token);
        setShowTurnstileModal(false);
        submitCredentials(token);
    };

    const submitCredentials = async (token) => {
        setSubmitting(true);
        try {
            const data = await getCredentials({
                nationalId,
                phoneNumber: phone,
                facultyId: selectedFaculty.value,
                turnstileToken: token,
            });
            setResult(data);
            showToast({ type: "success", title: t('getCredentials.foundTitle'), message: t('getCredentials.foundMessage') });
        } catch (err) {
            setErrors({ form: err?.detail || err?.message || t('getCredentials.verifyFailed') });
        } finally {
            setSubmitting(false);
        }
    };

    if (result) {
        return (
            <AuthLayout title={t('getCredentials.resultTitle')} subtitle={t('getCredentials.resultSubtitle')} bgImageName="FrontLibNoPepole">
                <div className="space-y-6 text-center">
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 space-y-3">
                        <h3 className="text-lg font-semibold text-green-800 dark:text-green-200">{t('getCredentials.yourEmail')}</h3>
                        <p className="text-2xl font-bold text-green-700 dark:text-green-300 break-all">{result.email}</p>
                        <p className="text-sm text-green-600 dark:text-green-400">{result.message}</p>
                    </div>
                    <Link to="/login" className="text-blue-500 hover:text-blue-600 text-md block">
                        {t('getCredentials.goToLogin')}
                    </Link>
                </div>
            </AuthLayout>
        );
    }

    return (
        <AuthLayout title={t('getCredentials.title')} subtitle={t('getCredentials.subtitle')} bgImageName="FrontLibNoPepole">
            <form onSubmit={handleSubmit} className="space-y-5 mb-12">
                {errors.form && (
                    <div className="bg-red-100 text-red-700 p-3 rounded-md text-center">{errors.form}</div>
                )}

                <InputItem
                    label={t('getCredentials.nationalIdLabel')}
                    type="text"
                    name="nationalId"
                    placeholder={t('getCredentials.nationalIdPlaceholder')}
                    value={nationalId}
                    onChange={(e) => setNationalId(e.target.value)}
                    errorMessage={errors.nationalId}
                />

                <InputItem
                    label={t('getCredentials.phoneLabel')}
                    type="tel"
                    name="phone"
                    placeholder={t('getCredentials.phonePlaceholder')}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    errorMessage={errors.phone}
                />

                <SelectBox
                    className="w-full"
                    label={t('getCredentials.facultyLabel')}
                    name="facultyId"
                    labelDirection="flex-col"
                    options={faculties}
                    selectedOption={selectedFaculty}
                    onChange={setSelectedFaculty}
                />

                <Button type="submit" width="w-full" disabled={submitting} loading={submitting}>
                    {t('getCredentials.submit')}
                </Button>
            </form>

            <div className="text-center space-y-2">
                <Link to="/login" className="text-blue-500 hover:text-blue-600 text-md block">
                    {t('getCredentials.backToLogin')}
                </Link>
            </div>

            {showTurnstileModal && (
                <ModelOverlay onClose={() => setShowTurnstileModal(false)} maxWidth="max-w-sm">
                    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl">
                        <Turnstile onVerify={handleTurnstileVerify} />
                    </div>
                </ModelOverlay>
            )}
        </AuthLayout>
    );
}
