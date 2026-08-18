"""Generates an LLM digest for every scraped item that doesn't have one yet."""

from app.agent.digest_agent import DigestAgent
from app.database.connection import SessionLocal
from app.database.repository import Repository


def process_digests(limit: int = 100) -> int:
    session = SessionLocal()
    repo = Repository(session)
    agent = DigestAgent()

    try:
        items = repo.get_articles_without_digest(limit=limit)
        processed = 0
        for item in items:
            result = agent.generate_digest(
                title=item["title"],
                content=item["content"],
                article_type=item["type"],
            )
            if result is None:
                continue

            repo.create_digest(
                article_type=item["type"],
                article_id=item["id"],
                title=result.title,
                summary=result.summary,
                url=item["url"],
                published_at=item["published_at"],
            )
            processed += 1
        return processed
    finally:
        session.close()


if __name__ == "__main__":
    count = process_digests()
    print(f"Generated digests for {count} items")
