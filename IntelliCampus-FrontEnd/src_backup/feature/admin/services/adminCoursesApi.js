import apiClient from "../../../api/apiClient";

// ─── Courses ────────────────────────────────────────────────

export async function fetchCourses(params = {}) {
    const { search, status, departmentId, isActiveOnly } = params;
    const query = new URLSearchParams();
    if (search) query.set('search', search);
    if (status) query.set('status', status);
    if (departmentId) query.set('departmentId', departmentId);
    if (isActiveOnly) query.set('isActiveOnly', 'true');
    query.set('PageSize', '500');
    const qs = query.toString();
    const result = await apiClient(`/api/courses?${qs}`);
    return result?.data ?? result ?? [];
}

export async function fetchCourseById(id) {
    return apiClient(`/api/courses/${id}`);
}

function toCoursePayload(data) {
    return {
        courseName: data.courseName,
        courseNameAr: data.courseNameAr,
        courseCodeAr: data.courseCodeAr,
        courseCode: data.courseId,
        departmentName: data.departmentName || data.departmentId || "",
        description: data.description,
        descriptionAr: data.descriptionAr,
    };
}

export async function createCourse(data) {
    const payload = toCoursePayload(data);
    return apiClient('/api/courses', {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateCourse(id, data) {
    const payload = toCoursePayload(data);
    return apiClient(`/api/courses/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteCourse(id) {
    await apiClient(`/api/courses/${id}`, { method: "DELETE" });
    return true;
}

export async function fetchCourseRegistrationSettings(courseId) {
    return apiClient(`/api/courses/${courseId}/registration-settings`);
}

export async function updateCourseRegistrationSettings(courseId, data) {
    return apiClient(`/api/courses/${courseId}/registration-settings`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function activateCourse(id) {
    const result = await apiClient(`/api/courses/${id}/activate`, { method: "PATCH" });
    return result ?? true;
}

export async function deactivateCourse(id) {
    const result = await apiClient(`/api/courses/${id}/deactivate`, { method: "PATCH" });
    return result ?? true;
}

// ─── Course Classes ─────────────────────────────────────────

export async function fetchCourseClasses(courseId) {
    return apiClient(`/api/classes/course/${courseId}`);
}

export async function addClassToCourse(courseId, data) {
    const payload = { ...data, courseId: String(courseId) };
    return apiClient('/api/classes', {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function createLecture(courseId, data) {
    const payload = { ...data, courseId: Number(courseId) };
    return apiClient('/api/classes/lecture', {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function createSection(courseId, data) {
    const payload = { ...data, courseId: Number(courseId) };
    return apiClient('/api/classes/section', {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateClass(classId, data) {
    const payload = { ...data };
    const result = await apiClient(`/api/classes/${classId}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
    return result ?? true;
}

export async function fetchLectureInstructors() {
    return apiClient('/api/classes/lecture-instructors');
}

export async function fetchSectionInstructors() {
    return apiClient('/api/classes/section-instructors');
}

export async function fetchLectureRooms() {
    return apiClient('/api/classes/lecture-rooms');
}

export async function fetchSectionRooms() {
    return apiClient('/api/classes/section-rooms');
}

// ─── Course Students ────────────────────────────────────────

export async function fetchCourseStudents(courseId) {
    return apiClient(`/api/courses/${courseId}/students`);
}

// ─── Course Grades ──────────────────────────────────────────

export async function uploadCourseGrades(courseId, file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient(`/api/courses/${courseId}/grades/upload`, {
        method: "POST",
        body: formData,
    });
}

export async function deleteClassFromCourse(courseId, classId) {
    await apiClient(`/api/classes/${classId}`, { method: "DELETE" });
    return true;
}
