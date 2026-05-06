"""Group room routes protected by JWT."""

from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_current_user, get_mongo_db
from app.schemas.auth import UserRead
from app.schemas.room import RoomCreateRequest, RoomJoinRequest, RoomRead
from app.services.rooms_service import RoomsService

router = APIRouter()
_rooms = RoomsService()


@router.post("/create", response_model=RoomRead)
async def create_room(
    payload: RoomCreateRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> RoomRead:
    return await _rooms.create_room(user_id=user.id, payload=payload)


@router.post("/join", response_model=RoomRead)
async def join_room(
    payload: RoomJoinRequest,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    user: UserRead = Depends(get_current_user),
) -> RoomRead:
    return await _rooms.join_room(room_id=payload.room_id, user_id=user.id)


@router.get("/{room_id}", response_model=RoomRead)
async def get_room(
    room_id: str,
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
    _user: UserRead = Depends(get_current_user),
) -> RoomRead:
    return await _rooms.get_room(room_id=room_id)
