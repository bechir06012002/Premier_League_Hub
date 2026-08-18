"""Database connection setup: URL resolution, engine, and session factory."""

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

load_dotenv(Path(__file__).resolve().parent.parent / "services" / ".env")


def get_database_url() -> str:
    database_url = os.getenv("DATABASE_URL")
    if database_url:
        # Render provides postgres://, SQLAlchemy 2.x requires postgresql://
        if database_url.startswith("postgres://"):
            database_url = database_url.replace("postgres://", "postgresql://", 1)
        return database_url

    user = os.getenv("POSTGRES_USER", "postgres")
    password = os.getenv("POSTGRES_PASSWORD", "postgres")
    db = os.getenv("POSTGRES_DB", "postgres")
    host = os.getenv("POSTGRES_HOST", "localhost")
    port = os.getenv("POSTGRES_PORT", "5432")
    return f"postgresql://{user}:{password}@{host}:{port}/{db}"


engine = create_engine(get_database_url())
SessionLocal = sessionmaker(bind=engine, autoflush=False, autocommit=False)


def get_session():
    return SessionLocal()
