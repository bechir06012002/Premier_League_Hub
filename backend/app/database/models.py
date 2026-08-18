"""SQLAlchemy models: one table per scraped source, plus the shared digest table."""

from datetime import datetime, timezone

from sqlalchemy import BigInteger, Boolean, Column, DateTime, Integer, String, Text, UniqueConstraint
from sqlalchemy.dialects.postgresql import ARRAY, JSONB, UUID
from sqlalchemy.orm import declarative_base

Base = declarative_base()


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class YouTubeVideo(Base):
    __tablename__ = "youtube_videos"

    id = Column(Integer, primary_key=True, autoincrement=True)
    video_id = Column(String(64), unique=True, nullable=False, index=True)
    channel_id = Column(String(64), nullable=False)
    title = Column(String(512), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(1024), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False)
    transcript = Column(Text, nullable=True)
    scraped_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)


class BBCSportArticle(Base):
    __tablename__ = "bbc_sport_articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    guid = Column(String(512), unique=True, nullable=False, index=True)
    title = Column(String(512), nullable=False)
    description = Column(Text, nullable=True)
    url = Column(String(1024), nullable=False)
    category = Column(String(128), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=False)
    scraped_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)


class SkySportsArticle(Base):
    __tablename__ = "sky_sports_articles"

    id = Column(Integer, primary_key=True, autoincrement=True)
    guid = Column(String(512), unique=True, nullable=False, index=True)
    title = Column(String(512), nullable=False)
    description = Column(Text, nullable=True)
    markdown = Column(Text, nullable=True)
    url = Column(String(1024), nullable=False)
    category = Column(String(128), nullable=True)
    published_at = Column(DateTime(timezone=True), nullable=False)
    scraped_at = Column(DateTime(timezone=True), nullable=False, default=utcnow)


class Profile(Base):
    __tablename__ = "profiles"

    # References auth.users.id (Supabase-managed, outside this metadata) - the
    # actual FK constraint is added via raw SQL in create_tables.py, since
    # SQLAlchemy can't resolve a cross-schema target it doesn't have mapped.
    id = Column(UUID(as_uuid=True), primary_key=True)
    name = Column(String(255), nullable=True)
    favorite_teams = Column(ARRAY(String), nullable=False, server_default="{}")
    interests = Column(ARRAY(String), nullable=False, server_default="{}")
    expertise_level = Column(String(64), nullable=True)
    preferences = Column(JSONB, nullable=False, server_default="{}")
    onboarding_completed = Column(Boolean, nullable=False, server_default="false")
    # server_default (not just the Python-side default=utcnow used elsewhere in
    # this file) because this table is also written to directly by the
    # frontend via Supabase, bypassing SQLAlchemy entirely.
    created_at = Column(DateTime(timezone=True), nullable=False, server_default="now()")


class Digest(Base):
    __tablename__ = "digests"

    id = Column(String(64), primary_key=True)  # f"{article_type}:{article_id}"
    article_type = Column(String(32), nullable=False, index=True)
    article_id = Column(Integer, nullable=False)
    title = Column(String(512), nullable=False)
    summary = Column(Text, nullable=False)
    url = Column(String(1024), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False)
    created_at = Column(DateTime(timezone=True), nullable=False, default=utcnow, index=True)


class SavedArticle(Base):
    """A story a user starred, kept indefinitely.

    Deliberately stores a *snapshot* of the article rather than a foreign key to
    `digests`: the dashboard only shows the last 24h of digests, so a save has to
    outlive the feed it came from. `digest_id` is kept only to match a save back
    to a live card (for the filled/empty star), not as a dependency.

    Written exclusively by the frontend via Supabase, so RLS - not this model -
    is what enforces that a user only ever touches their own rows.
    """

    __tablename__ = "saved_articles"
    __table_args__ = (UniqueConstraint("user_id", "digest_id", name="saved_articles_user_digest_key"),)

    id = Column(BigInteger, primary_key=True, autoincrement=True)
    user_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    digest_id = Column(String(64), nullable=False)
    title = Column(String(512), nullable=False)
    summary = Column(Text, nullable=False)
    url = Column(String(1024), nullable=False)
    article_type = Column(String(32), nullable=False)
    published_at = Column(DateTime(timezone=True), nullable=False)
    saved_at = Column(DateTime(timezone=True), nullable=False, server_default="now()")
