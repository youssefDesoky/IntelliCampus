import { createPortal } from "react-dom";

export default function ModelOverlay({ children, onClose, maxWidth = "max-w-5xl", fullScreen = false }) {
    const overlay = (
        <div className={`fixed inset-0 z-[60] ${fullScreen ? "" : "flex items-center justify-center p-4"}`}>
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                onClick={fullScreen ? undefined : onClose}
            />

            <div className={`relative z-10 ${fullScreen ? "h-full w-full" : `w-full ${maxWidth} flex justify-center`}`}>
                {children}
            </div>
        </div>
    );

    if (typeof document !== "undefined") {
        return createPortal(overlay, document.body);
    }

    return overlay;
}
