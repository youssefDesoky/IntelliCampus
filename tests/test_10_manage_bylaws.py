"""
ManageBylaws (/admin/bylaws) API Tests
- List bylaws
- Create / Edit / Delete
- Toggle active
- Document upload (endpoint check)
- Document download (endpoint check)
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_patch, api_delete,
    assert_ok, assert_created, assert_no_content,
)

pytestmark = pytest.mark.integration


class TestManageBylaws:
    """Tests for ManageBylaws page."""

    created_bylaw_ids = []

    def test_01_list_bylaws(self, admin_session):
        """GET /api/Bylaw — list all bylaws."""
        resp = api_get(admin_session, "/bylaw")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_02_get_bylaw_types(self, admin_session):
        """GET /api/Bylaw/types — get bylaw types."""
        resp = api_get(admin_session, "/bylaw/types")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_03_create_bylaw(self, admin_session):
        """POST /api/Bylaw — create new bylaw."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "name": f"Test Bylaw {unique_id}",
            "type": "Bachelor",
            "description": f"Test bylaw description {unique_id}",
            "minHoursToChooseDepartment": 30,
            "minHoursToChooseSpecialization": 60,
        }
        resp = api_post(admin_session, "/bylaw", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            bylaw = resp.json()
            assert bylaw["name"] == payload["name"]
            self.created_bylaw_ids.append(bylaw["bylawId"])

    def test_04_get_bylaw_by_id(self, admin_session):
        """GET /api/Bylaw/{id} — get bylaw."""
        if not self.created_bylaw_ids:
            pytest.skip("No created bylaws")
        bylaw_id = self.created_bylaw_ids[0]
        resp = api_get(admin_session, f"/bylaw/{bylaw_id}")
        assert_ok(resp)
        bylaw = resp.json()
        assert bylaw["bylawId"] == bylaw_id

    def test_05_edit_bylaw(self, admin_session):
        """PUT /api/Bylaw/{id} — edit bylaw details."""
        if not self.created_bylaw_ids:
            pytest.skip("No created bylaws")
        bylaw_id = self.created_bylaw_ids[0]
        import uuid
        suffix = uuid.uuid4().hex[:8]
        payload = {
            "name": f"Edited Bylaw {suffix}",
            "description": f"Updated description {suffix}",
        }
        resp = api_put(admin_session, f"/bylaw/{bylaw_id}", json_data=payload)
        assert_ok(resp)

    def test_06_toggle_bylaw_active(self, admin_session):
        """PATCH /api/Bylaw/{id}/toggle-active — toggle active status."""
        if not self.created_bylaw_ids:
            pytest.skip("No created bylaws")
        bylaw_id = self.created_bylaw_ids[0]
        resp = api_patch(admin_session, f"/bylaw/{bylaw_id}/toggle-active")
        # May return 200 or 204
        assert resp.status_code in (200, 204), f"Got {resp.status_code}: {resp.text[:200]}"
        # Toggle back
        resp = api_patch(admin_session, f"/bylaw/{bylaw_id}/toggle-active")
        assert resp.status_code in (200, 204), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_07_document_upload_endpoint(self, admin_session):
        """POST /api/Bylaw/{id}/upload — check endpoint exists (no file)."""
        if not self.created_bylaw_ids:
            pytest.skip("No created bylaws")
        bylaw_id = self.created_bylaw_ids[0]
        # Without a file, should return 400
        resp = api_post(admin_session, f"/bylaw/{bylaw_id}/upload")
        assert resp.status_code in (400, 415), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_08_document_download_endpoint(self, admin_session):
        """GET /api/Bylaw/{id}/download — check endpoint exists."""
        if not self.created_bylaw_ids:
            pytest.skip("No created bylaws")
        bylaw_id = self.created_bylaw_ids[0]
        resp = api_get(admin_session, f"/bylaw/{bylaw_id}/download")
        # May return 404 if no document, or 400 (bad request) — endpoint exists
        assert resp.status_code in (200, 400, 404), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_09_delete_bylaw(self, admin_session):
        """DELETE /api/Bylaw/{id} — delete bylaw."""
        if not self.created_bylaw_ids:
            pytest.skip("No created bylaws")
        bylaw_id = self.created_bylaw_ids[-1]
        resp = api_delete(admin_session, f"/bylaw/{bylaw_id}")
        assert resp.status_code in (204, 400), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code == 204:
            self.created_bylaw_ids.remove(bylaw_id)

    def test_10_cleanup_remaining_bylaws(self, admin_session):
        """Delete remaining test bylaws."""
        for bid in self.created_bylaw_ids[:]:
            api_delete(admin_session, f"/bylaw/{bid}")
        self.created_bylaw_ids.clear()
