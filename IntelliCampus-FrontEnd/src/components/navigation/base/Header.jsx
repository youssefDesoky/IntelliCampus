import { useTranslation } from "react-i18next";
import { useState, useEffect, useRef } from "react";
import { Link, NavLink, Form, useNavigate, matchPath } from "react-router-dom";
import defaultImage from "../../../assets/defaultImage.jpg";
import { fetchMyNotifications, markNotificationAsRead, markAllNotificationsAsRead, subscribeNotificationsChanged } from "../../../api/notifications";

import DropdownMenu from "../../ui/DropdownMenu";
import ToggleViewMode from "../../ui/ToggleViewMode";
import ToggleTheme from "../../ui/ToggleTheme";

import { IntelliCampusIcon, BellIconLight, BellSlashIconLight, TranslateIcon, SignOutIcon, UserIcon, InboxIcon } from "../../ui/icons";
import { useError } from '../../../contexts/ErrorContext.jsx';
import { useToast } from '../../../contexts/ToastContext.jsx';
import { openChat, subscribeChatState } from '../../../utils/notificationHandler';


const NOTIFICATION_ROUTES = [
  // Student
  { path: "/courses/:courseId" },
  { path: "/courses/:courseId/materials" },
  { path: "/courses/:courseId/assignments" },
  { path: "/courses/:courseId/quizzes" },
  { path: "/courses/:courseId/quizzes/practice" },
  { path: "/courses/:courseId/attendance" },
  { path: "/courses/:courseId/grades" },
  { path: "/courses/:courseId/community" },
  { path: "/courses/:courseId/community/questions/:postId" },
  { path: "/courses/:courseId/smart-notes" },
  { path: "/courses/:courseId/meeting" },
  // Instructor
  { path: "/instructor/courses/:courseId" },
  { path: "/instructor/courses/:courseId/materials" },
  { path: "/instructor/courses/:courseId/assignments" },
  { path: "/instructor/courses/:courseId/quizzes" },
  { path: "/instructor/courses/:courseId/attendance" },
  { path: "/instructor/courses/:courseId/attendance/:sessionId" },
  { path: "/instructor/courses/:courseId/attendance/excuses" },
  { path: "/instructor/courses/:courseId/grades" },
  { path: "/instructor/courses/:courseId/grades/complaints" },
  { path: "/instructor/courses/:courseId/community" },
  { path: "/instructor/courses/:courseId/community/questions/:postId" },
  { path: "/instructor/courses/:courseId/smart-notes" },
  { path: "/instructor/courses/:courseId/analytics" },
  { path: "/instructor/courses/:courseId/meeting" },
];

function normalizeActionUrl(actionUrl) {
  let pathname;
  try {
    const parsed = new URL(actionUrl);
    pathname = parsed.pathname.replace(/\/+$/, "");
  } catch {
    pathname = actionUrl.split("?")[0].replace(/\/+$/, "");
  }
  const qs = actionUrl.includes("?") ? actionUrl.slice(actionUrl.indexOf("?")) : "";
  let path = pathname;
  while (path) {
    if (NOTIFICATION_ROUTES.some((r) => matchPath(r.path, path))) {
      return path + qs;
    }
    const slashIdx = path.lastIndexOf("/");
    if (slashIdx <= 0) break;
    path = path.slice(0, slashIdx);
  }
  return actionUrl;
}

const viewLabels = { student: 'Student', instructor: 'Instructor', admin: 'Admin' };
const StudentPaths = ['/', /^\/courses(\/|$)/];

function isStudentPath(path) {
    return StudentPaths.some((p) => (p instanceof RegExp ? p.test(path) : p === path));
}

function getViewFromPath(path) {
    if (isStudentPath(path)) return 'student';
    if (path.startsWith('/instructor')) return 'instructor';
    if (path.startsWith('/admin')) return 'admin';
    return null;
}

function parseChatUrl(actionUrl) {
    if (typeof actionUrl !== 'string' || !actionUrl.includes('openChat=')) return null;
    const params = new URLSearchParams(actionUrl.split('?')[1] || '');
    return {
        type: params.get('openChat'),
        userId: params.get('userId'),
        userName: params.get('userName'),
    };
}

