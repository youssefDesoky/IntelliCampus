import { useTranslation } from 'react-i18next';
import { useState } from "react";
import { useOutletContext } from "react-router-dom";
import { PlusIcon, Grid3ColIcon, Grid2ColIcon, ListIcon } from "../../../components/ui/icons";

import Button from "../../../components/ui/Button";
import Section from "../../../components/ui/Section";
import SearchBar from "../../../components/ui/SearchBar";
import ToggleViewMode from "../../../components/ui/ToggleViewMode";
import PaginationButtons from "../../../components/ui/PaginationButtons";
import SmartNote from "./SmartNote";
import SmartNoteEditor from "./SmartNoteEditor.jsx";

const emptyNote = {
    id: "new-note",
    title: "",
    content: "",
    creationDate: "",
    modified: "",
};

export default function SmartNotesBody({ notes=[], isPhone, isTablet, viewMode, setViewMode, onSaveNote, onDeleteNote, studentId, courseId: propCourseId }) {
    const { t } = useTranslation('student');
    // Get course data from CourseShell context if available
    const courseCtx = useOutletContext()
    const courseFolders = courseCtx?.course?.folders || []
    const courseId = propCourseId ?? courseCtx?.courseId ?? null
    const itemsPerPage = isPhone ? 6 : isTablet ? 8 : 12;
    const [currentPage, setCurrentPage] = useState(1);
    const [isComposerOpen, setIsComposerOpen] = useState(false);
    const totalPages = Math.max(1, Math.ceil(notes.length / itemsPerPage));

    // Reset to page 1 if current page exceeds total pages
    if (currentPage > totalPages) {
        setCurrentPage(1);
    }


    return (
        <div className="flex flex-col flex-1">
            <Section className="p-4 lg:p-6 mb-6 bg-bg-surface-primary-default-light dark:bg-bg-surface-primary-default-dark rounded-xl border border-border-primary-default-light dark:border-border-primary-default-dark">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div className="w-full lg:w-fit flex items-center justify-between gap-4">
                        <SearchBar placeholder={t('smartNotes.search')} />

                        {isPhone && (
                            <button
                                type="button"
                                disabled={!studentId}
                                onClick={() => setIsComposerOpen(true)}
                                className="flex items-center justify-center p-2 bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark rounded-md hover:scale-[1.02] shrink-0 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <PlusIcon className="w-5 h-5" />
                            </button>
                        )}

                        {!isPhone && setViewMode && (
                            <div className="flex items-center">
                                <ToggleViewMode
                                    id="notes-view-mode-toggle"
                                    isVertical={false}
                                    isFirstMode={viewMode === (isTablet ? "list" : "grid-3")}
                                    onFirstModeSelect={() => {
                                        const mode = isTablet ? "list" : "grid-3";
                                        setViewMode(mode);
                                        localStorage.setItem("notesViewMode", mode);
                                    }}
                                    onSecondModeSelect={() => {
                                        setViewMode("grid-2");
                                        localStorage.setItem("notesViewMode", "grid-2");
                                    }}
                                    firstModeLabel={isTablet ? <ListIcon className="w-5 h-5" /> : <Grid3ColIcon className="w-5 h-5" />}
                                    secondModeLabel={<Grid2ColIcon className="w-5 h-5" />}
                                />
                            </div>
                        )}
                    </div>

                    {!isPhone && (
                        <Button
                            type="button"
                            disabled={!studentId}
                            onClick={() => setIsComposerOpen(true)}
                            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-bg-fill-accent-default-light dark:bg-bg-fill-accent-default-dark text-text-accent-active-light dark:text-text-accent-active-dark rounded-md hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <PlusIcon className="w-5 h-5" />
                            <span className="font-semibold">{t('smartNotes.addNew')}</span>
                        </Button>
                    )}
                </div>
            </Section>

            {isComposerOpen && (
                <SmartNoteEditor
                    note={emptyNote}
                    onClose={() => setIsComposerOpen(false)}
                    courseFolders={courseFolders}
                    courseId={courseId}
                    studentId={studentId}
                    onSaveNote={onSaveNote}
                />
            )}

            <div className={`grid ${isPhone ? "grid-cols-1" : isTablet ? (viewMode === 'list' ? "grid-cols-1" : "grid-cols-2") : (viewMode === 'grid-3' ? "grid-cols-3" : "grid-cols-2")} gap-6 mb-4`}>
                {notes.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center min-h-[60vh] text-center">
                        <p className="text-base font-semibold text-text-primary-default-light dark:text-text-primary-default-dark">{t('smartNotes.noNotes')}</p>
                        <p className="mt-1 text-sm text-text-secondary-default-light dark:text-text-secondary-default-dark">{t('smartNotes.createPrompt')}</p>
                    </div>
                ) : (
                    notes.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage).map((note) => (
                        <SmartNote
                            key={note.id}
                            note={note}
                            viewMode={viewMode}
                            isTablet={isTablet}
                            courseFolders={courseFolders}
                            courseId={courseId}
                            studentId={studentId}
                            onSaveNote={onSaveNote}
                            onDeleteNote={onDeleteNote}
                        />
                    ))
                )}
            </div>

            {totalPages > 1 && notes.length > 0 && (
                <PaginationButtons buttonsNumber={totalPages} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            )}
        </div>
    );
}
