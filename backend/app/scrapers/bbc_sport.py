"""Simple single-feed RSS scraper — template for a 'plain' source."""

from datetime import datetime, timedelta, timezone
from typing import List, Optional

import feedparser
from pydantic import BaseModel

FEED_URL = "https://feeds.bbci.co.uk/sport/football/premier-league/rss.xml"


class BBCSportArticle(BaseModel):
    title: str
    description: str
    url: str
    guid: str
    published_at: datetime
    category: Optional[str] = None


class BBCSportScraper:
    feed_url = FEED_URL

    def get_articles(self, hours: int = 24) -> List[BBCSportArticle]:
        feed = feedparser.parse(self.feed_url)
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)

        articles: List[BBCSportArticle] = []
        seen_guids = set()

        for entry in feed.entries:
            if not entry.get("published_parsed"):
                continue
            published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
            if published_at < cutoff_time:
                continue

            guid = entry.get("id") or entry.get("link")
            if not guid or guid in seen_guids:
                continue
            seen_guids.add(guid)

            articles.append(
                BBCSportArticle(
                    title=entry.get("title", ""),
                    description=entry.get("summary", ""),
                    url=entry.get("link", ""),
                    guid=guid,
                    published_at=published_at,
                    category=entry.get("category"),
                )
            )

        return articles


if __name__ == "__main__":
    scraper = BBCSportScraper()
    articles = scraper.get_articles(hours=48)
    print(f"Found {len(articles)} articles")
    for article in articles[:5]:
        print(f"- [{article.published_at}] {article.title}")
