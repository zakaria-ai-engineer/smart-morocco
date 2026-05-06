"""Pydantic request/response models."""

from app.schemas.ai import (
    ChatRequest,
    ChatResponse,
    NLPExtracted,
    RecommendRequest,
    RecommendResponse,
)
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserRead
from app.schemas.city import CityRead
from app.schemas.favorite import FavoriteAddRequest, FavoriteRead, FavoriteWithTrip
from app.schemas.trip import TripRead

__all__ = [
    "ChatRequest",
    "ChatResponse",
    "CityRead",
    "FavoriteAddRequest",
    "FavoriteRead",
    "FavoriteWithTrip",
    "LoginRequest",
    "NLPExtracted",
    "RegisterRequest",
    "RecommendRequest",
    "RecommendResponse",
    "TokenResponse",
    "TripRead",
    "UserRead",
]
