"""User retrieval service for auth dependencies."""

from app.database.repositories import UserRepository
from app.schemas.auth import UserRead


class UsersService:
    def __init__(self, user_repo: UserRepository | None = None) -> None:
        self._users = user_repo or UserRepository()

    async def get_user(self, user_id: str) -> UserRead | None:
        return await self._users.get_by_id(user_id)
