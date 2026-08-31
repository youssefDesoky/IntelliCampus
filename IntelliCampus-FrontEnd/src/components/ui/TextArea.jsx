import { useEffect, useRef } from "react";
import { useTranslation } from "react-i18next";

export default function TextArea({ minHeight = 80, maxHeight = 300, className = "", style, ...props }) {
    const ref = useRef(null);
    const { i18n } = useTranslation();
    const isRTL = i18n.language === 'ar';

    useEffect(() => {
        const textarea = ref.current;
        if (!textarea) return;

        const resize = () => {
            textarea.style.height = "auto";
            const newHeight = Math.min(Math.max(textarea.scrollHeight, minHeight), maxHeight);
            textarea.style.height = `${newHeight}px`;
        };

        resize();
        textarea.addEventListener("input", resize);
        return () => textarea.removeEventListener("input", resize);
    }, [minHeight, maxHeight, props.value]);

    return (
        <textarea
            ref={ref}
            dir={isRTL ? 'rtl' : 'ltr'}
            style={{ minHeight, maxHeight, overflowY: "auto", ...style }}
            className={className}
            {...props}
        />
    );
}
