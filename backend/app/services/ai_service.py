"""Google Gemini-powered AI chat with a lightweight RAG trip context."""

from __future__ import annotations

import os
from dataclasses import dataclass

import google.generativeai as genai
from pydantic import BaseModel

from app.schemas.trip import TripRead
from app.services.recommendation_service import RecommendationService
from app.utils.nlp_helpers import extract_travel_intent

# ── Gemini Configuration ──────────────────────────────────────────────
_api_key = os.getenv("GEMINI_API_KEY", "").strip()
if _api_key:
    genai.configure(api_key=_api_key)

MODEL_NAME = "gemini-1.5-flash"
FALLBACK_AI_REPLY = "Sorry, AI is temporarily unavailable."


@dataclass
class AIChatResult:
    message: str
    trips: list[TripRead]


class AIService:
    def __init__(self, recommendation_service: RecommendationService | None = None) -> None:
        self._recommendation = recommendation_service or RecommendationService()

    @staticmethod
    def _build_trip_context(trips: list[TripRead]) -> str:
        if not trips:
            return "No trips available right now."
        lines: list[str] = []
        for idx, trip in enumerate(trips, start=1):
            lines.append(
                f"{idx}. {trip.title} in {trip.city} | {trip.price} MAD | {trip.duration} days | "
                f"tags: {', '.join(trip.tags)} | {trip.description}"
            )
        return "\n".join(lines)

    async def _generate_reply(self, message: str, trip_context: str) -> str:
        api_key = os.getenv("GEMINI_API_KEY", "").strip()
        if not api_key:
            raise RuntimeError("GEMINI_API_KEY is missing.")

        genai.configure(api_key=api_key)
        model = genai.GenerativeModel(MODEL_NAME)

        prompt = (
            "You are a Moroccan travel assistant.\n"
            f"User request: {message}\n\n"
            "Here are some available trips:\n"
            f"{trip_context}\n\n"
            "Respond naturally and recommend trips."
        )

        try:
            response = model.generate_content(prompt)
            content = response.text.strip()
            if not content:
                raise RuntimeError("Gemini returned an empty response.")
            return content
        except Exception as exc:
            raise RuntimeError(f"Gemini request failed: {exc}") from exc

    @staticmethod
    def fallback_result() -> AIChatResult:
        return AIChatResult(message=FALLBACK_AI_REPLY, trips=[])

    async def chat(self, message: str) -> AIChatResult:
        message = message.strip()
        if not message:
            raise ValueError("Message must not be empty.")

        try:
            intent = await extract_travel_intent(message)
            trips = await self._recommendation.recommend_top_trips(
                budget=intent.get("budget"),
                duration=intent.get("duration"),
                preferences=intent.get("preferences", []),
                limit=3,
            )
            trip_context = self._build_trip_context(trips)
            ai_message = await self._generate_reply(message=message, trip_context=trip_context)
            return AIChatResult(message=ai_message, trips=trips)
        except Exception:
            return self.fallback_result()
