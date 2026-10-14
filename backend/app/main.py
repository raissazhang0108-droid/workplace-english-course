import hashlib
import hmac
import json
import re
import secrets
import sqlite3
import unicodedata
import uuid
from contextlib import closing
from datetime import datetime, timedelta, timezone
from pathlib import Path
from typing import Annotated
from urllib.parse import urlsplit

from fastapi import FastAPI, HTTPException, Query, Request, Response, status
from pydantic import BaseModel, ConfigDict, Field, field_validator
from .scene_store import SceneStore


ANSWERS = (
    "How's", "weather", "looking", "usual", "weather", "all morning",
    "feel", "like", "miss", "the", "sun", "Classic", "At", "this",
    "point", "accepted", "don't", "even", "bother", "sounds", "staying",
)
HISTORY_LIMIT = 10
SESSION_COOKIE = "english_course_session"
SESSION_DAYS = 14
PASSWORD_ITERATIONS = 600_000
COURSE_IDS = frozenset({"intro", "coffee", "weather", "meeting", "interview"})
DEFAULT_DATABASE = Path(__file__).resolve().parents[1] / "data" / "quiz.sqlite3"
EMAIL_PATTERN = re.compile(r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
DUMMY_PASSWORD_SALT = bytes.fromhex("60f43c7ab50cfe1ee04bdce402fd227f")
DUMMY_PASSWORD_HASH = hashlib.pbkdf2_hmac(
    "sha256", b"not-the-password", DUMMY_PASSWORD_SALT, PASSWORD_ITERATIONS
)


class LegacyAttemptRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    completed_at: datetime = Field(alias="completedAt")
    answers: list[str] = Field(min_length=len(ANSWERS), max_length=len(ANSWERS))

    @field_validator("completed_at")
    @classmethod
    def require_timezone(cls, value: datetime) -> datetime:
        if value.tzinfo is None or value.utcoffset() is None:
            raise ValueError("completedAt must include a timezone")
        return value

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, values: list[str]) -> list[str]:
        if any(len(value) > 200 for value in values):
            raise ValueError("answers must be 200 characters or fewer")
        return values


class AccountRequest(BaseModel):
    email: str = Field(min_length=3, max_length=254)
    password: str = Field(min_length=8, max_length=128)
    anonymous_learner_id: str | None = Field(default=None, alias="anonymousLearnerId", max_length=128)
    completed_courses: list[str] = Field(default_factory=list, alias="completedCourses", max_length=5)
    legacy_attempts: list[LegacyAttemptRequest] = Field(default_factory=list, alias="legacyAttempts", max_length=10)

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        value = value.strip().casefold()
        if not EMAIL_PATTERN.fullmatch(value):
            raise ValueError("Enter a valid email address")
        return value

    @field_validator("anonymous_learner_id")
    @classmethod
    def validate_anonymous_id(cls, value: str | None) -> str | None:
        if value is not None and not value.strip():
            raise ValueError("anonymousLearnerId must not be blank")
        return value.strip() if value else None

    @field_validator("completed_courses")
    @classmethod
    def validate_completed_courses(cls, values: list[str]) -> list[str]:
        if any(course not in COURSE_IDS for course in values):
            raise ValueError("completedCourses contains an unknown course")
        return list(dict.fromkeys(values))


class AttemptRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    learner_id: str | None = Field(default=None, alias="learnerId", min_length=1, max_length=128)
    answers: list[str] = Field(min_length=len(ANSWERS), max_length=len(ANSWERS))

    @field_validator("learner_id")
    @classmethod
    def validate_learner_id(cls, value: str | None) -> str | None:
        value = value.strip() if value else value
        if value == "":
            raise ValueError("learnerId must not be blank")
        return value

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, values: list[str]) -> list[str]:
        if any(len(value) > 200 for value in values):
            raise ValueError("answers must be 200 characters or fewer")
        return values


