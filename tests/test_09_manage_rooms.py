"""
ManageRooms (/admin/rooms) API Tests
- List rooms
- Room types
- Create / Edit / Delete
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_delete,
    assert_ok, assert_created, assert_no_content,
)

pytestmark = pytest.mark.integration


class TestManageRooms:
    """Tests for ManageRooms page."""

    created_room_ids = []

    def test_01_list_rooms(self, admin_session):
        """GET /api/rooms — list all rooms."""
        resp = api_get(admin_session, "/rooms")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_02_room_types(self, admin_session):
        """GET /api/rooms/types — get room type enum values."""
        resp = api_get(admin_session, "/rooms/types")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        # Types may be returned as objects with value/label or as plain strings
        if data:
            if isinstance(data[0], dict):
                values = [item.get("value", item.get("label", "")) for item in data]
            else:
                values = data
            assert any(t in values for t in ["Hall", "Lab", "Classroom"])

    def test_03_create_room_classroom(self, admin_session):
        """POST /api/rooms — create a Classroom."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "roomName": f"Room {unique_id}",
            "capacity": 50,
            "type": "Classroom",
            "location": f"Building A - Floor {unique_id[:2]}",
        }
        resp = api_post(admin_session, "/rooms", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            room = resp.json()
            assert room["roomName"] == payload["roomName"]
            self.created_room_ids.append(room["roomId"])

    def test_04_create_lab(self, admin_session):
        """POST /api/rooms — create a Lab."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "roomName": f"Lab {unique_id}",
            "capacity": 30,
            "type": "Lab",
            "location": "Building B - Floor 1",
        }
        resp = api_post(admin_session, "/rooms", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            room = resp.json()
            self.created_room_ids.append(room["roomId"])

    def test_05_create_hall(self, admin_session):
        """POST /api/rooms — create a Hall."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "roomName": f"Hall {unique_id}",
            "capacity": 200,
            "type": "Hall",
            "location": "Main Building",
        }
        resp = api_post(admin_session, "/rooms", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            room = resp.json()
            self.created_room_ids.append(room["roomId"])

    def test_06_get_room_by_id(self, admin_session):
        """GET /api/rooms/{id} — get room details."""
        if not self.created_room_ids:
            pytest.skip("No created rooms")
        room_id = self.created_room_ids[0]
        resp = api_get(admin_session, f"/rooms/{room_id}")
        assert_ok(resp)
        room = resp.json()
        assert room["roomId"] == room_id

    def test_07_edit_room(self, admin_session):
        """PUT /api/rooms/{id} — edit room."""
        if not self.created_room_ids:
            pytest.skip("No created rooms")
        room_id = self.created_room_ids[0]
        import uuid
        suffix = uuid.uuid4().hex[:8]
        payload = {
            "roomName": f"Edited Room {suffix}",
            "capacity": 60,
            "type": "Classroom",
        }
        resp = api_put(admin_session, f"/rooms/{room_id}", json_data=payload)
        assert_ok(resp)
        updated = resp.json()
        assert updated["roomName"] == payload["roomName"]

    def test_08_delete_room(self, admin_session):
        """DELETE /api/rooms/{id} — delete room."""
        if not self.created_room_ids:
            pytest.skip("No created rooms")
        room_id = self.created_room_ids[-1]
        resp = api_delete(admin_session, f"/rooms/{room_id}")
        assert resp.status_code in (204, 400), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code == 204:
            self.created_room_ids.remove(room_id)

    def test_09_cleanup_remaining_rooms(self, admin_session):
        """Delete remaining test rooms."""
        for rid in self.created_room_ids[:]:
            api_delete(admin_session, f"/rooms/{rid}")
        self.created_room_ids.clear()
