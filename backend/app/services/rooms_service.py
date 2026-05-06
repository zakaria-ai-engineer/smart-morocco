"""Group rooms business logic."""

from fastapi import HTTPException

from app.database.repositories import RoomRepository, TripRepository
from app.schemas.room import RoomCreateRequest, RoomRead


class RoomsService:
    def __init__(
        self,
        room_repo: RoomRepository | None = None,
        trip_repo: TripRepository | None = None,
    ) -> None:
        self._rooms = room_repo or RoomRepository()
        self._trips = trip_repo or TripRepository()

    async def create_room(self, user_id: str, payload: RoomCreateRequest) -> RoomRead:
        trip = await self._trips.get_by_id(payload.trip_id)
        if trip is None:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return await self._rooms.create(
            trip_id=payload.trip_id,
            name=payload.name,
            capacity=payload.capacity,
            host_id=user_id,
        )

    async def join_room(self, room_id: str, user_id: str) -> RoomRead:
        room = await self._rooms.get_by_id(room_id)
        if room is None:
            raise HTTPException(status_code=404, detail="Room not found.")
        if user_id not in room.members and len(room.members) >= room.capacity:
            raise HTTPException(status_code=400, detail="Room is full.")
        updated = await self._rooms.join(room_id=room_id, user_id=user_id)
        if updated is None:
            raise HTTPException(status_code=404, detail="Room not found.")
        return updated

    async def get_room(self, room_id: str) -> RoomRead:
        room = await self._rooms.get_by_id(room_id)
        if room is None:
            raise HTTPException(status_code=404, detail="Room not found.")
        return room
