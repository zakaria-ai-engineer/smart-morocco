"""Bookings routes protected by JWT."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_current_user, get_mongo_db
from app.schemas.auth import UserRead
from app.schemas.booking import BookingCreateRequest, BookingRead
from app.services.bookings_service import BookingsService

router = APIRouter()
_bookings = BookingsService()


@router.post("", response_model=BookingRead)
async def create_booking(
    payload: BookingCreateRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> BookingRead:
    return await _bookings.create_booking(user_id=user.id, payload=payload)


@router.get("", response_model=list[BookingRead])
async def list_bookings(
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> list[BookingRead]:
    return await _bookings.list_bookings(user_id=user.id)


@router.delete("/{booking_id}", status_code=204)
async def cancel_booking(
    booking_id: str,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> None:
    await _bookings.cancel_booking(user_id=user.id, booking_id=booking_id)
