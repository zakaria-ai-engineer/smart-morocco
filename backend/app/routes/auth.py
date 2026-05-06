"""JWT auth routes."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_current_user, get_mongo_db
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserRead
from app.services.auth_service import AuthService

router = APIRouter()
_auth = AuthService()


@router.post("/register", response_model=UserRead)
async def register(
    payload: RegisterRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> UserRead:
    return await _auth.register(payload)


@router.post("/login", response_model=TokenResponse)
async def login(
    payload: LoginRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> TokenResponse:
    return await _auth.login(payload)


@router.get("/me", response_model=UserRead)
async def me(user: UserRead = Depends(get_current_user)) -> UserRead:
    return user
