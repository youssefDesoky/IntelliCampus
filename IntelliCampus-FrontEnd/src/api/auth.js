import apiClient from "./apiClient";

export function fetchPublicFaculties() {
    return apiClient("/api/faculties/public", { credentials: "omit" });
}

export function getCredentials(data) {
    return apiClient("/api/auth/get-credentials", {
        method: "POST",
        credentials: "omit",
        body: JSON.stringify(data),
    });
}

export function forgotPassword(data) {
    return apiClient("/api/auth/forgot-password", {
        method: "POST",
        credentials: "omit",
        body: JSON.stringify(data),
    });
}

export function resetPassword(data) {
    return apiClient("/api/auth/reset-password", {
        method: "POST",
        credentials: "omit",
        body: JSON.stringify(data),
    });
}

export function sendVerificationCode(data) {
    return apiClient("/api/auth/first-time-setup/send-code", {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export function firstTimeSetup(data) {
    return apiClient("/api/auth/first-time-setup", {
        method: "POST",
        body: JSON.stringify(data),
    });
}
