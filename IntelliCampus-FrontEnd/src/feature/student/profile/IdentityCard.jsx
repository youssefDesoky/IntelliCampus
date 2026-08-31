import { useCallback, useEffect, useRef, useState } from "react";
import { useRevalidator } from "react-router-dom";
import { useTranslation } from "react-i18next";
import BrandedQRCode from "../../../components/ui/BrandedQRCode";
import {
    UserIcon,
    UserTieIcon,
    MailIconDark,
    PhoneIcon,
    LocationDotIcon,
    HouseIcon,
    QRCodeIcon,
    ArrowRotateRightIcon,
    PenSquareIcon,
    CameraIcon,
} from "../../../components/ui/icons";
import Button from "../../../components/ui/Button";
import { useError } from '../../../contexts/ErrorContext.jsx';
import EditProfileForm from "./EditProfileForm";
import { updateProfileImage, generateAttendanceQr as generateAttendanceQrApi } from "../services/profileApi";
import useArabicDigits from "../../../hooks/useArabicDigits";

export default function IdentityCard({ user, className = "", onProfileUpdate }) {
    const { t } = useTranslation('student');
    const { convert: ar } = useArabicDigits();
    const { revalidate } = useRevalidator();
    const [isFlipped, setIsFlipped] = useState(false);
    const [qrPayload, setQrPayload] = useState(user.qrCode || "");
    const [isGeneratingQr, setIsGeneratingQr] = useState(false);
    const { showError } = useError();
    const [isExpired, setIsExpired] = useState(false);
    const [countdown, setCountdown] = useState(30);
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || "");
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
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
            showError(err?.message || t("profile.updateImageFailed"));
            setAvatarPreview(user?.avatar || "");
        } finally {
            setUploadingAvatar(false);
        }
    };

    useEffect(() => {
        if (!isFlipped || countdown <= 0) return;
        const timer = setInterval(() => {
            setCountdown((prev) => {
                if (prev <= 1) {
                    setIsExpired(true);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, [isFlipped, countdown]);

    const generateAttendanceQr = useCallback(async () => {
        if (isGeneratingQr) return;

        setIsGeneratingQr(true);
        setIsExpired(false);

        try {
            const data = await generateAttendanceQrApi();
            const qrPayload = data.qrPayload ?? data.QrPayload;
            const expiresInSeconds = data.expiresInSeconds ?? data.ExpiresInSeconds ?? 15;

            if (!qrPayload) {
                throw new Error(t("profile.qrPayloadError"));
            }

            setQrPayload(qrPayload);
            setCountdown(expiresInSeconds);
            setIsFlipped(true);
        } catch (error) {
            showError(error.message || t("profile.qrGenerateFailed"));
        } finally {
            setIsGeneratingQr(false);
        }
    }, [isGeneratingQr]);

    return (
        <>
        <div className={`group perspective-distant min-h-[28rem] h-full ${className}`}>
            <div
                className={`relative w-full h-full transition-all duration-700 ease-[cubic-bezier(0.4,0,0.2,1)] preserve-3d ${isFlipped ? "rotate-y-180" : ""}`}
                style={{ transformStyle: "preserve-3d", transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)" }}
            >
                {/* FRONT: Profile Overview */}
                <div
                    className="group relative w-full h-full rounded-3xl border border-border-primary-default-light/70 dark:border-border-primary-default-dark/70 bg-bg-surface-primary-default-light/80 dark:bg-bg-surface-primary-default-dark/80 backdrop-blur-xl overflow-hidden shadow-2xl flex flex-col"
                    style={{ backfaceVisibility: "hidden" }}
                >
                    {/* Header Cover */}
                    <div className="relative h-32 shrink-0 overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-bg-fill-accent-default-light via-bg-fill-accent-active-light to-blue-950 transition-transform duration-500 group-hover:scale-105" />
                        <div className="absolute -top-10 -end-10 w-48 h-48 rounded-full bg-white/10 blur-2xl group-hover:scale-120 transition-transform duration-700 ease-out" />
                        <div className="absolute -bottom-12 -start-12 w-40 h-40 rounded-full bg-blue-400/20 blur-3xl" />
                        <button
                            onClick={generateAttendanceQr}
                            disabled={isGeneratingQr}
                            className="absolute top-4 end-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark border border-border-primary-default-light dark:border-border-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-xs font-semibold transition-all shadow-sm"
                        >
                            <QRCodeIcon size={14} className={isGeneratingQr ? "animate-spin" : ""} />
                            <span className="hidden sm:inline">{isGeneratingQr ? t("profile.generating") : t("profile.qrCheckIn")}</span>
                        </button>
                    </div>

                    {/* Avatar + Identity */}
                    <div className="relative -mt-14 px-6 z-10">
                        <div className="flex items-center gap-4">
                            <div className="relative shrink-0">
                                <div
                                    onClick={handleAvatarClick}
                                    className="w-24 h-24 rounded-2xl p-[2px] bg-gradient-to-tr from-blue-500 to-cyan-400 shadow-xl cursor-pointer group/avatar"
                                >
                                    <div className="relative w-full h-full rounded-2xl overflow-hidden bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark">
                                        <img src={avatarPreview} alt={t("profile.avatarAlt", { name: user.name })} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover/avatar:opacity-100 transition-opacity">
                                            <CameraIcon size={20} className="text-white" />
                                        </div>
                                    </div>
                                </div>
                                {uploadingAvatar && (
                                    <div className="absolute -bottom-1 start-1/2 -translate-x-1/2 bg-black/70 text-white text-[10px] px-2 py-0.5 rounded-full whitespace-nowrap">
                                        {t("profile.uploading")}
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
                            <div className="min-w-0 flex-1">
                                <h2 className="text-xl font-extrabold tracking-tight truncate text-white drop-shadow-md">
                                    {user.name}
                                </h2>
                                <div className="flex items-center gap-1.5 mt-1">
                                    <UserTieIcon size={12} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                                    <p className="text-xs font-semibold truncate text-text-accent-default-light dark:text-text-accent-default-dark">
                                        {user.department || "–"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* User Data */}
                    <div className="px-6 mt-4 flex-1 flex flex-col justify-center space-y-3">
                        <div className="flex items-center gap-2.5 text-sm">
                            <HouseIcon size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                            <span className="text-text-primary-default-light dark:text-text-primary-default-dark font-medium">{user.faculty}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                            <MailIconDark size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                            <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{user.email}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                            <PhoneIcon size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                            <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{ar(user.phone)}</span>
                        </div>
                        <div className="flex items-center gap-2.5 text-sm">
                            <LocationDotIcon size={14} className="text-text-accent-default-light dark:text-text-accent-default-dark shrink-0" />
                            <span className="text-text-secondary-default-light dark:text-text-secondary-default-dark">{user.address}</span>
                        </div>
                    </div>

                    {/* Footer Action */}
                    <div className="pt-4 pb-5 px-6 mt-2">
                        <Button
                            variant="primary"
                            width="w-full"
                            onClick={() => setIsEditProfileOpen(true)}
                            className="rounded-xl h-10 text-xs font-bold shadow-md hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
                        >
                            <PenSquareIcon size={13} />
                            {t("profile.editProfileDetails")}
                        </Button>
                    </div>
                </div>

                {/* BACK: QR Code */}
                <div
                    className="absolute inset-0 w-full h-full backface-hidden rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark shadow-xl rotate-y-180 flex flex-col"
                    style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
                >
                    <div className="relative flex-1 flex flex-col px-6 pt-4 pb-6 bg-linear-to-b from-bg-surface-primary-default-light dark:from-bg-surface-primary-default-dark to-bg-surface-secondary-default-light dark:to-bg-surface-secondary-default-dark">
                        <button
                            onClick={() => setIsFlipped(false)}
                            className="absolute top-4 end-4 z-10 flex items-center gap-2 px-3 py-2 rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark hover:bg-bg-surface-primary-hover-light dark:hover:bg-bg-surface-primary-hover-dark border border-border-primary-default-light dark:border-border-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark text-xs font-semibold transition-all"
                        >
                            <UserIcon size={14} />
                            <span className="hidden sm:inline">{t("profile.showProfile")}</span>
                        </button>

                        <div className="text-start mb-2">
                            <h3 className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{t("profile.attendanceQrCode")}</h3>
                            <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">{t("profile.qrScanInstruction")}</p>
                        </div>

                        <div className="flex-1 flex items-center justify-center min-h-0">
                            <div className="rounded-3xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-lg border border-border-primary-default-light dark:border-border-primary-default-dark flex items-center justify-center p-2 max-w-full">
                                <div className="relative inline-flex">
                                    <BrandedQRCode token={qrPayload} />
                                    {isExpired && (
                                        <button
                                            type="button"
                                            onClick={generateAttendanceQr}
                                            disabled={isGeneratingQr}
                                            className="absolute inset-0 rounded-2xl bg-white/40 dark:bg-black/40 backdrop-blur-sm flex items-center justify-center transition-colors hover:bg-white/30 dark:hover:bg-black/30"
                                        >
                                            <ArrowRotateRightIcon size={50} className="text-white text-sm scale-x-[-1]" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
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
