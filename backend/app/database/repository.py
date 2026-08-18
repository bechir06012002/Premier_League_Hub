"""All database reads/writes go through this Repository."""

from datetime import datetime, timedelta, timezone
from typing import Any, Callable, Dict, List, Optional, Sequence, Type

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.database.models import Base
from app.database.models import BBCSportArticle as BBCSportArticleDB
from app.database.models import Digest
from app.database.models import Profile
from app.database.models import SkySportsArticle as SkySportsArticleDB
from app.database.models import YouTubeVideo
from app.scrapers.bbc_sport import BBCSportArticle
from app.scrapers.sky_sports import SkySportsArticle
from app.scrapers.youtube import YouTubeVideoItem

UNAVAILABLE_TRANSCRIPT = "__UNAVAILABLE__"


class Repository:
    def __init__(self, session: Session):
        self.session = session

    def _bulk_create(
        self,
        model: Type[Base],
        key_field: str,
        items: Sequence[Any],
        build: Callable[[Any], dict],
    ) -> int:
        if not items:
            return 0

        keys = [getattr(item, key_field) for item in items]
        existing_keys = {
            row[0]
            for row in self.session.query(getattr(model, key_field))
            .filter(getattr(model, key_field).in_(keys))
            .all()
        }

        new_rows = [model(**build(item)) for item in items if getattr(item, key_field) not in existing_keys]
        if not new_rows:
            return 0

        self.session.add_all(new_rows)
        self.session.commit()
        return len(new_rows)

    def bulk_create_youtube_videos(self, videos: Sequence[YouTubeVideoItem]) -> int:
        return self._bulk_create(
            YouTubeVideo,
            "video_id",
            videos,
            lambda v: {
                "video_id": v.video_id,
                "channel_id": v.channel_id,
                "title": v.title,
                "description": v.description,
                "url": v.url,
                "published_at": v.published_at,
            },
        )

    def bulk_create_bbc_sport_articles(self, articles: Sequence[BBCSportArticle]) -> int:
        return self._bulk_create(
            BBCSportArticleDB,
            "guid",
            articles,
            lambda a: {
                "guid": a.guid,
                "title": a.title,
                "description": a.description,
                "url": a.url,
                "category": a.category,
                "published_at": a.published_at,
            },
        )

    def bulk_create_sky_sports_articles(self, articles: Sequence[SkySportsArticle]) -> int:
        return self._bulk_create(
            SkySportsArticleDB,
            "guid",
            articles,
            lambda a: {
                "guid": a.guid,
                "title": a.title,
                "description": a.description,
                "url": a.url,
                "category": a.category,
                "published_at": a.published_at,
            },
        )

    def get_sky_sports_articles_without_markdown(self, limit: int = 50) -> List[SkySportsArticleDB]:
        return (
            self.session.query(SkySportsArticleDB)
            .filter(SkySportsArticleDB.markdown.is_(None))
            .limit(limit)
            .all()
        )

    def update_sky_sports_article_markdown(self, article_id: int, markdown: str) -> None:
        article = self.session.get(SkySportsArticleDB, article_id)
        if article is None:
            return
        article.markdown = markdown
        self.session.commit()

    def get_youtube_videos_without_transcript(self, limit: int = 50) -> List[YouTubeVideo]:
        return (
            self.session.query(YouTubeVideo)
            .filter(YouTubeVideo.transcript.is_(None))
            .limit(limit)
            .all()
        )

    def update_youtube_video_transcript(self, video_id: int, transcript: str) -> None:
        video = self.session.get(YouTubeVideo, video_id)
        if video is None:
            return
        video.transcript = transcript
        self.session.commit()

    def get_articles_without_digest(self, limit: int = 100) -> List[Dict[str, Any]]:
        existing_digest_ids = {row[0] for row in self.session.query(Digest.id).all()}

        items: List[Dict[str, Any]] = []

        for article in self.session.query(BBCSportArticleDB).all():
            if f"bbc_sport:{article.id}" in existing_digest_ids:
                continue
            items.append(
                {
                    "type": "bbc_sport",
                    "id": article.id,
                    "title": article.title,
                    "url": article.url,
                    "content": article.description,
                    "published_at": article.published_at,
                }
            )

        for article in self.session.query(SkySportsArticleDB).all():
            if f"sky_sports:{article.id}" in existing_digest_ids:
                continue
            items.append(
                {
                    "type": "sky_sports",
                    "id": article.id,
                    "title": article.title,
                    "url": article.url,
                    "content": article.markdown or article.description,
                    "published_at": article.published_at,
                }
            )

        for video in self.session.query(YouTubeVideo).all():
            if f"youtube:{video.id}" in existing_digest_ids:
                continue
            transcript = video.transcript if video.transcript and video.transcript != UNAVAILABLE_TRANSCRIPT else None
            items.append(
                {
                    "type": "youtube",
                    "id": video.id,
                    "title": video.title,
                    "url": video.url,
                    "content": transcript or video.description,
                    "published_at": video.published_at,
                }
            )

        items.sort(key=lambda item: item["published_at"], reverse=True)
        return items[:limit]

    def create_digest(
        self,
        article_type: str,
        article_id: int,
        title: str,
        summary: str,
        url: str,
        published_at: datetime,
    ) -> Digest:
        digest = Digest(
            id=f"{article_type}:{article_id}",
            article_type=article_type,
            article_id=article_id,
            title=title,
            summary=summary,
            url=url,
            published_at=published_at,
        )
        self.session.add(digest)
        self.session.commit()
        return digest

    def get_recent_digests(self, hours: int = 24) -> List[Digest]:
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        return (
            self.session.query(Digest)
            .filter(Digest.published_at >= cutoff_time)
            .order_by(Digest.published_at.desc())
            .all()
        )

    def get_active_profiles(self) -> List[Profile]:
        return self.session.query(Profile).filter(Profile.onboarding_completed.is_(True)).all()

    def get_active_profiles_with_email(self) -> List[Dict[str, Any]]:
        # profiles deliberately doesn't duplicate email (Supabase auth.users
        # already has it) - join it in only where it's actually needed.
        rows = self.session.execute(
            text(
                """
                select p.id, p.name, p.favorite_teams, p.interests,
                       p.expertise_level, p.preferences, u.email
                from public.profiles p
                join auth.users u on u.id = p.id
                where p.onboarding_completed = true
                """
            )
        ).mappings()
        return [dict(row) for row in rows]

    def get_profile(self, user_id: Any) -> Optional[Profile]:
        return self.session.get(Profile, user_id)

    def create_or_update_profile(
        self,
        user_id: Any,
        name: Optional[str] = None,
        favorite_teams: Optional[List[str]] = None,
        interests: Optional[List[str]] = None,
        expertise_level: Optional[str] = None,
        preferences: Optional[dict] = None,
        onboarding_completed: Optional[bool] = None,
    ) -> Profile:
        profile = self.session.get(Profile, user_id)
        if profile is None:
            profile = Profile(id=user_id)
            self.session.add(profile)

        if name is not None:
            profile.name = name
        if favorite_teams is not None:
            profile.favorite_teams = favorite_teams
        if interests is not None:
            profile.interests = interests
        if expertise_level is not None:
            profile.expertise_level = expertise_level
        if preferences is not None:
            profile.preferences = preferences
        if onboarding_completed is not None:
            profile.onboarding_completed = onboarding_completed

        self.session.commit()
        return profile
