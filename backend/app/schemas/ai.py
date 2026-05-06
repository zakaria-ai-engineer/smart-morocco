"""AI-related schemas."""

from pydantic import BaseModel, Field

from app.schemas.trip import TripRead


class NLPExtracted(BaseModel):
    """Structured output from ``nlp_helpers.extract_travel_intent``."""

    budget: int | None = Field(default=None, description="Parsed budget in MAD; null if not found")
    duration: int | None = Field(default=None, description="Parsed duration in days; null if not found")
    preferences: list[str] = Field(
        default_factory=list,
        description="Canonical tags: beach, desert, culture, nature",
    )


class RecommendRequest(BaseModel):
    query: str = Field(..., min_length=1, description="User free-text request")


class RecommendResponse(BaseModel):
    extracted: NLPExtracted
    trips: list[TripRead] = Field(default_factory=list, description="Top 3 scored trips")
    message: str | None = Field(default=None, description="Optional message to user if no exact match")


class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, description="User free-text chat message")


class ChatResponse(BaseModel):
    reply: str
    trips: list[TripRead] = Field(default_factory=list, description="Top 3 recommended trips")
