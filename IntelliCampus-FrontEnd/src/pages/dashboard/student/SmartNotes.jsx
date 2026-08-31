import { useMemo, useState } from "react";
import { useOutletContext, useRouteLoaderData } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";

import useDeviceType from "../../../hooks/useDeviceType";

import SmartNotesBody from "../../../feature/student/smartNotes/SmartNotesBody";
import { SmartNotesPageSkeleton } from "../../../feature/student/smartNotes/SkeletonLoader";
import { fromBackendLinkedLecture } from "../../../feature/student/smartNotes/notesApi";
import { fetchStudentNotes } from "../../../feature/student/services/profileApi";
import { getLocalizedField } from '../../../utils/getLocalizedField';


export default function SmartNotes() {
    const { i18n } = useTranslation('student');
    const {isPhone, isTablet} = useDeviceType();
    const authUser = useRouteLoaderData("root");
    const outletCtx = useOutletContext();
    const [viewMode, setViewMode] = useState(
        localStorage.getItem('notesViewMode') === 'grid-3' ? 'grid-3' : 'grid-2'
    );

    const queryClient = useQueryClient();

    const studentId = authUser?.roles?.some(r => r.toLowerCase().startsWith("student")) ? authUser?.userId : null;
    const currentCourseId = outletCtx?.courseId || null;

    const { data: rawNotes = [], isLoading: loading, error } = useQuery({
        queryKey: ["smartNotes"],
        queryFn: async () => {
            if (!studentId) return [];
            const student = await fetchStudentNotes(studentId);
            const courses = currentCourseId
                ? (student?.courses || []).filter((course) => String(course?.id) === String(currentCourseId))
                : (student?.courses || []);
            return courses.flatMap((course) =>
                (course?.notes || []).map((note) => ({
                    ...note,
                    _course: course,
                    linkedLecture: fromBackendLinkedLecture(note?.linkedLecture),
                }))
            );
        },
        staleTime: 5 * 60 * 1000,
        enabled: !!studentId,
    });

    const notes = useMemo(() => rawNotes.map((note) => ({
        ...note,
        course: note?._course
            ? (note._course.title || getLocalizedField(note._course, 'courseName', i18n.language) || "")
            : (note?.course || ""),
    })), [rawNotes, i18n.language]);

    function handleDeleteNote(deletedNoteId) {
        queryClient.setQueryData(["smartNotes"], (prevNotes) =>
            (prevNotes || []).filter((item) => String(item.id) !== String(deletedNoteId))
        );
    }

    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => {
            const firstDate = Date.parse(a?.modified || a?.creationDate || "") || 0;
            const secondDate = Date.parse(b?.modified || b?.creationDate || "") || 0;
            return secondDate - firstDate;
        });
    }, [notes]);

    function handleSaveNote(savedNote) {
        if (!savedNote) return;
        queryClient.setQueryData(["smartNotes"], (prevNotes) => {
            if (!prevNotes) return [savedNote];
            const existingIndex = prevNotes.findIndex((item) => String(item.id) === String(savedNote.id));
            if (existingIndex !== -1) {
                return prevNotes.map((item, idx) => (idx === existingIndex ? savedNote : item));
            }
            return [savedNote, ...prevNotes];
        });
    }

    if (loading) {
        return <SmartNotesPageSkeleton isPhone={isPhone} isTablet={isTablet} viewMode={viewMode} />;
    }

    return (
        <SmartNotesBody
            notes={sortedNotes}
            isPhone={isPhone}
            isTablet={isTablet}
            viewMode={viewMode}
            setViewMode={setViewMode}
            onSaveNote={handleSaveNote}
            onDeleteNote={handleDeleteNote}
            studentId={studentId}
            courseId={currentCourseId}
        />
    );
}