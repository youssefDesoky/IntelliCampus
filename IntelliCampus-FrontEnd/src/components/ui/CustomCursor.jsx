import { useEffect, useRef, useState } from "react";
import { useTranslation } from 'react-i18next';

export default function CustomCursor() {
    const { t } = useTranslation('common');
    const cursorRef = useRef(null);
    const imgRef = useRef(null);
    const defaultSrc = "/cursors/FahimFinger.cur";
    const inputFallback = "/cursors/FahimAntenna.cur";  
    const [hasMouse] = useState(() => window.matchMedia('(pointer: fine)').matches);

    useEffect(() => {
        if (!hasMouse) return;

        new Image().src = defaultSrc;
        new Image().src = inputFallback;

        const moveCursor = (e) => {
            if (!cursorRef.current) return;
            cursorRef.current.style.transform = `translate3d(${e.clientX - 16}px, ${e.clientY - 16}px, 0)`;
            cursorRef.current.style.opacity = "1";
        };

        const hideCursor = () => {
            if (!cursorRef.current) return;
            cursorRef.current.style.opacity = "0";
        };

        const showCursor = () => {
            if (!cursorRef.current) return;
            cursorRef.current.style.opacity = "1";
            document.documentElement.style.cursor = "none";
            requestAnimationFrame(() => {
                document.documentElement.style.cursor = "";
            });
        };

        const handleDocMouseOut = (e) => {
            if (!e.relatedTarget && !e.toElement) hideCursor();
        };

        window.addEventListener("mousemove", moveCursor);
        document.addEventListener("mouseout", handleDocMouseOut);
        const handleVisibility = () => {
            if (document.hidden) hideCursor();
            else showCursor();
        };
        document.addEventListener("visibilitychange", handleVisibility);
        window.addEventListener("mouseenter", showCursor);
        window.addEventListener("focus", showCursor);

        return () => {
            window.removeEventListener("mousemove", moveCursor);
            document.removeEventListener("mouseout", handleDocMouseOut);
            document.removeEventListener("visibilitychange", handleVisibility);
            window.removeEventListener("mouseenter", showCursor);
            window.removeEventListener("focus", showCursor);
        };
    }, [hasMouse, defaultSrc, inputFallback]);

    useEffect(() => {
        if (!hasMouse) return;

        const inputSelector = "input:not([type='checkbox']):not([type='radio']), textarea, select, [data-cursor='input']";
        const clickableSelector = "button, a, label, input[type='checkbox'], input[type='radio'], [data-cursor='clickable']";

        const handleMouseOver = (e) => {
            if (!cursorRef.current || !imgRef.current) return;
            const target = e.target;

            const input = target.closest(inputSelector);
            if (input) {
                const src = input.getAttribute("data-cursor-src") || inputFallback;
                imgRef.current.src = src;
                imgRef.current.style.transform = "";
                cursorRef.current.classList.remove("clickable");
            } else if (target.closest(clickableSelector)) {
                imgRef.current.src = defaultSrc;
                imgRef.current.style.transform = "rotateY(0deg) rotateZ(-45deg)";
                cursorRef.current.classList.add("clickable");
            } else {
                imgRef.current.src = defaultSrc;
                imgRef.current.style.transform = "rotateY(180deg)";
                cursorRef.current.classList.remove("clickable");
            }
        };

        document.addEventListener("mouseover", handleMouseOver);

        return () => {
            document.removeEventListener("mouseover", handleMouseOver);
        };
    }, [hasMouse, defaultSrc, inputFallback]);

    if (!hasMouse) return null;

    return (
        <div
            ref={cursorRef}
            className="custom-cursor fixed top-0 left-0 w-10 h-10 pointer-events-none z-[99999] transition-opacity duration-200"
            style={{ opacity: 1 }}
        >
            <img
                ref={imgRef}
                src={defaultSrc}
                alt={t('labels.customCursor', 'Custom Cursor')}
                className="w-full h-full object-cover transform transition-transform duration-0 ease-linear rotate-y-180"
            />
        </div>
    );
}
