"""AI-style routes (NLP + trip recommendations) — powered by Groq."""

import logging
import os
from pathlib import Path

from dotenv import load_dotenv
from fastapi import APIRouter, HTTPException
from groq import Groq
from pydantic import BaseModel

# Load .env once at module level — override ensures fresh values at startup.
_env_path = Path(__file__).resolve().parents[2] / ".env"
load_dotenv(dotenv_path=_env_path, override=True)

logger = logging.getLogger(__name__)
router = APIRouter()


# ── Request schema ────────────────────────────────────────────────────────────

class GenerateRequest(BaseModel):
    destination: str
    days: int
    budget: int
    persons: int
    group_type: str


# ── Endpoint ──────────────────────────────────────────────────────────────────

@router.post("/generate")
async def generate_trip(request: GenerateRequest):
    """Generate a Moroccan travel itinerary using the Groq LLM."""
    final_key = (os.getenv("GROQ_API_KEY") or "").strip()

    if not final_key or len(final_key) < 40:
        logger.error(
            "GROQ_API_KEY is missing or invalid (length=%d). Check .env at: %s",
            len(final_key),
            _env_path,
        )
        raise HTTPException(
            status_code=500,
            detail=(
                f"GROQ_API_KEY is not configured correctly. "
                f"Check your .env file at: {_env_path}"
            ),
        )

    try:
        client = Groq(api_key=final_key)

        prompt = (
            f"You are a friendly Moroccan travel expert.\n"
            f"Create a {request.days}-day trip to {request.destination} "
            f"for {request.persons} people ({request.group_type}) "
            f"with budget ${request.budget}.\n\n"
            f"Rules:\n"
            f"- Use simple clean text (NO markdown)\n"
            f"- Format: ✈️ Day 1 — Title\n"
            f"- Include Moroccan food (Couscous, Tanjia...)\n"
            f"- Include hidden gems\n"
            f"- End with 💰 Budget Breakdown\n"
        )

        completion = client.chat.completions.create(
            model="llama3-8b-8192",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.7,
            max_tokens=2000,
        )

        content = completion.choices[0].message.content
        logger.info(
            "Generated itinerary for '%s' (%d chars).",
            request.destination,
            len(content),
        )

        return {"response": content}

    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Groq API error for destination='%s'", request.destination)
        raise HTTPException(status_code=500, detail=str(exc)) from exc