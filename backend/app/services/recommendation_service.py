"""Score and rank trips from MongoDB using extracted NLP constraints."""

from __future__ import annotations

from app.database.repositories import TripRepository
from app.schemas.trip import TripRead


class RecommendationService:
    def __init__(self, trip_repo: TripRepository | None = None) -> None:
        self._trip_repo = trip_repo or TripRepository()

    @staticmethod
    def _score_trip(
        trip: TripRead,
        budget: int | None,
        duration: int | None,
        preferences: list[str],
    ) -> int:
        score = 0
        pref_set = set(preferences)

        if budget is not None and trip.price <= budget:
            score += 10

        if duration is not None and trip.duration == duration:
            score += 10

        trip_tags = set(trip.tags)
        for tag in pref_set:
            if tag in trip_tags:
                score += 5

        return score

    async def recommend_top_trips(
        self,
        budget: int | None,
        duration: int | None,
        preferences: list[str],
        limit: int = 3,
    ) -> tuple[list[TripRead], int]:
        trips = await self._trip_repo.list_all()
        ranked = sorted(
            trips,
            key=lambda t: (
                -self._score_trip(t, budget, duration, preferences),
                t.price,
                t.title,
            ),
        )
        best_score = self._score_trip(ranked[0], budget, duration, preferences) if ranked else 0
        return ranked[:limit], best_score
