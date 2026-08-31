import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';

export default function UpdateBanner() {
    const { t, i18n } = useTranslation('common');
    const [show, setShow] = useState(false);

    const handleUpdate = useCallback(() => {
        if (window.__updateSW) {
            window.__updateSW(true);
        }
        setShow(false);
    }, []);

    const handleDismiss = useCallback(() => {
        setShow(false);
    }, []);

    useEffect(() => {
        const handler = () => setShow(true);
        window.addEventListener('sw:updateReady', handler);
        return () => window.removeEventListener('sw:updateReady', handler);
    }, []);

    if (!show) return null;

    const isRTL = i18n.language === 'ar';

    return (
        <div className={`fixed bottom-4 ${isRTL ? 'left-4' : 'right-4'} z-[91] max-w-xs`}>
            <div className="bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-xl shadow-lg p-4 flex flex-col gap-3">
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark flex items-center justify-center shrink-0">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                            {t('update.title', 'Update Available')}
                        </p>
                        <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-0.5">
                            {t('update.message', 'A new version is ready. Refresh to update.')}
                        </p>
                    </div>
                    <button
                        onClick={handleDismiss}
                        className="shrink-0 p-1 text-icon-secondary-default-light dark:text-icon-secondary-default-dark hover:text-icon-secondary-hover-light dark:hover:text-icon-secondary-hover-dark"
                        aria-label={t('update.dismiss', 'Dismiss')}
                    >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18" />
                            <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                    </button>
                </div>
                <button
                    onClick={handleUpdate}
                    className="w-full px-4 py-2 text-sm font-medium rounded-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors"
                >
                    {t('update.confirm', 'Update Now')}
                </button>
            </div>
        </div>
    );
}
