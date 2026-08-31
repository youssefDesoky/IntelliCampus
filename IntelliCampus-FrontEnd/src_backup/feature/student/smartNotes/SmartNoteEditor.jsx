import { useTranslation } from 'react-i18next';
import { useState, useEffect, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import Tiptap from "../ui/Tiptap"
import ModelOverlay from "../../../components/ui/ModelOverlay"
import { BookIcon, LinkIcon, ClockIcon, FileLinesIcon } from "../../../components/ui/icons"
import { createNote, updateNote, fromBackendLinkedLecture } from "./notesApi"

// Fallback hardcoded options when not in CourseShell
const defaultWeeklyLectureOptions = [
    {
        id: 1,
        title: "Data Structures",
        shortTitle: "Week 2",
        weekLabel: "Week 2 Lecture",
        course: "CS301",
        materialFolderId: "week-2",
    },
    {
        id: 3,
        title: "Web Development",
        shortTitle: "Week 4",
        weekLabel: "Week 4 Lecture",
        course: "CS310",
        materialFolderId: "week-4",
    },
]

function useAutosave(note, titleRef, bodyRef, delay = 800) {
    const [saveStatus, setSaveStatus] = useState("idle")
    const timer = useRef(null)

    const persist = useCallback(() => {
        setSaveStatus("saving")
        sessionStorage.setItem("session", JSON.stringify({
            id: note?.id ?? null,
            title: titleRef.current,
            body: bodyRef.current,
        }))
        requestAnimationFrame(() => setSaveStatus("saved"))
    }, [note, titleRef, bodyRef])

    const schedule = useCallback(() => {
        clearTimeout(timer.current)
        timer.current = setTimeout(persist, delay)
    }, [persist, delay])

    useEffect(() => () => clearTimeout(timer.current), [])
    return { saveStatus, schedule }
}

function countWords(html = "") {
    const text = html.replace(/<[^>]+>/g, " ").trim()
    return text ? text.split(/\s+/).length : 0
}

function htmlToText(html = "") {
    return html
        .replace(/<[^>]*>/g, " ")
        .replace(/\s+/g, " ")
        .trim()
}

function SaveBadge({ status, t }) {
    const map = {
        idle:   null,
        saving: { dot: "bg-amber-400 animate-pulse", label: t('smartNotes.saving') },
        saved:  { dot: "bg-emerald-400",             label: t('smartNotes.saved')   },
    }
    const cfg = map[status]
    if (!cfg) return null
    return (
        <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded-full px-2.5 py-1">
            <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${cfg.dot}`} />
            {cfg.label}
        </span>
    )
}

export default function SmartNoteEditor({ note, onClose, courseFolders = [], courseId = null, studentId = null, onSaveNote }) {
    const { t } = useTranslation('student');
    const normalizedLinkedLecture = fromBackendLinkedLecture(note?.linkedLecture) ?? note?.linkedLecture ?? null

    const titleRef = useRef(note?.title ?? "")
    const bodyRef  = useRef(note?.content ?? "")

    const [titleValue, setTitleValue] = useState(note?.title ?? "")
    const [wordCount,  setWordCount]  = useState(countWords(note?.content))
    const [visible,    setVisible]    = useState(false)
    const [linkedLecture, setLinkedLecture] = useState(normalizedLinkedLecture)
    const [isPickerOpen, setIsPickerOpen] = useState(false)
    const [isSaving,   setIsSaving]   = useState(false)
    const navigate = useNavigate()
    
    // Build lecture options from course folders or use defaults
    let weeklyLectureOptions = defaultWeeklyLectureOptions
    if (courseFolders && courseFolders.length > 0) {
        weeklyLectureOptions = courseFolders.map((folder, idx) => ({
            id: folder.materialFolderId ?? idx + 1,
            title: folder.name || `Week ${idx + 1}`,
            shortTitle: folder.name || `Week ${idx + 1}`,
            weekLabel: `${folder.name || `Week ${idx + 1}`} Lecture`,
            description: folder.description || "",
            courseId: folder.courseId ?? courseId,
            materialFolderId: folder.materialFolderId ?? idx + 1,
        }))
    }

    const { saveStatus, schedule } = useAutosave(note, titleRef, bodyRef)

    const handleClose = useCallback(() => {
        setVisible(false)
        setTimeout(onClose, 220)
    }, [onClose])

    useEffect(() => { requestAnimationFrame(() => setVisible(true)) }, [])
    useEffect(() => {
        const h = (e) => { if (e.key === "Escape") handleClose() }
        window.addEventListener("keydown", h)
        return () => window.removeEventListener("keydown", h)
    }, [handleClose])
    function handleTitleChange(e) {
        titleRef.current = e.target.value
        setTitleValue(e.target.value)
        schedule()
    }
    function handleBodyChange(content) {
        bodyRef.current = content
        setWordCount(countWords(content))
        schedule()
    }

    async function handleSave() {
        const title = titleRef.current.trim()
        const plainContent = htmlToText(bodyRef.current)

        if (!title && !plainContent) {
            handleClose()
            return
        }

        const isNewNote = !note?.id || note?.id === "new-note"

        if (isNewNote && !studentId) {
            handleClose()
            return
        }

        setIsSaving(true)

        try {
            let savedNote
            if (isNewNote) {
                savedNote = await createNote({
                    studentId,
                    courseId,
                    title,
                    content: bodyRef.current,
                    linkedLecture,
                    courseFolders,
                })
            } else {
                savedNote = await updateNote(note.id, {
                    title,
                    content: bodyRef.current,
                    linkedLecture,
                    courseFolders,
                })
            }

            onSaveNote?.(savedNote)
            handleClose()
        } catch {
            // apiClient already emits errors via ErrorContext
        } finally {
            setIsSaving(false)
        }
    }

    return (
        <ModelOverlay onClose={handleClose}>
            <div
                onClick={(e) => e.stopPropagation()}
                style={{
                    transform: visible ? "translateY(0) scale(1)" : "translateY(24px) scale(0.97)",
                    opacity: visible ? 1 : 0,
                }}
                className="relative z-50 w-full max-w-4xl h-[88vh] rounded-2xl overflow-hidden flex flex-col bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark shadow-[0_32px_80px_-12px_rgba(0,0,0,0.28)]"
            >
                {/* ── Top bar ── */}
                <header className="flex items-center justify-between px-4 py-2.5 border-b border-border-primary-default-light dark:border-border-primary-default-dark shrink-0">
                    <div className="flex items-center gap-2.5">
                        {/* Doc icon */}
                        <div className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark shrink-0">
                            <NoteIcon />
                        </div>
                        <SaveBadge status={saveStatus} t={t} />
                    </div>

                    <div className="flex items-center gap-1.5">
                        {/* Lecture chip */}
                        {linkedLecture ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    const folderId = linkedLecture?.id ?? linkedLecture?.materialFolderId
                                    if (courseId && folderId != null) {
                                        navigate(`/courses/${courseId}/materials?folderId=${folderId}`)
                                    }
                                }}
                                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-800/50 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                            >
                                <BookIcon className="w-3 h-3" />
                                {linkedLecture?.shortTitle ?? "Lecture"}
                            </button>
                        ) : (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.stopPropagation()
                                    setIsPickerOpen((prev) => !prev)
                                }}
                                className="flex items-center gap-1.5 text-[11px] font-medium px-2.5 py-1.5 rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-500 transition-colors"
                            >
                                <LinkIcon className="w-3 h-3" />
                                <span className="hidden sm:inline">{t('smartNotes.linkLecture')}</span>
                            </button>
                        )}

                        {/* Save */}
                        <button
                            type="button"
                            disabled={isSaving}
                            onClick={handleSave}
                            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-[11px] font-semibold rounded-lg bg-text-primary-active-light dark:bg-text-primary-active-dark text-bg-surface-primary-default-light dark:text-bg-surface-primary-default-dark hover:opacity-85 active:scale-[0.97] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            <SaveIcon />
                            <span className="hidden sm:inline">{isSaving ? t('smartNotes.saving') : t('smartNotes.save')}</span>
                        </button>

                        {/* Close */}
                        <button
                            type="button"
                            onClick={handleClose}
                            aria-label={t('smartNotes.closeEsc')}
                            className="w-7 h-7 flex items-center justify-center rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark text-icon-secondary-default-light dark:text-icon-primary-default-dark hover:bg-bg-surface-secondary-hover-light dark:hover:bg-bg-surface-secondary-hover-dark active:scale-90 transition-all"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                </header>

                {isPickerOpen && (
                    <div className="px-4 py-2 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark shrink-0">
                        <div className="flex items-center gap-2">
                            <select
                                value={linkedLecture?.id ?? ""}
                                onChange={(e) => {
                                    const selected = weeklyLectureOptions.find((item) => String(item.id) === e.target.value)
                                    setLinkedLecture(selected ?? null)
                                    setIsPickerOpen(false)
                                }}
                                className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark text-text-primary-default-light dark:text-text-primary-default-dark"
                            >
                                <option value="">{t('smartNotes.selectLecture')}</option>
                                {weeklyLectureOptions.map((lecture) => (
                                    <option key={lecture.id} value={lecture.id}>
                                        {lecture.weekLabel} - {lecture.title}
                                    </option>
                                ))}
                            </select>

                            <button
                                type="button"
                                onClick={() => {
                                    setLinkedLecture(null)
                                    setIsPickerOpen(false)
                                }}
                                className="px-2 py-1.5 text-xs rounded-lg border border-border-primary-default-light dark:border-border-primary-default-dark text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-red-500"
                            >
                                {t('smartNotes.clear')}
                            </button>
                        </div>
                    </div>
                )}

                {/* ── Lecture strip (only when linked) ── */}
                {linkedLecture && (
                    <div className="flex items-center gap-2 px-4 py-1.5 sm:py-2 border-b border-border-primary-default-light dark:border-border-primary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark shrink-0">
                        <div className="w-6 h-6 rounded-md bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center shrink-0">
                            <BookIcon className="w-3 h-3 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[9.5px] font-semibold text-indigo-500 dark:text-indigo-400 uppercase tracking-wide mb-0.5">
                                {t('smartNotes.linkedLecture')}
                            </p>
                            <p className="text-xs font-medium text-text-primary-active-light dark:text-text-primary-active-dark truncate">
                                {linkedLecture.title}
                            </p>
                        </div>
                        <span className="text-[10px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark hidden sm:block shrink-0">
                            {linkedLecture.weekLabel}
                        </span>
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation()
                                setLinkedLecture(null)
                            }}
                            className="w-5 h-5 flex items-center justify-center rounded-md border border-border-primary-default-light dark:border-border-primary-default-dark text-icon-secondary-default-light dark:text-icon-primary-default-dark hover:bg-red-50 dark:hover:bg-red-950 hover:border-red-200 hover:text-red-400 transition-colors shrink-0"
                        >
                            <CloseIcon />
                        </button>
                    </div>
                )}

                {/* ── Title ── */}
                <div className="px-4 sm:px-8 pt-4 sm:pt-5 pb-2 shrink-0">
                    <input
                        type="text"
                        name="title"
                        autoFocus
                        placeholder={t('smartNotes.untitled')}
                        value={titleValue}
                        onChange={handleTitleChange}
                        className="w-full bg-transparent border-none outline-none text-[1.25rem] sm:text-[1.5rem] font-semibold leading-snug tracking-tight text-text-primary-active-light dark:text-text-primary-active-dark placeholder:text-text-placeholder-default-light dark:placeholder:text-text-placeholder-default-dark placeholder:font-normal"
                    />
                    <div className="mt-3 h-px bg-border-primary-default-light dark:border-border-primary-default-dark opacity-50" />
                </div>

                {/* ── Tiptap (toolbar + editor body) ── */}
                <div className="flex-1 overflow-y-auto min-h-0">
                    <Tiptap
                        content={note?.content ?? ""}
                        onChange={handleBodyChange}
                        className="h-full"
                    />
                </div>

                {/* ── Status bar ── */}
                <footer className="flex items-center justify-between px-4 py-2 border-t border-border-primary-default-light dark:border-border-primary-default-dark shrink-0">
                    <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1 text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <FileLinesIcon className="w-2.5 h-2.5" />
                            {wordCount} {wordCount === 1 ? t('smartNotes.word') : t('smartNotes.words')}
                        </span>
                        <span className="flex items-center gap-1 text-[11px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark">
                            <ClockIcon className="w-2.5 h-2.5" />
                            {note?.modified ?? t('smartNotes.justNow')}
                        </span>
                    </div>
                    <kbd className="text-[10px] text-text-tertiary-default-light dark:text-text-tertiary-default-dark bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark border border-border-primary-default-light dark:border-border-primary-default-dark rounded px-1.5 py-0.5 font-mono">
                        Esc
                    </kbd>
                </footer>
            </div>
        </ModelOverlay>
    )
}

function NoteIcon() {
    return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-icon-secondary-default-light dark:text-icon-primary-default-dark"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
}
function SaveIcon() {
    return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
}
function CloseIcon() {
    return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
}