import { useState, useLayoutEffect } from 'react';
import { SidebarContext } from './SidebarContext';
import useDeviceType from '../hooks/useDeviceType';

export default function SidebarProvider({ children }) {
  const { isPhone, isTablet, isDesktop, isMobile } = useDeviceType();

  const [width, setWidth] = useState(() => {
    const savedWidth = localStorage.getItem('sidebar-width');
    return savedWidth ? parseInt(savedWidth) : 15;
  });

  const [isCompact, setIsCompact] = useState(() => {
    const savedWidth = localStorage.getItem('sidebar-width');
    return savedWidth ? parseInt(savedWidth) < 15 : false;
  });

  useLayoutEffect(() => {
    localStorage.setItem('sidebar-width', width);
  }, [width]);

  const toggleSidebar = () => {
    setWidth(width === 15 ? 4 : 15);
    setIsCompact(width === 15);
  };

  return (
    <SidebarContext.Provider value={{ 
      width, 
      isCompact, 
      isPhone,
      isTablet,
      isDesktop,
      isMobile, 
      setWidth, 
      setIsCompact, 
      toggleSidebar 
    }}>
      {children}
    </SidebarContext.Provider>
  );
}