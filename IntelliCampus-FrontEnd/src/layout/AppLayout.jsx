import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useRouteLoaderData, useSearchParams, useNavigate } from 'react-router-dom';
import { useSidebar, useDeviceType } from '../hooks';
import usePushNotifications from '../hooks/usePushNotifications';
import useScrollVisibility from '../hooks/useScrollVisibility';
import { getAside, getBottomBar, getHeader } from '../utils/layoutHelper';
import Chat from '../feature/chat/components/Chat';
import CommentsIcon from '../components/ui/icons/CommentsIcon';
import { setOpenChatHandler } from '../utils/notificationHandler';

const VIEW_TYPES = ['student', 'instructor', 'admin'];
const VIEW_DASHBOARD_MAP = { student: '/', instructor: '/instructor', admin: '/admin' };

function resolvePrimaryRole(roles) {
    const r = (roles || []).map(r => r.toLowerCase());
    if (r.some(x => x === 'superadmin')) return 'superadmin';
    if (r.some(x => x.startsWith('admin'))) return 'admin';
    if (r.some(x => x === 'instructor')) return 'instructor';
    if (r.some(x => x.startsWith('student'))) return 'student';
    return null;
}

function getAvailableViews(roles) {
    const r = (roles || []).map(r => r.toLowerCase());
    const views = [];
    if (r.some(x => x.startsWith('student'))) views.push('student');
    if (r.some(x => x === 'instructor')) views.push('instructor');
    if (r.some(x => x.startsWith('admin') || x === 'superadmin')) views.push('admin');
    return views;
}

