"""Ranks recent digests, builds a personalized email, and sends it - per user."""

from datetime import datetime, timezone
from typing import Any, Dict, List, Optional

from app.agent.curator_agent import CuratorAgent
from app.agent.email_agent import EmailAgent, EmailDigestResponse
from app.database.connection import SessionLocal
from app.database.repository import Repository
from app.services.email import digest_to_html, send_email


def _profile_to_dict(profile: Dict[str, Any]) -> Dict[str, Any]:
    teams = profile.get("favorite_teams") or []
    if len(teams) == 1:
        title = f"{teams[0]} Fan"
    elif teams:
        title = "Premier League Fan (" + ", ".join(teams) + ")"
    else:
        title = "Premier League Fan"

    background = f"Follows {', '.join(teams)} closely" if teams else "Follows the Premier League closely"

    preferences = dict(profile.get("preferences") or {})
    preferences.setdefault("favorite_clubs", teams)

    return {
        "name": profile.get("name") or "there",
        "title": title,
        "background": background,
        "interests": profile.get("interests") or [],
        "preferences": preferences,
        "expertise_level": profile.get("expertise_level") or "casual fan",
    }


def generate_email_digest(
    user_profile: Dict[str, Any], hours: int = 24, top_n: int = 10
) -> Optional[EmailDigestResponse]:
    session = SessionLocal()
    repo = Repository(session)
    try:
        digests = repo.get_recent_digests(hours=hours)
        if not digests:
            return None

        curator = CuratorAgent(user_profile)
        ranked = curator.rank_digests(digests)

        by_id = {d.id: d for d in digests}
        top_ranked = sorted(ranked, key=lambda r: r.rank)[:top_n]

        merged = []
        for r in top_ranked:
            digest = by_id.get(r.id)
            if digest is None:
                continue
            digest.reasoning = r.reasoning
            merged.append(digest)

        if not merged:
            # Ranking failed or returned nothing usable (e.g. an LLM rate limit) -
            # sending an article-free "digest" would be worse than skipping today.
            return None

        email_agent = EmailAgent(user_profile)
        return email_agent.build_email(merged)
    finally:
        session.close()


def send_digest_email(user_profile: Dict[str, Any], to_email: str, hours: int = 24, top_n: int = 10) -> dict:
    response = generate_email_digest(user_profile, hours=hours, top_n=top_n)
    if response is None:
        return {"sent": False, "reason": "no recent digests"}

    markdown_body = response.to_markdown()
    html_body = digest_to_html(markdown_body)
    today = datetime.now(timezone.utc).strftime("%B %d, %Y")
    subject = f"Your Premier League Hub Digest - {today}"

    send_email(subject=subject, body_text=markdown_body, body_html=html_body, to_email=to_email)

    return {"sent": True, "subject": subject, "article_count": len(response.articles)}


def _digest_size(profile: Dict[str, Any], fallback: int) -> int:
    """Per-user story count from `profiles.preferences.digest_size`.

    Set by the frontend (onboarding / edit profile). Anything missing or
    out of range falls back to the pipeline-wide default rather than
    letting a bad value produce an empty or absurdly long email.
    """
    raw = (profile.get("preferences") or {}).get("digest_size")
    try:
        size = int(raw)
    except (TypeError, ValueError):
        return fallback
    return size if 1 <= size <= 25 else fallback


def send_all_user_digests(hours: int = 24, top_n: int = 10) -> List[dict]:
    session = SessionLocal()
    repo = Repository(session)
    try:
        profiles = repo.get_active_profiles_with_email()
    finally:
        session.close()

    results = []
    for profile in profiles:
        try:
            result = send_digest_email(
                _profile_to_dict(profile),
                profile["email"],
                hours=hours,
                top_n=_digest_size(profile, top_n),
            )
        except Exception as e:
            # One user's failure (bad data, a one-off send error) shouldn't
            # block everyone else's digest.
            result = {"sent": False, "error": str(e)}
        results.append({"user_id": str(profile["id"]), "email": profile["email"], **result})

    return results


if __name__ == "__main__":
    for result in send_all_user_digests():
        print(result)
