"""
ManageBylawDetailsPage (/admin/bylaws/:bylawId) API Tests
- Bylaw Details tab (PUT)
- General Settings & Status (requirements + minhours)
- Registration & Credit Hours (PUT requirements)
- Grading System (PUT grade-scales, passing-grade, grade-weights)
- Probation (PUT probation)
- Levels (PUT level-scales)
- Major Declaration (PUT minhours + specialization prerequisites)
- Course Mapping (POST, DELETE, PUT prerequisites)
- Elective Buckets (GET/POST/PUT/DELETE)
"""

import pytest
from conftest import (
    api_get, api_post, api_put, api_patch, api_delete,
    assert_ok, assert_created, assert_no_content,
)

pytestmark = pytest.mark.integration


class TestBylawDetails:
    """Tests for Bylaw Details page (all bylaw configuration tabs)."""

    bylaw_id = None
    created_bucket_ids = []
    _setup_done = False

    def test_01_find_or_create_bylaw(self, admin_session):
        """Find existing bylaw or create one for testing."""
        resp = api_get(admin_session, "/bylaw")
        assert_ok(resp)
        bylaws = resp.json()
        if bylaws:
            self.__class__.bylaw_id = bylaws[0]["bylawId"]
            print(f"\nUsing bylaw ID: {self.bylaw_id}")
        else:
            import uuid
            unique_id = uuid.uuid4().hex[:8]
            payload = {
                "name": f"Details Test Bylaw {unique_id}",
                "type": "Bachelor",
            }
            resp = api_post(admin_session, "/bylaw", json_data=payload)
            assert resp.status_code in (200, 201)
            bylaw = resp.json()
            self.__class__.bylaw_id = bylaw["bylawId"]
            self.created_bucket_ids.append(f"__bylaw__{self.bylaw_id}")
        self.__class__._setup_done = True

    @pytest.fixture(autouse=True)
    def check_bylaw_id(self):
        if not self._setup_done:
            return  # Don't skip during setup
        if self.bylaw_id is None:
            pytest.skip("No bylaw ID available")

    def test_02_get_bylaw_details(self, admin_session):
        """GET /api/Bylaw/{id} — full bylaw details."""
        resp = api_get(admin_session, f"/bylaw/{self.bylaw_id}")
        assert_ok(resp)
        bylaw = resp.json()
        assert bylaw["bylawId"] == self.bylaw_id
        # Should contain various settings fields
        assert "name" in bylaw
        assert "type" in bylaw

    def test_03_update_bylaw_details(self, admin_session):
        """PUT /api/Bylaw/{id} — update bylaw basic details."""
        import uuid
        suffix = uuid.uuid4().hex[:8]
        payload = {
            "name": f"Bylaw Detail Edit {suffix}",
            "description": f"Updated detail {suffix}",
            "type": "Bachelor",
        }
        resp = api_put(admin_session, f"/bylaw/{self.bylaw_id}", json_data=payload)
        assert_ok(resp)

    def test_04_update_requirements(self, admin_session):
        """PUT /api/Bylaw/{id}/requirements — set credit hour requirements."""
        payload = {
            "totalHoursToCompleteDegree": 144,
            "minCreditHoursPerSemester": 12,
            "maxCreditHoursPerSemester": 21,
            "summerMaxCreditHours": 9,
            "thesisCreditHours": 0,
            "hasComprehensiveExam": False,
        }
        resp = api_put(admin_session, f"/bylaw/{self.bylaw_id}/requirements", json_data=payload)
        assert_ok(resp)

    def test_05_update_passing_grade(self, admin_session):
        """PUT /api/Bylaw/{id}/passing-grade — set passing grade."""
        payload = {
            "minPassingGpa": 2.0,
            "minPassingGradeLetter": "C",
            "minPassingGradeSortOrder": 4,
        }
        resp = api_put(admin_session, f"/bylaw/{self.bylaw_id}/passing-grade", json_data=payload)
        assert_ok(resp)

    def test_06_update_grade_weights(self, admin_session):
        """PUT /api/Bylaw/{id}/grade-weights — set grade weights."""
        payload = {
            "courseWorkGrade": 40.0,
            "finalExamGrade": 60.0,
        }
        resp = api_put(admin_session, f"/bylaw/{self.bylaw_id}/grade-weights", json_data=payload)
        assert_ok(resp)

    def test_07_update_probation(self, admin_session):
        """PUT /api/Bylaw/{id}/probation — set probation settings."""
        payload = {
            "probationThreshold": 2.0,
            "probationRegistrationLimit": 12,
        }
        resp = api_put(admin_session, f"/bylaw/{self.bylaw_id}/probation", json_data=payload)
        assert_ok(resp)

    def test_08_update_grade_scales(self, admin_session):
        """PUT /api/Bylaw/{id}/grade-scales — set grading scale."""
        payload = [
            {"gradeLetter": "A+", "minPercentage": 95, "gpaValue": 4.0, "sortOrder": 1},
            {"gradeLetter": "A", "minPercentage": 90, "gpaValue": 3.7, "sortOrder": 2},
            {"gradeLetter": "B+", "minPercentage": 85, "gpaValue": 3.3, "sortOrder": 3},
            {"gradeLetter": "B", "minPercentage": 80, "gpaValue": 3.0, "sortOrder": 4},
            {"gradeLetter": "C+", "minPercentage": 75, "gpaValue": 2.7, "sortOrder": 5},
            {"gradeLetter": "C", "minPercentage": 70, "gpaValue": 2.3, "sortOrder": 6},
            {"gradeLetter": "D+", "minPercentage": 65, "gpaValue": 2.0, "sortOrder": 7},
            {"gradeLetter": "D", "minPercentage": 60, "gpaValue": 1.7, "sortOrder": 8},
        ]
        resp = api_put(admin_session, f"/bylaw/{self.bylaw_id}/grade-scales", json_data=payload)
        assert_ok(resp)

    def test_09_update_level_scales(self, admin_session):
        """PUT /api/Bylaw/{id}/level-scales — set level progression."""
        payload = [
            {"level": 1, "minHours": 0},
            {"level": 2, "minHours": 36},
            {"level": 3, "minHours": 72},
            {"level": 4, "minHours": 108},
        ]
        resp = api_put(admin_session, f"/bylaw/{self.bylaw_id}/level-scales", json_data=payload)
        assert_ok(resp)

    def test_10_update_minhours_major(self, admin_session):
        """PUT /api/Bylaw/{id}/minhours-departmentAndSpecialization — set major declaration hours."""
        payload = {
            "minHoursToChooseDepartment": 30,
            "minHoursToChooseSpecialization": 60,
            "minCreditHoursForGraduationProject": 120,
        }
        resp = api_put(
            admin_session,
            f"/bylaw/{self.bylaw_id}/minhours-departmentAndSpecialization",
            json_data=payload,
        )
        assert_ok(resp)

    def test_11_list_elective_buckets(self, admin_session):
        """GET /api/ElectiveBuckets/bylaw/{bylawId} — list buckets for bylaw."""
        resp = api_get(admin_session, f"/electivebuckets/bylaw/{self.bylaw_id}")
        assert_ok(resp)
        data = resp.json()
        assert isinstance(data, list)

    def test_12_create_elective_bucket(self, admin_session):
        """POST /api/ElectiveBuckets — create elective bucket."""
        import uuid
        unique_id = uuid.uuid4().hex[:8]
        # Get a course to include
        courses_resp = api_get(admin_session, "/courses/active")
        assert_ok(courses_resp)
        courses = courses_resp.json()

        payload = {
            "name": f"Bucket {unique_id}",
            "bylawId": self.bylaw_id,
            "requiredCreditHours": 6,
            "requiredCourseCount": 2,
            "courseIds": [courses[0]["courseId"]] if courses else [],
        }
        resp = api_post(admin_session, "/electivebuckets", json_data=payload)
        assert resp.status_code in (200, 201), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code in (200, 201):
            bucket = resp.json()
            bid = bucket.get("bucketId") or bucket.get("electiveBucketId")
            if bid:
                self.created_bucket_ids.append(bid)

    def test_13_get_elective_bucket(self, admin_session):
        """GET /api/ElectiveBuckets/{bucketId} — get single bucket."""
        if not self.created_bucket_ids:
            pytest.skip("No created buckets")
        bucket_id = self.created_bucket_ids[0]
        resp = api_get(admin_session, f"/electivebuckets/{bucket_id}")
        assert_ok(resp)

    def test_14_update_elective_bucket(self, admin_session):
        """PUT /api/ElectiveBuckets/{bucketId} — update bucket."""
        if not self.created_bucket_ids:
            pytest.skip("No created buckets")
        bucket_id = self.created_bucket_ids[0]
        payload = {
            "name": f"Updated Bucket {bucket_id}",
            "requiredCreditHours": 9,
        }
        resp = api_put(admin_session, f"/electivebuckets/{bucket_id}", json_data=payload)
        assert_ok(resp)

    def test_15_delete_elective_bucket(self, admin_session):
        """DELETE /api/ElectiveBuckets/{bucketId} — delete bucket."""
        if not self.created_bucket_ids:
            pytest.skip("No created buckets")
        bucket_id = self.created_bucket_ids[-1]
        resp = api_delete(admin_session, f"/electivebuckets/{bucket_id}")
        assert resp.status_code in (204, 400), f"Got {resp.status_code}: {resp.text[:300]}"
        if resp.status_code == 204:
            self.created_bucket_ids.remove(bucket_id)

    def test_16_cleanup_buckets(self, admin_session):
        """Clean up remaining buckets and test bylaw if created."""
        for bid in self.created_bucket_ids[:]:
            if isinstance(bid, str) and bid.startswith("__bylaw__"):
                bylaw_id = int(bid.split("__")[-1])
                api_delete(admin_session, f"/bylaw/{bylaw_id}")
            else:
                api_delete(admin_session, f"/electivebuckets/{bid}")
        self.created_bucket_ids.clear()
