import apiClient from "../../../api/apiClient";

export async function fetchActiveCourses(params = {}) {
  const { search, status, departmentId, isActiveOnly, pageIndex, pageSize, searchQuery } = params;
  const query = new URLSearchParams();
  if (pageIndex !== undefined) query.set('pageIndex', pageIndex);
  if (pageSize !== undefined) query.set('pageSize', pageSize);
  const searchTerm = searchQuery || search;
  if (searchTerm) query.set('search', searchTerm);
  if (status) query.set('status', status);
  if (departmentId) query.set('departmentId', departmentId);
  if (isActiveOnly) query.set('isActiveOnly', 'true');
  const qs = query.toString();
  return apiClient(`/api/courses/active${qs ? `?${qs}` : ''}`);
}

export async function fetchClassesForCourse(courseId) {
  return apiClient(`/api/classes/course/${courseId}`);
}

export async function registerForCourse(courseId, classId) {
  return apiClient('/api/registration', {
    method: "POST",
    body: JSON.stringify({ courseId, classId }),
  });
}

export async function getMyRegistrations() {
  return apiClient('/api/registration/my-courses');
}

export async function unregisterFromCourse(courseId) {
  await apiClient(`/api/registration/${courseId}`, { method: "DELETE" });
  return true;
}

export async function fetchRegistrationSettings() {
  return apiClient('/api/registration/settings');
}

export async function changeCourseSection(courseId, classId) {
  return apiClient(`/api/registration/${courseId}/section`, {
    method: "PATCH",
    body: JSON.stringify({ classId }),
  });
}

export async function fetchStudentCourseRegistrations(studentId) {
  return apiClient(`/api/StudentCourse/${studentId}`);
}
