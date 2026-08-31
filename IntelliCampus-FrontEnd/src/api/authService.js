import apiClient from "./apiClient";

export async function verifyAuth() {
  return apiClient('/api/auth/me');
}

export async function login(email, password) {
  return apiClient('/api/auth/login', {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function logout() {
  await apiClient('/api/auth/logout', {
    method: "POST",
  });
}

export async function unregisterDevice(endpoint) {
  return apiClient('/api/devices/unregister', {
    method: 'POST',
    body: JSON.stringify({ endpoint }),
  });
}