class ProgressRequest(BaseModel):
    completed_courses: list[str] = Field(alias="completedCourses", max_length=5)

    @field_validator("completed_courses")
    @classmethod
    def validate_completed_courses(cls, values: list[str]) -> list[str]:
        if any(course not in COURSE_IDS for course in values):
            raise ValueError("completedCourses contains an unknown course")
        return list(dict.fromkeys(values))


class SceneDialogueLine(BaseModel):
    speaker: str = Field(min_length=1, max_length=80)
    role: str = Field(default="", max_length=120)
    en: str = Field(min_length=1, max_length=2000)
    zh: str = Field(default="", max_length=2000)
    phrases: list[str] = Field(default_factory=list, max_length=30)


class SceneVocabularyItem(BaseModel):
    en: str = Field(min_length=1, max_length=120)
    zh: str = Field(default="", max_length=300)
    example: str = Field(default="", max_length=1000)


class ScenePhraseItem(BaseModel):
    en: str = Field(min_length=1, max_length=500)
    zh: str = Field(default="", max_length=500)


class SceneWordingExample(BaseModel):
    ordinary: str = Field(min_length=1, max_length=1000)
    natural: str = Field(min_length=1, max_length=1000)
    explanation: str = Field(default="", max_length=1000)


class SceneEntryRequest(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    course_key: str = Field(min_length=1, max_length=80, alias="courseKey")
    title: str = Field(min_length=1, max_length=200)
    english_title: str = Field(default="", max_length=200, alias="englishTitle")
    category: str = Field(min_length=1, max_length=80)
    subtitle: str = Field(default="", max_length=500)
    level: str = Field(default="A2–B1", max_length=40)
    duration_minutes: int = Field(default=15, ge=1, le=600, alias="durationMinutes")
    scene_label: str = Field(default="", max_length=120, alias="sceneLabel")
    description: list[str] = Field(default_factory=list, max_length=20)
    formula: list[str] = Field(default_factory=list, max_length=30)
    speakers: str = Field(default="", max_length=500)
    dialogue: list[SceneDialogueLine] = Field(default_factory=list, max_length=300)
    vocabulary: list[SceneVocabularyItem] = Field(default_factory=list, max_length=200)
    quick_phrases: list[ScenePhraseItem] = Field(default_factory=list, max_length=200, alias="quickPhrases")
    wording_examples: list[SceneWordingExample] = Field(default_factory=list, max_length=100, alias="wordingExamples")
    practice: str = Field(default="", max_length=2000)

    @field_validator("course_key", "title", "category", mode="before")
    @classmethod
    def trim_required_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("english_title", "subtitle", "level", "scene_label", "speakers", "practice", mode="before")
    @classmethod
    def trim_optional_text(cls, value: object) -> object:
        return value.strip() if isinstance(value, str) else value

    @field_validator("description", "formula")
    @classmethod
    def normalize_text_lines(cls, values: list[str]) -> list[str]:
        return [value.strip() for value in values if value.strip()]


def normalize_answer(value: str) -> str:
    without_punctuation = "".join(
        char for char in value.lower()
        if not unicodedata.category(char).startswith("P")
    )
    return " ".join(without_punctuation.split())


def initialize_database(database_path: Path) -> None:
    database_path.parent.mkdir(parents=True, exist_ok=True)
    with closing(sqlite3.connect(database_path)) as connection:
        with connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS attempts (
                    id TEXT PRIMARY KEY,
                    learner_id TEXT NOT NULL,
                    completed_at TEXT NOT NULL,
                    answers_json TEXT NOT NULL,
                    correctness_json TEXT NOT NULL,
                    score INTEGER NOT NULL
                )
                """
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS attempts_learner_completed "
                "ON attempts (learner_id, completed_at DESC)"
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS users (
                    id TEXT PRIMARY KEY,
                    email TEXT NOT NULL UNIQUE COLLATE NOCASE,
                    password_salt BLOB NOT NULL,
                    password_hash BLOB NOT NULL,
                    created_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    token_hash TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    expires_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                "CREATE INDEX IF NOT EXISTS sessions_user ON sessions(user_id)"
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS anonymous_claims (
                    learner_id TEXT PRIMARY KEY,
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    claimed_at TEXT NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS course_progress (
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    course_id TEXT NOT NULL,
                    completed_at TEXT NOT NULL,
                    PRIMARY KEY (user_id, course_id)
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS imported_attempts (
                    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                    source_key TEXT NOT NULL,
                    PRIMARY KEY (user_id, source_key)
                )
                """
            )


