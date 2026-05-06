"""Trips service."""

from app.database.repositories import TripRepository
from app.schemas.trip import TripRead


class TripsService:
    def __init__(self, trip_repo: TripRepository | None = None) -> None:
        self._trips = trip_repo or TripRepository()

    async def list_trips(self) -> list[TripRead]:
        return await self._trips.list_all()

    async def get_trip(self, trip_id: str) -> TripRead | None:
        return await self._trips.get_by_id(trip_id)

    async def list_by_city(self, city: str) -> list[TripRead]:
        return await self._trips.list_by_city(city)

    async def search(self, query: str) -> list[TripRead]:
        return await self._trips.search(query)

