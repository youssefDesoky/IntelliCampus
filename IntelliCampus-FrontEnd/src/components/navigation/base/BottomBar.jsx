import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from "react-router-dom";

const VISIBLE_COUNT = 5; // عدد العناصر الظاهرة
const SLIDE_EASE = "0.4s cubic-bezier(0.34, 1.56406, 0.64, 1)";

export default function BottomBar({ links = [], leftLinks = [], rightLinks = [], children, visible = true, floatingAction = null }) {
    const { i18n } = useTranslation();
    const { pathname } = useLocation();

    // ── دمج اللينكات ─────────────────────────────────────────────
    const allLinks = [...leftLinks, ...links, ...rightLinks];
    const total = allLinks.length;

    const getIsActive = (to) => {
        if (to === "/") return pathname === "/";
        if (pathname === to) return true;
        if (pathname.startsWith(to + "/")) {
            return !allLinks.some(link => {
                if (link.to === to) return false;
                if (pathname === link.to) return true;
                if (pathname.startsWith(link.to + "/")) {
                    return link.to.length > to.length;
                }
                return false;
            });
        }
        return false;
    };

    // ── تحديد اللينك النشط ─────────────────────────────────────────────
    const activeIndex = allLinks.findIndex((l) => getIsActive(l.to));
    const activeLink = activeIndex !== -1 ? allLinks[activeIndex] : null;
    const ActiveIcon = activeLink?.icon;

    // ── دالة حساب الموقع الدائري المحدثة (Bulletproof Circular Offset) ──
    const getWrappedOffset = (index) => {
        if (activeIndex === -1) return index; 
        
        let diff = index - activeIndex;
        const half = Math.floor(total / 2);
        
        // المعادلة دي بتضمن إن اللينكات تلف كدايرة مغلقة سواء عددهم فردي أو زوجي
        if (diff > half) {
            diff -= total;
        } else if (diff < -Math.floor((total - 1) / 2)) {
            diff += total;
        }
        
        return diff;
    };

    const itemWidthPercent = 100 / VISIBLE_COUNT;

    return (
        <nav
            id="bottom-bar"
            className="fixed bottom-0 start-0 end-0 z-50 px-3"
            data-visible={String(visible)}
            style={{
                paddingBottom: "max(12px, env(safe-area-inset-bottom))",
            }}
        >
            <div className="relative">
                {/* ── الدايرة البارزة الثابتة في النص (اللينك النشط) ──────── */}
                {activeLink && (
                    <div
                        className="absolute z-10 pointer-events-none"
                        style={{
                            top: "50%",
                            left: "50%",
                            transform: "translate(-50%, calc(-50% - 20px))",
                        }}
                    >
                        <div
                            key={activeLink.to}
                            className="flex flex-col items-center pointer-events-auto max-w-[80px]"
                            style={{ animation: "bottomBarPop 0.32s cubic-bezier(0.34,1.56406,0.64,1) both" }}
                        >
                            <div className="p-[3px] rounded-full bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                                <div
                                    className="w-[54px] h-[54px] rounded-full bg-bg-fill-primary-active-light dark:bg-bg-fill-primary-active-dark flex items-center justify-center"
                                    style={{ boxShadow: "0 8px 26px -4px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.1)" }}
                                >
                                    {ActiveIcon && <ActiveIcon className="w-[26px] h-[26px] text-white" />}
                                </div>
                            </div>
                            <span className="mt-1 text-[10px] font-semibold leading-none truncate max-w-full text-center text-text-secondary-active-light dark:text-text-secondary-active-dark">
                                {activeLink.label}
                            </span>
                        </div>
                    </div>
                )}

                {/* ── الزر العائم (مثلاً أيقونة الدردشة) ─────────────────── */}
                {floatingAction && (
                    <div
                        className="absolute z-20 pointer-events-auto end-3"
                        style={{ top: "50%", transform: "translateY(calc(-50% - 72px))" }}
                    >
                        {floatingAction}
                    </div>
                )}

                <div className="overflow-hidden flex items-center h-[62px] rounded-[18px] border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark shadow-xl px-1 relative">

                    {activeIndex === -1 ? (
                        <div className="flex flex-1 items-center justify-around h-full">
                            {allLinks.slice(0, VISIBLE_COUNT).map(({ to, label, icon: Icon }) => (
                                <NavLink
                                    key={to}
                                    to={to}
                                    end={to === "/"}
                                    title={label}
                                    className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors duration-150 text-text-secondary-active-light dark:text-text-secondary-active-dark hover:text-text-accent-hover-light dark:hover:text-text-accent-hover-dark w-full"
                                >
                                    {Icon && <Icon className="w-5 h-5" />}
                                    <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
                                </NavLink>
                            ))}
                        </div>
                    ) : (
                        <div className="relative flex-1 h-full">
                            {allLinks.map(({ to, label, icon: Icon }, index) => {
                                const isActive = getIsActive(to);
                                const offset = getWrappedOffset(index);
                                const isVisible = Math.abs(offset) <= Math.floor(VISIBLE_COUNT / 2) + 1;

                                return (
                                    <div
                                        key={to}
                                        className="absolute top-0 h-full flex items-center justify-center"
                                        style={{
                                            width: `${itemWidthPercent}%`,
                                            left: "50%",
                                            transform: `translateX(calc(-50% + ${offset * 100}%))`,
                                            transition: `transform ${SLIDE_EASE}, opacity 0.3s`,
                                            opacity: isVisible ? 1 : 0,
                                            zIndex: isActive ? 0 : 1,
                                            pointerEvents: isVisible ? "auto" : "none"
                                        }}
                                    >
                                        {!isActive && (
                                            <NavLink
                                                to={to}
                                                end={to === "/"}
                                                title={label}
                                                className="flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors duration-150 text-text-secondary-active-light dark:text-text-secondary-active-dark hover:text-text-accent-hover-light dark:hover:text-text-accent-hover-dark w-full"
                                            >
                                                {Icon && <Icon className="w-5 h-5" />}
                                                <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
                                            </NavLink>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {children}
                </div>
            </div>

            <style>{`
                #bottom-bar {
                    transform: translateY(0);
                    transition: transform 0.4s cubic-bezier(0.34, 1.56406, 0.64, 1);
                    will-change: transform;
                }
                #bottom-bar[data-visible="false"] {
                    transform: translateY(100%);
                }
                @keyframes bottomBarPop {
                    from { opacity: 0; transform: translateY(8px) scale(0.7); }
                    to   { opacity: 1; transform: translateY(0) scale(1); }
                }
            `}</style>
        </nav>
    );
}