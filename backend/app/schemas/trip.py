"""Trip schemas."""

from typing import Literal

from pydantic import BaseModel, Field

TripTag = Literal["beach", "desert", "culture", "nature"]


class TripRead(BaseModel):
    id: str = Field(..., description="MongoDB ObjectId as string")
    title: str
    city: str
    price: int = Field(..., ge=0, description="Price in MAD")
    duration: int = Field(..., ge=1, description="Duration in days")
    tags: list[TripTag]
    description: str
    image: str | None = Field(default=None, description="Optional trip image URL")
