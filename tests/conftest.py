"""
Shared fixtures and helpers for IntelliCampus API integration tests.

Requires the .NET backend running at API_BASE_URL.
Test accounts are seeded on first run (see TEST_ACCOUNTS.md).
"""

import os
import warnings
import pytest
import requests
import urllib3

# Suppress SSL warnings for local dev
urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)
warnings.filterwarnings("ignore", message="Unverified HTTPS request")

API_BASE_URL = os.environ.get("API_BASE_URL", "http://localhost:5122")
API_PREFIX = f"{API_BASE_URL}/api"

# ── Test account credentials (from seed data JSON files) ──
ADMIN_EMAIL = "20260101@intellicampus.online"
ADMIN_PASSWORD = "2900101123456"
PROFESSOR_EMAIL = "202601001@intellicampus.online"       # Dr. Ahmed Hassan
PROFESSOR_PASSWORD = "2750315012341"
TA_EMAIL = "202601003@intellicampus.online"               # Eng. Omar Khaled
TA_PASSWORD = "2950910023453"
STUDENT_EMAIL = "2023010001@intellicampus.online"         # Mohamed Adel
STUDENT_PASSWORD = "30412022101731"
STUDENT2_EMAIL = "2023010002@intellicampus.online"        # Youssef Desoky
STUDENT2_PASSWORD = "30404011300039"


def login(email: str, password: str) -> requests.Session:
    """
    Login and return an authenticated requests.Session with the cookie set.
    The backend sets 'token' as an HttpOnly cookie.
    """
    session = requests.Session()
    url = f"{API_PREFIX}/auth/login"
    resp = session.post(
        url,
        json={"email": email, "password": password},
        headers={"Content-Type": "application/json"},
        verify=False,
    )
    assert resp.status_code == 200, f"Login failed for {email}: {resp.status_code} {resp.text}"
    return session


@pytest.fixture(scope="session")
def admin_session() -> requests.Session:
    """Authenticated session with SuperAdmin privileges."""
    return login(ADMIN_EMAIL, ADMIN_PASSWORD)


@pytest.fixture(scope="session")
def professor_session() -> requests.Session:
    """Authenticated session as Professor (Ahmed Hassan)."""
    return login(PROFESSOR_EMAIL, PROFESSOR_PASSWORD)


@pytest.fixture(scope="session")
def ta_session() -> requests.Session:
    """Authenticated session as TA (Omar Khaled)."""
    return login(TA_EMAIL, TA_PASSWORD)


@pytest.fixture(scope="session")
def student_session() -> requests.Session:
    """Authenticated session as Student (Mohamed Adel)."""
    return login(STUDENT_EMAIL, STUDENT_PASSWORD)


@pytest.fixture(scope="session")
def student2_session() -> requests.Session:
    """Authenticated session as Student (Youssef Desoky)."""
    return login(STUDENT2_EMAIL, STUDENT2_PASSWORD)


def api_get(session: requests.Session, path: str, **kwargs):
    """GET request to API with session auth."""
    url = f"{API_PREFIX}{path}"
    return session.get(url, verify=False, **kwargs)


def api_post(session: requests.Session, path: str, json_data=None, **kwargs):
    """POST request to API with session auth."""
    url = f"{API_PREFIX}{path}"
    return session.post(url, json=json_data, verify=False, **kwargs)


def api_put(session: requests.Session, path: str, json_data=None, **kwargs):
    """PUT request to API with session auth."""
    url = f"{API_PREFIX}{path}"
    return session.put(url, json=json_data, verify=False, **kwargs)


def api_patch(session: requests.Session, path: str, json_data=None, **kwargs):
    """PATCH request to API with session auth."""
    url = f"{API_PREFIX}{path}"
    return session.patch(url, json=json_data, verify=False, **kwargs)


def api_delete(session: requests.Session, path: str, **kwargs):
    """DELETE request to API with session auth."""
    url = f"{API_PREFIX}{path}"
    return session.delete(url, verify=False, **kwargs)


def assert_ok(resp: requests.Response, expected_status: int = 200):
    """Assert response status and print body on failure."""
    assert resp.status_code == expected_status, (
        f"Expected {expected_status}, got {resp.status_code}: {resp.text[:500]}"
    )


def assert_ok_or_created(resp: requests.Response):
    """Assert 200 or 201, returning parsed JSON."""
    assert resp.status_code in (200, 201), (
        f"Expected 200/201, got {resp.status_code}: {resp.text[:500]}"
    )
    return resp.json()


def assert_created(resp: requests.Response):
    """Assert 201 created. Falls back to 200 OK gracefully."""
    if resp.status_code == 200:
        return resp.json()
    assert_ok(resp, 201)
    return resp.json()


def assert_no_content(resp: requests.Response):
    """Assert 204 no content. Also accepts 200."""
    assert resp.status_code in (200, 204), (
        f"Expected 200/204, got {resp.status_code}: {resp.text[:300]}"
    )


def assert_bad_request(resp: requests.Response):
    """Assert 400 bad request."""
    assert_ok(resp, 400)