export default function Header({ avatar, notifications: initialNotifications, isMobile, isPhone, availableViews = [], activeView, onViewChange }) {
    const { t, i18n } = useTranslation('ui');
    const viewLabels = { student: t('header.student'), instructor: t('header.instructor'), admin: t('header.admin') };
    const navigate = useNavigate();
    const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
    const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
    const [notifications, setNotifications] = useState(Array.isArray(initialNotifications) ? initialNotifications : []);
    const [isMarkingAllRead, setIsMarkingAllRead] = useState(false);
    const [activeTab, setActiveTab] = useState('unread');

    const notificationsRef = useRef(null);
    const profileMenuRef = useRef(null);
    const eventSourceRef = useRef(null);
    const seenNotificationIds = useRef(new Set());
    const activeChatStateRef = useRef({ isChatOpen: false, activeChatUserId: null });
    const canNavigateRef = useRef(null);
    const { showError } = useError();
    const { showToast } = useToast();

    useEffect(() => {
        return subscribeChatState((state) => {
            activeChatStateRef.current = state;
        });
    }, []);

    const canNavigateTo = (actionUrl) => {
        if (!actionUrl) return false;
        if (parseChatUrl(actionUrl)) return false;
        const targetPath = actionUrl.split('?')[0];
        const requiredView = getViewFromPath(targetPath);
        return !requiredView || availableViews.includes(requiredView);
    };

    useEffect(() => {
        canNavigateRef.current = canNavigateTo;
    }, [availableViews]);

    useEffect(() => {
        const handleClick = (event) => {
            if (notificationsRef.current && !notificationsRef.current.contains(event.target)) {
                setIsNotificationsOpen(false);
            }
            if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
                setIsProfileMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClick);
        return () => document.removeEventListener('click', handleClick);
    }, []);

    // Connect to SSE stream for real-time notifications
    useEffect(() => {
        try {
            if (eventSourceRef.current) {
                eventSourceRef.current.close();
            }

            const eventSource = new EventSource('/api/notifications/stream', { withCredentials: true });
            eventSourceRef.current = eventSource;

            eventSource.onmessage = (event) => {
                try {
                    const notification = JSON.parse(event.data);
                    if (seenNotificationIds.current.has(notification.userNotificationId)) return;
                    seenNotificationIds.current.add(notification.userNotificationId);

                    const chatInfo = parseChatUrl(notification.clickUrl);
                    if (chatInfo && chatInfo.userId && activeChatStateRef.current.isChatOpen && activeChatStateRef.current.activeChatUserId === chatInfo.userId) {
                        return;
                    }

                    setNotifications(prevNotifications => {
                        if (!Array.isArray(prevNotifications)) return [notification];
                        const exists = prevNotifications.some(n => n.userNotificationId === notification.userNotificationId);
                        if (exists) return prevNotifications;
                        const actionUrl = notification.clickUrl || notification.actionUrl;
                        showToast({
                            title: notification.typeLabel || t('header.notificationLabel'),
                            message: notification.message,
                            type: 'info',
                            actionUrl,
                            onClick: actionUrl
                                ? () => {
                                    handleMarkAsRead(notification.userNotificationId);
                                    if (parseChatUrl(actionUrl)) {
                                        const info = parseChatUrl(actionUrl);
                                        openChat(info.type, info.userId, info.userName);
                                    } else if (canNavigateRef.current?.(actionUrl)) {
                                        navigate(normalizeActionUrl(actionUrl));
                                    }
                                }
                                : undefined,
                        });
                        return [notification, ...prevNotifications];
                    });
                } catch (err) {
                    showError(err.message);
                }
            };

            eventSource.onerror = () => {
                eventSource.close();
                eventSourceRef.current = null;
                setTimeout(() => {
                    const newEventSource = new EventSource('/api/notifications/stream', { withCredentials: true });
                    eventSourceRef.current = newEventSource;
                    newEventSource.onmessage = eventSource.onmessage;
                    newEventSource.onerror = eventSource.onerror;
                }, 3000);
            };

            return () => {
                eventSource.close();
            };
        } catch (err) {
            showError(err.message);
        }
    }, [showError]);

    useEffect(() => {
        const refreshNotifications = async () => {
            try {
                const fresh = await fetchMyNotifications();
                setNotifications(fresh || []);
            } catch (err) {
                showError(err.message);
            }
        };

        return subscribeNotificationsChanged(refreshNotifications);
    }, [showError]);

    const handleMarkAsRead = async (notificationId) => {
        try {
            await markNotificationAsRead(notificationId);
            setNotifications(prev => prev.map(n =>
                n.userNotificationId === notificationId ? { ...n, isRead: true } : n
            ));
        } catch (err) {
            showError(err.message);
        }
    };

    const handleNotificationClick = async (notification) => {
        const actionUrl = notification.clickUrl || notification.actionUrl;
        if (!actionUrl) return;

        setIsNotificationsOpen(false);
        if (!notification.isRead) {
            try {
                await markNotificationAsRead(notification.userNotificationId);
                setNotifications(prev => prev.map(n =>
                    n.userNotificationId === notification.userNotificationId ? { ...n, isRead: true } : n
                ));
            } catch (err) {
                showError(err.message);
            }
        }

        const chatInfo = parseChatUrl(actionUrl);
        if (chatInfo) {
            openChat(chatInfo.type, chatInfo.userId, chatInfo.userName);
        } else if (canNavigateTo(actionUrl)) {
            navigate(normalizeActionUrl(actionUrl));
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setIsMarkingAllRead(true);
            await markAllNotificationsAsRead();
            setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        } catch (err) {
            showError(err.message);
        } finally {
            setIsMarkingAllRead(false);
        }
    };

    const safeNotifications = Array.isArray(notifications) ? notifications : [];
    const unreadCount = safeNotifications.filter(n => !n.isRead).length;

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
        localStorage.setItem("lang", lng);
    };

    const dashboardRoute = activeView === 'instructor' ? '/instructor' : activeView === 'admin' ? '/admin' : '/';

    return (
        <header 
            className={`${isMobile ? 'p-2 h-15' : 'p-4 h-20'} sticky w-screen top-0 start-0 end-0 flex items-center justify-between z-50 border-b border-border-primary-default-light bg-bg-surface-primary-default-light text-text-primary-active-light dark:border-border-primary-default-dark dark:bg-bg-surface-primary-default-dark dark:text-text-primary-active-dark`}
        >
            <div id="header-logo" >
                {/* Need To Change Color using variables */}
                <Link to={dashboardRoute} className={`flex items-center gap-2 ${i18n.language === 'ar' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <IntelliCampusIcon className={`${isMobile ? 'w-10 h-10' : 'w-12 h-12'}`} />
                    {i18n.language === 'ar' ? (
                        <div className={`text-lg font-bold flex flex-col leading-none logo-title`}>
                            <span
                                className="inline-block overflow-hidden w-0 text-text-blue-default-light dark:text-text-blue-default-dark typewriter"
                                style={{ "--w": "6ch", "--steps": "6", "--d": "1.2s", "--delay": "0s" }}
                            >
                                Intelli
                            </span>
                            <span
                                className="inline-block overflow-hidden w-0 text-text-accent-default-light dark:text-text-accent-default-dark typewriter"
                                style={{ "--w": "7ch", "--steps": "7", "--d": "1.2s", "--delay": "1.25s" }}
                            >
                                Campus
                            </span>
                        </div>
                    ) : (
                        <div className={`text-lg font-bold flex flex-col leading-none logo-title`}>
                            <span
                                className="inline-block overflow-hidden w-0 text-text-blue-default-light dark:text-text-blue-default-dark typewriter"
                                style={{ "--w": "6ch", "--steps": "6", "--d": "1.2s", "--delay": "0s" }}
                            >
                                Intelli
                            </span>
                            <span
                                className="inline-block overflow-hidden w-0 text-text-accent-default-light dark:text-text-accent-default-dark typewriter"
                                style={{ "--w": "7ch", "--steps": "7", "--d": "1.2s", "--delay": "1.25s" }}
                            >
                                Campus
                            </span>
                        </div>
                    )}
                </Link>
            </div>

            <div className={`flex items-center gap-4`}>
                {!isMobile && 
                    <ToggleViewMode 
                        id="header-localization"
                        isFirstMode={i18n.language === 'en'}
                        onFirstModeSelect={() => changeLanguage('en')}
                        onSecondModeSelect={() => changeLanguage('ar')}
                        firstModeLabel="EN"
                        secondModeLabel="AR"
                        buttonStyle={`px-2 py-1 text-sm font-medium rounded-md `}
                    />
                }

                {availableViews.length > 1 && (
                    <div className="hidden sm:flex items-center gap-1">
                        <ToggleViewMode
                            isFirstMode={activeView === availableViews[0]}
                            onFirstModeSelect={() => onViewChange(availableViews[0])}
                            onSecondModeSelect={() => onViewChange(availableViews[1])}
                            firstModeLabel={viewLabels[availableViews[0]] || availableViews[0]}
                            secondModeLabel={viewLabels[availableViews[1]] || availableViews[1]}
                        />
                    </div>
                )}

                <Link
                  to="/inbox"
                  className="transition-colors duration-200 p-2 rounded-md text-text-secondary-active-light hover:text-text-secondary-hover-light hover:bg-bg-fill-primary-hover-light dark:text-text-secondary-active-dark dark:hover:text-text-primary-active-dark dark:hover:bg-bg-fill-primary-hover-dark"
                >
                  <InboxIcon className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
                </Link>

                <div id="notifications-button" className="relative" ref={notificationsRef}>
                    <button 
                        className="transition-colors duration-200 p-2 rounded-md relative text-text-secondary-active-light hover:text-text-secondary-hover-light hover:bg-bg-fill-primary-hover-light dark:text-text-secondary-active-dark dark:hover:text-text-primary-active-dark dark:hover:bg-bg-fill-primary-hover-dark" 
                        onClick={() => setIsNotificationsOpen(prev => !prev)}
                    >
                        {unreadCount > 0 && (
                            <span className="fixed flex size-2.5 ms-2.5 -mt-0.75">
                                <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 bg-bg-fill-primary-active-light dark:bg-bg-fill-primary-active-dark"></span>
                                <span className="relative inline-flex size-2.5 rounded-full bg-bg-fill-primary-active-light dark:bg-bg-fill-primary-active-dark"></span>
                            </span>
                        )}
                        <BellIconLight className={isMobile ? 'w-5 h-5' : 'w-6 h-6'} />
                    </button>

                    {isNotificationsOpen && (
                        isPhone ? (
                            <div className="fixed inset-x-0 bottom-0 top-[60px] z-50 flex flex-col bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark">
                                <div className="flex items-center justify-between px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark">
                                    <h3 className="text-lg font-semibold text-text-primary-active-light dark:text-text-primary-active-dark">
                                        {t('header.notifications')}
                                    </h3>
                                    <button
                                        onClick={() => setIsNotificationsOpen(false)}
                                        className="p-1.5 rounded-lg hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark"
                                        aria-label={t('header.close')}
                                    >
                                        <svg className="w-5 h-5 text-text-secondary-default-light dark:text-text-secondary-default-dark" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>

                                {unreadCount > 0 && (
                                    <div className="px-4 py-2 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark flex items-center justify-between">
                                        <span className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark">
                                            {t('header.unreadCount', { count: unreadCount })}
                                        </span>
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            disabled={isMarkingAllRead}
                                            className="text-xs font-medium text-white bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark px-3 py-1.5 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                                        >
                                            {isMarkingAllRead ? t('header.marking') : t('header.markAllRead')}
                                        </button>
                                    </div>
                                )}

                                <div className="flex gap-1 px-3 py-2 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark">
                                    {['all', 'unread', 'read'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150 ${
                                                activeTab === tab
                                                    ? 'bg-text-accent-default-light dark:bg-text-accent-default-dark text-white'
                                                    : 'text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark'
                                            }`}
                                        >
                                            {tab === 'all' ? t('header.all') : tab === 'unread' ? t('header.unread') : t('header.read')}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto">
                                    <ul>
                                        {(() => {
                                            const filteredNotifications = safeNotifications.filter(n => {
                                                if (activeTab === 'unread') return !n.isRead;
                                                if (activeTab === 'read') return n.isRead;
                                                return true;
                                            });
                                            return filteredNotifications.length > 0 ? (
                                                filteredNotifications.map((notification, index) => (
                                                    <li
                                                        key={notification.userNotificationId || index}
                                                        className={`border-b border-border-primary-default-light dark:border-border-primary-default-dark p-4 transition-colors ${
                                                            !notification.isRead
                                                                ? 'bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark'
                                                                : ''
                                                        } ${(notification.clickUrl || notification.actionUrl) ? 'cursor-pointer hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark' : 'cursor-default'}`}
                                                        onClick={() => handleNotificationClick(notification)}
                                                    >
                                                        <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                                                            <div className="flex items-start gap-2.5 min-w-0">
                                                                {!notification.isRead && (
                                                                    <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark" />
                                                                )}
                                                                <div className="min-w-0">
                                                                    <p className="font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark truncate">
                                                                        {notification.typeLabel || t('header.notificationLabel')}
                                                                    </p>
                                                                    <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1 line-clamp-2">
                                                                        {notification.message || JSON.stringify(notification)}
                                                                    </p>
                                                                    <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-2">
                                                                        {notification.timeAgo}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            {!notification.isRead && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation();
                                                                        handleMarkAsRead(notification.userNotificationId);
                                                                    }}
                                                                    className="self-start mt-1 flex-shrink-0 px-2.5 py-1 text-xs font-medium bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                                                                >
                                                                    {t('header.markRead')}
                                                                                
                                                                </button>
                                                            )}
                                                        </div>
                                                    </li>
                                                ))
                                            ) : (
                                                <li className="p-6 text-center text-text-secondary-default-light dark:text-text-secondary-default-dark text-sm flex flex-col items-center gap-2">
                                                    <BellSlashIconLight className="w-8 h-8 opacity-40" />
                                                    {t('header.noNotifications')}
                                                </li>
                                            );
                                        })()}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                            <div className="absolute top-full end-0 mt-2 w-80 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
                                <div className="sticky top-0 p-4 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark flex items-center justify-between">
                                    <h3 className="font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark">{t('header.notifications')}</h3>
                                    {unreadCount > 0 && (
                                        <button
                                            onClick={handleMarkAllAsRead}
                                            disabled={isMarkingAllRead}
                                            className="text-xs font-medium text-white bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark px-3 py-1.5 rounded-md hover:opacity-90 disabled:opacity-50 transition-opacity"
                                        >
                                            {isMarkingAllRead ? t('header.marking') : t('header.markAllRead')}
                                        </button>
                                    )}
                                </div>

                                <div className="flex gap-1 px-3 py-2 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-fill-primary-default-light dark:bg-bg-fill-primary-default-dark">
                                    {['all', 'unread', 'read'].map(tab => (
                                        <button
                                            key={tab}
                                            onClick={() => setActiveTab(tab)}
                                            className={`px-3 py-1 text-xs font-medium rounded-full transition-colors duration-150 ${
                                                activeTab === tab
                                                    ? 'bg-text-accent-default-light dark:bg-text-accent-default-dark text-white'
                                                    : 'text-text-secondary-default-light dark:text-text-secondary-default-dark hover:bg-bg-surface-secondary-default-light dark:hover:bg-bg-surface-secondary-default-dark'
                                            }`}
                                        >
                                            {tab === 'all' ? t('header.all') : tab === 'unread' ? t('header.unread') : t('header.read')}
                                        </button>
                                    ))}
                                </div>

                                <ul>
                                    {(() => {
                                        const filteredNotifications = safeNotifications.filter(n => {
                                            if (activeTab === 'unread') return !n.isRead;
                                            if (activeTab === 'read') return n.isRead;
                                            return true;
                                        });
                                        return filteredNotifications.length > 0 ? (
                                            filteredNotifications.map((notification, index) => (
                                                <li
                                                    key={notification.userNotificationId || index}
                                                    className={`border-b border-border-primary-default-light dark:border-border-primary-default-dark p-4 transition-colors ${
                                                        !notification.isRead
                                                            ? 'bg-bg-fill-secondary-default-light dark:bg-bg-fill-secondary-default-dark'
                                                            : ''
                                                    } ${(notification.clickUrl || notification.actionUrl) ? 'cursor-pointer hover:bg-bg-fill-primary-hover-light dark:hover:bg-bg-fill-primary-hover-dark' : 'cursor-default'}`}
                                                    onClick={() => handleNotificationClick(notification)}
                                                >
                                                    <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
                                                        <div className="flex items-start gap-2.5 min-w-0">
                                                            {!notification.isRead && (
                                                                <span className="mt-2 flex-shrink-0 w-2 h-2 rounded-full bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark" />
                                                            )}
                                                            <div className="min-w-0">
                                                                <p className="font-semibold text-sm text-text-primary-active-light dark:text-text-primary-active-dark truncate">
                                                                    {notification.typeLabel || t('header.notificationLabel')}
                                                                </p>
                                                                <p className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark mt-1 line-clamp-2">
                                                                    {notification.message || JSON.stringify(notification)}
                                                                </p>
                                                                <p className="text-xs text-text-tertiary-default-light dark:text-text-tertiary-default-dark mt-2">
                                                                    {notification.timeAgo}
                                                                </p>
                                                            </div>
                                                        </div>
                                                        {!notification.isRead && (
                                                            <button
                                                                onClick={(e) => {
                                                                    e.stopPropagation();
                                                                    handleMarkAsRead(notification.userNotificationId);
                                                                }}
                                                                className="self-start mt-1 flex-shrink-0 px-2.5 py-1 text-xs font-medium bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-white rounded-md hover:bg-blue-600 dark:hover:bg-blue-500 transition-colors"
                                                            >
                                                                {t('header.markRead')}
                                                            </button>
                                                        )}
                                                    </div>
                                                </li>
                                            ))
                                        ) : (
                                            <li className="p-6 text-center text-text-secondary-default-light dark:text-text-secondary-default-dark text-sm flex flex-col items-center gap-2">
                                                <BellSlashIconLight className="w-8 h-8 opacity-40" />
                                                No notifications
                                            </li>
                                        );
                                    })()}
                                </ul>
                            </div>
                        )
                    )}
                </div>

                <ToggleTheme />
                
                {!isMobile &&
                    <Link to="/profile" className={`w-12 h-12 block rounded-full border-2 hover:scale-110 border-border-accent-default-light dark:border-border-accent-default-dark`}>
                        <div className="w-full h-full rounded-full overflow-hidden">
                            <img src={avatar || defaultImage} alt={t('header.userProfile')} className="w-full h-full object-cover" />
                        </div>
                    </Link>
                }

                {isMobile && 
                    <div id="header-children-mobile" className="relative" ref={profileMenuRef}>
                        <button 
                            className={`w-10 h-10 block rounded-full overflow-hidden border-2 hover:scale-110 border-border-accent-default-light dark:border-border-accent-default-dark`}
                            onClick={() => setIsProfileMenuOpen(prev => !prev)}
                        >
                            <img src={avatar || defaultImage} alt={t('header.userProfile')} className="w-full h-full object-cover" />
                        </button>

                        { isProfileMenuOpen &&
                            <DropdownMenu 
                                direction="bottom"
                                position="end"
                            >
                                <li className="mb-2">
                                    <NavLink to="/profile" className="w-full text-start flex items-center gap-2">
                                        <UserIcon size={20} />
                                        <span className="text-sm font-semibold whitespace-nowrap">{t('header.myProfile')}</span>
                                    </NavLink>
                                </li>
                                
                                <li className="mb-2">                          
                                    <button 
                                        onClick={() => changeLanguage(i18n.language === 'en' ? 'ar' : 'en')} 
                                        className="w-full text-start flex items-center gap-2">
                                        <TranslateIcon size={20} />
                                        <span className="text-sm font-semibold whitespace-nowrap">{t('header.language')}</span>
                                    </button>
                                </li>

                                {availableViews.length > 1 && (
                                    <li className="mb-2 px-3">
                                        <div className="flex items-center gap-2 py-1">
                                            <span className="text-xs font-semibold text-text-secondary-default-light dark:text-text-secondary-default-dark uppercase tracking-wider">{t('header.view')}</span>
                                            <select
                                                value={activeView}
                                                onChange={(e) => onViewChange(e.target.value)}
                                                className="text-sm font-semibold bg-transparent border border-border-primary-default-light dark:border-border-primary-default-dark rounded px-2 py-1 outline-none"
                                            >
                                                {availableViews.map(v => (
                                                    <option key={v} value={v}>{viewLabels[v] || v}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </li>
                                )}

                                <li >
                                    <Form method="post" action="/logout">
                                        <button className="w-full text-start flex items-center gap-2">
                                            <SignOutIcon size={20} />
                                            <span className="text-sm font-semibold whitespace-nowrap">{t('header.logout')}</span>
                                        </button>
                                    </Form>
                                </li>
                            </DropdownMenu>
                        }
                    </div>
                }
            </div>
        </header>
    );
}