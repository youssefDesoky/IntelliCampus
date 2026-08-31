import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import MessageControls from "./MessageControls";
import { EllipsisVerticalIcon } from "../../../components/ui/icons";

export default function Message({ sender, message, sendTime, isGrouped, showSenderInfo, messageId, deleteMessage, editMessage, pinMessage, unpinMessage, isEdited, isPinned }) {
  const { t } = useTranslation('chat');
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message);
  const editInputRef = useRef(null);
  const controlsRef = useRef(null);
  const isOwn = sender.isOwnMessage;

  useEffect(() => {
    if (isEditing && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.setSelectionRange(editText.length, editText.length);
    }
  }, [isEditing]);

  useEffect(() => {
    if (!showControls) return;
    const handleClickOutside = (e) => {
      if (controlsRef.current && !controlsRef.current.contains(e.target)) {
        setShowControls(false);
      }
    };
    const handleEscape = (e) => {
      if (e.key === "Escape") setShowControls(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [showControls]);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
  };

  const handleStartEdit = () => {
    setEditText(message);
    setIsEditing(true);
    setShowControls(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditText(message);
  };

  const handleSubmitEdit = () => {
    const trimmed = editText.trim();
    if (trimmed && trimmed !== message) {
      editMessage(messageId, trimmed);
    }
    setIsEditing(false);
  };

  const handleEditKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmitEdit();
    } else if (e.key === "Escape") {
      handleCancelEdit();
    }
  };

  const handleDelete = () => {
    deleteMessage(messageId);
    setShowControls(false);
  };

  const handlePinToggle = () => {
    if (isPinned) {
      unpinMessage(messageId);
    } else {
      pinMessage(messageId);
    }
    setShowControls(false);
  };

  return (
    <div
      className={`flex items-start gap-3 px-2 group relative ${
        isOwn ? "flex-row-reverse" : "flex-row"
      } ${isGrouped ? "mt-0.5" : "mt-3"}`}
    >
      {/* Avatar — only in groups, first message */}
      {showSenderInfo && !isGrouped && (
        <div className="flex-shrink-0 w-8 mt-1">
          {sender.avatar ? (
            <img
              className="w-8 h-8 rounded-full object-cover ring-2 ring-white/10"
              src={sender.avatar}
              alt={sender.name}
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center ring-2 ring-white/10">
              <span className="text-xs font-medium text-gray-500 dark:text-gray-300">
                {sender.name?.charAt(0)?.toUpperCase() || "?"}
              </span>
            </div>
          )}
        </div>
      )}

      {/* Bubble + meta */}
      <div className={`flex flex-col min-w-0 ${isOwn ? "items-end" : "items-start"}`}>
        {/* Sender name — only in groups, first message */}
        {showSenderInfo && !isGrouped && (
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-1 px-1">
            {sender.name}
          </span>
        )}

        <div className={`flex items-end gap-1.5 relative ${isOwn ? "flex-row-reverse" : ""}`}>
          {/* Message bubble */}
          <div
            className={`relative px-4 py-2.5 text-sm leading-relaxed break-words max-w-md
              ${isOwn
                ? "bg-blue-600 text-white"
                : "bg-white/6 border border-white/8 text-[var(--text-primary)]"
              }
              ${!isGrouped
                ? (isOwn ? "rounded-[18px] rounded-tr-md" : "rounded-[18px] rounded-tl-md")
                : "rounded-[18px]"
              }
            `}
          >
            {isEditing ? (
              <input
                ref={editInputRef}
                type="text"
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleEditKeyDown}
                onBlur={handleSubmitEdit}
                className="w-full bg-transparent outline-none border-b border-current"
              />
            ) : (
              <div className="pe-5">
                {message}
                {isEdited && (
                  <span className={`text-[10px] ms-1.5 ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
                    {t('edited')}
                  </span>
                )}
              </div>
            )}

            {/* 3-dots button */}
            {!isEditing && (
              <button
                className="absolute top-1.5 end-1.5 p-1 rounded-full hover:bg-white/10 opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
                onClick={() => setShowControls((v) => !v)}
                aria-label={t('showMessageControls')}
              >
                <EllipsisVerticalIcon size={16} />
              </button>
            )}
          </div>

          {/* Time */}
          <span className="text-[10px] text-[var(--text-tertiary)] opacity-0 group-hover:opacity-60 transition-opacity whitespace-nowrap pb-1">
            {sendTime}
          </span>

          {showControls && (
            <div
              ref={controlsRef}
              className="absolute z-20 top-8 end-0"
            >
                <MessageControls
                  isOwn={isOwn}
                  isPinned={isPinned}
                  onCopy={handleCopy}
                  onEdit={handleStartEdit}
                  onDelete={handleDelete}
                  onPin={handlePinToggle}
                />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
