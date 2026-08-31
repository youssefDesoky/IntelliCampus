import apiClient from "../../../api/apiClient";

export async function fetchMyTeachingCourses(params = {}) {
  const { search, status, departmentId, isActiveOnly, pageSize, pageIndex } = params;
  const query = new URLSearchParams();
  if (search) query.set('search', search);
  if (status) query.set('status', status);
  if (departmentId) query.set('departmentId', departmentId);
  if (isActiveOnly) query.set('isActiveOnly', 'true');
  if (pageSize) query.set('pageSize', pageSize);
  if (pageIndex) query.set('pageIndex', pageIndex);
  const qs = query.toString();
  return apiClient(`/api/courses/my-teaching${qs ? `?${qs}` : ''}`);
}

export async function fetchMyStudentCourses(status = null, pageIndex = 1, pageSize = 100, search = "") {
  const params = new URLSearchParams();
  if (status) params.set('status', status);
  if (search) params.set('search', search);
  params.set('pageIndex', pageIndex);
  params.set('pageSize', pageSize);
  const query = params.toString();
  return apiClient(`/api/courses/my-courses${query ? `?${query}` : ''}`);
}

export async function fetchAllCourses() {
  return apiClient('/api/courses');
}

export async function fetchCourseById(courseId) {
  return apiClient(`/api/courses/${courseId}`);
}
