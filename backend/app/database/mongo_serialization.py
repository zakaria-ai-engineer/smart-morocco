"""Map MongoDB documents to API-friendly dicts (ObjectId -> string id)."""

from typing import Any


def with_string_id(doc: dict[str, Any]) -> dict[str, Any]:
    """Return a shallow copy with `_id` removed and `id` set to the stringified ObjectId."""
    out = {k: v for k, v in doc.items() if k != "_id"}
    out["id"] = str(doc["_id"])
    return out
