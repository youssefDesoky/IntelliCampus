import { Form, NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSidebar from "../../../hooks/useSidebar";
import { SidebarIcon, SignOutIcon } from "../../ui/icons";

const pageNameStyle = "text-base font-semibold whitespace-nowrap";

const isPathActive = (to, pathname) =>
    to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(to + "/");

export default function Aside({ height, links=[], children }) {
    const { t } = useTranslation('ui');
    const { width, isCompact, toggleSidebar, linkCls } = useSidebar();
    const { pathname } = useLocation();

    if (!links) {
        return <p>{t('aside.noLinks')}</p>
    }

    const dashboardLink = links.find(link => link.to === "/instructor" || link.to === "/admin" || link.to === "/");
    const otherLinks = links.filter(link => link.to !== dashboardLink?.to);

    return (
        <aside 
            id="sidebar" 
            className={`lg:start-0 lg:flex-col lg:border-e fixed z-50 p-4 flex border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-active-light dark:text-text-primary-active-dark bottom-0 lg:bottom-auto border-t lg:border-t-0`}
            style={{ 
                height: `calc(100vh - ${ height }px)`,  
                top: `${ height }px`, 
                width: `${width}%`
            }}
        >
            <nav className="space-y-4 flex flex-col justify-start">
                <div
                    id="toggle-sidebar"
                    className="flex flex-row justify-end z-60 pb-2 border-b border-border-primary-default-light dark:border-border-primary-default-dark"
                >
                    <button 
                        className="p-2 hover:text-text-accent-hover-light dark:hover:text-text-accent-hover-dark"
                        onClick={toggleSidebar}
                    >
                        <SidebarIcon className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex flex-col gap-2">
                    {dashboardLink && (
                        <NavLink to={dashboardLink.to} end className={({ isActive }) => linkCls(isActive)}>                
                            { dashboardLink.icon && <dashboardLink.icon className="w-5 h-5 shrink-0" /> }
                            {!isCompact && <span className={pageNameStyle}>{ dashboardLink.label }</span>}
                        </NavLink>
                    )}

                    {children}

                    {otherLinks.map(({ to, label, icon: Icon }, index) => (
                        <NavLink 
                            key={index}
                            to={to} 
                            end={to === "/"}
                            className={({ isActive }) => linkCls(isActive || isPathActive(to, pathname))}
                        >
                            {Icon && <Icon className="w-5 h-5 shrink-0" />}
                            {!isCompact && <span className={pageNameStyle}>{label}</span>}
                        </NavLink>
                    ))}
                </div>

                <div className="z-60 pt-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark">
                    <Form method="post" action="/logout">
                        <button className="w-full p-2 flex items-center gap-3 border border-transparent rounded-md hover:border-border-primary-hover-light dark:hover:border-border-primary-hover-dark text-text-danger-default-light dark:text-text-danger-default-dark hover:text-text-danger-hover-light dark:hover:text-text-danger-hover-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark">
                            <SignOutIcon className="w-5 h-5 shrink-0" />
                            {!isCompact && <span className={pageNameStyle}>{t('aside.logout')}</span>}
                        </button>
                    </Form>
                </div>
            </nav>
        </aside>
    );
}