import { HouseIcon, UsersIcon, UserTieIcon, UserCheckIcon, BookIcon, FileLinesIcon, DoorOpenIcon, BuildingIcon, ClipboardCheckIcon } from '../../components/ui/icons';

export const getNavigationLinks = (t) => [
    { to: "/admin", icon: HouseIcon, label: t('dashboard'), roles: ["superadmin", "admin_bachelor", "admin_masters", "admin_phd", "admin_diploma", "admin_academicstaff"] },
    { to: "/admin/students", icon: UsersIcon, label: t('students'), roles: ["superadmin", "admin_bachelor", "admin_masters", "admin_phd", "admin_diploma"] },
    { to: "/admin/instructors", icon: UserTieIcon, label: t('instructors'), roles: ["superadmin", "admin_academicstaff"] },
    { to: "/admin/admins", icon: UserCheckIcon, label: t('admins'), roles: ["superadmin"] },
    { to: "/admin/courses", icon: BookIcon, label: t('courses'), roles: ["superadmin"] },
    { to: "/admin/rooms", icon: DoorOpenIcon, label: t('rooms'), roles: ["superadmin"] },
    { to: "/admin/departments", icon: BuildingIcon, label: t('departments'), roles: ["superadmin"] },
    { to: "/admin/bylaws", icon: FileLinesIcon, label: t('bylaws'), roles: ["superadmin"] },
    { to: "/admin/exams", icon: ClipboardCheckIcon, label: t('exams'), roles: ["superadmin"] },
];
