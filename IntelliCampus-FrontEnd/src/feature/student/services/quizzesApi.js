import apiClient from "../../../api/apiClient";

export async function fetchCourseQuizzesOverview(courseId, { pageIndex = 1, pageSize = 10 } = {}) {
  const params = new URLSearchParams({ pageIndex, pageSize });
  return apiClient(`/api/courses/${courseId}/quizzes?${params}`);
}

export async function fetchPracticeQuiz(courseId, quizId) {
  const query = quizId ? `?quizId=${encodeURIComponent(quizId)}` : "";
  return apiClient(`/api/courses/${courseId}/quizzes/practice${query}`);
}

export async function submitPracticeQuiz(courseId, submitData) {
  return apiClient(`/api/courses/${courseId}/quizzes/practice/submit`, {
    method: "POST",
    body: JSON.stringify(submitData),
  });
}
