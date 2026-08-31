import apiClient from "../../../api/apiClient";

export async function checkEligibility() {
    return apiClient("/api/department-preference/eligibility");
}

export async function fetchMyPreferences() {
    return apiClient("/api/department-preference");
}

export async function savePreferences(items) {
    return apiClient("/api/department-preference", {
        method: "PUT",
        body: JSON.stringify({ items }),
    });
}

export async function fetchDepartments() {
    return apiClient("/api/Departments");
}