export default function AppLayout() {
    const { t, i18n } = useTranslation('common');
    const ASIDEHEIGHT = 80;
    const { width } = useSidebar();
    const { isMobile, isPhone } = useDeviceType();
    const barVisible = useScrollVisibility();
    const navigate = useNavigate();
    const user = useRouteLoaderData("root");
    const [searchParams] = useSearchParams();
    const primaryRole = resolvePrimaryRole(user?.roles);
    const isStudent = primaryRole === 'student';
    const [isChatOpen, setIsChatOpen] = useState(false);
    const [chatDefaultPanel, setChatDefaultPanel] = useState(null);
    const [chatDefaultPanelTrigger, setChatDefaultPanelTrigger] = useState(0);
    const [chatDefaultUserId, setChatDefaultUserId] = useState(null);
    const [chatDefaultGroupName, setChatDefaultGroupName] = useState(null);
    const [chatPosition, setChatPosition] = useState(null);
    const [btnDragging, setBtnDragging] = useState(false);
    const chatBtnRef = useRef(null);
    const btnDragOffset = useRef({ x: 0, y: 0 });
    const btnHasMoved = useRef(false);

    const availableViews = getAvailableViews(user?.roles);
    const [activeView, setActiveView] = useState(() => {
        const saved = localStorage.getItem('activeView');
        if (saved && availableViews.includes(saved)) return saved;
        if (availableViews.length > 0) return availableViews[0];
        return resolvePrimaryRole(user?.roles) || 'student';
    });

    useEffect(() => {
        if (!btnDragging) return;
        const onMove = (e) => {
            const mx = e.clientX ?? e.touches?.[0]?.clientX;
            const my = e.clientY ?? e.touches?.[0]?.clientY;
            if (mx == null) return;
            e.preventDefault();
            btnHasMoved.current = true;
            let newTop = my - btnDragOffset.current.y;
            let newLeft = mx - btnDragOffset.current.x;
            const el = chatBtnRef.current;
            if (el) {
                const r = el.getBoundingClientRect();
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const headerH = isPhone ? 60 : 80;
                const asideW = isPhone ? 0 : (width / 100) * vw;
                const bottomH = isPhone ? (barVisible ? 80 : 0) : 0;
                const minTop = headerH + 4;
                const maxTop = vh - bottomH - r.height - 4;
                const isRtl = i18n.dir() === 'rtl';
                const minLeft = isRtl ? 4 : asideW + 4;
                const maxLeft = isRtl ? vw - asideW - r.width - 4 : vw - r.width - 4;
                if (minTop <= maxTop) newTop = Math.max(minTop, Math.min(newTop, maxTop));
                if (minLeft <= maxLeft) newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
            }
            setChatPosition({ top: newTop, left: newLeft });
        };
        const onUp = () => {
            setBtnDragging(false);
            document.body.style.userSelect = '';
            const el = chatBtnRef.current;
            if (el) {
                const r = el.getBoundingClientRect();
                const vw = window.innerWidth;
                const vh = window.innerHeight;
                const headerH = isPhone ? 60 : 80;
                const asideW = isPhone ? 0 : (width / 100) * vw;
                const bottomH = isPhone ? (barVisible ? 80 : 0) : 0;
                setChatPosition(prev => {
                    if (!prev) return prev;
                    let newTop = prev.top;
                    let newLeft = prev.left;
                    const minTop = headerH + 4;
                    const maxTop = vh - bottomH - r.height - 4;
                    const isRtl = i18n.dir() === 'rtl';
                    const minLeft = isRtl ? 4 : asideW + 4;
                    const maxLeft = isRtl ? vw - asideW - r.width - 4 : vw - r.width - 4;
                    if (minTop <= maxTop) newTop = Math.max(minTop, Math.min(newTop, maxTop));
                    if (minLeft <= maxLeft) newLeft = Math.max(minLeft, Math.min(newLeft, maxLeft));
                    return (newTop !== prev.top || newLeft !== prev.left) ? { top: newTop, left: newLeft } : prev;
                });
            }
        };
        document.addEventListener('mousemove', onMove);
        document.addEventListener('mouseup', onUp);
        document.addEventListener('touchmove', onMove, { passive: false });
        document.addEventListener('touchend', onUp);
        return () => {
            document.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseup', onUp);
            document.removeEventListener('touchmove', onMove);
            document.removeEventListener('touchend', onUp);
        };
    }, [btnDragging]);

    const handleBtnPointerDown = (e) => {
        if (btnDragging) return;
        const btn = chatBtnRef.current;
        if (!btn) return;
        const rect = btn.getBoundingClientRect();
        const cx = e.clientX ?? e.touches?.[0]?.clientX;
        const cy = e.clientY ?? e.touches?.[0]?.clientY;
        if (cx == null) return;
        btnDragOffset.current = { x: cx - rect.left, y: cy - rect.top };
        setChatPosition({ top: rect.top, left: rect.left });
        btnHasMoved.current = false;
        document.body.style.userSelect = 'none';
        setBtnDragging(true);
    };

    const handleBtnClick = () => {
        if (btnHasMoved.current) {
            btnHasMoved.current = false;
            return;
        }
        setIsChatOpen(true);
    };

    const handleViewChange = (view) => {
        setActiveView(view);
        localStorage.setItem('activeView', view);
        const target = VIEW_DASHBOARD_MAP[view];
        if (target && window.location.pathname !== target) {
            navigate(target, { replace: true });
        }
    };

    useEffect(() => {
      const openChatParam = searchParams.get("openChat");
      if (openChatParam === "addFriend" || openChatParam === "message") {
        if (openChatParam === "addFriend") {
          setChatDefaultPanel("addFriend");
          setChatDefaultUserId(null);
          setChatDefaultPanelTrigger(prev => prev + 1);
          setIsChatOpen(true);
        } else {
          const userId = searchParams.get("userId");
          const userName = searchParams.get("userName");
          setChatDefaultPanel("messaging");
          setChatDefaultUserId(userId ? { id: userId, name: userName || "User" } : null);
          setChatDefaultPanelTrigger(prev => prev + 1);
          setIsChatOpen(true);
        }

        const currentPath = window.location.pathname;
        const isStudentAccessible = availableViews.includes('student');
        const safePath = (currentPath === '/' && !isStudentAccessible)
          ? (availableViews.includes('instructor') ? '/instructor'
            : availableViews.includes('admin') ? '/admin'
            : currentPath)
          : currentPath;

        navigate(safePath, { replace: true });
      }
    }, [searchParams, navigate, availableViews]);

    usePushNotifications(true);

    useEffect(() => {
        setOpenChatHandler((type, userId, userName) => {
            if (type === 'addFriend') {
                setChatDefaultPanel("addFriend");
                setChatDefaultUserId(null);
                setChatDefaultGroupName(null);
                setChatDefaultPanelTrigger(prev => prev + 1);
                setIsChatOpen(true);
            } else if (type === 'message' || type === 'user') {
                setChatDefaultPanel("messaging");
                setChatDefaultUserId(userId ? { id: userId, name: userName || "User" } : null);
                setChatDefaultGroupName(null);
                setChatDefaultPanelTrigger(prev => prev + 1);
                setIsChatOpen(true);
            } else if (type === 'group') {
                setChatDefaultPanel("messaging");
                setChatDefaultUserId(null);
                setChatDefaultGroupName(userId);
                setChatDefaultPanelTrigger(prev => prev + 1);
                setIsChatOpen(true);
            }
        });
        return () => setOpenChatHandler(null);
    }, []);

    return (
        <div className="min-h-screen bg-bg-light dark:bg-bg-dark text-text-primary-active-light dark:text-text-primary-active-dark">
            <div className="mx-auto">
                    {getHeader(isMobile, isPhone, user?.profileImage, user?.notifications, {
                        availableViews,
                        activeView,
                        onViewChange: handleViewChange
                    })}
                    
                    {!isMobile && getAside(activeView, ASIDEHEIGHT)}

                    <main 
                        className="container mx-auto mt-0 pt-4 md:pt-6 pb-16 lg:pb-2 px-4 md:px-6 xl:px-8" 
                        style={{
                            marginInlineStart: !isMobile ? `${width}%` : '0',
                            maxWidth: !isMobile ? `calc(100% - ${width}%)` : '100%'
                        }}
                    >
                        <Outlet context={{ user }} />
                    </main>

                    {/* Chatting interface - outside main to overlay everything */}
                    <Chat isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} currentUser={user} defaultPanel={chatDefaultPanel} defaultPanelTrigger={chatDefaultPanelTrigger} defaultUser={chatDefaultUserId} defaultGroupName={chatDefaultGroupName} />

                    {!isChatOpen && (
                        <>
                            {isMobile && getBottomBar(activeView, {
                                visible: isPhone ? barVisible : true,
                                floatingAction: isPhone ? null : (
                                    isStudent ? (
                                        <button
                                            onClick={() => setIsChatOpen(true)}
                                            className="relative w-24 h-24 rounded-full hover:scale-110 active:scale-95 transition-all duration-200"
                                            aria-label="Open chat"
                                        >
                                            <img
                                                src="/static/images/faheem-avatar.png"
                                                alt="Open chat"
                                                className="absolute inset-0 w-full h-full object-contain"
                                                draggable={false}
                                            />
                                            <img
                                                src="/static/images/Fahim_Boarder.svg"
                                                alt=""
                                                className="absolute inset-0 w-full h-full dark:brightness-[1.8]"
                                                draggable={false}
                                            />
                                        </button>
                                    ) : (
                                        <button
                                            onClick={() => setIsChatOpen(true)}
                                            className="w-14 h-14 rounded-full bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white flex items-center justify-center hover:scale-110 active:scale-95 transition-all duration-200 shadow-lg"
                                            aria-label="Open chat"
                                        >
                                            <CommentsIcon size={28} />
                                        </button>
                                    )
                                )
                            })}
                            {(isPhone || !isMobile) && (
                                <button
                                    ref={chatBtnRef}
                                    onClick={handleBtnClick}
                                    onMouseDown={handleBtnPointerDown}
                                    onTouchStart={handleBtnPointerDown}
                                    className={`fixed z-50 rounded-full transition-transform duration-200 hover:scale-110 active:scale-95 ${(isPhone || isStudent) ? 'w-24 h-24' : 'w-14 h-14 bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white flex items-center justify-center shadow-lg'}`}
                                    style={chatPosition ? { top: chatPosition.top, left: chatPosition.left, touchAction: 'none' } : isPhone ? (i18n.dir() === 'rtl' ? { bottom: '5.5rem', left: '1rem', touchAction: 'none' } : { bottom: '5.5rem', right: '1rem', touchAction: 'none' }) : (i18n.dir() === 'rtl' ? { bottom: '1.5rem', left: '2rem', touchAction: 'none' } : { bottom: '1.5rem', right: '2rem', touchAction: 'none' })}
                                    aria-label={t('openChat')}
                                >
                                    {(isPhone || isStudent) ? (
                                        <>
                                            <img
                                                src="/static/images/faheem-avatar.png"
                                                alt={t('openChat')}
                                                className="absolute inset-0 w-full h-full object-contain"
                                                draggable={false}
                                            />
                                            <img
                                                src="/static/images/Fahim_Boarder.svg"
                                                alt=""
                                                className="absolute inset-0 w-full h-full dark:brightness-[1.8]"
                                                draggable={false}
                                            />
                                        </>
                                    ) : (
                                        <CommentsIcon size={28} />
                                    )}
                                </button>
                            )}
                        </>
                    )}
            </div>
        </div>
    );
}