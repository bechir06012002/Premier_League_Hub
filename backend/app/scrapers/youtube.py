"""YouTube channel scraper: Atom feed for video metadata + youtube_transcript_api for transcripts."""

import os
from datetime import datetime, timedelta, timezone
from typing import List, Optional

import feedparser
from pydantic import BaseModel
from youtube_transcript_api import NoTranscriptFound, TranscriptsDisabled, YouTubeTranscriptApi
from youtube_transcript_api.proxies import WebshareProxyConfig

FEED_URL_TEMPLATE = "https://www.youtube.com/feeds/videos.xml?channel_id={channel_id}"


class YouTubeVideoItem(BaseModel):
    video_id: str
    channel_id: str
    title: str
    description: str
    url: str
    published_at: datetime


class YouTubeScraper:
    def __init__(self) -> None:
        self._api: Optional[YouTubeTranscriptApi] = None

    @property
    def api(self) -> YouTubeTranscriptApi:
        if self._api is None:
            proxy_username = os.getenv("PROXY_USERNAME")
            proxy_password = os.getenv("PROXY_PASSWORD")
            proxy_config = (
                WebshareProxyConfig(proxy_username=proxy_username, proxy_password=proxy_password)
                if proxy_username and proxy_password
                else None
            )
            self._api = YouTubeTranscriptApi(proxy_config=proxy_config)
        return self._api

    def get_latest_videos(self, channel_id: str, hours: int = 24) -> List[YouTubeVideoItem]:
        feed = feedparser.parse(FEED_URL_TEMPLATE.format(channel_id=channel_id))
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)

        videos: List[YouTubeVideoItem] = []
        for entry in feed.entries:
            link = entry.get("link", "")
            if "/shorts/" in link:
                continue

            if not entry.get("published_parsed"):
                continue
            published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            if published_at < cutoff_time:
                continue

            video_id = entry.get("yt_videoid")
            if not video_id:
                continue

            videos.append(
                YouTubeVideoItem(
                    video_id=video_id,
                    channel_id=channel_id,
                    title=entry.get("title", ""),
                    description=entry.get("summary", ""),
                    url=link,
                    published_at=published_at,
                )
            )

        return videos

    def get_transcript(self, video_id: str) -> Optional[str]:
        try:
            fetched = self.api.fetch(video_id, languages=("en",))
        except (TranscriptsDisabled, NoTranscriptFound):
            return None
        return " ".join(snippet["text"] for snippet in fetched.to_raw_data())

    def scrape_channel(self, channel_id: str, hours: int = 24) -> List[YouTubeVideoItem]:
        return self.get_latest_videos(channel_id, hours)


if __name__ == "__main__":
    import sys

    sys.stdout.reconfigure(encoding="utf-8")  # video titles routinely contain emoji

    from config import YOUTUBE_CHANNELS

    scraper = YouTubeScraper()
    for channel_id in YOUTUBE_CHANNELS:
        videos = scraper.scrape_channel(channel_id, hours=48)
        print(f"Channel {channel_id}: {len(videos)} videos")
        for video in videos[:3]:
            print(f"- [{video.published_at}] {video.title}")

        if videos:
            transcript = scraper.get_transcript(videos[0].video_id)
            print(f"\nTranscript for '{videos[0].title}': {len(transcript) if transcript else 0} chars")
