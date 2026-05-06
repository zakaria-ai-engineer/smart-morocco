"""Authentication business logic."""

from fastapi import HTTPException

from app.database.repositories import UserRepository
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserRead
from app.utils.security import create_access_token, hash_password, verify_password


class AuthService:
    def __init__(self, user_repo: UserRepository | None = None) -> None:
        self._users = user_repo or UserRepository()

    async def register(self, payload: RegisterRequest) -> UserRead:
        existing = await self._users.get_by_email(payload.email)
        if existing is not None:
            raise HTTPException(status_code=409, detail="Email already registered.")
        return await self._users.create(payload.email, hash_password(payload.password), getattr(payload, "full_name", None))

    async def login(self, payload: LoginRequest) -> TokenResponse:
        auth_doc = await self._users.get_auth_doc_by_email(payload.email)
        if auth_doc is None:
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        hashed = str(auth_doc.get("hashed_password", ""))
        if not verify_password(payload.password, hashed):
            raise HTTPException(status_code=401, detail="Invalid credentials.")
        token = create_access_token(subject=str(auth_doc["_id"]))
        return TokenResponse(access_token=token)
