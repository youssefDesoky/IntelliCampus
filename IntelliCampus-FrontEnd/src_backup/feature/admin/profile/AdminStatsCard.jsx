import { useTranslation } from "react-i18next";
import {
    CheckIcon,
    StarIcon,
    UserCheckIcon,
} from "../../../components/ui/icons";

function Skeleton({ className = "" }) {
    return <div className={`animate-pulse rounded bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark ${className}`} />;
}

export default function AdminStatsCard({ user = {}, loading = false }) {
    const { t } = useTranslation('admin');
    const isSuperAdmin = (user.roles || []).some(r => r.toLowerCase() === "superadmin");

    const stats = [
        { label: t('profile.statsCardRoleLabel'), value: isSuperAdmin ? t('profile.statsCardSuperAdmin') : t('profile.statsCardAdmin'), color: "text-purple-500", icon: UserCheckIcon },
        { label: t('profile.statsCardStatusLabel'), value: t('profile.statsCardActive'), color: "text-emerald-500", icon: CheckIcon },
        { label: t('profile.statsCardAccountTypeLabel'), value: t('profile.statsCardAdministrative'), color: "text-blue-500", icon: StarIcon },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {loading
                ? [1, 2, 3].map((i) => (
                      <div key={i} className="flex items-center gap-3 p-4 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                          <Skeleton className="h-10 w-10 shrink-0 rounded-lg" />
                          <div className="space-y-2 flex-1">
                              <Skeleton className="h-3 w-16" />
                              <Skeleton className="h-5 w-12" />
                          </div>
                      </div>
                  ))
                : stats.map((stat) => (
                      <div key={stat.label} className="flex items-center gap-3 p-4 rounded-2xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color} bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark`}>
                              <stat.icon size={18} />
                          </div>
                          <div>
                              <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary-default-light dark:text-text-tertiary-default-dark">{stat.label}</p>
                              <p className="text-lg font-bold text-text-primary-default-light dark:text-text-primary-default-dark">{stat.value}</p>
                          </div>
                      </div>
                  ))}
        </div>
    );
}
