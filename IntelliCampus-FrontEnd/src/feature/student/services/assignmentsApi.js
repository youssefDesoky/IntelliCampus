import apiClient from "../../../api/apiClient";
import { dispatchNotificationsChanged } from "../../../api/notifications";

export async function fetchAssignmentsByCourse(courseId, { pageIndex = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({ pageIndex, pageSize });
  return apiClient(`/api/assignments/${courseId}?${params}`);
}

export async function fetchAssignmentStats(courseId) {
  return apiClient(`/api/assignments/${courseId}/stats`);
}

export async function submitAssignment(assignmentId, submitData) {
  const result = await apiClient(`/api/assignments/${assignmentId}/submit`, {
    method: 'POST',
    body: submitData,
  });
  dispatchNotificationsChanged();
  return result;
}

export async function deleteAssignment(assignmentId) {
  await apiClient(`/api/assignments/${assignmentId}`, { method: 'DELETE' });
  return true;
}
