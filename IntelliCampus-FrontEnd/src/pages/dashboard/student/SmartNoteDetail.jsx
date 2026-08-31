import { useTranslation } from 'react-i18next';
import { useEffect, useState, useRef } from "react";
import { useParams, useLocation, useNavigate, useOutletContext } from "react-router-dom";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FahimIcon } from '../../../components/ui/icons';
import SmartNoteEditor from "../../../feature/student/smartNotes/SmartNoteEditor.jsx";
import { fetchNote, enhanceNote } from "../../../feature/student/smartNotes/notesApi";

const BackArrowIcon = () => (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M10 12L6 8l4-4" />
    </svg>
);

const SpinnerIcon = ({ className = "" }) => (
    <svg className={`animate-spin ${className}`} viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
    </svg>
);

const ChevronUpIcon = ({ className = "" }) => (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M4 10l4-4 4 4" />
    </svg>
);

const AlertIcon = ({ className = "" }) => (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" />
        <path d="M8 5.25v3.75M8 11.25h.01" />
    </svg>
);

const RefreshIcon = ({ className = "" }) => (
    <svg className={className} width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d="M2.5 8a5.5 5.5 0 019.5-3.86M13.5 8a5.5 5.5 0 01-9.5 3.86" />
        <path d="M12.4 2.6l.35 2.1-2.1.4M3.6 13.4l-.35-2.1 2.1-.4" />
    </svg>
);

const FahimBadge = ({ className = "" }) => (
    <div className={`shrink-0 rounded bg-linear-to-br from-indigo-500 to-cyan-500 flex items-center justify-center ${className}`}>
        <FahimIcon className="w-3 h-3 text-white" />
    </div>
);

const SkeletonLine = ({ width = "w-full", height = "h-2.5" }) => (
    <div className={`${height} ${width} rounded-full bg-bg-skeleton-default-light dark:bg-bg-skeleton-default-dark animate-pulse`} />
);

const markdownComponents = {
    h1: ({ children, ...props }) => <h1 className="text-sm font-bold my-1" {...props}>{children}</h1>,
    h2: ({ children, ...props }) => <h2 className="text-sm font-bold my-1" {...props}>{children}</h2>,
    h3: ({ children, ...props }) => <h3 className="text-sm font-semibold my-1" {...props}>{children}</h3>,
    p: ({ children, ...props }) => <p className="my-1" {...props}>{children}</p>,
    ul: ({ children, ...props }) => <ul className="list-disc list-inside my-1 space-y-0.5" {...props}>{children}</ul>,
    ol: ({ children, ...props }) => <ol className="list-decimal list-inside my-1 space-y-0.5" {...props}>{children}</ol>,
    li: ({ children, ...props }) => <li className="my-0.5" {...props}>{children}</li>,
    strong: ({ children, ...props }) => <strong className="font-semibold" {...props}>{children}</strong>,
    code: ({ children, ...props }) => <code className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark px-1 rounded text-[11px]" {...props}>{children}</code>,
    pre: ({ children, ...props }) => <pre className="bg-bg-surface-secondary-default-light dark:bg-bg-surface-secondary-default-dark p-2 rounded my-1 overflow-x-auto text-[11px]" {...props}>{children}</pre>,
};

