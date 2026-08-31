import { useTranslation } from 'react-i18next';
import ChatUsersHeader from "./ChatUsersHeader";
import ChatUsersSection from "./ChatUsersSection";
import ChatUser from "./ChatUser";

const FAHIM_USER = {
  id: "ai-fahim",
  name: "Fahim",
  avatar: null,
  status: "online",
  unread: 0,
  roles: ["AI Assistant"],
};

export default function ChatUsers({ chatPartner, friends = [], groups = [], onlineUsers = new Set(), unreadCounts = {}, onAddFriend, onCreateGroup, onSelectUser, onSelectGroup, searchMembers, onSearchMembersChange, currentUser }) {
  const { t } = useTranslation('chat');
  const q = searchMembers.toLowerCase().trim();

  const mapFriend = (f) => ({ id: f.userId, name: f.fullName, avatar: f.profileImage || null, status: onlineUsers.has(String(f.userId)) ? "online" : null, unread: unreadCounts[String(f.userId)] || 0 });
  const mapGroup = (g) => ({ id: g.groupId, name: g.title, avatar: g.profileImage || null, status: null, unread: 0 });

  const filterFn = (u) => !q || u.name.toLowerCase().includes(q);

  const isStudent = currentUser?.roles?.some((r) => r.toLowerCase().startsWith("student"));
  const showFahim = isStudent && (!q || "fahim".includes(q));

  const instructors = friends.filter((f) => f.role === "Instructor").map(mapFriend).filter(filterFn);
  const students = friends.filter((f) => f.role === "Student").map(mapFriend).filter(filterFn);
  const groupList = groups.map(mapGroup).filter(filterFn);

  return (
    <div className="col-span-1 sm:border-e sm:border-white/8 sm:pe-4 flex flex-col min-h-0 h-full">
      <ChatUsersHeader onAddFriend={onAddFriend} onCreateGroup={onCreateGroup} searchMembers={searchMembers} onSearchMembersChange={onSearchMembersChange} />
      <div className="flex flex-col gap-2 overflow-y-auto min-h-0 no-scrollbar pt-1">
        {showFahim && (
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 px-2 py-1">
              <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
              </svg>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-blue-500">{t('aiAssistant')}</span>
            </div>
            <ChatUser user={FAHIM_USER} onClick={onSelectUser} />
          </div>
        )}
        {groupList.length > 0 && (
          <ChatUsersSection type="Groups" users={groupList} onSelectUser={onSelectGroup} />
        )}
        {instructors.length > 0 && (
          <ChatUsersSection type="Instructors" users={instructors} onSelectUser={onSelectUser} />
        )}
        {students.length > 0 && (
          <ChatUsersSection type="Students" users={students} onSelectUser={onSelectUser} />
        )}
        {!instructors.length && !students.length && !groupList.length && !showFahim && (
          <div className="text-xs text-center text-gray-400 py-6">
            {searchMembers ? t('noMembersMatch', { query: searchMembers }) : t('noMembers')}
          </div>
        )}
      </div>
    </div>
  );
}