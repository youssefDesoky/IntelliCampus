import apiClient, { downloadBlob } from "../../../api/apiClient";
import { dispatchNotificationsChanged } from "../../../api/notifications";

export async function fetchCourseAnnouncements(courseId) {
  return apiClient(`/api/courses/${courseId}/announcements`);
}

export async function createCourseAnnouncement(courseId, content, attachments = []) {
  const formData = new FormData();
  formData.append("content", content);

  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append(`attachments`, file);
    });
  }

  const result = await apiClient(`/api/courses/${courseId}/announcements`, {
    method: "POST",
    body: formData,
  });

  dispatchNotificationsChanged();
  return result;
}

export async function updateCourseAnnouncement(courseId, announcementId, content, attachments = []) {
  const formData = new FormData();
  formData.append("content", content);

  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      formData.append(`attachments`, file);
    });
  }

  const result = await apiClient(`/api/courses/${courseId}/announcements/${announcementId}`, {
    method: "PUT",
    body: formData,
  });

  dispatchNotificationsChanged();
  return result;
}

export async function deleteCourseAnnouncement(courseId, announcementId) {
  const result = await apiClient(`/api/courses/${courseId}/announcements/${announcementId}`, {
    method: "DELETE",
  });

  dispatchNotificationsChanged();
  return result;
}

export async function pinCourseAnnouncement(courseId, announcementId) {
  const result = await apiClient(`/api/courses/${courseId}/announcements/${announcementId}/pin`, {
    method: "PATCH",
    body: JSON.stringify({ isPinned: true }),
  });

  dispatchNotificationsChanged();
  return result;
}

export async function unpinCourseAnnouncement(courseId, announcementId) {
  const result = await apiClient(`/api/courses/${courseId}/announcements/${announcementId}/pin`, {
    method: "PATCH",
    body: JSON.stringify({ isPinned: false }),
  });

  dispatchNotificationsChanged();
  return result;
}

export async function createAnnouncementComment(courseId, announcementId, content) {
  const result = await apiClient(`/api/courses/${courseId}/announcements/${announcementId}/comments`, {
    method: "POST",
    body: JSON.stringify({ content }),
  });

  dispatchNotificationsChanged();
  return result;
}
