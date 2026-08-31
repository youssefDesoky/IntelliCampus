import apiClient from "../../../api/apiClient";

// ─── Departments ────────────────────────────────────────────

export async function fetchDepartments() {
    const result = await apiClient('/api/departments?PageSize=50');
    return result?.data ?? result ?? [];
}

export async function fetchDepartmentById(id) {
    return apiClient(`/api/departments/${id}`);
}

export async function createDepartment(data) {
    return apiClient('/api/departments', {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateDepartment(id, data) {
    return apiClient(`/api/departments/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteDepartment(id) {
    await apiClient(`/api/departments/${id}`, { method: "DELETE" });
    return true;
}

export async function updateDepartmentRegistrationSettings(data) {
    return apiClient('/api/departments/registration-settings', {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// ─── Department Specializations ────────────────────────────

export async function fetchSpecializations(departmentId) {
    return apiClient(`/api/Specialization/department/${departmentId}`);
}

export async function createSpecialization(departmentId, data) {
    const payload = {
        name: data.name,
        nameAr: data.nameAr || null,
        departmentId: parseInt(departmentId),
        maxCapacity: data.maxCapacity ?? null,
    };
    return apiClient('/api/Specialization', {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function deleteSpecialization(departmentId, specId) {
    await apiClient(`/api/Specialization/${specId}`, { method: "DELETE" });
    return true;
}

export async function fetchSpecializationPrerequisites(specId) {
    return apiClient(`/api/Specialization/${specId}/prerequisites`);
}

export async function setSpecializationPrerequisites(specId, prerequisites) {
    await apiClient(`/api/Specialization/${specId}/prerequisites`, {
        method: "PUT",
        body: JSON.stringify({ prerequisites }),
    });
    return true;
}
