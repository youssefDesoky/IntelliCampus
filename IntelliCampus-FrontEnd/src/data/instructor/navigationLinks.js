import { HouseIcon, BellIconDark, CalendarDaysIcon, BookIcon, ChartLineIcon } from '../../components/ui/icons';

export const getNavigationLinks = (t) => [
    { to: "/instructor", icon: HouseIcon, label: t('dashboard') },
    { to: "/instructor/reminders", icon: BellIconDark, label: t('reminders') },
    { to: "/instructor/schedule", icon: CalendarDaysIcon, label: t('schedule') },
    { to: "/instructor/courses", icon: BookIcon, label: t('courses') },
];
