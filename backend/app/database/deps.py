"""FastAPI dependencies for MongoDB-backed routes."""

from fastapi import Depends, HTTPException, Request
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.connection import get_database
from app.schemas.auth import UserRead
from app.services.users_service import UsersService
from app.utils.security import decode_access_token


async def get_mongo_db(request: Request) -> AsyncIOMotorDatabase:
    """Ensure Atlas is available before running repository logic."""
    if not getattr(request.app.state, "mongodb_connected", False):
        err = getattr(request.app.state, "mongodb_error", None)
        raise HTTPException(
            status_code=503,
            detail="MongoDB is unavailable. Check MONGODB_URI and Atlas network access."
            + (f" ({err})" if err else ""),
        )
    return get_database()


_users = UsersService()
_bearer = HTTPBearer(auto_error=True)


async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(_bearer)) -> UserRead:
    token = credentials.credentials
    try:
        user_id = decode_access_token(token)
    except ValueError as exc:
        raise HTTPException(status_code=401, detail=str(exc)) from exc
    user = await _users.get_user(user_id)
    if user is None:
        raise HTTPException(status_code=401, detail="User not found for this token.")
    return user
