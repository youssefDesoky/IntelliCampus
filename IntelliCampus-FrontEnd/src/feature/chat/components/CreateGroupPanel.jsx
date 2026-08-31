import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

import TextArea from "../../../components/ui/TextArea";
import { ImageIcon } from "../../../components/ui/icons";
import BasePanel from "./BasePanel";

import { searchUsers } from "../services/chatService";
import { getLocalizedField } from "../../../utils/getLocalizedField";

export default function CreateGroupPanel({
  friends = [],
  onCreate,
  onCancel,
}) {
  const { t, i18n } = useTranslation('chat');
  const isRTL = i18n.language === 'ar';
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [dropdownPos, setDropdownPos] = useState(null);
  const [isCreating, setIsCreating] = useState(false);
  const fileInputRef = useRef(null);
  const searchTimeoutRef = useRef(null);
  const searchInputRef = useRef(null);

  const friendIds = useMemo(() => new Set(friends.map((f) => f.id)), [friends]);
  const selectedIds = useMemo(() => new Set(selectedFriends), [selectedFriends]);

  const handleToggleFriend = (id) => {
    setSelectedFriends((prev) =>
      prev.includes(id) ? prev.filter((fid) => fid !== id) : [...prev, id]
    );
  };

  const handleRemoveSelected = (id) => {
    setSelectedFriends((prev) => prev.filter((fid) => fid !== id));
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => setProfileImage(event.target.result);
    reader.readAsDataURL(file);
  };

  const handleCreate = async () => {
    if (isCreating) return;
    if (title.trim() && selectedFriends.length > 0) {
      setIsCreating(true);
      try {
        await onCreate({ title, description, members: selectedFriends, profileImage });
      } catch (err) {
        console.error("[CreateGroup] onCreate threw:", err);
      } finally {
        setIsCreating(false);
      }
    }
  };

  const canCreate = title.trim() && selectedFriends.length > 0 && !isCreating;

  const performSearch = useCallback(async (query) => {
    const trimmed = query.trim();
    if (trimmed.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      setSearchError(null);
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      const results = await searchUsers(trimmed);
      setSearchResults(Array.isArray(results) ? results : []);
    } catch (err) {
      setSearchError(err.message || "Search failed");
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      performSearch(searchQuery);
    }, 300);

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, performSearch]);

  // Update dropdown position based on search input position
  useEffect(() => {
    const updatePos = () => {
      if (!searchInputRef.current) return;
      const rect = searchInputRef.current.getBoundingClientRect();
      setDropdownPos({
        bottom: window.innerHeight - rect.top + 4,
        left: rect.left,
        width: rect.width,
      });
    };

    if (searchQuery.trim().length >= 2) {
      updatePos();
      window.addEventListener("scroll", updatePos, true);
      window.addEventListener("resize", updatePos);
      return () => {
        window.removeEventListener("scroll", updatePos, true);
        window.removeEventListener("resize", updatePos);
      };
    } else {
      setDropdownPos(null);
    }
  }, [searchQuery]);

  const showDropdown = searchQuery.trim().length >= 2 && dropdownPos;

  return (
    <BasePanel
      icon={
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600 dark:text-blue-400">
          <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
          <circle cx="9" cy="7" r="4" />
          <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      }
      title={t('group.create')}
      onBack={onCancel}
    >
      <div className="flex flex-col gap-4 px-5 py-5 overflow-y-auto flex-1 no-scrollbar">
        {/* Profile image */}
        <div className="flex flex-col items-center gap-2.5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="relative w-20 h-20 rounded-2xl overflow-hidden bg-gray-100 dark:bg-gray-700/80 flex items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-blue-50/50 dark:hover:bg-blue-900/20 transition-all group"
          >
            {profileImage ? (
              <img src={profileImage} alt={t('group.photoAlt')} className="w-full h-full object-cover" />
            ) : (
              <div className="flex flex-col items-center gap-1">
                <ImageIcon size={20} className="text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" />
              </div>
            )}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-2xl" />
            <div className="absolute bottom-1 end-1 w-6 h-6 rounded-full bg-white dark:bg-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.12)] flex items-center justify-center">
              <svg width="10" height="10" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="text-gray-500">
                <path d="M8 3v10M3 8h10" />
              </svg>
            </div>
          </button>
          <span className="text-[10px] font-medium text-gray-400 dark:text-gray-500 tracking-wide">
            {t('group.photo')}
          </span>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelect}
          />
        </div>

        {/* Title */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
            {t('group.title')}
          </label>
          <input
            type="text"
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 dark:focus:border-blue-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-all"
            placeholder={t('group.titlePlaceholder')}
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-widest">
{t("group.description")}
<span className="ms-1.5 normal-case text-gray-300 dark:text-gray-600 font-normal tracking-normal">
  — {t("common.optional")}
</span>
          </label>
          <TextArea
            className="w-full px-3 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 dark:focus:border-blue-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-all"
            placeholder={t('group.descriptionPlaceholder')}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {/* Members divider */}
        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
          <span className="text-xs font-medium text-gray-400 dark:text-gray-500">{t('group.members')}</span>
          {selectedFriends.length > 0 && (
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400 shadow-[inset_0_1px_2px_rgba(59,130,246,0.1)]">
              {t('group.selected', { count: selectedFriends.length })}
            </span>
          )}
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-200 dark:via-gray-700 to-transparent" />
        </div>

        {/* Selected chips */}
        {selectedFriends.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {selectedFriends.map((id) => {
              const isFriend = friendIds.has(id);
              const user = isFriend
                ? friends.find((f) => f.id === id)
                : searchResults.find((u) => u.userId === id);
              if (!user) return null;
              const name = user.name ?? user.fullName;
              return (
                <span
                  key={id}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs font-medium ring-1 ring-blue-200 dark:ring-blue-800"
                >
                  <span className="w-4 h-4 rounded-full bg-blue-600 text-white flex items-center justify-center text-[9px] font-bold">
{name?.[0]?.toUpperCase() ?? "?"}
</span>
{name}
                  <button
                    onClick={() => handleRemoveSelected(id)}
                    className="ms-0.5 text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    <svg width="12" height="12" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M4 4l8 8M12 4l-8 8" />
                    </svg>
                  </button>
                </span>
              );
            })}
          </div>
        )}

        {/* Search input */}
        <div className="relative">
          <span className="absolute start-3 top-1/2 -translate-y-1/2 text-gray-400">
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="7" cy="7" r="5" />
              <path d="M11 11l3 3" />
            </svg>
          </span>
          <input
            ref={searchInputRef}
            type="text"
            dir={isRTL ? 'rtl' : 'ltr'}
            className="w-full ps-9 pe-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/60 focus:border-blue-400 dark:focus:border-blue-500 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] dark:shadow-none transition-all"
            placeholder={t('searchFriends')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Friends list (shown when not searching) */}
        {!showDropdown && (
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto no-scrollbar -mx-1 px-1">
            {friends.length > 0 ? (
              friends.map((friend) => {
                const isSelected = selectedFriends.includes(friend.id);
                return (
                  <button
                    key={`friend-${friend.id}`}
                    onClick={() => handleToggleFriend(friend.id)}
                    className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-left transition-all active:scale-[0.98] ${
                      isSelected
                        ? "bg-blue-50 dark:bg-blue-900/30 ring-1 ring-blue-200 dark:ring-blue-800"
                        : "hover:bg-white dark:hover:bg-gray-800/60 hover:ring-1 hover:ring-gray-100 dark:hover:ring-gray-700/50"
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-semibold shrink-0 ${
                      isSelected ? "bg-blue-600 text-white" : "bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400"
                    }`}>
                      {friend.name?.[0]?.toUpperCase() ?? "?"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className={`text-sm font-medium truncate ${isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-800 dark:text-gray-100"}`}>
                        {friend.name}
                      </p>
                      <p className="text-xs text-gray-400 dark:text-gray-500">ID: {friend.id} (friend)</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-600"}`}>
                      {isSelected && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 6l3 3 5-5" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center">
                <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                  </svg>
                </div>
                <p className="text-sm text-gray-400 dark:text-gray-500">No friends to add yet</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">Type a name or code to search all users</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Portal dropdown - rendered in document.body so it's never clipped */}
      {showDropdown && createPortal(
        <div
          style={{
            position: "fixed",
            bottom: `${dropdownPos.bottom}px`,
            left: `${dropdownPos.left}px`,
            width: `${dropdownPos.width}px`,
            zIndex: 9999,
          }}
          className="bg-white dark:bg-gray-800 rounded-xl border-2 border-blue-400 dark:border-blue-600 shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between px-3 py-2 bg-blue-500 text-white">
            <span className="text-[10px] font-bold uppercase tracking-widest">Search Results</span>
            <span className="text-[10px] opacity-75">{searchResults.length} found</span>
          </div>

          <div className="max-h-[200px] overflow-y-auto no-scrollbar">
            {isSearching && (
              <div className="flex items-center justify-center gap-2 py-4 text-gray-500 dark:text-gray-300 text-sm">
                <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Searching...
              </div>
)}

{searchError && (
  <p className="text-sm text-red-600 dark:text-red-400 text-center py-3 px-3 font-medium">
    {searchError}
  </p>
)}

{!isSearching && !searchError && searchResults.length === 0 && searchQuery.trim().length >= 2 && (
  <div className="py-8 text-center">
    <p className="text-sm text-gray-400 dark:text-gray-500">
      {t("group.noFriendsSearch")}
    </p>
  </div>
)}

{!isSearching &&
  !searchError &&
  searchResults.length > 0 &&
  searchResults.map((user) => {
    const isSelected = selectedFriends.includes(user.userId);

    return (
      <button
        key={user.userId}
        onClick={() => handleToggleFriend(user.userId)}
        className={`flex items-center gap-3 w-full px-3 py-3 text-left border-b border-gray-100 dark:border-gray-700 last:border-b-0 transition-colors ${
                    isSelected
                      ? "bg-blue-100 dark:bg-blue-900/60"
                      : "hover:bg-gray-50 dark:hover:bg-gray-700/60"
                  }`}
                >
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${
                    isSelected ? "bg-blue-600 text-white" : "bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-200"
                  }`}>
{getLocalizedField(user, "fullName", i18n.language)?.[0]?.toUpperCase() ?? "?"}
</div>

<div className="min-w-0 flex-1 text-start">
  <p
    className={`text-sm font-medium truncate leading-tight transition-colors ${
      isSelected
        ? "text-blue-700 dark:text-blue-300"
        : "text-gray-800 dark:text-gray-100"
    }`}
  >
    {getLocalizedField(user, "fullName", i18n.language)}
  </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      {user.studentCode ? `Code: ${user.studentCode}` : `ID: ${user.userId}`}
                    </p>
                  </div>
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center border-2 shrink-0 ${
                    isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 dark:border-gray-500"
                  }`}>
                    {isSelected && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    )}
                  </div>
                </button>
              );
            })}

            {!isSearching && !searchError && searchResults.length === 0 && (
              <div className="flex flex-col items-center justify-center gap-2 py-6 text-center px-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                  No users found for "{searchQuery}"
                </p>
              </div>
            )}
          </div>
        </div>,
        document.body
      )}

      {/* Footer buttons */}
      <div className="flex items-center gap-2 px-5 py-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shrink-0">
        <button
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 active:scale-95 transition-all"
        >
          {t('group.cancel')}
        </button>
        <button
          onClick={handleCreate}
          disabled={!canCreate}
          className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-40 disabled:active:scale-95 shadow-[0_1px_2px_rgba(59,130,246,0.3)] hover:shadow-[0_2px_4px_rgba(59,130,246,0.4)] transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M8 3v10M3 8h10" />
          </svg>
          {t('group.create')}
        </button>
      </div>
    </BasePanel>
  );
}
