import * as signalR from "@microsoft/signalr";
import apiClient from "../../../api/apiClient";

const CHAT_PARTNERS = {
  12: { userId: "2", fullName: "Dr. Ahmed Hassan", role: "Instructor" },
  2: { userId: "12", fullName: "Layla Ahmed", role: "Student" },
};

export function getChatPartner(currentUserId) {
  return CHAT_PARTNERS[currentUserId] || null;
}

export function createHubConnection() {
  return new signalR.HubConnectionBuilder()
    .withUrl("/hubs/chat", { withCredentials: true })
    .withAutomaticReconnect()
    .build();
}

export async function fetchChatHistory(userId1, userId2) {
  return apiClient(`/api/chat/history/${userId1}/${userId2}`);
}

// --- Friend API ---

export async function sendFriendRequest(recipientId) {
  return apiClient("/api/friends/request", {
    method: "POST",
    body: JSON.stringify({ recipientId }),
  });
}

export async function acceptFriendRequest(requestId) {
  return apiClient(`/api/friends/requests/${requestId}/accept`, {
    method: "PUT",
  });
}

export async function declineFriendRequest(requestId) {
  return apiClient(`/api/friends/requests/${requestId}/reject`, {
    method: "PUT",
  });
}

export async function fetchPendingRequests() {
  return apiClient("/api/friends/requests/pending");
}

export async function fetchFriends() {
  return apiClient("/api/friends");
}

export async function fetchGroupChatHistory(groupName) {
  return apiClient(`/api/chat/group/${encodeURIComponent(groupName)}`);
}

// --- Group API ---

export async function createGroup(title, description, memberIds, profileImage) {
  return apiClient("/api/groups", {
    method: "POST",
    body: JSON.stringify({ title, description, memberIds, profileImage }),
  });
}

export async function fetchMyGroups() {
  return apiClient("/api/groups");
}

export function formatTime(timestamp) {
  const d = new Date(timestamp);
  return d.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
}

export function toDateKey(timestamp) {
  const d = new Date(timestamp);
  return d.toISOString().slice(0, 10);
}

export function groupMessagesByDate(messages) {
  const grouped = {};
  for (const msg of messages) {
    const key = toDateKey(msg.timestamp);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(msg);
  }
  return grouped;
}
