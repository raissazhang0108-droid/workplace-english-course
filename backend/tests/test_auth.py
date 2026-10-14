import hashlib
import sqlite3

from fastapi.testclient import TestClient

from backend.app.main import create_app


SAME_ORIGIN = {"Origin": "http://testserver"}
ANSWERS = [
    "How's", "weather", "looking", "usual", "weather", "all morning",
    "feel", "like", "miss", "the", "sun", "Classic", "At", "this",
    "point", "accepted", "don't", "even", "bother", "sounds", "staying",
]


def test_registration_normalizes_email_and_sets_http_only_session(tmp_path):
    client = TestClient(create_app(tmp_path / "accounts.sqlite3"))

    response = client.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={"email": "  Learner@Example.com ", "password": "a-long-password"},
    )

    assert response.status_code == 201
    assert response.json() == {"email": "learner@example.com", "completedCourses": []}
    cookie = response.cookies.get("english_course_session")
    assert cookie
    assert "httponly" in response.headers["set-cookie"].lower()
    assert client.get("/api/auth/me").json() == {
        "email": "learner@example.com",
        "completedCourses": [],
    }

    duplicate = client.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={"email": "LEARNER@example.com", "password": "another-password"},
    )
    assert duplicate.status_code == 409


def test_login_uses_generic_error_and_logout_revokes_session(tmp_path):
    client = TestClient(create_app(tmp_path / "accounts.sqlite3"))
    client.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={"email": "learner@example.com", "password": "a-long-password"},
    )
    client.cookies.clear()

    invalid = client.post(
        "/api/auth/login",
        headers=SAME_ORIGIN,
        json={"email": "learner@example.com", "password": "wrong-password"},
    )
    assert invalid.status_code == 401
    assert invalid.json()["detail"] == "邮箱或密码不匹配"

    login = client.post(
        "/api/auth/login",
        headers=SAME_ORIGIN,
        json={"email": "LEARNER@example.com", "password": "a-long-password"},
    )
    assert login.status_code == 200
    assert client.get("/api/auth/me").status_code == 200

    logout = client.post("/api/auth/logout", headers=SAME_ORIGIN)
    assert logout.status_code == 200
    assert client.get("/api/auth/me").status_code == 401


def test_account_claims_guest_quiz_history_and_course_progress_once(tmp_path):
    client = TestClient(create_app(tmp_path / "accounts.sqlite3"))
    legacy_attempt = {
        "completedAt": "2026-10-12T12:00:00+00:00",
        "answers": ANSWERS,
    }
    guest = client.post(
        "/api/attempts",
        json={"learnerId": "anonymous-browser-1", "answers": ANSWERS},
    )
    assert guest.status_code == 201

    registered = client.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={
            "email": "learner@example.com",
            "password": "a-long-password",
            "anonymousLearnerId": "anonymous-browser-1",
            "completedCourses": ["intro", "meeting"],
            "legacyAttempts": [legacy_attempt],
        },
    )
    assert registered.status_code == 201
    assert registered.json()["completedCourses"] == ["intro", "meeting"]
    attempts = client.get("/api/attempts").json()["attempts"]
    assert len(attempts) == 2
    assert guest.json() in attempts
    assert any(attempt["score"] == len(ANSWERS) for attempt in attempts)

    client.post(
        "/api/auth/login",
        headers=SAME_ORIGIN,
        json={
            "email": "learner@example.com",
            "password": "a-long-password",
            "anonymousLearnerId": "anonymous-browser-1",
            "legacyAttempts": [legacy_attempt],
        },
    )
    assert len(client.get("/api/attempts").json()["attempts"]) == 2

    client.put(
        "/api/progress",
        headers=SAME_ORIGIN,
        json={"completedCourses": ["interview"]},
    )
    assert client.get("/api/progress").json() == {"completedCourses": ["interview"]}


def test_authenticated_quiz_history_is_bound_to_session_not_client_learner_id(tmp_path):
    client = TestClient(create_app(tmp_path / "accounts.sqlite3"))
    client.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={"email": "learner@example.com", "password": "a-long-password"},
    )
    response = client.post(
        "/api/attempts",
        headers=SAME_ORIGIN,
        json={"learnerId": "someone-elses-id", "answers": ANSWERS},
    )

    assert response.status_code == 201
    assert client.get("/api/attempts", params={"learnerId": "someone-elses-id"}).json() == {
        "attempts": [response.json()],
    }


def test_auth_rejects_invalid_registration_and_cross_origin_mutations(tmp_path):
    client = TestClient(create_app(tmp_path / "accounts.sqlite3"))
    short_password = client.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={"email": "learner@example.com", "password": "short"},
    )
    assert short_password.status_code == 422

    cross_origin = client.post(
        "/api/auth/register",
        headers={"Origin": "https://attacker.example"},
        json={"email": "learner@example.com", "password": "a-long-password"},
    )
    assert cross_origin.status_code == 403


def test_https_session_cookie_is_secure_and_only_a_token_digest_is_stored(tmp_path):
    database = tmp_path / "accounts.sqlite3"
    client = TestClient(create_app(database), base_url="https://testserver")

    response = client.post(
        "/api/auth/register",
        headers={"Origin": "https://testserver"},
        json={"email": "learner@example.com", "password": "a-long-password"},
    )

    raw_token = response.cookies.get("english_course_session")
    assert raw_token
    assert "secure" in response.headers["set-cookie"].lower()
    with sqlite3.connect(database) as connection:
        stored_token_hash = connection.execute(
            "SELECT token_hash FROM sessions"
        ).fetchone()[0]
        password_hash, = connection.execute(
            "SELECT password_hash FROM users"
        ).fetchone()
    assert stored_token_hash == hashlib.sha256(raw_token.encode("ascii")).hexdigest()
    assert raw_token not in stored_token_hash
    assert password_hash != b"a-long-password"
    logout = client.post("/api/auth/logout", headers={"Origin": "https://testserver"})
    assert logout.status_code == 200
    assert "secure" in logout.headers["set-cookie"].lower()


def test_account_data_is_isolated_and_authenticated_mutations_require_same_origin(tmp_path):
    app = create_app(tmp_path / "accounts.sqlite3")
    learner_a = TestClient(app)
    learner_b = TestClient(app)
    learner_a.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={"email": "a@example.com", "password": "a-long-password"},
    )
    learner_b.post(
        "/api/auth/register",
        headers=SAME_ORIGIN,
        json={"email": "b@example.com", "password": "b-long-password"},
    )
    learner_a.put(
        "/api/progress",
        headers=SAME_ORIGIN,
        json={"completedCourses": ["interview"]},
    )

    assert learner_a.get("/api/progress").json() == {"completedCourses": ["interview"]}
    assert learner_b.get("/api/progress").json() == {"completedCourses": []}
    forbidden = learner_a.put(
        "/api/progress",
        headers={"Origin": "https://attacker.example"},
        json={"completedCourses": []},
    )
    assert forbidden.status_code == 403
