import apiClient from "../../../api/apiClient";

// ─── Rooms ──────────────────────────────────────────────────

export async function fetchRooms() {
    const result = await apiClient('/api/rooms?PageSize=50');
    return result?.data ?? result ?? [];
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
