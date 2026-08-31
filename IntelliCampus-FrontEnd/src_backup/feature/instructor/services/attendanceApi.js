import apiClient from "../../../api/apiClient";

export async function fetchClassesByCourse(courseId) {
  return apiClient(`/api/classes/course/${courseId}`);
}

export async function fetchAttendanceReport(classId, { pageIndex = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({ pageIndex, pageSize });
  return apiClient(`/api/attendance/report/class/${classId}?${params}`);
}

export async function fetchSessionAttendance(sessionId) {
  return apiClient(`/api/attendance/sessions/${sessionId}/students`);
}

export async function createClass(classType, payload) {
  const endpoint = classType === "Section" ? '/api/classes/section' : '/api/classes/lecture';
  return apiClient(endpoint, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function recordAttendance(payload) {
  return apiClient('/api/attendance/record', {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function getSessionById(sessionId) {
  return apiClient(`/api/attendance/sessions/${sessionId}`);
}

export async function getSessionsByClass(classId) {
  return apiClient(`/api/attendance/sessions/class/${classId}`);
}

export async function createSession(payload) {
  return apiClient('/api/attendance/sessions', {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function scanAttendanceQr(payload) {
  return apiClient('/api/attendance/scan', {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function recordManualAttendance(payload) {
  return apiClient('/api/attendance/manual', {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function generateStudentAttendanceQr() {
  return apiClient('/api/attendance/qr');
}

export async function fetchExcuses(courseId) {
  return apiClient(`/api/courses/${courseId}/attendance/excuses`);
}

export async function updateExcuseStatus(excuseId, status) {
  return apiClient(`/api/attendance/excuses/${excuseId}`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}
