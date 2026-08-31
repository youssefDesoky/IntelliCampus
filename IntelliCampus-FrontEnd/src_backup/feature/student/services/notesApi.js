import apiClient from "../../../api/apiClient";

export function toBackendLinkedLecture(lecture, courseFolders = []) {
    if (!lecture) return null;

    const folderId = lecture.id ?? lecture.materialFolderId;
    const folder = courseFolders.find(
        (f) => String(f.materialFolderId) === String(folderId)
    );
    const title = lecture.title ?? folder?.name ?? "";

    return {
        id: Number(folderId),
        title,
        shortTitle: lecture.shortTitle ?? title,
        weekLabel: lecture.weekLabel ?? title,
        description: lecture.description ?? folder?.description ?? "",
        courseId: lecture.courseId ?? folder?.courseId ?? null,
        materialFolderId: folder?.name ?? title,
    };
}

export function fromBackendLinkedLecture(dto) {
    if (!dto) return null;

    return {
        id: dto.id,
        materialFolderId: dto.id,
        title: dto.title,
        shortTitle: dto.shortTitle,
        weekLabel: dto.weekLabel,
        description: dto.description,
        courseId: dto.courseId,
    };
}

export async function createNote({ studentId, courseId, title, content, linkedLecture, courseFolders }) {
    const payload = {
        studentId: Number(studentId),
        courseId: Number(courseId),
        title,
        content,
        linkedLecture: toBackendLinkedLecture(linkedLecture, courseFolders),
    };

    const data = await apiClient("/api/notes", {
        method: "POST",
        body: JSON.stringify(payload),
    });

    return {
        ...data,
        linkedLecture: fromBackendLinkedLecture(data.linkedLecture),
    };
}

export async function updateNote(noteId, { title, content, linkedLecture, courseFolders }) {
    const payload = {
        title,
        content,
        linkedLecture: toBackendLinkedLecture(linkedLecture, courseFolders),
    };

    const data = await apiClient(`/api/notes/${noteId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return {
        ...data,
        linkedLecture: fromBackendLinkedLecture(data.linkedLecture),
    };
}

export async function deleteNote(noteId) {
    await apiClient(`/api/notes/${noteId}`, { method: "DELETE" });
    return true;
}

export async function updateNoteLinkedLecture(noteId, { lecture, courseFolders }) {
    const folderId = lecture?.id ?? lecture?.materialFolderId;
    const folder = courseFolders.find(
        (f) => String(f.materialFolderId) === String(folderId)
    );
    const title = lecture?.title ?? folder?.name ?? "";

    const payload = folderId
        ? {
            materialFolderId: Number(folderId),
            name: folder?.name ?? title,
            title,
            shortTitle: lecture?.shortTitle ?? title,
            weekLabel: lecture?.weekLabel ?? title,
            description: lecture?.description ?? folder?.description ?? "",
            courseId: lecture?.courseId ?? folder?.courseId ?? null,
        }
        : null;

    const data = await apiClient(`/api/notes/${noteId}/link-lecture`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });

    return {
        ...data,
        linkedLecture: fromBackendLinkedLecture(data.linkedLecture),
    };
}
