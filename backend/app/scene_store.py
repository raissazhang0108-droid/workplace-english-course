"""Portable persistence for authored workplace-English lesson scenes.

Set SCENES_DATABASE_URL to replace the default SQLite database, for example:
mysql+pymysql://user:password@host:3306/workplace_english
"""

import os
import uuid
from datetime import datetime, timezone
from pathlib import Path
from typing import Any

from sqlalchemy import DateTime, JSON, String, Text, create_engine, select
from sqlalchemy.engine import URL
from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, sessionmaker


class SceneBase(DeclarativeBase):
    pass


class CourseSceneRow(SceneBase):
    __tablename__ = "course_scenes"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    title: Mapped[str] = mapped_column(String(200), nullable=False, index=True)
    english_title: Mapped[str] = mapped_column(String(200), nullable=False, default="")
    category: Mapped[str] = mapped_column(String(80), nullable=False, index=True)
    content: Mapped[dict[str, Any]] = mapped_column(JSON, nullable=False, default=dict)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, index=True)


def serialize_scene(row: CourseSceneRow) -> dict[str, Any]:
    return {
        "id": row.id,
        **row.content,
        "title": row.title,
        "englishTitle": row.english_title,
        "category": row.category,
        "createdAt": row.created_at.isoformat(),
        "updatedAt": row.updated_at.isoformat(),
    }


class SceneStore:
    """Scene content repository; route handlers do not depend on a SQL dialect."""

    def __init__(self, database_path: Path, database_url: str | None = None) -> None:
        configured_url = database_url or os.environ.get("SCENES_DATABASE_URL")
        if configured_url:
            engine = create_engine(configured_url, pool_pre_ping=True)
        else:
            database_path.parent.mkdir(parents=True, exist_ok=True)
            sqlite_url = URL.create("sqlite", database=str(database_path.resolve()))
            engine = create_engine(sqlite_url, connect_args={"check_same_thread": False}, pool_pre_ping=True)
        self._sessions = sessionmaker(bind=engine, expire_on_commit=False)
        SceneBase.metadata.create_all(engine)

    def list(self) -> list[dict[str, Any]]:
        with self._sessions() as session:
            rows = session.scalars(select(CourseSceneRow).order_by(CourseSceneRow.updated_at.desc(), CourseSceneRow.title)).all()
            return [serialize_scene(row) for row in rows]

    def get(self, scene_id: str) -> dict[str, Any] | None:
        with self._sessions() as session:
            row = session.get(CourseSceneRow, scene_id)
            return serialize_scene(row) if row else None

    def create(self, content: dict[str, Any]) -> dict[str, Any]:
        now = datetime.now(timezone.utc)
        row = CourseSceneRow(
            id=str(uuid.uuid4()),
            title=content["title"],
            english_title=content.get("englishTitle", ""),
            category=content["category"],
            content=content,
            created_at=now,
            updated_at=now,
        )
        with self._sessions() as session:
            session.add(row)
            session.commit()
            session.refresh(row)
            return serialize_scene(row)

    def update(self, scene_id: str, content: dict[str, Any]) -> dict[str, Any] | None:
        with self._sessions() as session:
            row = session.get(CourseSceneRow, scene_id)
            if not row:
                return None
            row.title = content["title"]
            row.english_title = content.get("englishTitle", "")
            row.category = content["category"]
            row.content = content
            row.updated_at = datetime.now(timezone.utc)
            session.commit()
            session.refresh(row)
            return serialize_scene(row)

    def delete(self, scene_id: str) -> bool:
        with self._sessions() as session:
            row = session.get(CourseSceneRow, scene_id)
            if not row:
                return False
            session.delete(row)
            session.commit()
            return True
