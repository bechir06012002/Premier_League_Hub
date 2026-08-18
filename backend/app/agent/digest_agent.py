"""Per-item LLM summarizer: title + 2-3 sentence summary."""

import json
from typing import Optional

from pydantic import BaseModel

from app.agent.config import OPENAI_MODEL, get_llm_client

SYSTEM_PROMPT = """You are a sports news summarizer for a Premier League fan's daily email digest.

Given an article or video's title and content, write a concise, engaging summary.

Respond in JSON with exactly these fields:
{
  "title": "a clear, punchy headline (rewrite the original if it's clickbait-y or unclear)",
  "summary": "2-3 sentences summarizing the key facts - no fluff, no clickbait, just what a Premier League fan needs to know"
}
"""


class DigestOutput(BaseModel):
    title: str
    summary: str


class DigestAgent:
    def __init__(self):
        self.client = get_llm_client()

    def generate_digest(self, title: str, content: str, article_type: str) -> Optional[DigestOutput]:
        try:
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": SYSTEM_PROMPT},
                    {"role": "user", "content": f"Source type: {article_type}\nTitle: {title}\n\nContent:\n{content}"},
                ],
                response_format={"type": "json_object"},
            )
            data = json.loads(response.choices[0].message.content)
            return DigestOutput(**data)
        except Exception as e:
            print(f"DigestAgent failed for '{title}': {e}")
            return None


if __name__ == "__main__":
    agent = DigestAgent()
    result = agent.generate_digest(
        title="Chelsea set Man City deadline to bid for Fernandez",
        content=(
            "Chelsea have told Manchester City they have a deadline of 5pm this Friday "
            "to make an offer for Enzo Fernandez. Chelsea value Fernandez at £120m and "
            "he has six years left on his contract."
        ),
        article_type="sky_sports",
    )
    print(result)
