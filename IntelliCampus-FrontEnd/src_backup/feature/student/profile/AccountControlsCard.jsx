import { useState } from "react";
import { useTranslation } from "react-i18next";
import { KeyIcon, EnvelopIcon } from "../../../components/ui/icons";
import ChangePasswordForm from "./ChangePasswordForm";
import ChangeRetrievalMailForm from "./ChangeRetrievalMailForm";

export default function AccountControlsCard({ className = "" }) {
    const { t } = useTranslation('student');
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isChangeRetrievalMailOpen, setIsChangeRetrievalMailOpen] = useState(false);

    const [preferences, setPreferences] = useState({
        email: true,
        notifications: false,
        push: false,
    });

    const togglePreference = (id) => {
        setPreferences((prev) => ({ ...prev, [id]: !prev[id] }));
    };

    const preferenceOptions = [
        { id: "email", label: t("profile.preferenceEmail") },
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
                                <label htmlFor={id} className="relative inline-flex items-center">
                                    <input
                                        type="checkbox"
                                        id={id}
                                        className="peer sr-only"
                                        checked={preferences[id]}
                                        onChange={() => togglePreference(id)}
                                    />
                                    <div className="h-5 w-9 rounded-full bg-bg-fill-secondary-default-light transition-colors peer-checked:bg-bg-fill-accent-default-light peer-focus:outline-none dark:bg-bg-fill-secondary-default-dark dark:peer-checked:bg-bg-fill-accent-default-dark after:absolute after:top-0.5 after:start-0.5 after:h-4 after:w-4 after:rounded-full after:bg-bg-fill-primary-default-light after:transition-transform after:content-[''] peer-checked:after:translate-x-4 dark:after:bg-bg-fill-primary-default-dark" />
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
