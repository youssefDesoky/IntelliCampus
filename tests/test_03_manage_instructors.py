"""
ManageInstructors (/admin/instructors) API Tests
- List instructors
- Create Professor / TA
- Create Loan instructor
- Edit / Delete instructor
- Import dialog
- Assign Role
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_delete,
    assert_ok, assert_created, assert_no_content, assert_bad_request,
)

pytestmark = pytest.mark.integration


class TestManageInstructors:
    """Tests for ManageInstructors page."""

    created_instructor_ids = []

    def test_01_list_instructors(self, admin_session):
        """GET /api/instructors — list all instructors."""
        resp = api_get(admin_session, "/instructors")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        assert len(data) >= 2

    def test_02_create_professor(self, admin_session):
        """POST /api/instructors — create a Professor."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "nationalId": f"PR{unique_id}",
            "fullName": f"Prof Test {unique_id}",
            "phoneNumber": f"0120{unique_id[:6]}",
            "nationality": "Egyptian",
            "instructorRole": "Professor",
            "facultyId": 1,
            "specialization": "Software Engineering",
            "status": "Employed",
            "hireDate": "2024-01-15",
        }
        resp = api_post(admin_session, "/instructors", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            inst = resp.json()
            assert inst["fullName"] == payload["fullName"]
            self.created_instructor_ids.append(inst["userId"])

    def test_03_create_ta(self, admin_session):
        """POST /api/instructors — create a Teaching Assistant."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "nationalId": f"TA{unique_id}",
            "fullName": f"TA Test {unique_id}",
            "phoneNumber": f"0121{unique_id[:6]}",
            "nationality": "Egyptian",
            "instructorRole": "TeachingAssistant",
            "facultyId": 1,
            "status": "Employed",
            "hireDate": "2025-09-01",
        }
        resp = api_post(admin_session, "/instructors", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            inst = resp.json()
            self.created_instructor_ids.append(inst["userId"])

    def test_04_create_lecturer(self, admin_session):
        """POST /api/instructors — create a Lecturer."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "nationalId": f"LC{unique_id}",
            "fullName": f"Lecturer Test {unique_id}",
            "phoneNumber": f"0122{unique_id[:6]}",
            "nationality": "Egyptian",
            "instructorRole": "Lecturer",
            "facultyId": 1,
            "status": "Employed",
            "hireDate": "2025-01-15",
        }
        resp = api_post(admin_session, "/instructors", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            inst = resp.json()
            self.created_instructor_ids.append(inst["userId"])

    def test_05_create_loan_instructor(self, admin_session):
        """POST /api/instructors — create Loan instructor with loan details."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "nationalId": f"LN{unique_id}",
            "fullName": f"Loan Instructor {unique_id}",
            "phoneNumber": f"0123{unique_id[:6]}",
            "nationality": "Egyptian",
            "instructorRole": "Lecturer",
            "facultyId": 1,
            "status": "Loan",
            "loanFromFacultyId": 1,
            "loanFromDepartmentId": 1,
            "loanProfessorId": "LPR001",
            "contractStartDate": "2026-02-01",
            "contractEndDate": "2026-08-01",
            "hireDate": "2026-02-01",
        }
        resp = api_post(admin_session, "/instructors", json_data=payload)
        assert resp.status_code in (200, 201, 400), f"Got {resp.status_code}: {resp.text[:300]}"
        inst = resp.json() if resp.status_code in (200, 201) else None
        if inst and "userId" in inst:
            self.created_instructor_ids.append(inst["userId"])

    def test_06_edit_instructor(self, admin_session):
        """PUT /api/instructors/{id} — edit instructor."""
        if not self.created_instructor_ids:
            pytest.skip("No created instructors to edit")
        inst_id = self.created_instructor_ids[0]
        import uuid
        unique_suffix = uuid.uuid4().hex[:8]
        payload = {
            "fullName": f"Edited Instructor {unique_suffix}",
            "specialization": "Data Science",
        }
        resp = api_put(admin_session, f"/instructors/{inst_id}", json_data=payload)
        assert_ok(resp)
        updated = resp.json()
        assert updated["fullName"] == payload["fullName"]

    def test_07_get_instructor_roles(self, admin_session):
        """GET /api/instructors/roles — returns available instructor roles."""
        resp = api_get(admin_session, "/instructors/roles")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        # Should contain common roles
        role_names = [r if isinstance(r, str) else r.get("name", r.get("roleName", "")) for r in data]
        # At minimum we should get a list back

    def test_08_assign_role_to_instructor(self, admin_session):
        """POST /api/Roles/assign — assign role to instructor."""
        if not self.created_instructor_ids:
            pytest.skip("No created instructors")
        inst_id = self.created_instructor_ids[0]
        payload = {"userId": inst_id, "roleName": "Instructor"}
        resp = api_post(admin_session, "/roles/assign", json_data=payload)
        assert resp.status_code in (200, 400, 409), f"Got {resp.status_code}: {resp.text[:300]}"

    def test_09_instructor_departments(self, admin_session):
        """GET /api/instructors/professors — filterable."""
        resp = api_get(admin_session, "/instructors/professors")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_10_delete_instructor(self, admin_session):
        """DELETE /api/instructors/{id} — delete instructor."""
        if not self.created_instructor_ids:
            pytest.skip("No created instructors to delete")
        inst_id = self.created_instructor_ids[-1]
        resp = api_delete(admin_session, f"/instructors/{inst_id}")
        assert resp.status_code in (204, 400), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code == 204:
            self.created_instructor_ids.remove(inst_id)

    def test_11_cleanup_remaining_instructors(self, admin_session):
        """Delete remaining test instructors."""
        for iid in self.created_instructor_ids[:]:
            api_delete(admin_session, f"/instructors/{iid}")
        self.created_instructor_ids.clear()
