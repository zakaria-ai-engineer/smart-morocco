"""Lightweight NLP: budget, duration, and multilingual preference cues.

This is intentionally simple regex-based parsing (no heavy NLP dependencies).
"""

from __future__ import annotations

import asyncio
import re
import unicodedata
from typing import Any

# (regex pattern, canonical tag) — patterns run on normalized ASCII-ish text where noted
_PREFERENCE_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    # English
    (re.compile(r"\bbeach(es)?\b", re.IGNORECASE), "beach"),
    (re.compile(r"\bdesert\b", re.IGNORECASE), "desert"),
    (re.compile(r"\bculture\b", re.IGNORECASE), "culture"),
    (re.compile(r"\bnature\b", re.IGNORECASE), "nature"),
    # French
    (re.compile(r"\bplages?\b", re.IGNORECASE), "beach"),
    (re.compile(r"\bd[ée]serts?\b", re.IGNORECASE), "desert"),
    (re.compile(r"\bcultures?\b", re.IGNORECASE), "culture"),
    (re.compile(r"\bnatures?\b", re.IGNORECASE), "nature"),
    # Moroccan Darija (Latin chat)
    (re.compile(r"\bb7ar\b", re.IGNORECASE), "beach"),
    (re.compile(r"\bbahr\b", re.IGNORECASE), "beach"),
    (re.compile(r"\bsahra\b", re.IGNORECASE), "desert"),
    (re.compile(r"\bjbel\b", re.IGNORECASE), "nature"),
    (re.compile(r"\bmadina\b", re.IGNORECASE), "culture"),
    (re.compile(r"\bmdina\b", re.IGNORECASE), "culture"),
)

# Extra hints → canonical tag (optional, improves recall)
_EXTRA_PATTERNS: tuple[tuple[re.Pattern[str], str], ...] = (
    (re.compile(r"\bsea\b|\bocean\b|\bcoast\b|\bAtlantic\b", re.IGNORECASE), "beach"),
    (re.compile(r"\bsahara\b|\bdunes?\b", re.IGNORECASE), "desert"),
    (re.compile(r"\bmedina\b|\bmedieval\b|\bmuseum\b|\bheritage\b", re.IGNORECASE), "culture"),
    (re.compile(r"\bmountain\b|\bhiking\b|\brandonn[ée]e\b", re.IGNORECASE), "nature"),
)

_BUDGET_RE = re.compile(
    r"(?P<num>\d[\d\s]*)\s*(?P<cur>dh|DH|dhs|DHS|mad|MAD|د\.?\s*م\.?|dirhams?)\b",
    re.IGNORECASE,
)

_DURATION_RE = re.compile(
    r"(?P<n>\d+)\s*(?:days?|day\b|jours?|jour\b|nuits?|night|nights)\b",
    re.IGNORECASE,
)


def _strip_accents(value: str) -> str:
    normalized = unicodedata.normalize("NFKD", value)
    return "".join(ch for ch in normalized if not unicodedata.combining(ch))


def _normalize_for_match(text: str) -> str:
    """Lowercase + strip accents for robust FR matching."""
    return _strip_accents(text.lower())


def _parse_int_loose(raw: str) -> int:
    return int(re.sub(r"\s+", "", raw))


def _extract_budget(text: str) -> int | None:
    best: int | None = None
    for match in _BUDGET_RE.finditer(text):
        try:
            value = _parse_int_loose(match.group("num"))
        except ValueError:
            continue
        best = value if best is None else max(best, value)
    return best


def _extract_duration(text: str) -> int | None:
    best: int | None = None
    for match in _DURATION_RE.finditer(text):
        try:
            value = int(match.group("n"))
        except ValueError:
            continue
        best = value if best is None else max(best, value)
    return best


def _extract_preferences(text: str) -> list[str]:
    haystack = _normalize_for_match(text)
    found: set[str] = set()
    for pattern, tag in _PREFERENCE_PATTERNS:
        if pattern.search(haystack):
            found.add(tag)
    for pattern, tag in _EXTRA_PATTERNS:
        if pattern.search(haystack):
            found.add(tag)
    return sorted(found)


def extract_travel_intent_sync(message: str) -> dict[str, Any]:
    """
    Parse free text and return structured constraints.

    Returns:
        ``{"budget": int | None, "duration": int | None, "preferences": list[str]}``
    """
    if not message or not message.strip():
        return {"budget": None, "duration": None, "preferences": []}

    text = message.strip()
    budget = _extract_budget(text)
    duration = _extract_duration(text)
    preferences = _extract_preferences(text)
    return {"budget": budget, "duration": duration, "preferences": preferences}


async def extract_travel_intent(message: str) -> dict[str, Any]:
    """Async wrapper so callers can await without blocking the event loop boundary."""
    await asyncio.sleep(0)
    return extract_travel_intent_sync(message)
