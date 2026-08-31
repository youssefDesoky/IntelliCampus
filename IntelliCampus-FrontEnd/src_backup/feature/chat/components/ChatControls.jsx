import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { PaperclipIcon, PaperPlaneIcon, ImageIcon, FileIcon } from "../../../components/ui/icons";

export default function ChatControls({ sendMessage, onInputChange, onAttachFile }) {
  const { t } = useTranslation('chat');
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    if (menuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [menuOpen]);

  const handleSend = () => {
    const trimmed = text.trim();
    if (trimmed) {
      sendMessage(trimmed);
      setText("");
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (onAttachFile) {
      onAttachFile(file, type);
    }
    setMenuOpen(false);
    e.target.value = "";
  };

  const canSend = text.trim().length > 0;
  const isTyping = text.length > 0;

  return (
    <div className="pt-3 border-t border-white/8 mt-2 relative">
      <div
        className={`
          flex items-center gap-2 w-full
          rounded-xl border px-3 py-2.5 transition-all duration-200
          ${focused
            ? "border-[var(--primary)]/50 bg-white/6 shadow-[0_0_0_3px_var(--primary-10,rgba(59,130,246,0.08))]"
            : "border-white/10 bg-white/4 hover:border-white/20"
          }
        `}
      >
        {/* Attachment */}
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-white/6 transition-colors"
            aria-label={t('attachFile')}
          >
            <PaperclipIcon size={17} />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full start-0 mb-2 w-44 rounded-xl border border-white/10 bg-[var(--surface)] shadow-xl p-1.5 z-50">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/6 transition-colors text-start"
              >
                <ImageIcon size={16} className="text-[var(--primary)]" />
                {t('photoVideo')}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-white/6 transition-colors text-start"
              >
                <FileIcon size={16} className="text-[var(--primary)]" />
                {t('document')}
              </button>
            </div>
          )}

          <input
            ref={imageInputRef}
            type="file"
            accept="image/*,video/*"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "media")}
          />
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={(e) => handleFileSelect(e, "file")}
          />
        </div>

        {/* Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (onInputChange) onInputChange();
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={t('typeMessage')}
          className="
            flex-1 bg-transparent outline-none border-none
            text-sm text-[var(--text-primary)]
            placeholder:text-[var(--text-tertiary)]
            min-w-0
          "
        />

        {/* Send */}
        <button
          type="button"
          onClick={handleSend}
          className={`
            flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center
            transition-all duration-200
            ${canSend
              ? "bg-[var(--primary)] text-white hover:brightness-110 active:scale-95 shadow-md"
              : "bg-white/6 text-[var(--text-tertiary)]"
            }
          `}
          aria-label={t('send')}
          disabled={!canSend}
        >
          <PaperPlaneIcon size={18} />
        </button>
      </div>

      <p className="hidden md:block text-center text-[10px] text-[var(--text-tertiary)] mt-2">
        {t('sendHint')}
      </p>

      <style>{`
        @keyframes bounceDot {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}