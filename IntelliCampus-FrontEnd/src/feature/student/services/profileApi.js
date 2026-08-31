import apiClient from "../../../api/apiClient";
import { API_URL } from "../../../config/api";

export async function fetchStudentProfile(studentId) {
  return apiClient(`/api/students/${studentId}`);
}

export async function updateProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/auth/profile/image`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }
  return res.json();
}

export async function updateProfile(data) {
  return apiClient('/api/auth/profile', {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changePassword(currentPassword, newPassword) {
  return apiClient('/api/auth/change-password', {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}

export async function generateAttendanceQr() {
  return apiClient('/api/attendance/qr');
}

export async function fetchCommunities() {
  return apiClient('/api/communities');
}

export async function fetchCoursePrerequisites(params = {}) {
  const query = new URLSearchParams();
  query.set('PageSize', params.PageSize ?? 500);
  if (params.searchQuery) query.set('search', params.searchQuery);
  return apiClient(`/api/courses/prerequisites?${query.toString()}`);
}

export async function fetchMyAttendance(courseId) {
  return apiClient(`/api/attendance/my-attendance/course/${courseId}?PageSize=50`);
}

export async function submitExcuse(courseId, { sessionId, reason, file }) {
  const formData = new FormData();
  formData.append("SessionId", sessionId);
  formData.append("Reason", reason);
  formData.append("Document", file);

  return apiClient(`/api/courses/${courseId}/attendance/excuse`, {
    method: "POST",
    body: formData,
  });
}

export async function fetchStudentNotes(studentId) {
  return apiClient(`/api/students/${studentId}`);
}
