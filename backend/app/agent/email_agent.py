"""Generates the personalized intro and assembles the final email payload."""

import json
from typing import Any, Dict, List

from pydantic import BaseModel

from app.agent.config import OPENAI_MODEL, get_llm_client

GREETING_SYSTEM_PROMPT = """You write the opening greeting for a Premier League fan's personalized daily email digest.

Given the reader's profile and today's top-ranked stories, write a short (2-3 sentence), warm, personalized
greeting that teases what's in today's digest. No generic "Hello!" filler - make it specific to today's stories.

Respond in JSON with exactly this field:
{"greeting": "the greeting text"}
"""


class EmailArticle(BaseModel):
    title: str
    summary: str
    url: str
    reasoning: str = ""


class EmailDigestResponse(BaseModel):
    greeting: str
    articles: List[EmailArticle]

    def to_markdown(self) -> str:
        lines = [self.greeting, ""]
        for i, article in enumerate(self.articles, start=1):
            lines.append(f"## {i}. {article.title}")
            lines.append("")
            lines.append(article.summary)
            if article.reasoning:
                lines.append("")
                lines.append(f"*Why this made the cut: {article.reasoning}*")
            lines.append("")
            lines.append(f"[Read more]({article.url})")
            lines.append("")
        return "\n".join(lines)


class EmailAgent:
    def __init__(self, user_profile: Dict[str, Any]):
        self.user_profile = user_profile
        self.client = get_llm_client()

    def _generate_greeting(self, top_digests: List[Any]) -> str:
        titles = "\n".join(f"- {d.title}" for d in top_digests)
        try:
            response = self.client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": GREETING_SYSTEM_PROMPT},
                    {
                        "role": "user",
                        "content": f"Reader: {self.user_profile.get('name')}\n\nToday's top stories:\n{titles}",
                    },
                ],
                response_format={"type": "json_object"},
            )
            data = json.loads(response.choices[0].message.content)
            return data["greeting"]
        except Exception as e:
            print(f"EmailAgent failed to generate greeting: {e}")
            return f"Hi {self.user_profile.get('name', 'there')}, here's your Premier League digest."

    def build_email(self, ranked_digests: List[Any]) -> EmailDigestResponse:
        greeting = self._generate_greeting(ranked_digests)
        articles = [
            EmailArticle(
                title=d.title,
                summary=d.summary,
                url=d.url,
                reasoning=getattr(d, "reasoning", ""),
            )
            for d in ranked_digests
        ]
        return EmailDigestResponse(greeting=greeting, articles=articles)
