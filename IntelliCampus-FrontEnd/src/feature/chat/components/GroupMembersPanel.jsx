import { useState } from "react";
import { searchUsers } from "../services/chatService";

const initials = (name) =>
  name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();

const avatarColors = [
  "from-blue-500 to-blue-600",
  "from-green-500 to-green-600",
  "from-purple-500 to-purple-600",
  "from-orange-500 to-orange-600",
  "from-pink-500 to-pink-600",
  "from-teal-500 to-teal-600",
  "from-red-500 to-red-600",
  "from-indigo-500 to-indigo-600",
];

const colorForName = (name) =>
  avatarColors[
    name.split("").reduce((acc, c) => acc + c.charCodeAt(0), 0) %
      avatarColors.length
  ];

export default function GroupMembersPanel({ members, onClose, groupDetails, onAddGroupMember, currentUser }) {
  const [adding, setAdding] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);

  const isAdmin = currentUser && groupDetails?.createdById === currentUser.userId;

  const handleSearch = async (val) => {
    setQuery(val);
    if (val.trim().length < 2) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const data = await searchUsers(val, 10);
      const memberIds = new Set(members.map((m) => m.userId));
      setResults(data.filter((u) => !memberIds.has(u.userId)));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleAdd = async (userId) => {
    await onAddGroupMember(userId);
    setQuery("");
    setResults([]);
    setAdding(false);
  };

  return (
    <div className="border-t border-gray-100 dark:border-gray-700/80 bg-gray-50 dark:bg-gray-800/50">
      <div className="flex items-center justify-between px-4 py-2">
        <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Members ({members.length})
        </span>
        <div className="flex items-center gap-1">
          {isAdmin && (
            <button
              onClick={() => setAdding((v) => !v)}
              className={`p-1 rounded transition-colors ${adding ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-600' : 'hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-400'}`}
              title="Add member"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
              </svg>
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors text-gray-400"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {adding && (
        <div className="px-3 pb-2">
          <input
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search users by name…"
            className="w-full px-3 py-1.5 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-700 outline-none focus:ring-2 focus:ring-blue-500"
            autoFocus
          />
          {searching && <p className="text-xs text-gray-400 mt-1">Searching…</p>}
          {results.length > 0 && (
            <div className="mt-1 max-h-32 overflow-y-auto space-y-0.5">
              {results.map((u) => (
                <button
                  key={u.userId}
                  onClick={() => handleAdd(u.userId)}
                  className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700/50 transition-colors text-left"
                >
                  <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorForName(u.fullName)} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}>
                    {initials(u.fullName)}
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-200 truncate flex-1">{u.fullName}</span>
                  <svg className="w-4 h-4 text-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                  </svg>
                </button>
              ))}
            </div>
          )}
          {query.trim().length >= 2 && !searching && results.length === 0 && (
            <p className="text-xs text-gray-400 mt-1">No users found</p>
          )}
        </div>
      )}

      <div className="px-3 pb-3 max-h-40 overflow-y-auto space-y-1">
        {members.map((m) => (
          <div
            key={m.userId}
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-white dark:hover:bg-gray-700/50 transition-colors"
          >
            <div
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${colorForName(m.fullName)} flex items-center justify-center text-[10px] font-bold text-white shrink-0`}
            >
              {initials(m.fullName)}
            </div>
            <span className="text-sm text-gray-700 dark:text-gray-200 truncate">
              {m.fullName}
            </span>
            {groupDetails?.createdById === m.userId && (
              <span className="text-[10px] font-semibold text-blue-500 dark:text-blue-400 ml-auto shrink-0">Admin</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
