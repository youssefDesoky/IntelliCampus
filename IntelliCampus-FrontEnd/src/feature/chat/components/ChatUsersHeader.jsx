import { useTranslation } from 'react-i18next';
import SearchBar from "../../../components/ui/SearchBar";
import { UsersPlusIcon, UserPlusIcon } from "../../../components/ui/icons";

export default function ChatUsersHeader({ 
  onAddFriend, 
  onCreateGroup, 
  searchMembers,
  onSearchMembersChange 
}) {
  const { t } = useTranslation('chat');
  return (
    <div className="flex flex-col gap-4 mb-5">
      {/* Top Row: Title, Count, and Actions */}
      <div className="flex items-center justify-between">        
        <h3 className="text-sm font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
          {t('group.members')}
        </h3>

        {/* Right Side: Action Buttons */}
        <div className="flex items-center gap-1">
          <button
            onClick={onAddFriend}
            title={t('friends.addFriend')}
            aria-label={t('friends.addFriend')}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/15 rounded-lg transition-all duration-200"
          >
            <UserPlusIcon size={20} />
          </button>
          <button
            onClick={onCreateGroup}
            title={t('group.create')}
            aria-label={t('group.create')}
            className="p-1.5 text-[var(--text-secondary)] hover:text-[var(--primary)] hover:bg-[var(--primary)]/15 rounded-lg transition-all duration-200"
          >
            <UsersPlusIcon size={20} />
          </button>
        </div>
        
      </div>

      {/* Bottom Row: Search */}
      <SearchBar
        placeholder={t('searchMembers')}
        value={searchMembers}
        onChange={(e) => onSearchMembersChange(e.target.value)}
      />
    </div>
  );
}