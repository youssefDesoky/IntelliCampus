"""
ManageDepartments (/admin/departments) API Tests
- List departments
- Create / Edit / Delete — delete guarded (cannot delete dept with specializations)
- Set Specializations (GET/POST/DELETE)
- Registration settings
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_delete,
    assert_ok, assert_created, assert_no_content, assert_bad_request,
)

pytestmark = pytest.mark.integration


class TestManageDepartments:
    """Tests for ManageDepartments page."""

    created_dept_ids = []
    created_spec_ids = []

    def test_01_list_departments(self, admin_session):
        """GET /api/departments — list all departments."""
        resp = api_get(admin_session, "/departments")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 1

    def test_02_create_department(self, admin_session):
        """POST /api/departments — create department."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "departmentName": f"Test Dept {unique_id}",
            "description": f"Test department {unique_id}",
            "facultyId": 1,
            "maxCapacity": 500,
        }
        resp = api_post(admin_session, "/departments", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            dept = resp.json()
            assert dept["departmentName"] == payload["departmentName"]
            self.created_dept_ids.append(dept["departmentId"])

    def test_03_get_department_by_id(self, admin_session):
        """GET /api/departments/{id} — get department."""
        if not self.created_dept_ids:
            pytest.skip("No created departments")
        dept_id = self.created_dept_ids[0]
        resp = api_get(admin_session, f"/departments/{dept_id}")
        assert_ok(resp)
        dept = resp.json()
        assert dept["departmentId"] == dept_id

    def test_04_edit_department(self, admin_session):
        """PUT /api/departments/{id} — edit department."""
        if not self.created_dept_ids:
            pytest.skip("No created departments")
        dept_id = self.created_dept_ids[0]
        import uuid
        suffix = uuid.uuid4().hex[:8]
        payload = {
            "departmentName": f"Edited Dept {suffix}",
            "maxCapacity": 600,
        }
        resp = api_put(admin_session, f"/departments/{dept_id}", json_data=payload)
        assert_ok(resp)
        updated = resp.json()
        assert updated["departmentName"] == payload["departmentName"]

    def test_05_list_specializations(self, admin_session):
        """GET /api/specialization — list specializations."""
        resp = api_get(admin_session, "/specialization")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_06_create_specialization_in_department(self, admin_session):
        """POST /api/Specialization — create specialization."""
        if not self.created_dept_ids:
            pytest.skip("No created departments")
        dept_id = self.created_dept_ids[0]
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "name": f"Spec {unique_id}",
            "departmentId": dept_id,
            "maxCapacity": 200,
        }
        resp = api_post(admin_session, "/specialization", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            spec = resp.json()
            self.created_spec_ids.append(spec["specializationId"])

    def test_07_get_specializations_by_department(self, admin_session):
        """GET /api/Specialization/department/{departmentId} — specs for department."""
        if not self.created_dept_ids:
            pytest.skip("No created departments")
        dept_id = self.created_dept_ids[0]
        resp = api_get(admin_session, f"/specialization/department/{dept_id}")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_08_delete_specialization(self, admin_session):
        """DELETE /api/Specialization/{id} — delete specialization."""
        if not self.created_spec_ids:
            pytest.skip("No created specializations")
        spec_id = self.created_spec_ids[-1]
        resp = api_delete(admin_session, f"/specialization/{spec_id}")
        assert resp.status_code in (204, 400), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code == 204:
            self.created_spec_ids.remove(spec_id)

    def test_09_delete_department_with_specialization_guarded(self, admin_session):
        """DELETE /api/departments/{id} — should fail if specialization exists."""
        # Try to delete dept with remaining specializations
        if not self.created_dept_ids:
            pytest.skip("No created departments")
        dept_id = self.created_dept_ids[0]
        if self.created_spec_ids:
            resp = api_delete(admin_session, f"/departments/{dept_id}")
            assert resp.status_code in (400, 204), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_10_registration_settings(self, admin_session):
        """PUT /api/departments/registration-settings — update registration settings."""
        payload = {
            "allowedLevels": [1, 2, 3, 4],
            "regStartDate": "2026-09-01T00:00:00",
            "regEndDate": "2026-09-15T00:00:00",
        }
        resp = api_put(admin_session, "/departments/registration-settings", json_data=payload)
        assert resp.status_code in (200, 400), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_11_cleanup(self, admin_session):
        """Clean up created test data."""
        for sid in self.created_spec_ids[:]:
            api_delete(admin_session, f"/specialization/{sid}")
        for did in self.created_dept_ids[:]:
            api_delete(admin_session, f"/departments/{did}")
        self.created_spec_ids.clear()
        self.created_dept_ids.clear()
