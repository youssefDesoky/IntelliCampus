import apiClient from "../../../api/apiClient";

// ─── Email ───────────────────────────────────────────────────

export async function sendEmail({ recipientEmail, subject, body }) {
    return apiClient('/api/messages', {
        method: "POST",
        body: JSON.stringify({ recipientEmail, subject, body }),
    });
}
