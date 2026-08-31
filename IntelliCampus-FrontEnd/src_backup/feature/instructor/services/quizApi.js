import apiClient from "../../../api/apiClient";

export async function fetchQuizzesByCourse(courseId) {
  return apiClient(`/api/courses/${courseId}/quizzes`);
}

export async function createQuiz(payload) {
  return apiClient(`/api/courses/${payload.courseId}/quizzes`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export async function addQuestions(courseId, quizId, questions) {
  return apiClient(`/api/courses/${courseId}/quizzes/${quizId}/questions`, {
    method: "POST",
    body: JSON.stringify(questions),
  });
}

export async function fetchQuestions(courseId, quizId) {
  return apiClient(`/api/courses/${courseId}/quizzes/${quizId}/questions`);
}

export async function deleteQuestion(courseId, quizId, questionId) {
  return apiClient(`/api/courses/${courseId}/quizzes/${quizId}/questions/${questionId}`, {
    method: "DELETE",
  });
}

export async function updateQuiz(courseId, quizId, payload) {
  return apiClient(`/api/courses/${courseId}/quizzes/${quizId}`, {
    method: "PUT",
    body: JSON.stringify(payload),
  });
}

export async function deleteQuiz(courseId, quizId) {
  return apiClient(`/api/courses/${courseId}/quizzes/${quizId}`, {
    method: "DELETE",
  });
}

export async function fetchQuizSubmissions(courseId, quizId) {
  return apiClient(`/api/courses/${courseId}/quizzes/${quizId}/submissions`);
}

export async function gradeQuizSubmission(courseId, quizId, submissionId, payload) {
  return apiClient(`/api/courses/${courseId}/quizzes/${quizId}/submissions/${submissionId}/grade`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
