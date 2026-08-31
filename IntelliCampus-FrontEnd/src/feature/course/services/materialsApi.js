import apiClient from "../../../api/apiClient";

export async function fetchCourseMaterialsOrganized(courseId, folderId = null) {
  const query = folderId ? `?folderId=${encodeURIComponent(folderId)}` : '';
  return apiClient(`/api/materials/course/${courseId}/organized${query}`);
}

export async function fetchCourseMaterials(courseId) {
  return apiClient(`/api/materials/course/${courseId}`);
}

export async function fetchCourseFolders(courseId) {
  return apiClient(`/api/materials/course/${courseId}/folders`);
}

export async function createMaterial(formData) {
  return apiClient('/api/materials', {
    method: 'POST',
    body: formData,
  });
}

export async function deleteMaterial(materialId) {
  await apiClient(`/api/materials/${materialId}`, { method: 'DELETE' });
  return true;
}

export async function resyncMaterialToAi(materialId) {
  return apiClient(`/api/materials/${materialId}/resync-ai`, { method: 'POST' });
}

export function getMaterialDownloadUrl(materialId) {
  return `/api/materials/${materialId}/download`;
}

export async function createFolder({ name, description, courseId }) {
  return apiClient('/api/materials/folders', {
    method: 'POST',
    body: JSON.stringify({ Name: name, Description: description, CourseId: courseId }),
  });
}

export async function updateFolder(folderId, { name, description }) {
  return apiClient(`/api/materials/folders/${folderId}`, {
    method: 'PUT',
    body: JSON.stringify({ Name: name, Description: description }),
  });
}

export async function deleteFolder(folderId) {
  await apiClient(`/api/materials/folders/${folderId}`, { method: 'DELETE' });
  return true;
}
