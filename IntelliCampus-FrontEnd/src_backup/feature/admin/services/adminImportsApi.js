import apiClient from "../../../api/apiClient";

// ─── Bulk Import ────────────────────────────────────────────

export async function importCourses(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient('/api/ExcelImport/courses', {
        method: "POST",
        body: formData,
    });
}

export async function importClasses(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient('/api/ExcelImport/sections', {
        method: "POST",
        body: formData,
    });
}

export async function importStudents(file, bylawId) {
    const formData = new FormData();
    formData.append("file", file);
    let url = '/api/ExcelImport/students';
    if (bylawId) url += `?bylawId=${bylawId}`;
    return apiClient(url, {
        method: "POST",
        body: formData,
    });
}

export async function importInstructors(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient('/api/ExcelImport/instructors', {
        method: "POST",
        body: formData,
    });
}

export async function importRooms(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient('/api/ExcelImport/rooms', {
        method: "POST",
        body: formData,
    });
}

export async function importDepartments(file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient('/api/ExcelImport/departments', {
        method: "POST",
        body: formData,
    });
}

// ─── Student Upload (legacy) ──────────────────────────────────

export async function uploadStudents(file, bylawId) {
    const formData = new FormData();
    formData.append("file", file);
    let url = '/api/ExcelImport/students';
    if (bylawId) url += `?bylawId=${bylawId}`;
    return apiClient(url, {
        method: "POST",
        body: formData,
    });
}
