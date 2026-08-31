import apiClient from "../../../api/apiClient";

export async function fetchCourseGrades(courseId, { pageIndex = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({ pageIndex, pageSize });
  return apiClient(`/api/grades/course/${courseId}/overview?${params}`);
}

export async function fetchCourseComplaints(courseId) {
  return apiClient(`/api/grades/course/${courseId}/complaints`);
}

export async function updateComplaintStatus(complaintId, data) {
  return apiClient(`/api/grades/complaint/${complaintId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  });
}

export async function getCourseWorkWeight(courseId) {
  return apiClient(`/api/grades/course/${courseId}/coursework-weight`);
}

export async function setCourseWorkWeight(courseId, data) {
  return apiClient(`/api/grades/course/${courseId}/coursework-weight`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function uploadCourseGrades(courseId, file) {
  const formData = new FormData();
  formData.append("file", file);
  return apiClient(`/api/courses/${courseId}/grades/upload`, {
    method: "POST",
    body: formData,
  });
}