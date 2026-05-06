"""Favorites business logic."""

from fastapi import HTTPException

from app.database.repositories import FavoriteRepository, TripRepository
from app.schemas.favorite import FavoriteRead, FavoriteWithTrip


class FavoritesService:
    def __init__(
        self,
        favorite_repo: FavoriteRepository | None = None,
        trip_repo: TripRepository | None = None,
    ) -> None:
        self._favorites = favorite_repo or FavoriteRepository()
        self._trips = trip_repo or TripRepository()

    async def add_favorite(self, user_id: str, trip_id: str) -> FavoriteRead:
        trip = await self._trips.get_by_id(trip_id)
        if trip is None:
            raise HTTPException(status_code=404, detail="Trip not found.")
        return await self._favorites.add(user_id=user_id, trip_id=trip_id)

    async def list_favorites(self, user_id: str) -> list[FavoriteWithTrip]:
        favs = await self._favorites.list_by_user(user_id)
        out: list[FavoriteWithTrip] = []
        for fav in favs:
            trip = await self._trips.get_by_id(fav.trip_id)
            if trip is None:
                continue
            out.append(FavoriteWithTrip(favorite_id=fav.id, trip=trip))
        return out

    async def remove_favorite(self, user_id: str, favorite_id: str) -> None:
        deleted = await self._favorites.delete_by_id(user_id=user_id, favorite_id=favorite_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Favorite not found.")
