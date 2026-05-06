"""Small async utilities."""

import asyncio
from typing import Any


async def maybe_yield() -> None:
    """Yield to the event loop (keeps async style similar to I/O-bound repos)."""
    await asyncio.sleep(0)


def last_user_message(messages: list[Any]) -> str | None:
    for message in reversed(messages):
        role = getattr(message, "role", None)
        content = getattr(message, "content", None)
        if role == "user" and isinstance(content, str) and content.strip():
            return content.strip()
    return None
