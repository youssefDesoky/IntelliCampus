import { HouseIcon, BellIconDark, CalendarDaysIcon, OrderedListIcon } from '../../components/ui/icons';

export const getNavigationLinks = (t, roles = []) => {
    const isBachelor = roles.some(r => r.toLowerCase() === "student_bachelor");

    return [
        { to: "/", icon: HouseIcon, label: t('dashboard') },
        { to: "/reminders", icon: BellIconDark, label: t('reminders') },
        { to: "/schedule", icon: CalendarDaysIcon, label: t('schedule') },
        ...(isBachelor ? [{ to: "/department-preference", icon: OrderedListIcon, label: t('departmentPreference') }] : []),
    ];
};
