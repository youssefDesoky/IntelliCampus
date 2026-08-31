import apiClient from "../../../api/apiClient";

// ─── Departments ────────────────────────────────────────────

export async function fetchDepartments({ pageIndex = 1, pageSize = 50, searchQuery = '', filters = {} } = {}) {
    const params = new URLSearchParams({ PageIndex: pageIndex, PageSize: pageSize });
    if (searchQuery) params.set('Search', searchQuery);
    const result = await apiClient(`/api/departments?${params}`);
    return { data: result?.data ?? result ?? [], totalCount: result?.totalCount ?? 0 };
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
