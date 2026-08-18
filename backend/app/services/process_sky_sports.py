"""Backfills markdown for Sky Sports articles that don't have it yet."""

from app.database.connection import SessionLocal
from app.database.repository import Repository
from app.scrapers.sky_sports import SkySportsScraper


def process_sky_sports_articles(limit: int = 50) -> int:
    session = SessionLocal()
    repo = Repository(session)
    scraper = SkySportsScraper()

    try:
        articles = repo.get_sky_sports_articles_without_markdown(limit=limit)
        processed = 0
        for article in articles:
            markdown = scraper.url_to_markdown(article.url)
            if markdown:
                repo.update_sky_sports_article_markdown(article.id, markdown)
                processed += 1
        return processed
    finally:
        session.close()


if __name__ == "__main__":
    count = process_sky_sports_articles()
    print(f"Backfilled markdown for {count} Sky Sports articles")
