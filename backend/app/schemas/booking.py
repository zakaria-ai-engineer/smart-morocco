"""Booking schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class BookingCreateRequest(BaseModel):
    trip_id: str = Field(..., min_length=1)
    travelers: int = Field(default=1, ge=1, le=20)
    notes: str | None = Field(default=None, max_length=600)


class BookingRead(BaseModel):
    id: str
    user_id: str
    trip_id: str
    travelers: int
    notes: str | None = None
    status: str
    created_at: datetime
    cancelled_at: datetime | None = None
