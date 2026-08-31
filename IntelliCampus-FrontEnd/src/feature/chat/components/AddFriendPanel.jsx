import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import BasePanel from "./BasePanel";
import { getLocalizedField } from '../../../utils/getLocalizedField';

export default function AddFriendPanel({
  friendId,
  setFriendId,
  friendRequests,
  sentRequests = [],
  onInvite,
  onBack,
  onAcceptRequest,
  onDeclineRequest,
  searchUsers,
}) {
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar';
  const pendingCount = friendRequests.length;
  const [searchQuery, setSearchQuery] = useState(friendId || "");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const searchRef = useRef(null);

  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const results = await searchUsers(searchQuery.trim());
        setSearchResults(results || []);
        setShowDropdown(true);
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, searchUsers]);

  useEffect(() => {
    function handleClickOutside(e) {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setFriendId(String(user.userId));
    setSearchQuery(user.fullName);
    setShowDropdown(false);
  };

  const handleClearSelection = () => {
    setSelectedUser(null);
    setFriendId("");
    setSearchQuery("");
    setSearchResults([]);
  };

  const divider = (label, count) => (
    <div className="flex items-center gap-3">
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
      <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{label}</span>
      {count > 0 && (
        <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400">
          {count}
        </span>
      )}
      <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
    </div>
  );

  return (
    <BasePanel
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M19 8v6M16 11h6" />
        </svg>
      }
      title={t('friends.addFriend')}
      onBack={onBack}
    >
      <div className="flex flex-col gap-5 px-5 py-5 overflow-y-auto flex-1 form-scrollbar">
        <div className="flex flex-col gap-2">
          <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {t('friends.sendInvitation')}
          </p>
          <div className="flex gap-2" ref={searchRef}>
            <div className="relative flex-1">
              <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
                <svg width="15" height="15" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="7" cy="7" r="5" />
                  <path d="M11 11l3 3" />
                </svg>
              </span>
              <input
                type="text"
dir={isRTL ? "rtl" : "ltr"}
className="w-full ps-9 pe-8 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 dark:focus:border-blue-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-all"
placeholder={t("friends.placeholder")}
value={searchQuery}
onChange={(e) => {
  setSearchQuery(e.target.value);
  if (selectedUser) handleClearSelection();
}}
onFocus={() => searchResults.length > 0 && setShowDropdown(true)}
onKeyDown={(e) => e.key === "Enter" && selectedUser && onInvite()}
              />
              {searchQuery && !selectedUser && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2">
                  {isSearching ? (
                    <svg className="animate-spin text-gray-400" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" strokeDasharray="31.4 31.4" strokeLinecap="round" />
                    </svg>
                  ) : null}
                </span>
              )}
              {selectedUser && (
                <button
                  onClick={handleClearSelection}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                    <path d="M4 4l8 8M12 4l-8 8" />
                  </svg>
                </button>
              )}
              {showDropdown && searchResults.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto form-scrollbar">
                  {searchResults.map((user) => (
                    <button
                      key={user.userId}
                      onClick={() => handleSelectUser(user)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-sm text-left hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors first:rounded-t-xl last:rounded-b-xl"
                    >
                      {user.profileImage ? (
                        <img className="w-8 h-8 rounded-lg object-cover shrink-0" src={user.profileImage} alt="" />
                      ) : (
                        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                            {user.fullName?.[0]?.toUpperCase() ?? "?"}
                          </span>
                        </div>
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-gray-800 dark:text-gray-100 truncate">{user.fullName}</p>
                        {user.email && (
                          <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{user.email}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {showDropdown && searchResults.length === 0 && searchQuery.trim().length >= 2 && !isSearching && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg z-50 py-4 text-center">
                  <p className="text-sm text-gray-400 dark:text-gray-500">No users found</p>
                </div>
              )}
            </div>
            <button
              onClick={onInvite}
              disabled={!friendId.trim()}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-medium bg-blue-600 hover:bg-blue-700 active:scale-95 text-white disabled:opacity-40 shadow-[0_1px_2px_rgba(59,130,246,0.3)] hover:shadow-[0_2px_4px_rgba(59,130,246,0.4)] transition-all"
            >
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v10M3 8h10" />
              </svg>
              {t('friends.send')}
            </button>
          </div>
        </div>

        {sentRequests.length > 0 && (
          <>
            {divider(t('friends.sentRequests'), sentRequests.length)}
            <div className="flex flex-col gap-1.5">
              {sentRequests.map((req) => (
                <div
                  key={req.id}
                  className="flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-white dark:bg-gray-800/40 ring-1 ring-gray-100 dark:ring-gray-700/30"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {req.avatar ? (
                      <img className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-gray-100 dark:ring-gray-700/50" src={req.avatar} alt={getLocalizedField(req, 'name', i18n.language)} />
                    ) : (
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/30 dark:to-orange-900/30 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700/50">
                        <span className="text-sm font-bold text-amber-600 dark:text-amber-400">
                          {getLocalizedField(req, 'name', i18n.language)?.[0]?.toUpperCase() ?? "?"}
                        </span>
                      </div>
                    )}
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate leading-tight">
                        {getLocalizedField(req, 'name', i18n.language)}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0">
                    {t('friends.pending')}
                  </span>
                </div>
              ))}
            </div>
          </>
        )}

        {divider(t('friends.pendingRequests'), pendingCount)}

        {pendingCount === 0 ? (
          <div className="flex flex-col items-center justify-center gap-4 py-14 text-center">
            <div className="relative">
              <div className="w-16 h-16 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center ring-1 ring-gray-200 dark:ring-gray-700">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <div className="absolute -top-1 -end-1 w-5 h-5 rounded-full bg-gray-200 dark:bg-gray-600 flex items-center justify-center">
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-500 dark:text-gray-400">
                  <path d="M4 4l8 8M12 4l-8 8" />
                </svg>
              </div>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">
                {t('noRequests')}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                {t('friends.inviteHint')}
              </p>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-1.5">
            {friendRequests.map((req) => (
              <div
                key={req.id}
                className="group flex items-center justify-between gap-3 px-3.5 py-3 rounded-xl bg-white dark:bg-gray-800/40 hover:bg-white dark:hover:bg-gray-800/80 shadow-[0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none hover:shadow-[0_2px_6px_rgba(0,0,0,0.06)] dark:hover:shadow-none ring-1 ring-gray-100 dark:ring-gray-700/30 hover:ring-gray-200 dark:hover:ring-gray-600/50 transition-all"
              >
                <div className="flex items-center gap-3 min-w-0">
                  {req.avatar ? (
                    <img
                      className="w-10 h-10 rounded-xl object-cover shrink-0 ring-1 ring-gray-100 dark:ring-gray-700/50"
                      src={req.avatar}
                      alt={getLocalizedField(req, 'name', i18n.language)}
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 flex items-center justify-center shrink-0 ring-1 ring-gray-100 dark:ring-gray-700/50">
                      <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                        {getLocalizedField(req, 'name', i18n.language)?.[0]?.toUpperCase() ?? "?"}
                      </span>
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate leading-tight">
                      {getLocalizedField(req, 'name', i18n.language)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() => onAcceptRequest(req.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-green-700 dark:text-green-400 bg-green-50 dark:bg-green-900/30 hover:bg-green-100 dark:hover:bg-green-900/50 hover:shadow-[0_1px_2px_rgba(34,197,94,0.2)] active:scale-95 transition-all"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M3 8l4 4 6-7" />
                    </svg>
                    {t('friends.accept')}
                  </button>
                  <button
                    onClick={() => onDeclineRequest(req.id)}
                    className="flex items-center justify-center w-7 h-7 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 active:scale-90 transition-all"
                    aria-label={t('friends.decline')}
                  >
                    <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </BasePanel>
  );
}
