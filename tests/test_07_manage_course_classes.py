"""
ManageCourseClasses (/admin/courses/:courseId) API Tests
- Load course + classes
- Students tab
- Grades upload tab (endpoint check)
- Deactivate course
- Edit course
- Import classes
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_patch, api_delete,
    assert_ok,
)

pytestmark = pytest.mark.integration


class TestManageCourseClasses:
    """Tests for ManageCourseClasses page."""

    course_id = None

    def test_01_find_existing_course(self, admin_session):
        """Find an existing course from seed data."""
        resp = api_get(admin_session, "/courses")
        assert_ok(resp)
        courses = resp.json()
        assert len(courses) > 0
        self.__class__.course_id = courses[0]["courseId"]
        print(f"\nUsing course ID: {self.course_id}")

    def test_02_get_course(self, admin_session):
        """GET /api/courses/{id} — load course."""
        if not self.course_id:
            pytest.skip("No course ID found")
        resp = api_get(admin_session, f"/courses/{self.course_id}")
        assert_ok(resp)
        course = resp.json()
        assert course["courseId"] == self.course_id

    def test_03_get_course_classes(self, admin_session):
        """GET /api/Classes/course/{courseId} — get course classes."""
        if not self.course_id:
            pytest.skip("No course ID found")
        resp = api_get(admin_session, f"/classes/course/{self.course_id}")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_04_get_course_students(self, admin_session):
        """GET /api/courses/{id}/students — get course students."""
        if not self.course_id:
            pytest.skip("No course ID found")
        resp = api_get(admin_session, f"/courses/{self.course_id}/students")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_05_edit_course_from_classes(self, admin_session):
        """PUT /api/courses/{id} — edit course (may be blocked if active)."""
        if not self.course_id:
            pytest.skip("No course ID found")
        import uuid
        suffix = uuid.uuid4().hex[:8]
        payload = {"description": f"Updated from classes {suffix}", "courseName": f"Course {suffix}"}
        resp = api_put(admin_session, f"/courses/{self.course_id}", json_data=payload)
        # May be blocked if course is active
        assert resp.status_code in (200, 400), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_06_grades_upload_endpoint(self, admin_session):
        """POST /api/courses/{id}/grades/upload — check endpoint exists (no file)."""
        if not self.course_id:
            pytest.skip("No course ID found")
        # Without a file, should return 400 (bad request) - endpoint exists
        resp = api_post(admin_session, f"/courses/{self.course_id}/grades/upload")
        assert resp.status_code in (400, 415), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_07_deactivate_course(self, admin_session):
        """PATCH /api/courses/{id}/deactivate — deactivate course."""
        if not self.course_id:
            pytest.skip("No course ID found")
        resp = api_patch(admin_session, f"/courses/{self.course_id}/deactivate")
        assert resp.status_code in (200, 204), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_08_reactivate_course(self, admin_session):
        """PATCH /api/courses/{id}/activate — reactivate."""
        if not self.course_id:
            pytest.skip("No course ID found")
        resp = api_patch(admin_session, f"/courses/{self.course_id}/activate")
        assert resp.status_code in (200, 204), f"Got {resp.status_code}: {resp.text[:200]}"

    def test_09_list_all_classes(self, admin_session):
        """GET /api/classes — list all classes."""
        resp = api_get(admin_session, "/classes")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_10_lecture_instructors(self, admin_session):
        """GET /api/Classes/lecture-instructors — available instructors."""
        resp = api_get(admin_session, "/classes/lecture-instructors")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_11_lecture_rooms(self, admin_session):
        """GET /api/Classes/lecture-rooms — available rooms."""
        resp = api_get(admin_session, "/classes/lecture-rooms")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)
