"""Instantiates every scraper, pulls items, and bulk-writes them via the Repository."""

from typing import Dict

from app.database.connection import SessionLocal
from app.database.repository import Repository
from app.scrapers.bbc_sport import BBCSportScraper
from app.scrapers.sky_sports import SkySportsScraper
from app.scrapers.youtube import YouTubeScraper
from config import YOUTUBE_CHANNELS


def run_scrapers(hours: int = 24) -> Dict[str, int]:
    session = SessionLocal()
    repo = Repository(session)

    try:
        bbc_articles = BBCSportScraper().get_articles(hours=hours)
        sky_articles = SkySportsScraper().get_articles(hours=hours)

        youtube_scraper = YouTubeScraper()
        yt_videos = []
        for channel_id in YOUTUBE_CHANNELS:
            yt_videos.extend(youtube_scraper.scrape_channel(channel_id, hours=hours))

        return {
            "bbc_sport": repo.bulk_create_bbc_sport_articles(bbc_articles),
            "sky_sports": repo.bulk_create_sky_sports_articles(sky_articles),
            "youtube": repo.bulk_create_youtube_videos(yt_videos),
        }
    finally:
        session.close()
