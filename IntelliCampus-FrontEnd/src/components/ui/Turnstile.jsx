import { useEffect, useRef } from "react";

const SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY || "1x00000000000000000000AA"; // invisible test key

export default function Turnstile({ onVerify }) {
    const containerRef = useRef(null);
    const widgetIdRef = useRef(null);
    const callbackRef = useRef(onVerify);
    callbackRef.current = onVerify;

    useEffect(() => {
        const scriptId = "cf-turnstile-script";

        const initWidget = () => {
            if (!containerRef.current || !window.turnstile) return;
            widgetIdRef.current = window.turnstile.render(containerRef.current, {
                sitekey: SITE_KEY,
                callback: (token) => callbackRef.current?.(token),
                "expired-callback": () => callbackRef.current?.(null),
            });
        };

        if (!document.getElementById(scriptId)) {
            const script = document.createElement("script");
            script.id = scriptId;
            script.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
            script.async = true;
            script.defer = true;
            script.onload = initWidget;
            document.body.appendChild(script);
        } else {
            initWidget();
        }

        return () => {
            if (widgetIdRef.current && window.turnstile) {
                window.turnstile.remove(widgetIdRef.current);
            }
        };
    }, []);

    return <div ref={containerRef} />;
}
