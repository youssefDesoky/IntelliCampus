import { useEffect, useRef } from 'react';
import { registerPushSubscription } from '../api/notifications';

const VAPID_PUBLIC_KEY = import.meta.env.VITE_VAPID_PUBLIC_KEY;

function urlBase64ToUint8Array(base64Url) {
    const padding = '='.repeat((4 - base64Url.length % 4) % 4);
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/') + padding;
    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export default function usePushNotifications(enabled = true) {
    const lastEndpoint = useRef(localStorage.getItem('push_endpoint'));

    useEffect(() => {
        if (!enabled) return;
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return;

        async function init() {
            try {
                const permission = await Notification.requestPermission();
                if (permission !== 'granted') return;

                const existingRegs = await navigator.serviceWorker.getRegistrations();
                for (const reg of existingRegs) {
                    const scriptUrl = reg.scriptURL || '';
                    if (scriptUrl.includes('firebase-messaging-sw')) {
                        await reg.unregister();
                    }
                }

                const swReg = await navigator.serviceWorker.register('/push-sw.js');
                await navigator.serviceWorker.ready;

                const existingSub = await swReg.pushManager.getSubscription();
                if (existingSub) {
                    await existingSub.unsubscribe();
                }

                const subscription = await swReg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
                });

                const subJson = subscription.toJSON();
                if (subJson.endpoint && subJson.endpoint !== lastEndpoint.current) {
                    await registerPushSubscription({
                        endpoint: subJson.endpoint,
                        keys: subJson.keys,
                        platform: navigator.platform,
                    });
                    localStorage.setItem('push_endpoint', subJson.endpoint);
                    lastEndpoint.current = subJson.endpoint;
                }
            } catch {
                // Fail silently — push is non-critical; in-app SSE fallback works
            }
        }

        init();
    }, [enabled]);
}
