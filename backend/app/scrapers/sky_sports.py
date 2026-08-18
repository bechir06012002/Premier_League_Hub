"""Multi-feed RSS scraper with docling markdown enrichment — template for a 'rich' source."""

from datetime import datetime, timedelta, timezone
from typing import TYPE_CHECKING, List, Optional

import feedparser
from pydantic import BaseModel

if TYPE_CHECKING:
    from docling.document_converter import DocumentConverter

FEED_URLS = [
    "https://www.skysports.com/rss/11095",  # Football News
    "https://www.skysports.com/rss/12691",  # Transfer Centre
]


class SkySportsArticle(BaseModel):
    title: str
    description: str
    url: str
    guid: str
    published_at: datetime
    category: Optional[str] = None


class SkySportsScraper:
    feed_urls = FEED_URLS

    def __init__(self) -> None:
        self._converter: Optional["DocumentConverter"] = None

    @property
    def converter(self) -> "DocumentConverter":
        # Imported lazily: docling pulls in torch/transformers, a multi-second
        # cold import that get_articles() — and anything that merely imports
        # this module, e.g. the repository layer — shouldn't have to pay for.
        if self._converter is None:
            from docling.document_converter import DocumentConverter

            self._converter = DocumentConverter()
        return self._converter

    def get_articles(self, hours: int = 24) -> List[SkySportsArticle]:
        cutoff_time = datetime.now(timezone.utc) - timedelta(hours=hours)
        articles: List[SkySportsArticle] = []
        seen_guids = set()

        for feed_url in self.feed_urls:
            feed = feedparser.parse(feed_url)
            for entry in feed.entries:
                if not entry.get("published_parsed"):
                    continue
                published_at = datetime(*entry.published_parsed[:6], tzinfo=timezone.utc)
                if published_at < cutoff_time:
                    continue

                # These feeds carry no <guid>, so fall back to the article URL.
                guid = entry.get("id") or entry.get("link")
                if not guid or guid in seen_guids:
                    continue
                seen_guids.add(guid)

                articles.append(
                    SkySportsArticle(
                        title=entry.get("title", ""),
                        description=entry.get("summary", ""),
                        url=entry.get("link", ""),
                        guid=guid,
                        published_at=published_at,
                        category=entry.get("category"),
                    )
                )

        return articles

    def url_to_markdown(self, url: str) -> Optional[str]:
        try:
            result = self.converter.convert(url)
            return result.document.export_to_markdown()
        except Exception as e:
            print(f"Failed to convert {url} to markdown: {e}")
            return None


if __name__ == "__main__":
    scraper = SkySportsScraper()
    articles = scraper.get_articles(hours=48)
    print(f"Found {len(articles)} articles")
    for article in articles[:5]:
        print(f"- [{article.published_at}] {article.title}")

    if articles:
        markdown = scraper.url_to_markdown(articles[0].url)
        print(f"\nMarkdown for '{articles[0].title}': {len(markdown) if markdown else 0} chars")
