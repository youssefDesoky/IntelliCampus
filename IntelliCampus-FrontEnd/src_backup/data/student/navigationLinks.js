import { HouseIcon, BellIconDark, CalendarDaysIcon, OrderedListIcon } from '../../components/ui/icons';

export const getNavigationLinks = (t) => [
    { to: "/", icon: HouseIcon, label: t('dashboard') },
    { to: "/reminders", icon: BellIconDark, label: t('reminders') },
    { to: "/schedule", icon: CalendarDaysIcon, label: t('schedule') },
    { to: "/specialization-preference", icon: OrderedListIcon, label: t('specializationPreference') },
];
