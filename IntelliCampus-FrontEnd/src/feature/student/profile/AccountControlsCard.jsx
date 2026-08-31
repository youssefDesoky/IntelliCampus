import { useState, useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";
import { KeyIcon, EnvelopIcon } from "../../../components/ui/icons";
import ChangePasswordForm from "./ChangePasswordForm";
import ChangeRetrievalMailForm from "./ChangeRetrievalMailForm";
import { fetchNotificationPreferences, updateNotificationPreferences } from "../../../api/notifications";

const FIELD_MAP = {
    notifications: "inAppNotificationsEnabled",
    push: "pushNotificationsEnabled",
};

export default function AccountControlsCard({ className = "" }) {
    const { t } = useTranslation('student');
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isChangeRetrievalMailOpen, setIsChangeRetrievalMailOpen] = useState(false);
    const [preferences, setPreferences] = useState(null);
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(null);
    const prefsRef = useRef(preferences);
    useEffect(() => { prefsRef.current = preferences; }, [preferences]);

    useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const data = await fetchNotificationPreferences();
                if (!cancelled) setPreferences(data);
            } catch {
                if (!cancelled) setPreferences({ inAppNotificationsEnabled: true, pushNotificationsEnabled: false });
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();
        return () => { cancelled = true; };
    }, []);

    const togglePreference = async (id) => {
        const field = FIELD_MAP[id];
        if (!field || updating) return;

        const current = prefsRef.current;
        const newValue = !current[field];
        const updated = { ...current, [field]: newValue };

        setUpdating(id);
        setPreferences(updated);

        try {
            const result = await updateNotificationPreferences(updated);
            if (result) setPreferences(result);
        } catch {
            setPreferences(prefsRef.current);
        } finally {
            setUpdating(null);
        }
    };

    const preferenceOptions = [
        { id: "notifications", label: t("profile.preferenceNotifications") },
        { id: "push", label: t("profile.preferencePush") },
    ];

    return (
        <>
            <div className={`rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark overflow-hidden shadow-xl ${className}`}>
                <div className="px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                    <p className="text-xs font-bold uppercase tracking-wider text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                        {t("profile.accountControls")}
                    </p>
                    <p className="text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1">
                        {t("profile.managePreferences")}
                    </p>
                </div>

                <div className="p-5">
                    <div className="grid grid-cols-1 gap-2.5">
                        {preferenceOptions.map(({ id, label }) => (
                            <div key={id} className="flex items-center justify-between rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-3.5 py-2.5">
                                <span className="text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark truncate">
                                    {label}
                                </span>
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input
                                        type="checkbox"
                                        className="peer sr-only"
                                        checked={preferences?.[FIELD_MAP[id]] ?? false}
                                        disabled={loading || updating === id}
                                        onChange={() => togglePreference(id)}
                                    />
                                    <div className={`h-5 w-9 rounded-full bg-gray-300 transition-colors peer-checked:bg-bg-fill-accent-default-light peer-focus:outline-none dark:bg-gray-600 dark:peer-checked:bg-bg-fill-accent-default-dark after:absolute after:top-0.5 after:start-0.5 after:h-4 after:w-4 after:rounded-full after:bg-white after:transition-transform after:content-[''] peer-checked:after:translate-x-4 rtl:peer-checked:after:-translate-x-4 dark:after:bg-white ${loading ? 'opacity-50' : ''}`} />
                                </label>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="px-5 pb-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <button
                        onClick={() => setIsChangePasswordOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-4 py-2.5 text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark transition-all hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark hover:shadow-sm"
                    >
                        <KeyIcon size={14} />
                        {t("profile.resetPassword")}
                    </button>
                    <button
                        onClick={() => setIsChangeRetrievalMailOpen(true)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-4 py-2.5 text-xs font-semibold text-text-primary-default-light dark:text-text-primary-default-dark transition-all hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark hover:shadow-sm"
                    >
                        <EnvelopIcon size={14} />
                        {t("profile.changeRetrievalMail")}
                    </button>
                </div>
            </div>

            <ChangePasswordForm
                isOpen={isChangePasswordOpen}
                onClose={() => setIsChangePasswordOpen(false)}
            />
            <ChangeRetrievalMailForm
                isOpen={isChangeRetrievalMailOpen}
                onClose={() => setIsChangeRetrievalMailOpen(false)}
            />
        </>
    );
}
