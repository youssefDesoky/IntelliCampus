import apiClient from "../../../api/apiClient";
import { API_URL } from "../../../config/api";

export async function fetchAdminProfile(adminId) {
  return apiClient(`/api/admins/${adminId}`);
}

export async function updateProfileImage(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch(`${API_URL}/api/auth/profile/image`, {
    method: "PUT",
    credentials: "include",
    body: formData,
  });
  if (!res.ok) {
    throw new Error(`Upload failed (${res.status})`);
  }
  return res.json();
}

export async function updateProfile(data) {
  return apiClient('/api/auth/profile', {
    method: "PUT",
    body: JSON.stringify(data),
  });
}

export async function changePassword(currentPassword, newPassword) {
  return apiClient('/api/auth/change-password', {
    method: "POST",
    body: JSON.stringify({ currentPassword, newPassword }),
  });
}
