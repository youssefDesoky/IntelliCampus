import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import MessageControls from "./MessageControls";
import { EllipsisVerticalIcon } from "../../../components/ui/icons";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const isImageUrl = (str) =>
  /\.(jpe?g|png|gif|webp|bmp|svg)(\?.*)?$/i.test(str);

const isFileUrl = (str) =>
  /\/uploads\//i.test(str) && !isImageUrl(str);

export default function Message({ sender, message, sendTime, isGrouped, showSenderInfo, messageId, deleteMessage, editMessage, pinMessage, unpinMessage, isEdited, isPinned, isSystemMessage, isAi }) {
  const { t, i18n } = useTranslation('chat');
  const isRtl = i18n.dir() === 'rtl';
  const [showControls, setShowControls] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(message);
  const editInputRef = useRef(null);
  const controlsRef = useRef(null);
  const isOwn = sender.isOwnMessage;

  if (isSystemMessage) {
    return (
      <div className="flex justify-center py-1.5">
        <span className="text-xs text-gray-400 dark:text-gray-500 italic bg-gray-50 dark:bg-gray-800/50 px-3 py-1 rounded-full">
          {message}
        </span>
      </div>
    );
  }

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
      className={`flex flex-col px-2 group relative ${
        isOwn ? "items-end" : "items-start"
      } ${isGrouped ? "mt-0.5" : "mt-2"}`}
    >
      {/* Sender info — above the bubble only in groups, first message */}
      {showSenderInfo && !isGrouped && (
        <div className="flex items-center gap-2 mb-1.5 ml-1">
          <div className={`w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center ring-2 ring-[var(--border-subtle)] shrink-0`}>
            <span className="text-[10px] font-bold text-white">
              {sender.name?.charAt(0)?.toUpperCase() || "?"}
            </span>
          </div>
          <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">
            {sender.name}
          </span>
        </div>
      )}

<div className={`flex items-end gap-1.5 relative ${isOwn ? "flex-row-reverse" : ""}`}>
  {/* Message bubble */}
  <div
    className={`relative px-4 py-2.5 text-sm leading-relaxed break-words max-w-md
      ${
        isOwn
          ? "bg-blue-600 text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)]"
          : "bg-[var(--surface-hover)] border border-[var(--border-subtle)] text-[var(--text-primary)] shadow-sm"
      }
      ${
        !isGrouped
          ? isOwn
            ? isRtl
              ? "rounded-[18px] rounded-tl-md"
              : "rounded-[18px] rounded-tr-md"
            : isRtl
              ? "rounded-[18px] rounded-tr-md"
              : "rounded-[18px] rounded-tl-md"
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
        dir={isRtl ? "rtl" : "ltr"}
        className="w-full bg-transparent outline-none border-b border-current"
      />
    ) : isImageUrl(message) ? (
      <div className="pr-5">
        <img
          src={message}
          alt={t('sharedImage')}
          className="max-w-full rounded-lg cursor-pointer"
          style={{ maxHeight: "300px" }}
          onClick={() => window.open(message, "_blank")}
        />
      </div>
    ) : isFileUrl(message) ? (
      <div className="pe-5">
        <button
          onClick={() => window.open(message, "_blank")}
          className="flex items-center gap-2 px-3 py-2 border border-[var(--border-subtle)] rounded-lg hover:bg-[var(--surface-hover)] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
          <span>{t('downloadFile')}</span>
        </button>
        {isEdited && (
          <span className={`text-[10px] ms-1.5 ${isOwn ? "text-blue-200" : "text-gray-400"}`}>
            {t('edited')}
          </span>
        )}
      </div>
            ) : (
              <div className="pe-5">
                {isAi ? (
                    <div className="prose prose-sm dark:prose-invert max-w-none [&_h1]:text-base [&_h2]:text-sm [&_h3]:text-sm [&_ul]:ps-4 [&_ol]:ps-4 [&_li]:my-0.5 [&_p]:my-1 [&_code]:bg-[var(--surface-active)] [&_code]:px-1 [&_code]:rounded [&_pre]:bg-[var(--surface-active)] [&_pre]:p-2 [&_pre]:rounded-lg [&_pre]:overflow-x-auto [&_pre_code]:bg-transparent [&_pre_code]:p-0 [&_blockquote]:border-s-2 [&_blockquote]:ps-2 [&_blockquote]:opacity-80">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {message}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <span>{message}</span>
                )}
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
            className="absolute top-1.5 end-1.5 p-1 rounded-full hover:bg-[var(--surface-active)] opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
            onClick={() => setShowControls((v) => !v)}
            aria-label={t("showMessageControls")}
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
            className="absolute z-20 top-8 right-0"
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
  );
}
