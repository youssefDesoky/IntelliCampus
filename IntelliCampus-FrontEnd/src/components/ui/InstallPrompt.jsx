import { useState, useEffect, useCallback } from 'react';

export default function InstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState(null);

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;

    const handleInstall = useCallback(async () => {
        const prompt = deferredPrompt || window.__deferredPrompt;
        if (!prompt) return;
        prompt.prompt();
        const { outcome } = await prompt.userChoice;
        window.__deferredPrompt = null;
        setDeferredPrompt(null);
    }, [deferredPrompt]);

    useEffect(() => {
        const handler = (e) => {
            e.preventDefault();
            window.__deferredPrompt = e;
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);

        const poll = setInterval(() => {
            if (window.__deferredPrompt && !deferredPrompt) {
                setDeferredPrompt(window.__deferredPrompt);
            }
        }, 500);

        return () => {
            window.removeEventListener('beforeinstallprompt', handler);
            clearInterval(poll);
        };
    }, [deferredPrompt]);

    if (isStandalone) return null;

    return (
        <button
            onClick={handleInstall}
            className="fixed bottom-4 left-4 z-[90] flex items-center gap-2 px-5 py-3 rounded-xl shadow-lg bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark hover:bg-bg-fill-accent-hover-light dark:hover:bg-bg-fill-accent-hover-dark transition-colors text-sm font-medium"
        >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="7 10 12 15 17 10" />
                <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Install App
        </button>
    );
}
