"""Favorites routes protected by JWT."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_current_user, get_mongo_db
from app.schemas.auth import UserRead
from app.schemas.favorite import FavoriteAddRequest, FavoriteRead, FavoriteWithTrip
from app.services.favorites_service import FavoritesService

router = APIRouter()
_favorites = FavoritesService()


@router.post("/add", response_model=FavoriteRead)
async def add_favorite(
    payload: FavoriteAddRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> FavoriteRead:
    return await _favorites.add_favorite(user_id=user.id, trip_id=payload.trip_id)


@router.get("", response_model=list[FavoriteWithTrip])
async def list_favorites(
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> list[FavoriteWithTrip]:
    return await _favorites.list_favorites(user_id=user.id)


@router.delete("/{favorite_id}", status_code=204)
async def delete_favorite(
    favorite_id: str,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> None:
    await _favorites.remove_favorite(user_id=user.id, favorite_id=favorite_id)
