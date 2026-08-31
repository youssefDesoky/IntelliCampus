import apiClient from "../../../api/apiClient";

export async function checkEligibility() {
    return apiClient("/api/specialization-preference/eligibility");
}

export async function fetchMyPreferences() {
    return apiClient("/api/specialization-preference");
}

export async function savePreferences(targetType, items) {
    return apiClient("/api/specialization-preference", {
        method: "PUT",
        body: JSON.stringify({ targetType, items }),
    });
}

export async function fetchDepartments() {
    return apiClient("/api/Departments");
}

export async function fetchSpecializations() {
    return apiClient("/api/Specialization");
}
