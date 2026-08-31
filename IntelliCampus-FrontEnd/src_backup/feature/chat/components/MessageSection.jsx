import { useTranslation } from 'react-i18next';
import Message from "./Message";

const toIsoDate = (d) => d.toISOString().slice(0, 10);

const formatDisplayDate = (isoDate) => {
  const parsed = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return isoDate;
  return parsed.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
};

export default function MessageSection({ date, messages, showSenderInfo, deleteMessage, editMessage, pinMessage, unpinMessage }) {
  const { t } = useTranslation('chat');
  const todayIso = toIsoDate(new Date());
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayIso = toIsoDate(yesterday);

  const label =
    date === todayIso
      ? t('today')
      : date === yesterdayIso
      ? t('yesterday')
      : formatDisplayDate(date);

  return (
    <div className="flex flex-col gap-1 mt-4">
      {/* Date divider */}
      <div className="flex items-center gap-3 px-2 my-2">
        <span className="h-px bg-white/8 flex-1" />
        <span className="text-[10px] font-semibold uppercase tracking-widest text-[var(--text-tertiary)] px-2 py-1 rounded-full bg-white/4 border border-white/8">
          {label}
        </span>
        <span className="h-px bg-white/8 flex-1" />
      </div>

      {messages.map((msg, idx) => {
        const prev = messages[idx - 1];
        const isGrouped =
          prev &&
          prev.sender.name === msg.sender.name &&
          prev.sender.isOwnMessage === msg.sender.isOwnMessage;
        return (
          <Message
            key={msg.id}
            messageId={msg.id}
            sender={msg.sender}
            message={msg.message}
            sendTime={msg.sendTime}
            isGrouped={isGrouped}
            showSenderInfo={showSenderInfo}
            deleteMessage={deleteMessage}
            editMessage={editMessage}
            pinMessage={pinMessage}
            unpinMessage={unpinMessage}
            isEdited={msg.isEdited}
            isPinned={msg.isPinned}
          />
        );
      })}
    </div>
  );
}