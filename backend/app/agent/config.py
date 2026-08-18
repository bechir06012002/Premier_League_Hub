"""OpenAI client configuration — shared by all three agents."""

import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv(Path(__file__).resolve().parent.parent / "services" / ".env")

OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")


def get_llm_client() -> OpenAI:
    return OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
