"""User profile/preferences business logic."""

from fastapi import HTTPException

from app.database.repositories import UserProfileRepository
from app.schemas.auth import UserRead
from app.schemas.user_profile import UserPreferencesRead, UserProfileRead, UserProfileUpdateRequest


class ProfilesService:
    def __init__(self, profile_repo: UserProfileRepository | None = None) -> None:
        self._profiles = profile_repo or UserProfileRepository()

    async def update_profile(self, user: UserRead, payload: UserProfileUpdateRequest) -> UserProfileRead:
        profile = await self._profiles.update_profile(
            user_id=user.id,
            full_name=payload.full_name,
            phone=payload.phone,
            avatar_url=payload.avatar_url,
        )
        if profile is None:
            raise HTTPException(status_code=404, detail="User not found.")
        return profile

    async def get_preferences(self, user: UserRead) -> UserPreferencesRead:
        return await self._profiles.get_preferences(user.id)
