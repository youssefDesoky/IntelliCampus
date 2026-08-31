import { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import useDeviceType from '../hooks/useDeviceType';
import { CheckIcon, XIcon, WarningIcon, InfoIcon } from '../components/ui/icons';

const ToastContext = createContext();

let globalOnToast = null;

export function emitToast(toast) {
  if (globalOnToast) {
    globalOnToast(toast);
  }
}

export function useToast() {
  return useContext(ToastContext);
}

const typeStyles = {
  success: {
    icon: <CheckIcon />,
    bgClass: 'bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark',
    borderClass: 'border-bg-fill-success-default-light dark:border-bg-fill-success-default-dark',
  },
  error: {
    icon: <XIcon />,
    bgClass: 'bg-bg-fill-danger-default-light dark:bg-bg-fill-danger-default-dark',
    borderClass: 'border-bg-fill-danger-default-light dark:border-bg-fill-danger-default-dark',
  },
  warning: {
    icon: <WarningIcon />,
    bgClass: 'bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark',
    borderClass: 'border-bg-fill-warning-default-light dark:border-bg-fill-warning-default-dark',
  },
  info: {
    icon: <InfoIcon />,
    bgClass: 'bg-bg-fill-info-default-light dark:bg-bg-fill-info-default-dark',
    borderClass: 'border-bg-fill-info-default-light dark:border-bg-fill-info-default-dark',
  },
};

function ToastItem({ toast, onDismiss, onDismissAnimated, isDesktop, isExiting }) {
  const config = typeStyles[toast.type] || typeStyles.info;
  const [translateX, setTranslateX] = useState(0);
  const [dismissing, setDismissing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const touchStart = useRef({ x: 0, y: 0 });
  const swipeOffset = useRef(0);
  const isDragging = useRef(false);

  const isClickable = Boolean(toast.onClick || toast.actionUrl);

  const handleClick = () => {
    if (!isClickable || isDragging.current) return;

    if (toast.onClick) {
      toast.onClick();
    } else if (toast.actionUrl) {
      window.location.href = toast.actionUrl;
    }
    onDismissAnimated(toast.id);
  };

  const handleTouchStart = useCallback((e) => {
    if (isDesktop || dismissing || isExiting) return;
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    swipeOffset.current = 0;
    isDragging.current = false;
  }, [isDesktop, dismissing, isExiting]);

  const handleTouchMove = useCallback((e) => {
    if (isDesktop || dismissing || isExiting) return;
    const dx = e.touches[0].clientX - touchStart.current.x;
    const dy = e.touches[0].clientY - touchStart.current.y;

    if (!isDragging.current) {
      if (Math.abs(dx) > 10 && Math.abs(dx) > Math.abs(dy)) {
        isDragging.current = true;
        setDragging(true);
      } else {
        return;
      }
    }

    swipeOffset.current = dx;
    setTranslateX(dx);
  }, [isDesktop, dismissing, isExiting]);

  const handleTouchEnd = useCallback(() => {
    if (isDesktop || !isDragging.current) return;
    isDragging.current = false;
    setDragging(false);

    if (Math.abs(swipeOffset.current) > 80) {
      setDismissing(true);
      const dir = swipeOffset.current > 0 ? 1 : -1;
      setTranslateX(dir * window.innerWidth);
      setTimeout(() => onDismiss(toast.id), 200);
    } else {
      setTranslateX(0);
    }
  }, [isDesktop, onDismiss, toast.id]);

  const style = {
    transform: `translateX(${translateX}px)`,
    transition: dragging ? 'none' : 'transform 0.2s ease, opacity 0.2s ease',
    opacity: dismissing ? 0 : Math.max(0.4, 1 - Math.abs(translateX) / 200),
  };

  const animClass = isExiting
    ? (isDesktop ? 'animate-slide-out-right' : 'animate-fade-out-up')
    : (isDesktop ? 'animate-slide-in-right' : 'animate-fade-in-down');

  return (
    <div
      onClick={handleClick}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={style}
      className={`
        flex items-start gap-3 p-4 rounded-lg shadow-lg pointer-events-auto select-none
        bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark
        border-s-4 ${config.borderClass}
        ${isDesktop ? 'w-80' : 'max-w-sm w-full mx-auto'} ${animClass}
        ${isClickable ? 'cursor-pointer' : ''}
      `}
      role={isClickable ? 'button' : 'alert'}
      aria-label={isClickable ? 'Click to open' : undefined}
    >
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-white ${config.bgClass}`}>
        {config.icon}
      </div>
      <div className="flex-1 min-w-0">
        {toast.title && (
          <p className="font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark">
            {toast.title}
          </p>
        )}
        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-0.5">
          {toast.message}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDismissAnimated(toast.id);
        }}
        className="flex-shrink-0 p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors"
      >
        <XIcon size={16} />
      </button>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const [exitingIds, setExitingIds] = useState(new Set());
  const { isDesktop } = useDeviceType();
  const timersRef = useRef({});
  const exitingTimersRef = useRef({});

  const dismissToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    setExitingIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    if (exitingTimersRef.current[id]) {
      clearTimeout(exitingTimersRef.current[id]);
      delete exitingTimersRef.current[id];
    }
  }, []);

  const dismissToastAnimated = useCallback((id) => {
    if (timersRef.current[id]) {
      clearTimeout(timersRef.current[id]);
      delete timersRef.current[id];
    }
    setExitingIds(prev => new Set(prev).add(id));
    exitingTimersRef.current[id] = setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
      setExitingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
      delete exitingTimersRef.current[id];
    }, 300);
  }, []);

  const showToast = useCallback(({ title, message, type = 'info', duration = 4000, onClick, actionUrl }) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, title, message, type, duration, onClick, actionUrl }]);

    if (duration > 0) {
      timersRef.current[id] = setTimeout(() => {
        dismissToastAnimated(id);
      }, duration);
    }

    return id;
  }, [dismissToastAnimated]);

  useEffect(() => {
    globalOnToast = showToast;
    return () => { globalOnToast = null; };
  }, [showToast]);

  useEffect(() => {
    return () => {
      Object.values(timersRef.current).forEach(clearTimeout);
      Object.values(exitingTimersRef.current).forEach(clearTimeout);
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className={`
          fixed z-[100] pointer-events-none
          ${isDesktop
            ? 'top-20 end-4 flex flex-col gap-3'
            : 'top-4 start-0 end-0 flex flex-col items-center gap-3 px-4'
          }
        `}
      >
        {toasts.map(toast => (
          <ToastItem
            key={toast.id}
            toast={toast}
            onDismiss={dismissToast}
            onDismissAnimated={dismissToastAnimated}
            isDesktop={isDesktop}
            isExiting={exitingIds.has(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  );
}
