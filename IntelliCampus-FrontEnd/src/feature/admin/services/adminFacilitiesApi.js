import apiClient from "../../../api/apiClient";

// ─── Rooms ──────────────────────────────────────────────────

export async function fetchRooms({ pageIndex = 1, pageSize = 50, searchQuery = '', filters = {} } = {}) {
    const params = new URLSearchParams({ PageIndex: pageIndex, PageSize: pageSize });
    if (searchQuery) params.set('Search', searchQuery);
    const result = await apiClient(`/api/rooms?${params}`);
    return { data: result?.data ?? result ?? [], totalCount: result?.totalCount ?? 0 };
}

export async function fetchRoomTypes() {
    return apiClient('/api/rooms/types');
}

export async function fetchRoomById(id) {
    return apiClient(`/api/rooms/${id}`);
}

function toRoomPayload(data) {
    return {
        roomName: data.name,
        roomNameAr: data.nameAr,
        type: data.type,
        capacity: data.capacity,
        location: data.location,
        locationAr: data.locationAr,
        isExamHall: data.isExamHall,
        facultyId: data.facultyId,
    };
}

export async function createRoom(data) {
    const payload = toRoomPayload(data);
    return apiClient('/api/rooms', {
        method: "POST",
        body: JSON.stringify(payload),
    });
}

export async function updateRoom(id, data) {
    const payload = toRoomPayload(data);
    return apiClient(`/api/rooms/${id}`, {
        method: "PUT",
        body: JSON.stringify(payload),
    });
}

export async function deleteRoom(id) {
    await apiClient(`/api/rooms/${id}`, { method: "DELETE" });
    return true;
}
