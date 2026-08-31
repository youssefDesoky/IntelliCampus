import apiClient from "../../../api/apiClient";

// ─── Email ───────────────────────────────────────────────────

export async function sendEmail({ to, subject, body }) {
    return apiClient('/api/email/send', {
        method: "POST",
        body: JSON.stringify({ to, subject, body }),
    });
}
