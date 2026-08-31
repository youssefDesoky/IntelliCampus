import useMediaQuery from './useMediaQuery';

export default function useDeviceType() {
  const isPhone = useMediaQuery('(max-width: 639px)');  
  const isTablet = useMediaQuery('(min-width: 640px) and (max-width: 1023px)');  
  const isDesktop = useMediaQuery('(min-width: 1024px)');  
  const isMobile = useMediaQuery('(max-width: 1023px)');

  return { isPhone, isTablet, isDesktop, isMobile };
}