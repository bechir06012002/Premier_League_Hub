"""Standalone scrape-only smoke test — scrapes and persists, no LLM or email involved."""

from app.runner import run_scrapers

if __name__ == "__main__":
    counts = run_scrapers(hours=24)
    print("Scrape results:")
    for source, count in counts.items():
        print(f"  {source}: {count} new items")
