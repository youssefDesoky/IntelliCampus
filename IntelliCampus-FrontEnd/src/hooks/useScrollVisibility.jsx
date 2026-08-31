import { useState, useEffect, useRef } from 'react';

const THRESHOLD = 10;

export default function useScrollVisibility() {
  const [visible, setVisible] = useState(true);
  const lastScrollY = useRef(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const delta = currentScrollY - lastScrollY.current;

      if (Math.abs(delta) < THRESHOLD) return;

      if (delta > 0 && currentScrollY > 50) {
        setVisible(false);
      } else if (delta < 0) {
        setVisible(true);
      }

      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return visible;
}
