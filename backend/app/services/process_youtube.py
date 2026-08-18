"""Backfills transcripts for YouTube videos that don't have one yet."""

from app.database.connection import SessionLocal
from app.database.repository import UNAVAILABLE_TRANSCRIPT, Repository
from app.scrapers.youtube import YouTubeScraper


def process_youtube_videos(limit: int = 50) -> int:
    session = SessionLocal()
    repo = Repository(session)
    scraper = YouTubeScraper()

    try:
        videos = repo.get_youtube_videos_without_transcript(limit=limit)
        processed = 0
        for video in videos:
            try:
                transcript = scraper.get_transcript(video.video_id)
            except Exception as e:
                # Transient failure (network, rate limit): leave transcript NULL
                # so it's retried next run, instead of poisoning the whole batch.
                print(f"Failed to fetch transcript for {video.video_id}: {e}")
                continue

            repo.update_youtube_video_transcript(video.id, transcript or UNAVAILABLE_TRANSCRIPT)
            processed += 1
        return processed
    finally:
        session.close()


if __name__ == "__main__":
    count = process_youtube_videos()
    print(f"Processed transcripts for {count} YouTube videos")
