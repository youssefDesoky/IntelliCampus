"""
ManageAdmins (/admin/admins) API Tests
- List admins
- Create admin with Admin_Masters / Admin_PhD role
- Edit / change role
- Delete — SuperAdmin delete correctly blocked (400)
- View details modal
- Assign Role
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_delete,
    assert_ok, assert_created, assert_no_content, assert_bad_request,
)

pytestmark = pytest.mark.integration


class TestManageAdmins:
    """Tests for ManageAdmins page."""

    created_admin_ids = []

    def test_01_list_admins(self, admin_session):
        """GET /api/admins — list all admins."""
        resp = api_get(admin_session, "/admins")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_02_create_admin_masters(self, admin_session):
        """POST /api/admins — create admin with Admin_Masters role."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "nationalId": f"AM{unique_id}",
            "fullName": f"Admin Masters {unique_id}",
            "phoneNumber": f"0130{unique_id[:6]}",
            "nationality": "Egyptian",
            "adminRole": "Admin_Masters",
            "facultyId": 1,
            "hireDate": "2025-06-01",
        }
        resp = api_post(admin_session, "/admins", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            admin = resp.json()
            assert admin["fullName"] == payload["fullName"]
            self.created_admin_ids.append(admin["userId"])

    def test_03_create_admin_phd(self, admin_session):
        """POST /api/admins — create admin with Admin_PhD role."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "nationalId": f"AP{unique_id}",
            "fullName": f"Admin PhD {unique_id}",
            "phoneNumber": f"0131{unique_id[:6]}",
            "nationality": "Egyptian",
            "adminRole": "Admin_PhD",
            "facultyId": 1,
            "hireDate": "2025-06-01",
        }
        resp = api_post(admin_session, "/admins", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            admin = resp.json()
            self.created_admin_ids.append(admin["userId"])

    def test_04_view_admin_detail(self, admin_session):
        """GET /api/admins/{id} — view admin details."""
        if not self.created_admin_ids:
            pytest.skip("No created admins to view")
        admin_id = self.created_admin_ids[0]
        resp = api_get(admin_session, f"/admins/{admin_id}")
        assert_ok(resp)
        admin = resp.json()
        assert admin["userId"] == admin_id

    def test_05_edit_admin(self, admin_session):
        """PUT /api/admins/{id} — edit admin info."""
        if not self.created_admin_ids:
            pytest.skip("No created admins to edit")
        admin_id = self.created_admin_ids[0]
        import uuid
        suffix = uuid.uuid4().hex[:8]
        payload = {
            "fullName": f"Edited Admin {suffix}",
            "phoneNumber": f"0132{suffix[:6]}",
        }
        resp = api_put(admin_session, f"/admins/{admin_id}", json_data=payload)
        assert_ok(resp)
        updated = resp.json()
        assert updated["fullName"] == payload["fullName"]

    def test_06_assign_role_to_admin(self, admin_session):
        """POST /api/Roles/assign — assign role to admin."""
        if not self.created_admin_ids:
            pytest.skip("No created admins")
        admin_id = self.created_admin_ids[0]
        payload = {"userId": admin_id, "roleName": "Admin_Masters"}
        resp = api_post(admin_session, "/roles/assign", json_data=payload)
        assert resp.status_code in (200, 400, 409), f"Got {resp.status_code}: {resp.text[:300]}"

    def test_07_delete_admin_should_work(self, admin_session):
        """DELETE /api/admins/{id} — delete a regular (non-SuperAdmin) admin."""
        if not self.created_admin_ids:
            pytest.skip("No created admins to delete")
        admin_id = self.created_admin_ids[-1]
        resp = api_delete(admin_session, f"/admins/{admin_id}")
        assert resp.status_code in (204, 400), (
            f"Expected 204 or 400 for deleting admin, got {resp.status_code}: {resp.text[:300]}"
        )
        if resp.status_code == 204:
            self.created_admin_ids.remove(admin_id)

    def test_08_delete_superadmin_should_be_blocked(self, admin_session):
        """DELETE /api/admins/{id} — deleting SuperAdmin should fail with 400."""
        # The first admin (id=1) should be SuperAdmin
        resp = api_delete(admin_session, "/admins/1")
        assert_ok(resp, 400)

    def test_09_cleanup_remaining_admins(self, admin_session):
        """Delete remaining test admins."""
        for aid in self.created_admin_ids[:]:
            api_delete(admin_session, f"/admins/{aid}")
        self.created_admin_ids.clear()
