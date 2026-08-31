import { createContext, useContext, useState, useCallback, useEffect, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from 'react-i18next';

const ContextMenuContext = createContext(null);

export function useContextMenu() {
    const ctx = useContext(ContextMenuContext);
    if (!ctx) throw new Error("useContextMenu must be used within <ContextMenuProvider>");
    return ctx;
}

const INPUT_TAGS = new Set(["INPUT", "TEXTAREA"]);

export function ContextMenuProvider({ children, blockNative = true, textSelectionMenu = false, disableDoubleClickSelect = true }) {
    const { t } = useTranslation('common');
    const [menu, setMenu] = useState(null);
    const menuRef = useRef(null);

    const showContextMenu = useCallback((e, items) => {
        e.preventDefault();
        e.stopPropagation();
        setMenu({ x: e.clientX, y: e.clientY, items });
    }, []);

    const closeMenu = useCallback(() => {
        setMenu(null);
    }, []);

    useEffect(() => {
        if (!blockNative) return;
        const preventNative = (e) => e.preventDefault();
        window.addEventListener("contextmenu", preventNative);
        return () => window.removeEventListener("contextmenu", preventNative);
    }, [blockNative]);

    useEffect(() => {
        if (!textSelectionMenu) return;

        let lastClickTime = 0;
        let lastX = 0;
        let lastY = 0;

        const selectWordAt = (x, y) => {
            if (!document.caretRangeFromPoint) return null;
            const range = document.caretRangeFromPoint(x, y);
            if (!range || range.startContainer.nodeType !== Node.TEXT_NODE) return null;
            range.expand("word");
            const selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
            const text = selection.toString().trim();
            return text || null;
        };

        const handleMouseDown = (e) => {
            const now = Date.now();
            const isDoubleClick =
                now - lastClickTime < 300 &&
                Math.abs(e.clientX - lastX) < 10 &&
                Math.abs(e.clientY - lastY) < 10;

            lastClickTime = now;
            lastX = e.clientX;
            lastY = e.clientY;

            if (!isDoubleClick) return;
            if (INPUT_TAGS.has(e.target.tagName) || e.target.isContentEditable) return;

            e.preventDefault();

            requestAnimationFrame(() => {
                const text = selectWordAt(e.clientX, e.clientY);
                if (!text) return;

                const selection = window.getSelection();
                const savedRange = selection.getRangeAt(0).cloneRange();

                selection.removeAllRanges();
                requestAnimationFrame(() => {
                    selection.addRange(savedRange);
                });

                setMenu({
                    x: e.clientX,
                    y: e.clientY,
                    items: [
                        {
                            label: t('labels.copy', 'Copy'),
                            onClick: () => {
                                navigator.clipboard.writeText(text).catch(() => {});
                            },
                        },
                    ],
                });
            });
        };

        document.addEventListener("mousedown", handleMouseDown);
        return () => document.removeEventListener("mousedown", handleMouseDown);
    }, [textSelectionMenu]);

    useEffect(() => {
        if (!menu) return;

        const handleMouseDown = (e) => {
            if (menuRef.current && !menuRef.current.contains(e.target)) {
                closeMenu();
            }
        };

        const handleKeyDown = (e) => {
            if (e.key === "Escape") closeMenu();
        };

        const handleScroll = () => closeMenu();

        document.addEventListener("mousedown", handleMouseDown);
        document.addEventListener("keydown", handleKeyDown);
        window.addEventListener("scroll", handleScroll, true);

        return () => {
            document.removeEventListener("mousedown", handleMouseDown);
            document.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("scroll", handleScroll, true);
        };
    }, [menu, closeMenu]);

    useLayoutEffect(() => {
        if (!menuRef.current || !menu) return;

        const rect = menuRef.current.getBoundingClientRect();
        const { innerWidth, innerHeight } = window;

        let x = menu.x;
        let y = menu.y;

        if (x + rect.width > innerWidth - 8) {
            x = Math.max(8, innerWidth - rect.width - 8);
        }
        if (y + rect.height > innerHeight - 8) {
            y = Math.max(8, innerHeight - rect.height - 8);
        }

        menuRef.current.style.top = `${y}px`;
        menuRef.current.style.left = `${x}px`;
    }, [menu]);

    return (
        <ContextMenuContext.Provider value={{ showContextMenu, closeMenu }}>
            {children}
            {menu && createPortal(
                <div
                    ref={menuRef}
                    className="fixed z-[9999] bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg shadow-lg p-1 min-w-40 animate-fade-in"
                    style={{ top: menu.y, left: menu.x }}
                >
                    {menu.items.map((item, i) =>
                        item.type === "divider" ? (
                            <div
                                key={i}
                                className="my-1 border-t border-border-primary-default-light dark:border-border-primary-default-dark"
                            />
                        ) : (
                            <button
                                key={i}
                                data-cursor="clickable"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    item.onClick?.();
                                    closeMenu();
                                }}
                                disabled={item.disabled}
                                className={`w-full text-start px-3 py-2 text-sm rounded-md transition-colors flex items-center gap-2 ${
                                    item.danger
                                        ? "text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-bg-surface-danger-default-light dark:hover:bg-bg-surface-danger-default-dark"
                                        : "text-text-primary-default-light dark:text-text-primary-default-dark hover:bg-bg-surface-primary-active-light dark:hover:bg-bg-surface-primary-active-dark"
                                } ${
                                    item.disabled
                                        ? "opacity-50"
                                        : ""
                                }`}
                            >
                                {item.icon}
                                {item.label}
                            </button>
                        )
                    )}
                </div>,
                document.body
            )}
        </ContextMenuContext.Provider>
    );
}
