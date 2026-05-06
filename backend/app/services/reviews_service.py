"""Reviews business logic."""

from fastapi import HTTPException

from app.database.repositories import ReviewRepository, TripRepository
from app.schemas.auth import UserRead
from app.schemas.review import ReviewCreateRequest, ReviewRead


class ReviewsService:
    def __init__(
        self,
        review_repo: ReviewRepository | None = None,
        trip_repo: TripRepository | None = None,
    ) -> None:
        self._reviews = review_repo or ReviewRepository()
        self._trips = trip_repo or TripRepository()

    async def add_review(self, user: UserRead, payload: ReviewCreateRequest) -> ReviewRead:
        trip = await self._trips.get_by_id(payload.trip_id)
        if trip is None:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return await self._reviews.create(
            user_id=user.id,
            user_email=str(user.email),
            trip_id=payload.trip_id,
            rating=payload.rating,
            comment=payload.comment,
        )

    async def list_reviews(self, trip_id: str) -> list[ReviewRead]:
        return await self._reviews.list_by_trip(trip_id)
