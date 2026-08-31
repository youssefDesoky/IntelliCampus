"""
InstructorDetails (/admin/instructors/:instructorId) API Tests
- Load instructor detail
- Info + Courses tabs
- Professor lectures
- TA sections
- Instructor courses
- Edit instructor
"""

import pytest
from conftest import (
    api_get, api_put,
    assert_ok,
)

pytestmark = pytest.mark.integration


class TestInstructorDetails:
    """Tests for InstructorDetails page."""

    instructor_id = None
    ta_id = None

    def test_01_find_instructor_ids(self, admin_session):
        """Find a professor and TA from seed data."""
        resp = api_get(admin_session, "/instructors")
        assert_ok(resp)
        instructors = resp.json()
        assert len(instructors) >= 2

        for inst in instructors:
            role = inst.get("instructorRole", "")
            uid = inst["userId"]
            if role in ("Professor",) and not self.__class__.instructor_id:
                self.__class__.instructor_id = uid
            if role in ("TeachingAssistant",) and not self.__class__.ta_id:
                self.__class__.ta_id = uid

        print(f"\nProfessor ID: {self.instructor_id}, TA ID: {self.ta_id}")

    def test_02_load_instructor(self, admin_session):
        """GET /api/instructors/{id} — load instructor details."""
        if not self.instructor_id:
            pytest.skip("No instructor ID found")
        resp = api_get(admin_session, f"/instructors/{self.instructor_id}")
        assert_ok(resp)
        inst = resp.json()
        assert inst["userId"] == self.instructor_id
        assert "fullName" in inst

    def test_03_professor_lectures(self, admin_session):
        """GET /api/Classes/professor-lectures — get professor lecture classes."""
        resp = api_get(admin_session, "/classes/professor-lectures")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_04_ta_sections(self, admin_session):
        """GET /api/Classes/ta-sections?instructorId= — get TA section classes."""
        if self.ta_id:
            resp = api_get(admin_session, f"/classes/ta-sections?instructorId={self.ta_id}")
        else:
            resp = api_get(admin_session, "/classes/ta-sections")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_05_instructor_courses(self, admin_session):
        """GET /api/Courses/instructor/{id} — get instructor's courses."""
        if not self.instructor_id:
            pytest.skip("No instructor ID found")
        resp = api_get(admin_session, f"/courses/instructor/{self.instructor_id}")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_06_instructor_my_teaching(self, professor_session):
        """GET /api/Courses/my-teaching — instructor's own teaching."""
        resp = api_get(professor_session, "/courses/my-teaching")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_07_edit_instructor(self, admin_session):
        """PUT /api/instructors/{id} — edit instructor from details."""
        if not self.instructor_id:
            pytest.skip("No instructor ID found")
        import uuid
        suffix = uuid.uuid4().hex[:8]
        payload = {"specialization": f"Edited {suffix}"}
        resp = api_put(admin_session, f"/instructors/{self.instructor_id}", json_data=payload)
        assert_ok(resp)
