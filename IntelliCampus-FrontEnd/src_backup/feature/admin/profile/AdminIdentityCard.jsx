import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRevalidator } from "react-router-dom";
import {
    CameraIcon,
    HashIcon,
    HouseIcon,
    LocationDotIcon,
    MailIconDark,
    PenSquareIcon,
    PhoneIcon,
    UserCheckIcon,
    UserIcon,
} from "../../../components/ui/icons";
import Button from "../../../components/ui/Button";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { updateProfileImage } from "../services/profileApi";
import EditProfileForm from "./EditProfileForm";

export default function AdminIdentityCard({ user = {}, className = "", onProfileUpdate }) {
    const { t } = useTranslation('admin');
    const { revalidate } = useRevalidator();
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const { showError } = useError();
    const fileInputRef = useRef(null);

    useEffect(() => {
        setAvatarPreview(user?.avatar || "");
    }, [user?.avatar]);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const handleAvatarChange = async (e) => {
        const file = e.target.files?.[0];
        if (!file || uploadingAvatar) return;
        setAvatarPreview(URL.createObjectURL(file));
        setUploadingAvatar(true);
        try {
            await updateProfileImage(file);
            onProfileUpdate?.();
            revalidate();
        } catch (err) {
            showError(err?.message || t('profile.errorImage'));
            setAvatarPreview(user?.avatar || "");
        } finally {
            setUploadingAvatar(false);
        }
    };

    return (
        <>
            <div className={`rounded-3xl border border-border-primary-default-light/70 dark:border-border-primary-default-dark/70 bg-bg-surface-primary-default-light/80 dark:bg-bg-surface-primary-default-dark/80 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
                <div className="relative h-32 shrink-0 overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-bg-fill-accent-default-light via-bg-fill-accent-active-light to-blue-950 transition-transform duration-500 group-hover:scale-105" />
                    <div className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl" />
                    <div className="absolute -bottom-12 -start-12 w-40 h-40 rounded-full bg-blue-400/20 blur-3xl" />
                </div>

                <div className="relative -mt-14 px-6 z-10">
                    <div className="flex items-end gap-4">
                        <div className="relative shrink-0">
                            <div
                                onClick={handleAvatarClick}
                                className="w-24 h-24 rounded-2xl p-[2px] bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-xl cursor-pointer group/avatar"
                            >
                                <div className="relative w-full h-full rounded-2xl overflow-hidden bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt={t('profile.avatarAlt', { name: user.name })} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <UserIcon size={30} className="text-text-secondary-default-light dark:text-text-secondary-default-dark" />
                                        </div>
                                    )}
                                    <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                        <CameraIcon size={20} className="text-white" />
                                    </div>
                                </div>
                            </div>
                            {uploadingAvatar && (
                                <div className="absolute -bottom-1 start-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                                    {t('profile.uploading')}
                                </div>
                            )}
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleAvatarChange}
                                className="hidden"
                            />
                        </div>
                        <div className="pb-2 min-w-0 flex-1">
                            <h2 className="text-xl font-extrabold tracking-tight truncate text-text-primary-default-light dark:text-text-primary-default-dark">
                                {user.name}
                            </h2>
                            <div className="flex items-center gap-1.5 mt-1">
                                <UserCheckIcon size={12} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                                <p className="text-xs font-semibold truncate text-text-accent-default-light dark:text-text-accent-default-dark">
                                    {user.role}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="px-6 mt-4 flex-1 flex flex-col justify-center space-y-3">
                    <div className="flex items-center gap-2.5 text-sm">
                        <HouseIcon size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                        <span className="text-text-primary-default-light dark:text-text-primary-default-dark font-medium">{user.faculty || user.department || "—"}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                        <MailIconDark size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                        <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{user.email}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                        <PhoneIcon size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                        <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{user.phone}</span>
                    </div>
                    <div className="flex items-center gap-2.5 text-sm">
                        <LocationDotIcon size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                        <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{user.address}</span>
                    </div>
                </div>

                <div className="pt-4 pb-5 px-6 mt-2">
                    <Button
                        variant="primary"
                        width="w-full"
                        onClick={() => setIsEditProfileOpen(true)}
                        className="rounded-xl h-10 text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                    >
                        <PenSquareIcon size={13} />
                        {t('profile.identityCardEditButton')}
                    </Button>
                </div>
            </div>

            <EditProfileForm
                isOpen={isEditProfileOpen}
                onClose={() => setIsEditProfileOpen(false)}
                user={user}
                onSaved={onProfileUpdate}
            />
        </>
    );
}
