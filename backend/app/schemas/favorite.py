"""Favorites schemas."""

from pydantic import BaseModel, Field

from app.schemas.trip import TripRead


class FavoriteAddRequest(BaseModel):
    trip_id: str = Field(..., min_length=1)


class FavoriteRead(BaseModel):
    id: str
    user_id: str
    trip_id: str


class FavoriteWithTrip(BaseModel):
    favorite_id: str
    trip: TripRead
