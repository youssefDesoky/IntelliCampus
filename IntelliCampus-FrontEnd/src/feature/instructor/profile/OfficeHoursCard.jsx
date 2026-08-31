import { useTranslation } from "react-i18next";
import {
    ClockIcon,
    LocationDotIcon,
    DoorOpenIcon,
} from "../../../components/ui/icons";

export default function OfficeHoursCard({ user = {} }) {
    const { t } = useTranslation('instructor');
    const items = [
        { label: t('profile.room'), value: user.officeHoursRoom || "—", icon: DoorOpenIcon },
        { label: t('profile.location'), value: user.officeHoursLocation || "—", icon: LocationDotIcon },
    ];
    const hoursValue = t('profile.officeHoursValue');

    return (
        <div className="rounded-3xl border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-linear-to-r from-bg-surface-secondary-default-light to-bg-surface-primary-default-light dark:from-bg-surface-secondary-default-dark dark:to-bg-surface-primary-default-dark">
                <div>
                    <h3 className="text-sm font-bold text-text-primary-default-light dark:text-text-primary-default-dark">
                        {t('profile.officeHours')}
                    </h3>
                    <p className="text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-0.5">
                        {t('profile.officeHoursSub')}
                    </p>
                </div>
            </div>

            <div className="p-5 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {items.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.label} className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-accent-default-light dark:text-text-accent-default-dark">
                                    <Icon size={15} />
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                        {item.label}
                                    </p>
                                    <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mt-0.5 truncate">
                                        {item.value}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
                <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-accent-default-light dark:text-text-accent-default-dark">
                        <ClockIcon size={15} />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="text-[10px] font-bold uppercase tracking-wider text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                                        {t('profile.hours')}
                        </p>
                        <p className="text-sm font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mt-0.5 truncate">
                            {hoursValue}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}