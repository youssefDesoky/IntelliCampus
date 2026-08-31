import { useEffect, useRef } from "react";

export default function TextArea({ minHeight = 80, maxHeight = 300, className = "", style, ...props }) {
    const ref = useRef(null);

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
            style={{ minHeight, maxHeight, overflowY: "auto", ...style }}
            className={className}
            {...props}
        />
    );
}
