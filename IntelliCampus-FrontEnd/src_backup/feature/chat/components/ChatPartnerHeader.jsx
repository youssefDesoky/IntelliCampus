import React, { useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';

export default function ChatPartnerHeader({ chatPartner, partnerTyping, searchQuery, onSearchChange, isPhone, onBack }) {
  const { t } = useTranslation('chat');
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
  const fullName = rawFullName || t('anonymous');
  const role = rawRole || t('member');

  return (
    <div className={`flex items-center justify-between py-3 border-b border-gray-100 dark:border-gray-700/80 bg-white dark:bg-gray-800 shrink-0 shadow-sm z-10 transition-colors duration-200 px-6'}`}>

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
          {avatar ? (
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
              className={`${isPhone ? 'w-full' : 'w-40'} bg-transparent text-sm outline-none text-gray-900 dark:text-white placeholder-gray-400 min-w-0`}
            />
            <button onClick={handleClear} className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors shrink-0">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700/60 rounded-lg transition-colors"
            aria-label={t('searchMessages')}
            onClick={() => setIsSearching(true)}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </button>
        )}
      </div>

    </div>
  );
}