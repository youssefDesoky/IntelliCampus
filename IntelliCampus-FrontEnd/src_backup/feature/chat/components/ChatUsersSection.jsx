import { useState } from "react";
import { useTranslation } from 'react-i18next';
import ChatUser from "./ChatUser";
import { UserTieIcon, UserIcon, UsersIcon, AngleDownIcon } from "../../../components/ui/icons";

const SECTION_ICONS = {
  Instructors: <UserTieIcon size={18} />,
  Students: <UserIcon size={18} />,
  Groups: <UsersIcon size={18} />,
};

export default function ChatUsersSection({ type, users, onSelectUser }) {
  const { t, i18n } = useTranslation('chat');
  const [isExpanded, setIsExpanded] = useState(true);

  const SECTION_LABELS = {
    Instructors: t('instructors'),
    Students: t('students'),
    Groups: t('groups'),
  };

  return (
    <div className="flex flex-col gap-1 bg-white/5 rounded-xl py-2">
      {/* Section header */}
      <div className="flex items-center gap-2 mb-1 px-2">
        <span className="text-base leading-none">
          {SECTION_ICONS[type]}
        </span>
        <span className="text-[11px] font-semibold tracking-widest uppercase text-[var(--text-secondary)]">
          {SECTION_LABELS[type] || type}
        </span>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="ms-auto text-[11px] font-medium text-(--text-tertiary)">
          <AngleDownIcon size={12} className={isExpanded ? "rotate-0" : (i18n.language === 'ar' ? "rotate-90" : "-rotate-90")} />
        </button>
      </div>

      {/* Divider */}
      <div className="h-px bg-white/5 mx-2" />

      {/* Users list */}
      <div className="flex flex-col gap-0.5">
        {isExpanded && users.map((user) => (
          <ChatUser key={user.id} user={user} onClick={onSelectUser} />
        ))}
      </div>
    </div>
  );
}