import apiClient from "../../../api/apiClient";

export async function fetchCourseAnalytics(courseId) {
  return apiClient(`/api/analytics/instructor/course/${courseId}`);
}
