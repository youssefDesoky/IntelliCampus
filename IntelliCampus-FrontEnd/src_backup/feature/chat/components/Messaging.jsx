import { useTranslation } from 'react-i18next';
import MessageSection from "./MessageSection";
import PinnedMessage from "./PinnedMessage";
import ChatControls from "./ChatControls";
import ChatPartnerHeader from "./ChatPartnerHeader";
import { useRef, useEffect } from "react";
import Message from "./Message";
import TypingIndicator from "./TypingIndicator";

export default function Messaging({ messages, sendMessage, onInputChange, partnerTyping, chatPartner, deleteMessage, editMessage, pinMessage, unpinMessage, pinnedMessage, showSenderInfo, searchQuery, onSearchChange, isPhone, onBack, onAttachFile }) {
  const { t } = useTranslation('chat');
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, partnerTyping]);

  const isEmpty = Object.keys(messages).length === 0;

  if (!chatPartner) return null;

  return (
    <div className={`${isPhone ? '' : 'col-span-2'} flex flex-col h-full min-h-0 gap-0`}>
      <ChatPartnerHeader chatPartner={chatPartner} partnerTyping={partnerTyping} searchQuery={searchQuery} onSearchChange={onSearchChange} isPhone={isPhone} onBack={onBack} />
      {pinnedMessage && <PinnedMessage message={pinnedMessage} />}

      {/* Messages area */}
      <div className="flex-1 min-h-0 overflow-y-auto pe-1 no-scrollbar mt-2">
        {searchQuery && isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-2xl">
              🔍
            </div>
            <p className="text-sm font-medium text-[var(--text-secondary)]">{t('noResults')}</p>
            <p className="text-xs text-[var(--text-tertiary)]">{t('noMessagesMatch', { query: searchQuery })}</p>
          </div>
        ) : isEmpty ? (
          <div className="h-full flex flex-col items-center justify-center gap-2 text-center px-8">
            <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/8 flex items-center justify-center text-2xl">
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

      <ChatControls sendMessage={sendMessage} onInputChange={onInputChange} onAttachFile={onAttachFile} />
    </div>
  );
}