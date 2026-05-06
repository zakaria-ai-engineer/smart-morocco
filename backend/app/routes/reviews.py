"""Reviews routes."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_current_user, get_mongo_db
from app.schemas.auth import UserRead
from app.schemas.review import ReviewCreateRequest, ReviewRead
from app.services.reviews_service import ReviewsService

router = APIRouter()
_reviews = ReviewsService()


@router.post("", response_model=ReviewRead)
async def add_review(
    payload: ReviewCreateRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> ReviewRead:
    return await _reviews.add_review(user=user, payload=payload)


@router.get("/{trip_id}", response_model=list[ReviewRead])
async def list_reviews(
    trip_id: str,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> list[ReviewRead]:
    return await _reviews.list_reviews(trip_id=trip_id)
