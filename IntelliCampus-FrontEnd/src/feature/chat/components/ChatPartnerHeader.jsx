import React, { useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { FAHIM_USER_ID } from "../services/chatService";

export default function ChatPartnerHeader({ chatPartner, partnerTyping, searchQuery, onSearchChange, isPhone, onBack, onDeleteFriend, onLeaveGroup, showMembers, onShowMembers }) {
    const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar';
  const inputRef = useRef(null);
  const [isSearching, setIsSearching] = React.useState(false);

  useEffect(() => {
    if (isSearching && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isSearching]);

  const handleClear = () => {
    onSearchChange("");
    setIsSearching(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Escape") handleClear();
  };

  if (!chatPartner) return null;

  const {
    avatar,
    fullName: rawFullName,
    role: rawRole,
    isOnline = false
  } = chatPartner;
  const isAi = String(chatPartner?.userId) === FAHIM_USER_ID;
  const fullName = isAi ? "Faheem" : (rawFullName || t('anonymous'));
  const role = isAi ? t('aiAssistant') : (rawRole || t('member'));

  return (
    <div className={`flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 shrink-0 shadow-sm z-10 transition-colors duration-200 px-6`}>

      {/* Left side: Back button + Avatar and User Info */}
      <div className="flex items-center gap-2 min-w-0">
        {isPhone && onBack && (
          <button
            onClick={onBack}
            className="flex items-center justify-center rounded-xl text-gray-500 hover:text-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 dark:hover:text-gray-100 transition-all active:scale-90 shrink-0"
            aria-label={t('backToMembers')}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8l4-4" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative shrink-0">
          {chatPartner?.type === "group" ? (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-blue-100 dark:ring-blue-900/50 shadow-sm">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          ) : avatar ? (
            <img
              className="w-10 h-10 rounded-xl object-cover ring-2 ring-gray-100 dark:ring-gray-700/50"
              src={avatar}
              alt={fullName}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 flex items-center justify-center ring-2 ring-gray-100 dark:ring-gray-700/50">
              <svg className="w-5 h-5 text-gray-500 dark:text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
          )}

          <span
            className={`absolute bottom-0 end-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-800 transform translate-x-0.5 translate-y-0.5
              ${isOnline ? "bg-green-500" : "bg-gray-300 dark:bg-gray-600"}`}
            title={isOnline ? t('online') : t('offline')}
          />
        </div>

        <div className="min-w-0">
          <p className="text-sm font-bold text-gray-900 dark:text-white truncate tracking-tight">
            {fullName}
          </p>
          <div className="flex items-center gap-1.5 text-xs truncate">
            {partnerTyping ? (
              <span className="text-green-600 dark:text-green-400 font-medium">{t('typing')}</span>
            ) : (
              <>
                <span className="text-gray-500 dark:text-gray-400">{role}</span>
                {isOnline && (
                  <>
                    <span className="w-1 h-1 rounded-full bg-gray-300 dark:bg-gray-600" />
                    <span className="text-green-600 dark:text-green-400 font-medium">{t('activeNow')}</span>
                  </>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      </div>

      {/* Right side: Search / Actions */}
      <div className={`flex items-center gap-1 text-gray-500 dark:text-gray-400 ${isSearching ? 'flex-1 min-w-0' : ''}`}>
        {isSearching ? (
          <div className="flex items-center gap-1 bg-gray-50 dark:bg-gray-700/60 rounded-lg px-2 py-1 w-full">
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('searchPlaceholder')}
              dir={isRTL ? 'rtl' : 'ltr'}
              className={`${isPhone ? 'w-full' : 'w-40'} bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400 min-w-0`}
            />
            <button onClick={handleClear} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <>
          {chatPartner?.type !== "group" && String(chatPartner?.userId) !== FAHIM_USER_ID && onDeleteFriend && (
            <button
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-500 hover:text-red-500"
              aria-label="Remove friend"
              onClick={() => onDeleteFriend(Number(chatPartner.userId))}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 14a6 6 0 00-6 6h8m1-7l3 3m0 0l3-3m-3 3V9" />
              </svg>
            </button>
          )}
          {chatPartner?.type === "group" && onShowMembers && (
            <button
              className={`p-2 rounded-lg transition-colors ${showMembers ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600' : 'hover:bg-gray-50 dark:hover:bg-gray-700/60 text-gray-500'}`}
              aria-label="Show members"
              onClick={() => onShowMembers()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </button>
          )}
          {chatPartner?.type === "group" && onLeaveGroup && (
            <button
              className="p-2 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors text-gray-500 hover:text-red-500"
              aria-label="Leave group"
              onClick={() => onLeaveGroup()}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          )}
          <button
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-lg transition-colors"
            aria-label={t('searchMessages')}
            onClick={() => setIsSearching(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
          </>
        )}
      </div>

    </div>
  );
}