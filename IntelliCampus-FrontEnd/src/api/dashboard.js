import apiClient from "./apiClient";

export async function fetchStudentDashboard() {
  return apiClient("/api/dashboard/student");
}

export async function fetchInstructorDashboard() {
  return apiClient("/api/dashboard/instructor");
}

export async function fetchAdminDashboard() {
  return apiClient("/api/dashboard/admin");
}

export async function publishNews(title) {
  return apiClient("/api/dashboard/admin/news", {
    method: "POST",
    body: JSON.stringify({ title }),
  });
}

export async function updateNews(id, title) {
  return apiClient(`/api/dashboard/admin/news/${id}`, {
    method: "PUT",
    body: JSON.stringify({ title }),
  });
}

export async function deleteNews(id) {
  return apiClient(`/api/dashboard/admin/news/${id}`, {
    method: "DELETE",
  });
}
