import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Outlet, useRouteLoaderData } from 'react-router-dom';
import { useSidebar, useDeviceType } from '../hooks';
import usePushNotifications from '../hooks/usePushNotifications';
import useScrollVisibility from '../hooks/useScrollVisibility';
import { getAside, getBottomBar, getHeader } from '../utils/layoutHelper';
import Chat from '../feature/chat/components/Chat';
import CommentsIcon from '../components/ui/icons/CommentsIcon';

const VIEW_TYPES = ['student', 'instructor', 'admin'];

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
    const { t } = useTranslation('common');
    const ASIDEHEIGHT = 80;
    const { width } = useSidebar();
    const { isMobile, isPhone } = useDeviceType();
    const barVisible = useScrollVisibility();
    const user = useRouteLoaderData("root");
    const [isChatOpen, setIsChatOpen] = useState(false);

    const availableViews = getAvailableViews(user?.roles);
    const [activeView, setActiveView] = useState(() => {
        const saved = localStorage.getItem('activeView');
        if (saved && availableViews.includes(saved)) return saved;
        if (availableViews.length > 0) return availableViews[0];
        return resolvePrimaryRole(user?.roles) || 'student';
    });

    const handleViewChange = (view) => {
        setActiveView(view);
        localStorage.setItem('activeView', view);
    };

    usePushNotifications(true);

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
                    <Chat isChatOpen={isChatOpen} setIsChatOpen={setIsChatOpen} currentUser={user} />

                    {isMobile && !isChatOpen && getBottomBar(activeView, {
                        visible: isPhone ? barVisible : true,
                        floatingAction: (
                            <button
                                onClick={() => setIsChatOpen(true)}
                                className="flex items-center justify-center w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-700 text-white rounded-full shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 hover:scale-110 active:scale-95 transition-all duration-200"
                                aria-label={t('openChat')}
                            >
                                <CommentsIcon size={22} />
                            </button>
                        )
                    })}
            </div>
        </div>
    );
}