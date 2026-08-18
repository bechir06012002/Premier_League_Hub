"""Ranks a batch of digests against a user profile."""

import json
from typing import Any, Dict, List

from pydantic import BaseModel

from app.agent.config import OPENAI_MODEL, get_llm_client


class RankedArticle(BaseModel):
    id: str
    score: int
    rank: int
    reasoning: str


class CuratorAgent:
    def __init__(self, user_profile: Dict[str, Any]):
        self.user_profile = user_profile
        self.client = get_llm_client()

    def _system_prompt(self) -> str:
        profile = self.user_profile
        return f"""You are a content curator ranking Premier League news for a specific reader.

Reader profile:
- Name: {profile.get('name')}
- Title: {profile.get('title')}
- Background: {profile.get('background')}
- Interests: {', '.join(profile.get('interests', []))}
- Preferences: {json.dumps(profile.get('preferences', {}))}
- Expertise level: {profile.get('expertise_level')}

Given a numbered list of article digests (id, title, summary), score each one 0-100 on how relevant and
interesting it is to this specific reader, then rank them best-to-worst.

Respond in JSON with exactly this shape:
{{
  "rankings": [
    {{"id": "<digest id>", "score": 0-100, "rank": 1, "reasoning": "one sentence why"}}
  ]
}}
"""

    def rank_digests(self, digests: List[Any]) -> List[RankedArticle]:
        if not digests:
            return []

        valid_ids = {d.id for d in digests}
        items_text = "\n".join(
            f"{i + 1}. id={d.id} | title={d.title} | summary={d.summary}" for i, d in enumerate(digests)
        )

        try:
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": self._system_prompt()},
                    {"role": "user", "content": f"Digests to rank:\n{items_text}"},
                ],
                response_format={"type": "json_object"},
            )
            data = json.loads(response.choices[0].message.content)
            rankings = [RankedArticle(**item) for item in data.get("rankings", [])]

            # The model occasionally hallucinates an id or repeats one; keep only
            # real, first-seen matches so callers can safely index digests by id.
            seen_ids = set()
            deduped = []
            for r in rankings:
                if r.id not in valid_ids or r.id in seen_ids:
                    continue
                seen_ids.add(r.id)
                deduped.append(r)
            return deduped
        except Exception as e:
            print(f"CuratorAgent failed to rank digests: {e}")
            return []
