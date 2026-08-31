import apiClient from "../../../api/apiClient";

// ─── Bylaws ─────────────────────────────────────────────────

export async function fetchBylaws(type) {
    const params = type ? `?Type=${type}&PageSize=50` : '?PageSize=50';
    const result = await apiClient(`/api/Bylaw${params}`);
    return result?.data ?? result ?? [];
}

export async function fetchBylawById(id) {
    return apiClient(`/api/Bylaw/${id}`);
}

export async function updateBylaw(id, data) {
    return apiClient(`/api/Bylaw/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function createBylaw(data) {
    return apiClient('/api/Bylaw', {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function deleteBylaw(id) {
    await apiClient(`/api/Bylaw/${id}`, { method: "DELETE" });
    return true;
}

export async function toggleBylawActive(id) {
    await apiClient(`/api/Bylaw/${id}/toggle-active`, { method: "PATCH" });
    return true;
}

export async function uploadBylawDocument(id, file) {
    const formData = new FormData();
    formData.append("file", file);
    return apiClient(`/api/Bylaw/${id}/upload`, {
        method: "POST",
        body: formData,
    });
}

export async function setBylawGradeScales(id, items) {
    return apiClient(`/api/Bylaw/${id}/grade-scales`, {
        method: "PUT",
        body: JSON.stringify(items),
    });
}

export async function setBylawLevelScales(id, items) {
    return apiClient(`/api/Bylaw/${id}/level-scales`, {
        method: "PUT",
        body: JSON.stringify(items),
    });
}

export async function setBylawMinHoursDepartment(id, minHours) {
    return apiClient(`/api/Bylaw/${id}/min-hours-department`, {
        method: "PUT",
        body: JSON.stringify({ minHours }),
    });
}

export async function setBylawMinHoursSpecialization(id, minHours) {
    return apiClient(`/api/Bylaw/${id}/min-hours-specialization`, {
        method: "PUT",
        body: JSON.stringify({ minHours }),
    });
}

export async function updateBylawRequirements(id, data) {
    return apiClient(`/api/Bylaw/${id}/requirements`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updateBylawPassingGrade(id, data) {
    return apiClient(`/api/Bylaw/${id}/passing-grade`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updateBylawProbation(id, data) {
    return apiClient(`/api/Bylaw/${id}/probation`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updateBylawGradeWeights(id, data) {
    return apiClient(`/api/Bylaw/${id}/grade-weights`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updateBylawPassingCourseGrades(id, data) {
    return apiClient(`/api/Bylaw/${id}/passing-course-grades`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updateBylawMinHours(id, data) {
    return apiClient(`/api/Bylaw/${id}/minhours-departmentAndSpecialization`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function mapCourseToBylaw(bylawId, data) {
    return apiClient(`/api/Bylaw/${bylawId}/courses`, {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function unmapCourseFromBylaw(bylawCourseId) {
    await apiClient(`/api/Bylaw/courses/${bylawCourseId}`, { method: "DELETE" });
    return true;
}

export async function setCoursePrerequisites(bylawCourseId, data) {
    return apiClient(`/api/Bylaw/courses/${bylawCourseId}/prerequisites`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updateBylawCourseAllowedDepartments(bylawCourseId, data) {
    return apiClient(`/api/Bylaw/courses/${bylawCourseId}/allowed-departments`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function updateBylawCourseCreditHours(bylawCourseId, data) {
    return apiClient(`/api/Bylaw/courses/${bylawCourseId}/credit-hours`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

// ─── Elective Buckets ──────────────────────────────────────

export async function fetchBucketsByBylaw(bylawId) {
    return apiClient(`/api/ElectiveBuckets/bylaw/${bylawId}`);
}

export async function createBucket(data) {
    return apiClient('/api/ElectiveBuckets', {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function updateBucket(bucketId, data) {
    return apiClient(`/api/ElectiveBuckets/${bucketId}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteBucket(bucketId) {
    await apiClient(`/api/ElectiveBuckets/${bucketId}`, { method: "DELETE" });
    return true;
}
