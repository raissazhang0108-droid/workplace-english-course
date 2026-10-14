from fastapi.testclient import TestClient

from backend.app.main import create_app


def test_attempt_is_graded_by_server_and_history_is_scoped_to_learner(tmp_path):
    client = TestClient(create_app(tmp_path / "scores.sqlite3"))
    answers = [
        "How's", "weather", "looking", "usual", "weather", "all morning",
        "feel", "like", "miss", "the", "sun", "Classic", "At", "this",
        "point", "accepted", "don't", "even", "bother", "sounds", "staying",
    ]

    response = client.post("/api/attempts", json={"learnerId": "learner-a", "answers": answers})

    assert response.status_code == 201
    attempt = response.json()
    assert attempt["score"] == 21
    assert attempt["correctness"] == [True] * 21
    assert attempt["answers"] == answers
    assert client.get("/api/attempts", params={"learnerId": "learner-a"}).json() == {
        "attempts": [attempt]
    }
    assert client.get("/api/attempts", params={"learnerId": "learner-b"}).json() == {
        "attempts": []
    }


def test_server_counts_blank_and_incorrect_answers(tmp_path):
    client = TestClient(create_app(tmp_path / "scores.sqlite3"))
    answers = ["wrong", ""] + [""] * 19

    response = client.post("/api/attempts", json={"learnerId": "learner-a", "answers": answers})

    assert response.status_code == 201
    assert response.json()["score"] == 0
    assert response.json()["correctness"] == [False] * 21


def test_server_accepts_punctuation_and_whitespace_and_keeps_only_ten_attempts(tmp_path):
    client = TestClient(create_app(tmp_path / "scores.sqlite3"))
    answers = ["  HOW'S!  ", " WEATHER ", "looking"] + [""] * 18

    first = client.post("/api/attempts", json={"learnerId": "learner-a", "answers": answers})
    assert first.status_code == 201
    assert first.json()["correctness"][:3] == [True, True, True]
    for _ in range(10):
        client.post("/api/attempts", json={"learnerId": "learner-a", "answers": [""] * 21})

    history = client.get("/api/attempts", params={"learnerId": "learner-a"}).json()["attempts"]
    assert len(history) == 10
    assert first.json()["id"] not in {attempt["id"] for attempt in history}


def test_server_rejects_missing_or_malformed_answers(tmp_path):
    client = TestClient(create_app(tmp_path / "scores.sqlite3"))

    assert client.post("/api/attempts", json={"learnerId": "learner-a", "answers": []}).status_code == 422
    assert client.post("/api/attempts", json={"learnerId": " ", "answers": ["x"] * 21}).status_code == 422
