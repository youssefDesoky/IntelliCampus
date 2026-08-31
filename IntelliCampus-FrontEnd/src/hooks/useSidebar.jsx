import { useContext } from 'react';
import { SidebarContext } from '../contexts/SidebarContext';

export default function useSidebar() {
  const context = useContext(SidebarContext);
  if (!context) {
    throw new Error('useSidebar must be used within SidebarProvider');
  }

  const { width } = context;

  const linkCls = (isActive) => {
    const activePart = isActive ?
        `bg-bg-fill-primary-active-light dark:bg-bg-fill-primary-active-dark text-text-accent-active-light dark:text-text-accent-active-dark ${width >= 15 ? "transform translate-x-2" : ""} active-link` :
        "border border-transparent text-text-secondary-active-light dark:text-text-secondary-active-dark hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark hover:text-text-accent-hover-light dark:hover:text-text-accent-hover-dark hover:border-border-primary-hover-light dark:hover:border-border-primary-hover-dark";
    
    return `flex items-center gap-3 p-2 rounded overflow-hidden ${activePart}`;
  };

  return { ...context, linkCls };
}