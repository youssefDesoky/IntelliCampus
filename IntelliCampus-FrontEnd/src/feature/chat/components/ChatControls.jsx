import { useState, useRef, useEffect } from "react";
import { useTranslation } from 'react-i18next';
import { PaperclipIcon, PaperPlaneIcon, ImageIcon, FileIcon } from "../../../components/ui/icons";
import { fetchMyStudentCourses } from "../../course/services/coursesApi";
import { FAHIM_USER_ID, uploadFile } from "../services/chatService";
import { useError } from '../../../contexts/ErrorContext.jsx';

export default function ChatControls({ sendMessage, onInputChange, onAttachFile, chatPartner, onSendCourseQuestion }) {
  const { t, i18n } = useTranslation('chat');
  const { showError } = useError();
  const isRTL = i18n.language === 'ar';
  const [text, setText] = useState("");
  const [focused, setFocused] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  const isFahim = String(chatPartner?.userId) === FAHIM_USER_ID;
  const [aiMode, setAiMode] = useState("advisor");
  const isCourseQa = isFahim && aiMode === "course";
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState({ code: "", name: "" });
  const [coursesLoading, setCoursesLoading] = useState(false);
  const [courseOpen, setCourseOpen] = useState(false);
  const [courseSearch, setCourseSearch] = useState("");
  const [pendingAttachment, setPendingAttachment] = useState(null);
  const [uploading, setUploading] = useState(false);
  const filteredCourses = courses.filter((c) => {
    const q = courseSearch.toLowerCase();
    const code = (c.courseCode || c.code || "").toLowerCase();
    const name = (c.courseName || c.name || "").toLowerCase();
    return code.includes(q) || name.includes(q);
  });

  useEffect(() => {
    if (isFahim && aiMode === "course") {
      setCoursesLoading(true);
      fetchMyStudentCourses()
        .then((data) => {
          const list = Array.isArray(data) ? data : (data.items || data.data || []);
          setCourses(list);
          if (list.length > 0) {
            const first = list[0];
            setSelectedCourse({
              code: first.courseCode || first.code || "",
              name: first.courseName || first.name || "",
            });
          }
        })
        .catch(() => setCourses([]))
        .finally(() => setCoursesLoading(false));
    }
  }, [isFahim, aiMode]);

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

  const handleSend = async () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    if (isFahim && aiMode === "course") {
      if (!selectedCourse.code || !onSendCourseQuestion) return;
      let fileUrl = null;
      if (pendingAttachment) {
        setUploading(true);
        try {
          const res = await uploadFile(pendingAttachment.file);
          fileUrl = res?.url ?? null;
        } catch (err) {
          showError(err?.message || t('uploadFailed'));
          setUploading(false);
          setPendingAttachment(null);
          return;
        }
        setUploading(false);
        setPendingAttachment(null);
      }
      onSendCourseQuestion(selectedCourse, trimmed, fileUrl);
    } else {
      sendMessage(trimmed);
    }
    setText("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = async (e, type) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setMenuOpen(false);
    e.target.value = "";

    if (isFahim && aiMode === "course") {
      setPendingAttachment({ file, name: file.name, type });
      return;
    }

    setUploading(true);
    try {
      const res = await uploadFile(file);
      const url = res?.url;
      if (url) sendMessage(url);
    } catch (err) {
      showError(err?.message || t('uploadFailed'));
    } finally {
      setUploading(false);
    }
  };

  const canSend = text.trim().length > 0 && !(isFahim && aiMode === "course" && !selectedCourse.code) && !uploading;
  const isTyping = text.length > 0;

  return (
    <div className="pt-3 border-t border-[var(--border-subtle)] mt-2 relative">
      {/* AI Mode selector — only when chatting with Fahim */}
      {isFahim && (
        <div className="mb-3">
          <div className="flex items-center gap-1.5 bg-[var(--surface-subtle)] rounded-xl p-1 border border-[var(--border-subtle)] shadow-sm">
            <button
              type="button"
              onClick={() => { setAiMode("advisor"); setSelectedCourse({ code: "", name: "" }); setCourseOpen(false); setCourseSearch(""); }}
              className={`flex items-center gap-1.5 flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                aiMode === "advisor"
                  ? "bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm border border-[var(--primary)]/20"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M12 20h9" /><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z" />
              </svg>
              {t('mode.academicAdvisor')}
            </button>
            <button
              type="button"
              onClick={() => { setAiMode("course"); setCourseOpen(false); setCourseSearch(""); }}
              className={`flex items-center gap-1.5 flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all duration-200 ${
                aiMode === "course"
                  ? "bg-[var(--primary)]/15 text-[var(--primary)] shadow-sm border border-[var(--primary)]/20"
                  : "text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)]"
              }`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
                <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" /><path d="M9 10h6" /><path d="M9 14h6" /><path d="M9 6h6" />
              </svg>
              {t('mode.courseQa')}
            </button>
          </div>

          {/* Course dropdown — only in course Q&A mode */}
          {aiMode === "course" && (
            <div className="mt-2 px-0.5">
              {coursesLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  <svg className="animate-spin h-3.5 w-3.5 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span className="text-xs text-[var(--text-tertiary)]">{t('mode.loadingCourses')}</span>
                </div>
              ) : courses.length === 0 ? (
                <div className="px-3 py-2 rounded-lg bg-[var(--surface-subtle)] border border-[var(--border-subtle)]">
                  <span className="text-xs text-[var(--text-tertiary)]">{t('mode.noCourses')}</span>
                </div>
              ) : (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setCourseOpen((prev) => !prev)}
                    className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg border border-[var(--border-subtle)] bg-[var(--surface-subtle)] text-xs text-start outline-none focus:border-[var(--primary)]/40 focus:bg-[var(--primary-10)] transition-colors cursor-pointer hover:bg-[var(--surface-hover)]"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-[var(--text-tertiary)]">
                      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H19a1 1 0 0 1 1 1v18a1 1 0 0 1-1 1H6.5A2.5 2.5 0 0 1 4 19.5Z" />
                      <path d="M9 10h6" /><path d="M9 14h6" />
                    </svg>
                    <span className="flex-1 truncate">
                      {selectedCourse.name || t('mode.selectCourse')}
                    </span>
                    <svg className={`shrink-0 h-3.5 w-3.5 text-[var(--text-tertiary)] transition-transform duration-200 ${courseOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="m6 9 6 6 6-6" />
                    </svg>
                  </button>

                  {courseOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setCourseOpen(false)} />
                      <div className="absolute z-50 start-0 end-0 bottom-full mb-1 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xl backdrop-blur-lg overflow-hidden">
                        <div className="p-2 border-b border-[var(--border-subtle)]">
                          <div className="relative">
                            <svg className="absolute start-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[var(--text-tertiary)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                            </svg>
                            <input
                              type="text"
                              value={courseSearch}
                              onChange={(e) => setCourseSearch(e.target.value)}
                              placeholder="Search courses..."
                              className="w-full text-xs bg-[var(--surface-subtle)] border border-[var(--border-subtle)] rounded-lg ps-8 pe-3 py-1.5 outline-none text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--primary)]/40"
                            />
                          </div>
                        </div>
                        <div className="max-h-48 overflow-y-auto py-1 no-scrollbar">
                          {filteredCourses.length === 0 ? (
                            <div className="px-3 py-4 text-center text-xs text-[var(--text-tertiary)]">
                              No courses match "{courseSearch}"
                            </div>
                          ) : (
                            filteredCourses.map((c) => {
                              const code = c.courseCode || c.code || "";
                              const name = c.courseName || c.name || code;
                              const isSelected = code === selectedCourse.code;
                              return (
                                <button
                                  key={code}
                                  type="button"
                                  onClick={() => { setSelectedCourse({ code, name }); setCourseOpen(false); setCourseSearch(""); }}
                                  className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-start transition-colors hover:bg-[var(--surface-hover)] ${
                                    isSelected ? "bg-[var(--primary)]/10 text-[var(--primary)]" : "text-[var(--text-primary)]"
                                  }`}
                                >
                                  <div className={`w-1.5 h-1.5 rounded-full shrink-0 ${isSelected ? "bg-[var(--primary)]" : "bg-[var(--text-tertiary)]"}`} />
                                  <span className="font-medium">{code}</span>
                                  <span className="text-[var(--text-tertiary)]">—</span>
                                  <span className="truncate text-[var(--text-secondary)]">{name}</span>
                                  {isSelected && (
                                    <svg className="ms-auto shrink-0 h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                      <polyline points="20 6 9 17 4 12" />
                                    </svg>
                                  )}
                                </button>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Pending attachment chip — only for Course Q&A mode */}
      {isCourseQa && pendingAttachment && (
        <div className="mb-2 flex items-center gap-2 px-3 py-2 rounded-lg bg-[var(--primary)]/8 border border-[var(--primary)]/20 text-xs">
          {pendingAttachment.type === "media" ? (
            <ImageIcon size={14} className="text-[var(--primary)] shrink-0" />
          ) : (
            <FileIcon size={14} className="text-[var(--primary)] shrink-0" />
          )}
          <span className="flex-1 truncate text-[var(--text-secondary)]" title={pendingAttachment.name}>
            {pendingAttachment.name}
          </span>
          <button
            type="button"
            onClick={() => setPendingAttachment(null)}
            className="shrink-0 p-0.5 rounded text-[var(--text-tertiary)] hover:text-red-500 hover:bg-[var(--surface-hover)] transition-colors"
            aria-label={t('removeAttachment')}
          >
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4l8 8M12 4l-8 8" />
            </svg>
          </button>
        </div>
      )}

      {uploading && (
        <div className="mb-2 flex items-center gap-2 px-1 text-xs text-[var(--text-tertiary)]">
          <svg className="animate-spin h-3.5 w-3.5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <span>{t('uploading')}</span>
        </div>
      )}

      <div
        className={`
          flex items-center gap-2 w-full
          rounded-xl border px-3 py-2.5 transition-all duration-200
          rtl:flex-row-reverse
          ${focused
            ? "border-[var(--primary)]/50 bg-[var(--surface-hover)] shadow-[0_0_0_3px_var(--primary-10)]"
            : "border-[var(--border-subtle)] bg-[var(--surface-subtle)] hover:border-[var(--border-hover)]"
          }
        `}
      >
        {/* Attachment — hidden for Academic Advisor mode */}
        {(!isFahim || aiMode !== "advisor") && (
        <div className="relative flex-shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1 rounded-lg text-[var(--text-tertiary)] hover:text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors"
            aria-label={t('attachFile')}
          >
            <PaperclipIcon size={17} />
          </button>

          {menuOpen && (
            <div className="absolute bottom-full start-0 mb-2 w-44 rounded-xl border border-[var(--border-subtle)] bg-[var(--surface)] shadow-xl p-1.5 z-50">
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors text-start"
              >
                <ImageIcon size={16} className="text-[var(--primary)]" />
                {t('photoVideo')}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-3 w-full px-3 py-2 rounded-lg text-sm text-[var(--text-secondary)] hover:bg-[var(--surface-hover)] transition-colors text-start"
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
        )}

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
          dir={isRTL ? 'rtl' : 'ltr'}
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
              : "bg-[var(--surface-hover)] text-[var(--text-tertiary)]"
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
