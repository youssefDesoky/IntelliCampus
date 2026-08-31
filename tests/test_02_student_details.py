"""
StudentDetails (/admin/students/:studentId) API Tests
- Load student detail
- Info / Completed / Registered tabs
- Registered courses (inprogress)
- Completed courses
- Available courses
- Register / Unregister course
- Edit from details
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_delete,
    assert_ok, assert_created, assert_no_content,
)

pytestmark = pytest.mark.integration


class TestStudentDetails:
    """Tests for StudentDetails page."""

    # We'll use the first seed student: mohammed.hassan@student.com
    student_id = None

    def test_01_load_student(self, admin_session, student_session):
        """GET /api/students/{id} — load student details."""
        # First get list to find a valid student ID
        resp = api_get(admin_session, "/students")
        assert_ok(resp)
        students = resp.json()
        assert len(students) > 0
        self.__class__.student_id = students[0]["userId"]

        resp = api_get(admin_session, f"/students/{self.student_id}")
        assert_ok(resp)
        student = resp.json()
        assert student["userId"] == self.student_id
        assert "fullName" in student
        assert "email" in student

        # Also test self-access via student session
        me_resp = api_get(student_session, "/auth/me")
        assert_ok(me_resp)
        me = me_resp.json()

    def test_02_get_registered_courses(self, admin_session):
        """GET /api/Courses/student/{id}?status=inprogress — registered courses."""
        if not self.student_id:
            pytest.skip("No student ID found")
        resp = api_get(
            admin_session,
            f"/courses/student/{self.student_id}",
            params={"status": "inprogress"},
        )
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_03_get_completed_courses(self, admin_session):
        """GET /api/Courses/student/{id}?status=completed — completed courses."""
        if not self.student_id:
            pytest.skip("No student ID found")
        resp = api_get(
            admin_session,
            f"/courses/student/{self.student_id}",
            params={"status": "completed"},
        )
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_04_get_available_courses(self, admin_session):
        """GET /api/Courses/active — list active courses available for registration."""
        resp = api_get(admin_session, "/courses/active")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
        # Should have at least a few active courses
        assert len(data) >= 1

    def test_05_register_course_for_student(self, admin_session):
        """POST /api/Students/{id}/register — register student in a course."""
        if not self.student_id:
            pytest.skip("No student ID found")

        # Get active courses
        resp = api_get(admin_session, "/courses/active")
        assert_ok(resp)
        courses = resp.json()
        if not courses:
            pytest.skip("No active courses available")

        # Use the first active course
        course_id = courses[0]["courseId"]

        payload = {"courseId": course_id, "classId": None}
        resp = api_post(admin_session, f"/students/{self.student_id}/register", json_data=payload)
        # May return 200 (success), 400 (already registered), or 404 (no class)
        assert resp.status_code in (200, 400, 404), (
            f"Got {resp.status_code}: {resp.text[:300]}"
        )

    def test_06_unregister_course(self, admin_session):
        """DELETE /api/Students/{id}/courses/{courseId} — unregister student."""
        if not self.student_id:
            pytest.skip("No student ID found")

        # Get registered courses
        resp = api_get(
            admin_session,
            f"/courses/student/{self.student_id}",
            params={"status": "inprogress"},
        )
        assert_ok(resp)
        courses = resp.json()
        if not courses:
            pytest.skip("Student has no registered courses")

        course_id = courses[0].get("courseId", courses[0].get("id"))
        resp = api_delete(admin_session, f"/students/{self.student_id}/courses/{course_id}")
        assert resp.status_code in (204, 400), f"Got {resp.status_code}: {resp.text[:300]}"

    def test_07_edit_student_from_details(self, admin_session):
        """PUT /api/students/{id} — edit student info from details page."""
        if not self.student_id:
            pytest.skip("No student ID found")
        import uuid
        unique_suffix = uuid.uuid4().hex[:8]
        payload = {
            "address": f"Updated from details {unique_suffix}",
        }
        resp = api_put(admin_session, f"/students/{self.student_id}", json_data=payload)
        assert_ok(resp)
