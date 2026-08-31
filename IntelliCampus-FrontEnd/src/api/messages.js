import apiClient from "./apiClient";

export async function fetchInboxMessages() {
  const result = await apiClient('/api/messages/inbox');
  return result?.data ?? result ?? [];
}

export async function fetchSentMessages() {
  return apiClient('/api/messages/sent');
}

export async function markMessageAsRead(messageId) {
  await apiClient(`/api/messages/${messageId}/read`, { method: 'PUT' });
  return true;
}

export async function deleteMessage(messageId) {
  await apiClient(`/api/messages/${messageId}`, { method: 'DELETE' });
  return true;
}

export async function sendMessage({ recipientEmail, subject, body, parentMessageId }) {
  return apiClient('/api/messages', {
    method: 'POST',
    body: JSON.stringify({ recipientEmail, subject, body, parentMessageId }),
  });
}
