import { useTranslation } from 'react-i18next';
import MessageSection from "./MessageSection";
import PinnedMessage from "./PinnedMessage";
import ChatControls from "./ChatControls";
import ChatPartnerHeader from "./ChatPartnerHeader";
import GroupMembersPanel from "./GroupMembersPanel";
import { useRef, useEffect, useState } from "react";
import TypingIndicator from "./TypingIndicator";

export default function Messaging({ messages, sendMessage, onInputChange, partnerTyping, chatPartner, deleteMessage, editMessage, pinMessage, unpinMessage, pinnedMessage, showSenderInfo, searchQuery, onSearchChange, isPhone, onBack, onAttachFile, onDeleteFriend, onLeaveGroup, groupMembers, groupDetails, onAddGroupMember, currentUser, onSendCourseQuestion }) {
  const { t } = useTranslation('chat');
  const bottomRef = useRef(null);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    if (Object.keys(messages).length === 0) return;
    const raf = requestAnimationFrame(() => {
      bottomRef.current?.scrollIntoView({ behavior: "auto", block: "end" });
    });
    return () => cancelAnimationFrame(raf);
  }, [messages, partnerTyping]);

  if (!chatPartner) return null;

  const isEmpty = Object.keys(messages).length === 0;

  return (
    <div className={`${isPhone ? '' : 'col-span-2'} flex flex-col h-full min-h-0 gap-0`}>
      <ChatPartnerHeader chatPartner={chatPartner} partnerTyping={partnerTyping} searchQuery={searchQuery} onSearchChange={onSearchChange} isPhone={isPhone} onBack={onBack} onDeleteFriend={onDeleteFriend} onLeaveGroup={onLeaveGroup} showMembers={showMembers} onShowMembers={() => setShowMembers((s) => !s)} />
      {pinnedMessage && <PinnedMessage message={pinnedMessage} />}

      {showMembers && groupMembers.length > 0 && (
        <GroupMembersPanel members={groupMembers} onClose={() => setShowMembers(false)} groupDetails={groupDetails} onAddGroupMember={onAddGroupMember} currentUser={currentUser} />
      )}

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto pe-1 no-scrollbar mt-2">
        {searchQuery && isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl">
              🔍
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t('noResults')}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{t('noMessagesMatch', { query: searchQuery })}</p>
          </div>
        ) : isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-8">
            <div className="w-12 h-12 rounded-2xl bg-[var(--surface-hover)] border border-[var(--border-subtle)] flex items-center justify-center text-2xl">
              💬
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t('noMessages')}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{t('noMessagesDesc')}</p>
          </div>
        ) : (
          Object.entries(messages).map(([date, msgs]) => (
            <MessageSection key={date} date={date} messages={msgs} showSenderInfo={showSenderInfo} deleteMessage={deleteMessage} editMessage={editMessage} pinMessage={pinMessage} unpinMessage={unpinMessage} />
          ))
        )}

        {/* Typing indicator */}
        {partnerTyping && <TypingIndicator />}
        <div ref={bottomRef} />
      </div>

      <ChatControls sendMessage={sendMessage} onInputChange={onInputChange} onAttachFile={onAttachFile} chatPartner={chatPartner} onSendCourseQuestion={onSendCourseQuestion} />
    </div>
  );
}
