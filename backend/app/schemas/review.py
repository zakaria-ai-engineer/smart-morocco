"""Review schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class ReviewCreateRequest(BaseModel):
    trip_id: str = Field(..., min_length=1)
    rating: int = Field(..., ge=1, le=5)
    comment: str | None = Field(default=None, max_length=1000)


class ReviewRead(BaseModel):
    id: str
    user_id: str
    user_email: str
    trip_id: str
    rating: int
    comment: str | None = None
    created_at: datetime