def attempt_response(row: tuple[object, ...]) -> dict[str, object]:
    return {
        "id": row[0],
        "completedAt": row[1],
        "answers": json.loads(str(row[2])),
        "correctness": json.loads(str(row[3])),
        "score": row[4],
    }


def hash_password(password: str, salt: bytes | None = None) -> tuple[bytes, bytes]:
    password_salt = salt or secrets.token_bytes(16)
    password_hash = hashlib.pbkdf2_hmac(
        "sha256", password.encode("utf-8"), password_salt, PASSWORD_ITERATIONS
    )
    return password_salt, password_hash


def hash_session(token: str) -> str:
    return hashlib.sha256(token.encode("ascii")).hexdigest()


def require_same_origin(request: Request) -> None:
    origin = request.headers.get("origin")
    host = request.headers.get("host")
    if not origin or not host:
        raise HTTPException(status_code=403, detail="请求来源校验失败")
    try:
        parsed = urlsplit(origin)
    except ValueError as error:
        raise HTTPException(status_code=403, detail="请求来源校验失败") from error
    if parsed.scheme not in {"http", "https"} or parsed.netloc.casefold() != host.casefold():
        raise HTTPException(status_code=403, detail="请求来源校验失败")


def current_user_id(request: Request, database_path: Path) -> str | None:
    token = request.cookies.get(SESSION_COOKIE)
    if not token:
        return None
    token_hash = hash_session(token)
    now = datetime.now(timezone.utc)
    with closing(sqlite3.connect(database_path)) as connection:
        row = connection.execute(
            "SELECT user_id, expires_at FROM sessions WHERE token_hash = ?",
            (token_hash,),
        ).fetchone()
        if row is None:
            return None
        if datetime.fromisoformat(row[1]) <= now:
            with connection:
                connection.execute("DELETE FROM sessions WHERE token_hash = ?", (token_hash,))
            return None
        return str(row[0])


def require_user_id(request: Request, database_path: Path) -> str:
    user_id = current_user_id(request, database_path)
    if user_id is None:
        raise HTTPException(status_code=401, detail="请先登录")
    return user_id


def completed_courses(connection: sqlite3.Connection, user_id: str) -> list[str]:
    rows = connection.execute(
        "SELECT course_id FROM course_progress WHERE user_id = ? ORDER BY course_id",
        (user_id,),
    ).fetchall()
    return [str(row[0]) for row in rows]


def merge_guest_data(
    connection: sqlite3.Connection,
    user_id: str,
    learner_id: str | None,
    courses: list[str],
    legacy_attempts: list[LegacyAttemptRequest],
) -> None:
    now = datetime.now(timezone.utc).isoformat()
    if learner_id:
        claim = connection.execute(
            "SELECT user_id FROM anonymous_claims WHERE learner_id = ?", (learner_id,)
        ).fetchone()
        if claim is None:
            connection.execute(
                "INSERT INTO anonymous_claims (learner_id, user_id, claimed_at) VALUES (?, ?, ?)",
                (learner_id, user_id, now),
            )
            connection.execute(
                "UPDATE attempts SET learner_id = ? WHERE learner_id = ?",
                (user_id, learner_id),
            )
    import_legacy_attempts(connection, user_id, legacy_attempts)
    for course in courses:
        connection.execute(
            """
            INSERT OR IGNORE INTO course_progress (user_id, course_id, completed_at)
            VALUES (?, ?, ?)
            """,
            (user_id, course, now),
        )


