import apiClient from "../../../api/apiClient";

export const ROLE_GROUP_MAP = {
    student_bachelor: { label: "Bachelor Student", group: "student" },
    student_masters: { label: "Masters Student", group: "student" },
    student_phd: { label: "PhD Student", group: "student" },
    student_diploma: { label: "Diploma Student", group: "student" },
    instructor: { label: "Instructor", group: "instructor" },
    admin_bachelor: { label: "Bachelor Admin", group: "admin" },
    admin_masters: { label: "Masters Admin", group: "admin" },
    admin_phd: { label: "PhD Admin", group: "admin" },
    admin_diploma: { label: "Diploma Admin", group: "admin" },
    admin_academicstaff: { label: "Academic Staff Admin", group: "admin" },
    superadmin: { label: "Super Admin", group: "admin" },
};

// ─── Admins ─────────────────────────────────────────────────

export async function fetchAdmins({ pageIndex = 1, pageSize = 50, searchQuery = '', filters = {} } = {}) {
    const params = new URLSearchParams({ PageIndex: pageIndex, PageSize: pageSize });
    if (searchQuery) params.set('Search', searchQuery);
    const result = await apiClient(`/api/admins?${params}`);
    return { data: result?.data ?? result ?? [], totalCount: result?.totalCount ?? 0 };
}

export async function createAdmin(data) {
    return apiClient('/api/admins', {
        method: "POST",
        body: JSON.stringify(data),
    });
}

export async function fetchAdminById(id) {
    return apiClient(`/api/admins/${id}`);
}

export async function updateAdmin(id, data) {
    return apiClient(`/api/admins/${id}`, {
        method: "PUT",
        body: JSON.stringify(data),
    });
}

export async function deleteAdmin(id) {
    await apiClient(`/api/admins/${id}`, { method: "DELETE" });
    return true;
}

// ─── User Roles ────────────────────────────────────────────

export async function fetchUserRoles(userId) {
    const data = await apiClient(`/api/Roles/user/${userId}`);
    return (data || []).map(r => r.roleName?.toLowerCase());
}

export async function fetchAssignableRoles() {
    const data = await apiClient('/api/Roles');
    return (data || [])
        .filter(r => {
            const key = r.roleName?.toLowerCase();
            return key !== 'superadmin' && !key?.startsWith('admin_');
        })
        .map(r => {
            const key = r.roleName?.toLowerCase();
            const meta = ROLE_GROUP_MAP[key] || {};
            return {
                value: key,
                label: meta.label || r.roleName,
                group: meta.group || "",
            };
        });
}

export async function assignUserRole(userId, roleId) {
    const payload = { userId, roleId };
    console.log('[RoleAssign] Sending:', JSON.stringify(payload), '| userId type:', typeof userId, '| roleId type:', typeof roleId);
    return apiClient('/api/Roles/assign', {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function removeUserRole(userId, roleId) {
    try {
        await apiClient(`/api/Roles/user/${userId}/role/${roleId}`, { method: "DELETE" });
    } catch (err) {
        if (err.status !== 404) throw err;
    }
    return true;
}

export async function fetchAdminRoles() {
    const data = await apiClient('/api/Roles');
    return (data || [])
        .filter(r => r.roleName?.toLowerCase().startsWith("admin_"))
        .map(r => ({
            value: r.roleName,
            label: r.roleName.replace("Admin_", "").replace(/([A-Z])/g, " $1").trim() + " Admin",
        }));
}

export async function fetchInstructorRoles() {
    const data = await apiClient('/api/instructors/roles');
    return (Array.isArray(data) ? data : []).map(r => ({
        value: r.toLowerCase(),
        label: r.charAt(0).toUpperCase() + r.slice(1).replace(/([A-Z])/g, ' $1').trim()
    }));
}

export async function assignUserRoles(userId, selectedRoles) {
    const currentRoles = await fetchUserRoles(userId);

    const rolesToAdd = selectedRoles.filter(r => !currentRoles.includes(r));
    const rolesToRemove = currentRoles.filter(r => !selectedRoles.includes(r));

    const allRoles = await apiClient('/api/Roles');

    for (const roleName of rolesToAdd) {
        const role = allRoles.find(r => r.roleName?.toLowerCase() === roleName);
        if (role) {
            await assignUserRole(userId, role.roleId);
        }
    }

    for (const roleName of rolesToRemove) {
        const role = allRoles.find(r => r.roleName?.toLowerCase() === roleName);
        if (role) {
            await removeUserRole(userId, role.roleId);
        }
    }

    return true;
}
