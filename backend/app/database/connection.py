"""Async MongoDB client (Motor).

Settings are loaded from environment variables via ``dotenv``:
- ``MONGODB_URI`` (preferred) or ``MONGO_URI`` (supported alias)
- ``MONGODB_DB_NAME``
"""

from __future__ import annotations

import logging
import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase

logger = logging.getLogger(__name__)

_BACKEND_ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
_APP_ENV_PATH = Path(__file__).resolve().parents[1] / ".env"
if _BACKEND_ENV_PATH.exists():
    load_dotenv(dotenv_path=_BACKEND_ENV_PATH, override=False)
elif _APP_ENV_PATH.exists():
    load_dotenv(dotenv_path=_APP_ENV_PATH, override=False)
else:
    load_dotenv(override=False)

_client: Optional[AsyncIOMotorClient] = None
_db: Optional[AsyncIOMotorDatabase] = None


def _normalize_env(value: str | None) -> str:
    if value is None:
        return ""
    return " ".join(value.split()).replace("\n", "").replace("\r", "")


def _mongodb_uri() -> str:
    # Support both names; keep MONGODB_URI as the canonical one.
    uri = _normalize_env(os.getenv("MONGODB_URI")) or _normalize_env(os.getenv("MONGO_URI"))
    if not uri:
        raise RuntimeError(
            "MONGODB_URI (or MONGO_URI) is missing or empty. Set it in backend/.env to your MongoDB Atlas "
            "SRV string (special characters in the password must be URL-encoded)."
        )
    lowered = uri.lower()
    if "mongodb+srv://" in lowered and ("localhost" in lowered or "127.0.0.1" in lowered):
        raise RuntimeError("MONGODB_URI looks invalid. Use mongodb://localhost:27017 or a valid Atlas SRV URI.")
    if not uri.startswith("mongodb+srv://") and not uri.startswith("mongodb://"):
        raise RuntimeError("MONGODB_URI must start with mongodb+srv:// or mongodb://")
    return uri


def _mongodb_db_name() -> str:
    name = _normalize_env(os.getenv("MONGODB_DB_NAME"))
    if not name:
        raise RuntimeError(
            "MONGODB_DB_NAME is missing or empty. Set it in backend/.env (e.g. smart-morocco)."
        )
    return name


async def connect_mongodb() -> None:
    """Create Motor client, select database, and verify with a ping (SCRAM auth with Atlas)."""
    global _client, _db
    if _client is not None and _db is not None:
        await _db.command("ping")
        return

    uri = _mongodb_uri()
    db_name = _mongodb_db_name()

    _client = AsyncIOMotorClient(
        uri,
        serverSelectionTimeoutMS=30_000,
        connectTimeoutMS=20_000,
    )
    _db = _client[db_name]
    await _db.command("ping")
    logger.info("MongoDB Atlas ping succeeded for database %r", db_name)


async def close_mongodb() -> None:
    """Close the Motor client and clear handles."""
    global _client, _db
    if _client is not None:
        _client.close()
    _client = None
    _db = None


def get_database() -> AsyncIOMotorDatabase:
    """Return the active database after a successful connect_mongodb()."""
    if _db is None:
        raise RuntimeError("MongoDB is not connected.")
    return _db


async def startup_database() -> tuple[bool, str | None]:
    """
    Connect and verify MongoDB. On failure, closes any partial client and returns (False, message).

    Seed callers should run only when this returns (True, None).
    """
    try:
        await connect_mongodb()
        return True, None
    except Exception as exc:
        logger.exception("MongoDB connection or authentication failed")
        await close_mongodb()
        return False, f"{type(exc).__name__}: {exc}"
