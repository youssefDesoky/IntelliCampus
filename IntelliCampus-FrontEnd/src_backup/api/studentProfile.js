import apiClient from "./apiClient";

export async function fetchStudentProfile(studentId) {
    return apiClient(`/api/students/${studentId}`);
}
