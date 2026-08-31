import { NavLink } from "react-router-dom";
import { useTranslation } from "react-i18next";
import useSidebar from "../../../hooks/useSidebar";
import { useEffect, useState, useRef } from "react";
import { getNavigationLinks } from "../../../data/student/navigationLinks";

import Aside from "../base/Aside";

import DropdownMenu from "../../ui/DropdownMenu";
import { BookIcon, AngleDownIcon, ChartBarIcon } from "../../ui/icons";


export default function StudentAside({height}) {
    const popupRef = useRef(null);
    const buttonRef = useRef(null);
    const { linkCls, isCompact } = useSidebar();
    const { t, i18n } = useTranslation('student/aside');
    const [isCoursesOpen, setIsCoursesOpen] = useState(false);
    
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (popupRef.current && !popupRef.current.contains(event.target) && 
                buttonRef.current && !buttonRef.current.contains(event.target)) {
                setIsCoursesOpen(false);
            }
        };

        if (isCoursesOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isCoursesOpen]);


    return (
        <Aside height={height} links={getNavigationLinks(t)}>
            <div className={`${isCoursesOpen ? `${!isCompact ? "ps-2 border-s-4 border-border-accent-default-light dark:border-border-accent-default-dark" : ""}` : "border-transparent"}`}>
                <div className="relative">
                    <button
                        ref={buttonRef}
                        onClick={() => setIsCoursesOpen(!isCoursesOpen)}
                        className="w-full flex items-center gap-3 p-2 rounded overflow-hidden border border-transparent text-text-secondary-active-light dark:text-text-secondary-active-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark hover:text-text-accent-hover-light dark:hover:text-text-accent-hover-dark hover:border-border-primary-hover-light dark:hover:border-border-primary-hover-dark"
                    >
                        <BookIcon className="w-5 h-5 shrink-0" />
                        {!isCompact && (
                            <>
                                <span className="text-base font-semibold whitespace-nowrap">{t('courses')}</span>
                                <AngleDownIcon className={`w-4 h-4 ms-auto shrink-0 transition-transform duration-200 ${isCoursesOpen ? "rotate-0" : (i18n.language === 'ar' ? "rotate-90" : "-rotate-90")}`} />
                            </>
                        )}
                    </button>
                  
                    {isCompact && isCoursesOpen &&
                        <DropdownMenu 
                            ref={popupRef}
                            position="end"    
                            direction="right"
                        >
                            <li>
                                <NavLink to="/courses" end className={({ isActive }) => linkCls(isActive)}>
                                    <span className="text-sm font-semibold whitespace-nowrap">{t('allCourses')}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/courses/registration" className={({ isActive }) => linkCls(isActive)}>
                                    <span className="text-sm font-semibold whitespace-nowrap">{t('courseRegistration')}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/courses/prerequisites" className={({ isActive }) => linkCls(isActive)}>
                                    <span className="text-sm font-semibold whitespace-nowrap">{t('coursePrerequisites')}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/courses/academic-progress" className={({ isActive }) => linkCls(isActive)}>
                                    <span className="text-sm font-semibold whitespace-nowrap">{t('academicProgress')}</span>
                                </NavLink>
                            </li>
                            <li>
                                <NavLink to="/courses/transcript" className={({ isActive }) => linkCls(isActive)}>
                                    <span className="text-sm font-semibold whitespace-nowrap">{t('transcript')}</span>
                                </NavLink>
                            </li>
                        </DropdownMenu> 
                    }
                </div>
              
                {!isCompact && 
                    <menu className={`${isCoursesOpen ? "flex" : "hidden"} flex-col ms-2 mt-2 mb-2 gap-2 w-[85%] text-sm`}>
                        <li>
                            <NavLink to="/courses" end className={({ isActive }) => linkCls(isActive)}>
                                <span className="text-base font-semibold whitespace-nowrap">{t('allCourses')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/courses/registration" className={({ isActive }) => linkCls(isActive)}>
                                <span className="text-base font-semibold whitespace-nowrap">{t('courseRegistration')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/courses/prerequisites" className={({ isActive }) => linkCls(isActive)}>
                                <span className="text-base font-semibold whitespace-nowrap">{t('coursePrerequisites')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/courses/academic-progress" className={({ isActive }) => linkCls(isActive)}>
                                <span className="text-base font-semibold whitespace-nowrap">{t('academicProgress')}</span>
                            </NavLink>
                        </li>
                        <li>
                            <NavLink to="/courses/transcript" className={({ isActive }) => linkCls(isActive)}>
                                <span className="text-base font-semibold whitespace-nowrap">{t('transcript')}</span>
                            </NavLink>
                        </li>
                    </menu>
                }
            </div>
        </Aside>
    );
}