def import_legacy_attempts(
    connection: sqlite3.Connection,
    user_id: str,
    legacy_attempts: list[LegacyAttemptRequest],
) -> int:
    imported_count = 0
    for attempt in legacy_attempts:
        completed_at = attempt.completed_at.astimezone(timezone.utc).isoformat()
        answers_json = json.dumps(attempt.answers, ensure_ascii=False)
        source_key = hashlib.sha256(
            f"{completed_at}\0{answers_json}".encode("utf-8")
        ).hexdigest()
        inserted = connection.execute(
            "INSERT OR IGNORE INTO imported_attempts (user_id, source_key) VALUES (?, ?)",
            (user_id, source_key),
        ).rowcount
        already_claimed = connection.execute(
            """
            SELECT 1 FROM attempts
            WHERE learner_id = ? AND completed_at = ? AND answers_json = ?
            LIMIT 1
            """,
            (user_id, completed_at, answers_json),
        ).fetchone()
        if not inserted or already_claimed:
            continue
        correctness = [
            normalize_answer(answer) == normalize_answer(expected)
            for answer, expected in zip(attempt.answers, ANSWERS, strict=True)
        ]
        connection.execute(
            """
            INSERT INTO attempts
                (id, learner_id, completed_at, answers_json, correctness_json, score)
            VALUES (?, ?, ?, ?, ?, ?)
            """,
            (
                str(uuid.uuid4()),
                user_id,
                completed_at,
                answers_json,
                json.dumps(correctness),
                sum(correctness),
            ),
        )
        imported_count += 1
    connection.execute(
        """
        DELETE FROM attempts
        WHERE learner_id = ?
          AND id NOT IN (
              SELECT id FROM attempts
              WHERE learner_id = ?
              ORDER BY completed_at DESC, id DESC
              LIMIT ?
          )
        """,
        (user_id, user_id, HISTORY_LIMIT),
    )
    return imported_count


def issue_session(
    connection: sqlite3.Connection,
    response: Response,
    request: Request,
    user_id: str,
) -> None:
    token = secrets.token_urlsafe(32)
    expires_at = datetime.now(timezone.utc) + timedelta(days=SESSION_DAYS)
    connection.execute(
        "INSERT INTO sessions (token_hash, user_id, expires_at) VALUES (?, ?, ?)",
        (hash_session(token), user_id, expires_at.isoformat()),
    )
    response.set_cookie(
        SESSION_COOKIE,
        token,
        max_age=SESSION_DAYS * 24 * 60 * 60,
        httponly=True,
        secure=request.url.scheme == "https",
        samesite="lax",
        path="/",
    )


