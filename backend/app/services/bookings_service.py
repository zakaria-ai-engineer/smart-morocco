"""Bookings business logic."""

from fastapi import HTTPException

from app.database.repositories import BookingRepository, TripRepository
from app.schemas.booking import BookingCreateRequest, BookingRead


class BookingsService:
    def __init__(
        self,
        booking_repo: BookingRepository | None = None,
        trip_repo: TripRepository | None = None,
    ) -> None:
        self._bookings = booking_repo or BookingRepository()
        self._trips = trip_repo or TripRepository()

    async def create_booking(self, user_id: str, payload: BookingCreateRequest) -> BookingRead:
        trip = await self._trips.get_by_id(payload.trip_id)
        if trip is None:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return await self._bookings.create(
            user_id=user_id,
            trip_id=payload.trip_id,
            travelers=payload.travelers,
            notes=payload.notes,
        )

    async def list_bookings(self, user_id: str) -> list[BookingRead]:
        return await self._bookings.list_by_user(user_id)

    async def cancel_booking(self, user_id: str, booking_id: str) -> None:
        cancelled = await self._bookings.cancel(user_id=user_id, booking_id=booking_id)
        if cancelled is None:
            raise HTTPException(status_code=404, detail="Booking not found.")