export default function SmartNoteDetail() {
    const { t } = useTranslation('student');
    const { noteId } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const courseCtx = useOutletContext();
    const courseFolders = location.state?.courseFolders || courseCtx?.course?.folders || [];
    const courseId = location.state?.courseId ?? courseCtx?.courseId ?? null;
    const studentId = location.state?.studentId ?? null;

    const [note, setNote] = useState(location.state?.note || null);
    const [loading, setLoading] = useState(true);
    const [aiSummary, setAiSummary] = useState(location.state?.note?.aiSummary || null);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiError, setAiError] = useState(false);
    const [aiErrorMessage, setAiErrorMessage] = useState("");
    const [drawerOpen, setDrawerOpen] = useState(Boolean(location.state?.note?.aiSummary));
    const autoEnhanceRef = useRef(location.state?.autoEnhance || false);

    useEffect(() => {
        setLoading(true);
        fetchNote(noteId)
            .then((data) => {
                setNote(data);
                setAiSummary(data.aiSummary || null);
                setDrawerOpen(Boolean(data.aiSummary));
            })
            .catch(() => navigate(-1))
            .finally(() => setLoading(false));
    }, [noteId, navigate]);

    useEffect(() => {
        if (note) setAiSummary(note.aiSummary || null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note?.aiSummary]);

    useEffect(() => {
        if (aiLoading || aiSummary || aiError) setDrawerOpen(true);
    }, [aiLoading, aiSummary, aiError]);

    const handleBack = () => navigate(-1);

    const handleEnhance = async () => {
        setAiLoading(true);
        setAiError(false);
        try {
            const result = await enhanceNote(note.id);
            const summary = result.generatedText || result.aiSummary;
            setAiSummary(summary);
        } catch (err) {
            setAiError(true);
            setAiErrorMessage(err?.detail || err?.message || '');
        } finally {
            setAiLoading(false);
        }
    };

    useEffect(() => {
        if (!note || !autoEnhanceRef.current) return;
        if (!note.aiSummary) {
            handleEnhance();
        }
        autoEnhanceRef.current = false;
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [note]);

    const hasContent = Boolean(aiLoading || aiSummary || aiError);
    const tone = aiError ? 'danger' : (aiLoading || aiSummary) ? 'accent' : 'neutral';

    const toneClasses = {
        neutral: {
            bg: 'bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark',
            border: 'border-border-primary-default-light dark:border-border-primary-default-dark',
            text: 'text-text-secondary-default-light dark:text-text-secondary-default-dark',
        },
        accent: {
            bg: 'bg-bg-surface-accent-muted-light dark:bg-bg-surface-accent-muted-dark',
            border: 'border-border-accent-muted-light dark:border-border-accent-muted-dark',
            text: 'text-text-accent-default-light dark:text-text-accent-default-dark',
        },
        danger: {
            bg: 'bg-bg-surface-danger-muted-light dark:bg-bg-surface-danger-muted-dark',
            border: 'border-border-danger-muted-light dark:border-border-danger-muted-dark',
            text: 'text-text-danger-default-light dark:text-text-danger-default-dark',
        },
    }[tone];

    const barLabel = aiError
        ? (aiErrorMessage || t('smartNotes.aiError'))
        : aiLoading
            ? t('smartNotes.aiEnhancing')
            : aiSummary
                ? t('smartNotes.aiSummary')
                : t('smartNotes.aiEnhance');

    const handleBarToggle = () => {
        if (!hasContent) {
            handleEnhance();
            return;
        }
        setDrawerOpen((isOpen) => !isOpen);
    };

    return (
        <div className="flex flex-col h-full">
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border-primary-default-light dark:border-border-primary-default-dark shrink-0">
                <button
                    onClick={handleBack}
                    className="flex items-center gap-1.5 text-sm font-medium text-text-secondary-default-light dark:text-text-secondary-default-dark hover:text-text-primary-active-light dark:hover:text-text-primary-active-dark transition-colors shrink-0"
                >
                    <BackArrowIcon />
                    {t('smartNotes.backToNotes')}
                </button>
                {note?.title && (
                    <span className="truncate text-sm font-medium text-text-primary-default-light dark:text-text-primary-default-dark border-l border-border-primary-default-light dark:border-border-primary-default-dark pl-3">
                        {note.title}
                    </span>
                )}
            </div>

            {loading && (
                <div className="flex-1 min-h-0 px-4 sm:px-8 py-6 space-y-4 overflow-hidden">
                    <SkeletonLine width="w-1/3" height="h-4" />
                    <div className="space-y-2 pt-2">
                        <SkeletonLine width="w-full" />
                        <SkeletonLine width="w-11/12" />
                        <SkeletonLine width="w-4/5" />
                        <SkeletonLine width="w-full" />
                        <SkeletonLine width="w-2/3" />
                    </div>
                </div>
            )}

            {!loading && note && (
                <>
                    <div className="flex-1 min-h-0">
                        <SmartNoteEditor
                            note={note}
                            onClose={handleBack}
                            courseFolders={courseFolders}
                            courseId={courseId}
                            studentId={studentId}
                            onSaveNote={(saved) => {
                                setNote(saved);
                                if (saved?.aiSummary) setAiSummary(saved.aiSummary);
                            }}
                            isModal={false}
                        />
                    </div>

                    <div
                        className={`shrink-0 flex flex-col overflow-hidden border-t transition-[height] duration-300 ease-in-out ${toneClasses.bg} ${toneClasses.border} ${drawerOpen ? 'h-[45%] max-h-[420px]' : 'h-14'}`}
                    >
                        <div
                            role="button"
                            tabIndex={0}
                            onClick={handleBarToggle}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    e.preventDefault();
                                    handleBarToggle();
                                }
                            }}
                            className="h-14 shrink-0 w-full flex items-center gap-2 px-4 sm:px-8 cursor-pointer select-none"
                        >
                            <div className="flex items-center gap-2 min-w-0 flex-1">
                                {aiError ? (
                                    <AlertIcon className={`shrink-0 ${toneClasses.text}`} />
                                ) : (
                                    <FahimBadge className="w-5 h-5" />
                                )}
                                <span className={`truncate text-xs font-semibold ${toneClasses.text}`}>
                                    {barLabel}
                                </span>
                                {aiLoading && <SpinnerIcon className={`w-3.5 h-3.5 shrink-0 ${toneClasses.text}`} />}
                            </div>
                            {aiSummary && !aiLoading && (
                                <button
                                    onClick={(e) => { e.stopPropagation(); handleEnhance(); }}
                                    aria-label={t('smartNotes.aiEnhance')}
                                    className={`shrink-0 p-1 rounded-md transition-colors ${toneClasses.text} hover:bg-bg-surface-accent-muted-light dark:hover:bg-bg-surface-accent-muted-dark`}
                                >
                                    <RefreshIcon />
                                </button>
                            )}
                            {hasContent && (
                                <ChevronUpIcon className={`shrink-0 transition-transform duration-300 ${drawerOpen ? '' : 'rotate-180'} ${toneClasses.text}`} />
                            )}
                        </div>

                        <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-8 pb-4 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb-default-light dark:[&::-webkit-scrollbar-thumb]:bg-scrollbar-thumb-default-dark">
                            {aiError ? (
                                <div className="space-y-2">
                                    <p className={`text-xs ${toneClasses.text}`}>
                                        {aiErrorMessage || t('smartNotes.aiError')}
                                    </p>
                                    <button
                                        disabled={aiLoading}
                                        onClick={handleEnhance}
                                        className="text-xs font-semibold px-2.5 py-1 rounded-lg border border-border-danger-default-light dark:border-border-danger-default-dark text-text-danger-default-light dark:text-text-danger-default-dark hover:bg-bg-surface-danger-muted-light dark:hover:bg-bg-surface-danger-muted-dark transition-colors disabled:opacity-50"
                                    >
                                        {t('smartNotes.aiRetry')}
                                    </button>
                                </div>
                            ) : aiLoading && !aiSummary ? (
                                <div className="space-y-2 pt-1">
                                    <SkeletonLine width="w-5/6" />
                                    <SkeletonLine width="w-full" />
                                    <SkeletonLine width="w-2/3" />
                                </div>
                            ) : aiSummary ? (
                                <div className="text-xs text-text-secondary-default-light dark:text-text-secondary-default-dark leading-relaxed">
                                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
                                        {aiSummary}
                                    </ReactMarkdown>
                                </div>
                            ) : null}
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}