def create_app(database_path: Path = DEFAULT_DATABASE) -> FastAPI:
    initialize_database(database_path)
    app = FastAPI(title="Workplace English Quiz API")
    scene_store = SceneStore(database_path)

    @app.get("/api/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.get("/api/scenes")
    def list_scenes() -> dict[str, object]:
        return {"scenes": scene_store.list()}

    @app.post("/api/scenes", status_code=status.HTTP_201_CREATED)
    def create_scene(request: Request, body: SceneEntryRequest) -> dict[str, object]:
        require_same_origin(request)
        values = body.model_dump(by_alias=True)
        return scene_store.create(values)

    @app.put("/api/scenes/{scene_id}")
    def update_scene(scene_id: str, request: Request, body: SceneEntryRequest) -> dict[str, object]:
        require_same_origin(request)
        values = body.model_dump(by_alias=True)
        updated = scene_store.update(scene_id, values)
        if not updated:
            raise HTTPException(status_code=404, detail="没有找到这个场景")
        return updated

    @app.delete("/api/scenes/{scene_id}", status_code=status.HTTP_204_NO_CONTENT)
    def delete_scene(scene_id: str, request: Request) -> Response:
        require_same_origin(request)
        if not scene_store.delete(scene_id):
            raise HTTPException(status_code=404, detail="没有找到这个场景")
        return Response(status_code=status.HTTP_204_NO_CONTENT)

    @app.post("/api/auth/register", status_code=status.HTTP_201_CREATED)
    def register(request: Request, body: AccountRequest, response: Response) -> dict[str, object]:
        require_same_origin(request)
        user_id = str(uuid.uuid4())
        salt, password_hash = hash_password(body.password)
        now = datetime.now(timezone.utc).isoformat()
        try:
            with closing(sqlite3.connect(database_path)) as connection:
                with connection:
                    connection.execute(
                        "INSERT INTO users (id, email, password_salt, password_hash, created_at) "
                        "VALUES (?, ?, ?, ?, ?)",
                        (user_id, body.email, salt, password_hash, now),
                    )
                    merge_guest_data(
                        connection,
                        user_id,
                        body.anonymous_learner_id,
                        body.completed_courses,
                        body.legacy_attempts,
                    )
                    issue_session(connection, response, request, user_id)
        except sqlite3.IntegrityError as error:
            raise HTTPException(status_code=409, detail="该邮箱已注册") from error
        return {"email": body.email, "completedCourses": completed_courses_for_user(database_path, user_id)}

    @app.post("/api/auth/login")
    def login(request: Request, body: AccountRequest, response: Response) -> dict[str, object]:
        require_same_origin(request)
        with closing(sqlite3.connect(database_path)) as connection:
            row = connection.execute(
                "SELECT id, password_salt, password_hash FROM users WHERE email = ?",
                (body.email,),
            ).fetchone()
            if row is None:
                hash_password(body.password, DUMMY_PASSWORD_SALT)
                candidate = DUMMY_PASSWORD_HASH
            else:
                candidate = hash_password(body.password, bytes(row[1]))[1]
            if row is None or not hmac.compare_digest(candidate, bytes(row[2]) if row else DUMMY_PASSWORD_HASH):
                raise HTTPException(status_code=401, detail="邮箱或密码不匹配")
            user_id = str(row[0])
            with connection:
                merge_guest_data(
                    connection,
                    user_id,
                    body.anonymous_learner_id,
                    body.completed_courses,
                    body.legacy_attempts,
                )
                issue_session(connection, response, request, user_id)
        return {"email": body.email, "completedCourses": completed_courses_for_user(database_path, user_id)}

    @app.get("/api/auth/me")
    def get_current_user(request: Request) -> dict[str, object]:
        user_id = require_user_id(request, database_path)
        with closing(sqlite3.connect(database_path)) as connection:
            email = connection.execute("SELECT email FROM users WHERE id = ?", (user_id,)).fetchone()[0]
            return {"email": email, "completedCourses": completed_courses(connection, user_id)}

    @app.post("/api/auth/logout")
    def logout(request: Request, response: Response) -> dict[str, str]:
        require_same_origin(request)
        token = request.cookies.get(SESSION_COOKIE)
        if token:
            with closing(sqlite3.connect(database_path)) as connection:
                with connection:
                    connection.execute("DELETE FROM sessions WHERE token_hash = ?", (hash_session(token),))
        response.delete_cookie(
            SESSION_COOKIE,
            path="/",
            httponly=True,
            secure=request.url.scheme == "https",
            samesite="lax",
        )
        return {"status": "ok"}

    @app.post("/api/auth/import-attempts")
    def import_attempt_history(
        request: Request,
        body: list[LegacyAttemptRequest],
    ) -> dict[str, int]:
        require_same_origin(request)
        if len(body) > HISTORY_LIMIT:
            raise HTTPException(status_code=422, detail="最多导入最近十次练习")
        user_id = require_user_id(request, database_path)
        with closing(sqlite3.connect(database_path)) as connection:
            with connection:
                imported = import_legacy_attempts(connection, user_id, body)
        return {"imported": imported}

    @app.get("/api/progress")
    def get_progress(request: Request) -> dict[str, list[str]]:
        user_id = require_user_id(request, database_path)
        with closing(sqlite3.connect(database_path)) as connection:
            return {"completedCourses": completed_courses(connection, user_id)}

    @app.put("/api/progress")
    def update_progress(request: Request, body: ProgressRequest) -> dict[str, list[str]]:
        require_same_origin(request)
        user_id = require_user_id(request, database_path)
        with closing(sqlite3.connect(database_path)) as connection:
            with connection:
                connection.execute("DELETE FROM course_progress WHERE user_id = ?", (user_id,))
                now = datetime.now(timezone.utc).isoformat()
                connection.executemany(
                    """
                    INSERT INTO course_progress (user_id, course_id, completed_at)
                    VALUES (?, ?, ?)
                    """,
                    [(user_id, course, now) for course in body.completed_courses],
                )
            return {"completedCourses": completed_courses(connection, user_id)}

    @app.get("/api/attempts")
    def get_attempts(
        request: Request,
        learner_id: Annotated[str | None, Query(alias="learnerId", min_length=1, max_length=128)] = None,
    ) -> dict[str, list[dict[str, object]]]:
        user_id = current_user_id(request, database_path)
        owner_id = user_id or learner_id
        if not owner_id:
            raise HTTPException(status_code=422, detail="learnerId is required for guest history")
        with closing(sqlite3.connect(database_path)) as connection:
            rows = connection.execute(
                """
                SELECT id, completed_at, answers_json, correctness_json, score
                FROM attempts
                WHERE learner_id = ?
                ORDER BY completed_at DESC, id DESC
                LIMIT ?
                """,
                (owner_id, HISTORY_LIMIT),
            ).fetchall()
        return {"attempts": [attempt_response(row) for row in rows]}

    @app.post("/api/attempts", status_code=status.HTTP_201_CREATED)
    def create_attempt(request: Request, body: AttemptRequest) -> dict[str, object]:
        user_id = current_user_id(request, database_path)
        if user_id:
            require_same_origin(request)
        owner_id = user_id or body.learner_id
        if not owner_id:
            raise HTTPException(status_code=422, detail="learnerId is required for guest history")
        correctness = [
            normalize_answer(answer) == normalize_answer(expected)
            for answer, expected in zip(body.answers, ANSWERS, strict=True)
        ]
        attempt_id = str(uuid.uuid4())
        completed_at = datetime.now(timezone.utc).isoformat()
        with closing(sqlite3.connect(database_path)) as connection:
            with connection:
                connection.execute(
                    """
                    INSERT INTO attempts
                        (id, learner_id, completed_at, answers_json, correctness_json, score)
                    VALUES (?, ?, ?, ?, ?, ?)
                    """,
                    (
                        attempt_id,
                        owner_id,
                        completed_at,
                        json.dumps(body.answers, ensure_ascii=False),
                        json.dumps(correctness),
                        sum(correctness),
                    ),
                )
                connection.execute(
                    """
                    DELETE FROM attempts
                    WHERE learner_id = ?
                      AND id NOT IN (
                          SELECT id FROM attempts
                          WHERE learner_id = ?
                          ORDER BY completed_at DESC, id DESC
                          LIMIT ?
                      )
                    """,
                    (owner_id, owner_id, HISTORY_LIMIT),
                )
        return {
            "id": attempt_id,
            "completedAt": completed_at,
            "answers": body.answers,
            "correctness": correctness,
            "score": sum(correctness),
        }

    return app


def completed_courses_for_user(database_path: Path, user_id: str) -> list[str]:
    with closing(sqlite3.connect(database_path)) as connection:
        return completed_courses(connection, user_id)


app = create_app()
