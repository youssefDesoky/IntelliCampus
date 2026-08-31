import { useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import {
    InfoIcon,
    WarningIcon,
    CheckIcon,
    XIcon
} from './icons';

import Button from './Button';

export default function Dialog({ 
    isOpen, 
    variant = "success",
    children, 
    title,
    onClose, 
    onConfirm, 
    confirmText: confirmTextProp,
    cancelText: cancelTextProp,
    showCloseButton = false,
    preventCloseOnOverlayClick = false,
    autoCloseDuration,
}) {
    const { t } = useTranslation('common');
    const confirmText = confirmTextProp || t('confirm');
    const cancelText = cancelTextProp || t('cancel');
    const handleClose = useCallback(() => {
        onClose?.();
    }, [onClose]);

    useEffect(() => {
        if (isOpen && autoCloseDuration) {
            const timer = setTimeout(handleClose, autoCloseDuration);
            return () => clearTimeout(timer);
        }
    }, [isOpen, autoCloseDuration, handleClose]);

    useEffect(() => {
        const handleEscape = (e) => {
            if (e.key === 'Escape' && isOpen) handleClose();
        };
        document.addEventListener('keydown', handleEscape);
        return () => document.removeEventListener('keydown', handleEscape);
    }, [isOpen, handleClose]);

    const handleConfirm = useCallback(() => {
        const shouldClose = onConfirm ? onConfirm() : true;
        if (shouldClose !== false) handleClose();
    }, [onConfirm, handleClose]);

    const variantStyles = {
        info: {
            defaultTitle: t('error.note'),
            icon: <InfoIcon />,
            bgClass: "bg-bg-fill-info-default-light dark:bg-bg-fill-info-default-dark",
            buttonVariant: "primary"
        },
        warning: {
            defaultTitle: t('error.warning'),
            icon: <WarningIcon />,
            bgClass: "bg-bg-fill-warning-default-light dark:bg-bg-fill-warning-default-dark",
            buttonVariant: "warning"
        },
        error: {
            defaultTitle: t('error.title'),
            icon: <XIcon />,
            bgClass: "bg-bg-fill-danger-default-light dark:bg-bg-fill-danger-default-dark",
            buttonVariant: "danger"
        },
        success: {
            defaultTitle: t('error.success'),
            icon: <CheckIcon />,
            bgClass: "bg-bg-fill-success-default-light dark:bg-bg-fill-success-default-dark",
            buttonVariant: "success"
        },
    };

    if (!isOpen) return null;

    const config = variantStyles[variant] || variantStyles.info;
    const dialogTitle = title || config.defaultTitle;

    return (
        <div 
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/60 backdrop-blur-[2px] animate-fade-in"
          onClick={(e) => e.target === e.currentTarget && !preventCloseOnOverlayClick && handleClose()}
        >
            <div 
                className="relative w-full max-w-xs sm:max-w-sm bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-lg shadow-2xl transform pt-12 pb-8 px-8 animate-fade-in"
            >
                {/* Pop-out Icon Container */}
                <div 
                    className={`absolute p-2 -top-10 start-1/2 transform -translate-x-1/2 w-20 h-20 rounded-full flex items-center justify-center text-white shadow-lg ${config.bgClass}`}
                >
                    {config.icon}
                </div>

                {showCloseButton && (
                    <button
                        type="button"
                        onClick={handleClose}
                        className="absolute top-2 end-2 p-2 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark transition-colors z-10"
                    >
                        <XIcon size={20} />
                    </button>
                )}

                <div className="flex flex-col items-center text-center mt-2">
                    <h2 className="text-3xl font-semibold text-text-primary-default-light dark:text-text-primary-default-dark mb-4 tracking-wide">
                        {dialogTitle}
                    </h2>
                    
                    <div className="text-text-secondary-default-light dark:text-text-secondary-default-dark text-sm font-medium leading-relaxed mb-8">
                        {children}
                    </div>

                    <div className="w-full flex gap-3">
                        {(variant === "warning" || onConfirm) ? (
                            <>
                                <Button 
                                    variant="secondary"
                                    onClick={handleClose}
                                    width="flex-1"
                                >
                                    {cancelText}
                                </Button>
                                <Button 
                                    variant={config.buttonVariant}
                                    onClick={handleConfirm}
                                    width="flex-1"
                                >
                                    {confirmText}
                                </Button>
                            </>
                        ) : (
                            <Button 
                                variant={config.buttonVariant}
                                onClick={handleClose}
                                width="w-full"
                            >
                                {confirmText}
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}