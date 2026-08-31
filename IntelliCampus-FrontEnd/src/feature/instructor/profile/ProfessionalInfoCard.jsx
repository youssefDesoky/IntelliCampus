import { useTranslation } from "react-i18next";
import useArabicDigits from "../../../hooks/useArabicDigits.js";
import {
    BookIcon,
    CalendarDaysIcon,
    HashIcon,
    StarIcon,
} from "../../../components/ui/icons";

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark ${className}`} />;
}

export default function ProfessionalInfoCard({ user = {}, loading = false }) {
    const { t } = useTranslation('instructor');
    const { convert: ar } = useArabicDigits();
    const infoFields = [
        { label: t('profile.instructorCode'), value: user.instructorCode ? ar(user.instructorCode) : (user.instructorId ? ar(user.instructorId) : "–"), icon: HashIcon },
        { label: t('profile.department'), value: user.department || user.departmentName || "–", icon: BookIcon },
        { label: t('profile.joined'), value: user.joinedDate || user.enrollmentDate || "–", icon: CalendarDaysIcon },
    ];

    return (
        <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-linear-to-r from-bg-surface-secondary-default-light to-bg-surface-primary-default-light dark:from-bg-surface-secondary-default-dark dark:to-bg-surface-primary-default-dark">
                <div>
                    <h3 className="text-sm font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('profile.professionalInfo')}
                    </h3>
                    <p className="text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
                        {t('profile.professionalInfoSub')}
                    </p>
                </div>
            </div>

            <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                {loading ? (
                    <>
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                                <Skeleton className="h-9 w-9 shrink-0 rounded-xl" />
                                <div className="min-w-0 flex-1 space-y-2">
                                    <Skeleton className="h-3 w-16" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    infoFields.map((field) => {
                        const Icon = field.icon;
                        return (
                            <div
                                key={field.label}
                                className="flex items-center gap-3.5 p-3.5 rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark hover:border-border-accent-default-light dark:hover:border-border-accent-default-dark transition-all group"
                            >
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-accent-default-light dark:text-text-accent-default-dark group-hover:scale-105 transition-transform">
                                    <Icon size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                        {field.label}
                                    </p>
                                    <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mt-0.5 truncate">
                                        {field.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
}
