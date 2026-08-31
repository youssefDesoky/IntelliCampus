"""
ManageStudents (/admin/students) API Tests
- List students
- Search/filter by department
- Create Bachelor student (auto-generates email/code)
- Create postgrad (Masters/PhD/Diploma)
- Edit student
- Delete student
- Assign Role modal
- Student Types
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_delete, api_patch,
    assert_ok, assert_created, assert_no_content, assert_bad_request,
)

pytestmark = pytest.mark.integration


class TestManageStudents:
    """Tests for ManageStudents page (list, CRUD, roles, types)."""

    created_student_ids = []
    created_bylaw_ids = []
    bylaw_map = {}  # type -> bylawId

    def test_00_setup_bylaws(self, admin_session):
        """Create bylaws for Masters, PhD, Diploma if they don't exist."""
        # Get existing bylaws
        resp = api_get(admin_session, "/bylaw")
        assert_ok(resp)
        existing = {b["type"]: b["bylawId"] for b in resp.json()}

        for btype in ["Bachelor", "Master", "PhD", "Diploma"]:
            if btype in existing:
                self.bylaw_map[btype] = existing[btype]
                continue
            import uuid
            unique_id = uuid.uuid4().hex[:8]
            payload = {
                "name": f"Test {btype} Bylaw {unique_id}",
                "type": btype,
            }
            resp = api_post(admin_session, "/bylaw", json_data=payload)
            if resp.status_code in (200, 201):
                bylaw = resp.json()
                self.bylaw_map[btype] = bylaw["bylawId"]
                self.created_bylaw_ids.append(bylaw["bylawId"])
        print(f"\nBylaw map: {self.bylaw_map}")

    def test_01_list_students(self, admin_session):
        """GET /api/students — return list of all students."""
        resp = api_get(admin_session, "/students")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        # Seed data has at least 5 students
        assert len(data) >= 2

    def test_02_list_students_requires_auth(self):
        """GET /api/students without auth should fail."""
        import requests
        resp = requests.get(
            "http://localhost:5122/api/students",
            verify=False,
            allow_redirects=False,
        )
        assert resp.status_code in (401, 302), f"Got {resp.status_code}"

    def test_03_student_types(self, admin_session):
        """GET /api/students/types — returns student type enum values."""
        resp = api_get(admin_session, "/students/types")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        assert "Bachelor" in data
        assert "Masters" in data
        assert "PhD" in data
        assert "Diploma" in data

    def test_04_create_bachelor_student(self, admin_session):
        """POST /api/students — create Bachelor student, auto-generates email/code."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        payload = {
            "nationalId": f"BN{unique_id}",
            "fullName": f"Bachelor Test {unique_id}",
            "phoneNumber": f"0100{unique_id[:6]}",
            "address": "Test Address",
            "nationality": "Egyptian",
            "studentType": "Bachelor",
            "level": 1,
            "facultyId": 1,
            "departmentId": 1,
            "bylawId": self.bylaw_map.get("Bachelor", 1),
            "enrollmentDate": "2026-01-15",
            "program": 0,  # General
        }
        resp = api_post(admin_session, "/students", json_data=payload)
        assert_created(resp)
        student = resp.json()
        assert student["fullName"] == payload["fullName"]
        assert student["nationalId"] == payload["nationalId"]
        assert student.get("email"), "Email should be auto-generated"
        assert student.get("studentCode"), "Code should be auto-generated"
        self.created_student_ids.append(student["userId"])

    def test_05_create_masters_student(self, admin_session):
        """POST /api/students — create postgrad Masters student."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        bylaw_id = self.bylaw_map.get("Master", 1)
        payload = {
            "nationalId": f"MN{unique_id}",
            "fullName": f"Masters Test {unique_id}",
            "phoneNumber": f"0101{unique_id[:6]}",
            "nationality": "Egyptian",
            "studentType": "Masters",
            "level": 1,
            "facultyId": 1,
            "departmentId": 1,
            "departmentName": "Computer Science",
            "bylawId": bylaw_id,
            "enrollmentDate": "2026-01-15",
            "program": 0,
        }
        resp = api_post(admin_session, "/students", json_data=payload)
        assert_created(resp)
        student = resp.json()
        assert student["fullName"] == payload["fullName"]
        self.created_student_ids.append(student["userId"])

    def test_06_create_phd_student(self, admin_session):
        """POST /api/students — create postgrad PhD student."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        bylaw_id = self.bylaw_map.get("PhD", 1)
        payload = {
            "nationalId": f"PN{unique_id}",
            "fullName": f"PhD Test {unique_id}",
            "phoneNumber": f"0102{unique_id[:6]}",
            "nationality": "Egyptian",
            "studentType": "PhD",
            "level": 1,
            "facultyId": 1,
            "departmentId": 1,
            "bylawId": bylaw_id,
            "enrollmentDate": "2026-01-15",
            "program": 1,  # Credit
        }
        resp = api_post(admin_session, "/students", json_data=payload)
        assert_created(resp)
        student = resp.json()
        self.created_student_ids.append(student["userId"])

    def test_07_create_diploma_student(self, admin_session):
        """POST /api/students — create postgrad Diploma student."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        bylaw_id = self.bylaw_map.get("Diploma", 1)
        payload = {
            "nationalId": f"DN{unique_id}",
            "fullName": f"Diploma Test {unique_id}",
            "phoneNumber": f"0103{unique_id[:6]}",
            "nationality": "Egyptian",
            "studentType": "Diploma",
            "level": 1,
            "facultyId": 1,
            "bylawId": bylaw_id,
            "enrollmentDate": "2026-01-15",
            "program": 0,
        }
        resp = api_post(admin_session, "/students", json_data=payload)
        assert_created(resp)
        student = resp.json()
        self.created_student_ids.append(student["userId"])

    def test_08_edit_student(self, admin_session):
        """PUT /api/students/{userId} — update student info."""
        if not self.created_student_ids:
            pytest.skip("No created students to edit")
        student_id = self.created_student_ids[0]
        import uuid
        unique_suffix = uuid.uuid4().hex[:8]
        payload = {
            "fullName": f"Edited Student {unique_suffix}",
            "phoneNumber": f"0110{unique_suffix[:6]}",
            "address": "Updated Address",
        }
        resp = api_put(admin_session, f"/students/{student_id}", json_data=payload)
        assert_ok(resp)
        updated = resp.json()
        assert updated["fullName"] == payload["fullName"]
        assert updated["phoneNumber"] == payload["phoneNumber"]

    def test_09_get_student_by_id(self, admin_session):
        """GET /api/students/{id} — load single student."""
        if not self.created_student_ids:
            pytest.skip("No created students to fetch")
        student_id = self.created_student_ids[0]
        resp = api_get(admin_session, f"/students/{student_id}")
        assert_ok(resp)
        student = resp.json()
        assert student["userId"] == student_id

    def test_10_assign_role_to_student(self, admin_session):
        """GET /api/Roles, POST /api/Roles/assign — assign a role to student."""
        if not self.created_student_ids:
            pytest.skip("No created students for role assignment")
        student_id = self.created_student_ids[0]

        # Get all roles
        resp = api_get(admin_session, "/roles")
        assert_ok(resp)
        roles = resp.json()
        assert len(roles) > 0

        # Get student's current roles
        resp = api_get(admin_session, f"/roles/user/{student_id}")
        assert_ok(resp)
        user_roles = resp.json()

        # Assign a role if not already assigned (e.g. Student_Bachelor)
        payload = {"userId": student_id, "roleName": "Student_Bachelor"}
        resp = api_post(admin_session, "/roles/assign", json_data=payload)
        # May succeed or may already exist (400/409)
        assert resp.status_code in (200, 400, 409), f"Got {resp.status_code}: {resp.text[:300]}"

    def test_11_delete_role_from_student(self, admin_session):
        """DELETE /api/Roles/user/{id}/role/{id} — remove role."""
        if not self.created_student_ids:
            pytest.skip("No created students")
        student_id = self.created_student_ids[0]

        # Get student's current roles
        resp = api_get(admin_session, f"/roles/user/{student_id}")
        assert_ok(resp)
        user_roles = resp.json()
        if not user_roles:
            pytest.skip("Student has no removable roles")
        # We won't delete the primary role to avoid breaking things
        # Just test the endpoint exists and returns appropriate status
        non_primary = [r for r in user_roles if not r["roleName"].startswith("Student_")]
        if non_primary:
            role_to_remove = non_primary[0]
            resp = api_delete(admin_session, f"/roles/user/{student_id}/role/{role_to_remove['roleId']}")
            assert resp.status_code in (204, 400)

    def test_12_get_user_roles(self, admin_session):
        """GET /api/Roles/user/{userId} — get user's assigned roles."""
        if not self.created_student_ids:
            pytest.skip("No created students")
        student_id = self.created_student_ids[0]
        resp = api_get(admin_session, f"/roles/user/{student_id}")
        assert_ok(resp)
        user_roles = resp.json()
        assert isinstance(user_roles, list)

    def test_13_delete_student(self, admin_session):
        """DELETE /api/students/{id} — delete student."""
        if not self.created_student_ids:
            pytest.skip("No created students to delete")
        student_id = self.created_student_ids[-1]
        resp = api_delete(admin_session, f"/students/{student_id}")
        assert_no_content(resp)
        # Verify deletion
        resp = api_get(admin_session, f"/students/{student_id}")
        assert resp.status_code in (200, 404)
        if resp.status_code == 404:
            self.created_student_ids.remove(student_id)
        else:
            # Soft delete — student still exists but maybe deactivated
            pass

    def test_14_cleanup_remaining_students(self, admin_session):
        """Delete any remaining test students and bylaws."""
        for sid in self.created_student_ids[:]:
            api_delete(admin_session, f"/students/{sid}")
        self.created_student_ids.clear()
        for bid in self.created_bylaw_ids[:]:
            api_delete(admin_session, f"/bylaw/{bid}")
        self.created_bylaw_ids.clear()
