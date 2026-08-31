import { NavLink } from "react-router-dom";
import useDeviceType from "../../../hooks/useDeviceType";

const baseStyles = (isActive, isMobile) => {
    if (isMobile) {
        return `whitespace-nowrap px-3 py-2 rounded-full text-sm font-medium transition-all duration-200 ${
            isActive
                ? 'bg-bg-surface-accent-default-light dark:bg-bg-surface-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark'
                : 'text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark'
        }`;
    }
    return `whitespace-nowrap px-4 py-2 border-b-2 font-medium transition-all duration-200 ${
        isActive
            ? 'border-border-accent-default-light dark:border-border-accent-default-dark text-text-accent-default-light dark:text-text-accent-default-dark'
            : 'border-transparent hover:border-border-tertiary-hover-light dark:hover:border-border-tertiary-hover-dark text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-default-light dark:hover:text-text-primary-default-dark'
    }`;
};

export default function CourseNavBar({ links }) {
    const { isMobile } = useDeviceType();

    return (
        <menu className={`flex flex-row gap-2 sm:gap-4 overflow-x-auto no-scrollbar mb-4 ${
            isMobile
                ? 'px-1'
                : 'border-b border-border-tertiary-default-light dark:border-border-tertiary-default-dark'
        }`}>
            {links.map((link) => (
                <NavLink key={link.to} to={link.to} end={link.end} className={({ isActive }) => baseStyles(isActive, isMobile)}>
                    {link.label}
                </NavLink>
            ))}
        </menu>
    );
}