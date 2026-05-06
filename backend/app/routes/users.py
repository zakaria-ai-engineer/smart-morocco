"""User profile and preferences routes protected by JWT."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_current_user, get_mongo_db
from app.schemas.auth import UserRead
from app.schemas.user_profile import UserPreferencesRead, UserProfileRead, UserProfileUpdateRequest
from app.services.profiles_service import ProfilesService

router = APIRouter()
_profiles = ProfilesService()


@router.put("/profile", response_model=UserProfileRead)
async def update_profile(
    payload: UserProfileUpdateRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> UserProfileRead:
    return await _profiles.update_profile(user=user, payload=payload)


@router.get("/preferences", response_model=UserPreferencesRead)
async def get_preferences(
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> UserPreferencesRead:
    return await _profiles.get_preferences(user=user)
