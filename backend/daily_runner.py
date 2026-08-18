"""Orchestrates the full daily pipeline: scrape -> enrich -> transcripts -> digest -> email."""

import logging
import os
import sys
from pathlib import Path
from typing import Any

from dotenv import load_dotenv

load_dotenv(Path(__file__).resolve().parent / "app" / "services" / ".env")

from app.database.connection import engine, get_database_url  # noqa: E402
from app.database.models import Base  # noqa: E402
from app.runner import run_scrapers  # noqa: E402
from app.services.process_digest import process_digests  # noqa: E402
from app.services.process_email import send_all_user_digests  # noqa: E402
from app.services.process_sky_sports import process_sky_sports_articles  # noqa: E402
from app.services.process_youtube import process_youtube_videos  # noqa: E402

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger(__name__)

# Log which database we're on (host only - never the credentials) *before* any
# connection is made, so a bad DATABASE_URL is visible on line one rather than
# buried in a driver traceback. Two failure modes this makes obvious: the var
# being unset (falls back to localhost, which is nothing inside a container),
# and it pointing at a non-Supabase Postgres - `create_all` will happily build
# the schema there, and the run then dies much later on `auth.users`.
logger.info(f"Connected to database: {get_database_url().split('@')[-1]}")


def _log_smtp_credential_shape() -> None:
    """Describe the SMTP credentials without ever printing them.

    Gmail rejects a malformed app password with a bare `(334, b'UGFzc3dvcmQ6')`
    - the base64 of "Password:" - which says nothing about *why*. The usual
    causes are all invisible in a dashboard field: the value was truncated at
    its first space, pasted with surrounding quotes, or carries a trailing
    newline. Logging the shape turns that guessing game into one glance.
    """
    sender = os.getenv("MY_EMAIL") or ""
    password = os.getenv("APP_PASSWORD") or ""
    # A Gmail app password is 16 characters, or 19 written in 4 space-separated
    # groups. Anything else is the bug.
    logger.info(
        f"SMTP sender: {sender!r} | app password: {len(password)} chars, "
        f"spaces={password.count(' ')}, quoted={password[:1] in ('\"', chr(39))}, "
        f"stripped_len={len(password.strip())}"
    )


_log_smtp_credential_shape()

Base.metadata.create_all(engine)


def run_daily_pipeline(hours: int = 24, top_n: int = 10) -> dict:
    results = {}

    logger.info("Step 1/5: scraping sources")
    try:
        results["scrape"] = run_scrapers(hours=hours)
        logger.info(f"Scrape results: {results['scrape']}")
    except Exception as e:
        logger.exception("Scrape step failed")
        results["scrape"] = {"error": str(e)}

    logger.info("Step 2/5: enriching Sky Sports articles with markdown")
    try:
        results["sky_sports_markdown"] = process_sky_sports_articles()
        logger.info(f"Backfilled markdown for {results['sky_sports_markdown']} articles")
    except Exception as e:
        logger.exception("Sky Sports enrichment step failed")
        results["sky_sports_markdown"] = {"error": str(e)}

    logger.info("Step 3/5: fetching YouTube transcripts")
    try:
        results["youtube_transcripts"] = process_youtube_videos()
        logger.info(f"Processed transcripts for {results['youtube_transcripts']} videos")
    except Exception as e:
        logger.exception("YouTube transcript step failed")
        results["youtube_transcripts"] = {"error": str(e)}

    logger.info("Step 4/5: generating digests")
    try:
        results["digests"] = process_digests()
        logger.info(f"Generated {results['digests']} digests")
    except Exception as e:
        logger.exception("Digest generation step failed")
        results["digests"] = {"error": str(e)}

    logger.info("Step 5/5: sending emails to all active users")
    try:
        results["email"] = send_all_user_digests(hours=hours, top_n=top_n)
        logger.info(f"Email results: {results['email']}")
    except Exception as e:
        logger.exception("Email step failed")
        results["email"] = {"error": str(e)}

    return results


def _step_failed(result: Any) -> bool:
    if isinstance(result, dict):
        return "error" in result
    if isinstance(result, list):
        return any(isinstance(item, dict) and "error" in item for item in result)
    return False


if __name__ == "__main__":
    pipeline_results = run_daily_pipeline(hours=24, top_n=10)
    logger.info(f"Pipeline complete: {pipeline_results}")

    failed = any(_step_failed(v) for v in pipeline_results.values())
    sys.exit(1 if failed else 0)
