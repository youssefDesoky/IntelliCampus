import apiClient from "../../../api/apiClient";

// ─── Exams ─────────────────────────────────────────────────

export async function fetchExams() {
    const result = await apiClient('/api/exams?PageSize=50');
    return result?.data ?? result ?? [];
}

export async function deleteExam(id) {
    await apiClient(`/api/exams/${id}`, { method: "DELETE" });
    return true;
}

export async function updateExam(id, data) {
    return apiClient(`/api/exams/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function uploadExams(file, examType) {
    const formData = new FormData();
    formData.append("file", file);
    let url = '/api/ExcelImport/exams';
    if (examType) url += `?examType=${examType}`;
    return apiClient(url, {
        method: "POST",
        body: formData,
    });
}

// ─── Auto Exam Scheduling ───────────────────────────────────

export async function autoSchedule(request) {
    return apiClient('/api/ExamScheduling/auto-schedule', {
        method: "POST",
        body: JSON.stringify(request),
    });
}

export async function detectConflicts({ courseId, date, startTime, endTime, excludeExamId }) {
    const params = new URLSearchParams({
        courseId,
        date,
        startTime,
        endTime,
    });
    if (excludeExamId) params.append("excludeExamId", excludeExamId);
    return apiClient(`/api/ExamScheduling/detect-conflicts?${params}`);
}

export async function getConflictGraph() {
    return apiClient('/api/ExamScheduling/conflict-graph');
}

export async function assignHalls(examId, roomIds) {
    return apiClient(`/api/ExamScheduling/assign-halls/${examId}`, {
        method: "POST",
        body: JSON.stringify({ examId, roomIds }),
    });
}

export async function getHallAssignments(examId) {
    return apiClient(`/api/ExamScheduling/hall-assignments/${examId}`);
}

export async function getSeatAssignments(examId) {
    return apiClient(`/api/ExamScheduling/seat-assignments/${examId}`);
}

export async function getAvailableSlots(request) {
    return apiClient('/api/ExamScheduling/available-slots', {
        method: "POST",
        body: JSON.stringify(request),
    });
}
