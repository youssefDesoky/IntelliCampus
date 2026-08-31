import apiClient from "../../../api/apiClient";

export async function fetchInstructorAssignmentsByCourse(courseId) {
  return apiClient(`/api/assignments/instructor/course/${courseId}`);
}

export async function createInstructorAssignment(payload) {
  return apiClient('/api/assignments/create', {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function deleteInstructorAssignment(assignmentId) {
  return apiClient(`/api/assignments/${assignmentId}`, {
    method: "DELETE",
  });
}

export async function updateInstructorAssignment(assignmentId, payload) {
  return apiClient(`/api/assignments/${assignmentId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function fetchAssignmentSubmissions(assignmentId) {
  return apiClient(`/api/assignments/${assignmentId}/submissions`);
}

export async function gradeAssignmentSubmission(assignmentId, payload) {
  return apiClient(`/api/assignments/${assignmentId}/grade`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
