"""Group room schemas."""

from datetime import datetime

from pydantic import BaseModel, Field


class RoomCreateRequest(BaseModel):
    trip_id: str = Field(..., min_length=1)
    name: str = Field(..., min_length=2, max_length=120)
    capacity: int = Field(default=6, ge=2, le=30)


class RoomJoinRequest(BaseModel):
    room_id: str = Field(..., min_length=1)


class RoomRead(BaseModel):
    id: str
    trip_id: str
    name: str
    capacity: int
    host_id: str
    members: list[str]
    created_at: datetime
