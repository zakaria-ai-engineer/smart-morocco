"""Async MongoDB repositories (Motor)."""

from datetime import datetime, timezone

from bson import ObjectId
from bson.errors import InvalidId
from pydantic import EmailStr
from pymongo import ReturnDocument

from app.database.connection import get_database
from app.database.mongo_serialization import with_string_id
from app.schemas.auth import UserRead
from app.schemas.booking import BookingRead
from app.schemas.city import CityRead
from app.schemas.favorite import FavoriteRead
from app.schemas.media import Media
from app.schemas.review import ReviewRead
from app.schemas.room import RoomRead
from app.schemas.trip import TripRead
from app.schemas.user_profile import UserPreferencesRead, UserProfileRead


class CityRepository:
    @staticmethod
    def _collection():
        return get_database()["cities"]

    @staticmethod
    async def list_all() -> list[CityRead]:
        cursor = CityRepository._collection().find({}).sort("name", 1)
        docs = await cursor.to_list(length=500)
        return [CityRead.model_validate(with_string_id(d)) for d in docs]

    @staticmethod
    async def get_by_id(city_id: str) -> CityRead | None:
        try:
            oid = ObjectId(city_id)
        except (InvalidId, TypeError):
            return None
        doc = await CityRepository._collection().find_one({"_id": oid})
        if doc is None:
            return None
        return CityRead.model_validate(with_string_id(doc))


class TripRepository:
    @staticmethod
    def _collection():
        return get_database()["trips"]

    @staticmethod
    async def list_all() -> list[TripRead]:
        cursor = TripRepository._collection().find({}).sort("title", 1)
        docs = await cursor.to_list(length=500)
        return [TripRead.model_validate(with_string_id(d)) for d in docs]

    @staticmethod
    async def get_by_id(trip_id: str) -> TripRead | None:
        try:
            oid = ObjectId(trip_id)
        except (InvalidId, TypeError):
            return None
        doc = await TripRepository._collection().find_one({"_id": oid})
        if doc is None:
            return None
        return TripRead.model_validate(with_string_id(doc))

    @staticmethod
    async def list_by_city(city: str) -> list[TripRead]:
        cursor = TripRepository._collection().find({"city": {"$regex": f"^{city}$", "$options": "i"}}).sort("title", 1)
        docs = await cursor.to_list(length=500)
        return [TripRead.model_validate(with_string_id(d)) for d in docs]

    @staticmethod
    async def search(query: str) -> list[TripRead]:
        safe_q = query.strip()
        cursor = TripRepository._collection().find(
            {
                "$or": [
                    {"title": {"$regex": safe_q, "$options": "i"}},
                    {"city": {"$regex": safe_q, "$options": "i"}},
                    {"description": {"$regex": safe_q, "$options": "i"}},
                    {"tags": {"$regex": safe_q, "$options": "i"}},
                ]
            }
        ).sort("title", 1)
        docs = await cursor.to_list(length=500)
        return [TripRead.model_validate(with_string_id(d)) for d in docs]


class UserRepository:
    @staticmethod
    def _collection():
        return get_database()["users"]

    @staticmethod
    async def get_by_email(email: EmailStr) -> UserRead | None:
        doc = await UserRepository._collection().find_one({"email": str(email).lower()})
        if doc is None:
            return None
        return UserRead.model_validate(with_string_id(doc))

    @staticmethod
    async def create(email: EmailStr, hashed_password: str, full_name: str | None = None) -> UserRead:
        payload = {"email": str(email).lower(), "hashed_password": hashed_password, "full_name": full_name}
        result = await UserRepository._collection().insert_one(payload)
        return UserRead(id=str(result.inserted_id), email=email, full_name=full_name)

    @staticmethod
    async def get_auth_doc_by_email(email: EmailStr) -> dict | None:
        return await UserRepository._collection().find_one({"email": str(email).lower()})

    @staticmethod
    async def get_by_id(user_id: str) -> UserRead | None:
        try:
            oid = ObjectId(user_id)
        except (InvalidId, TypeError):
            return None
        doc = await UserRepository._collection().find_one({"_id": oid})
        if doc is None:
            return None
        return UserRead.model_validate(with_string_id(doc))


class FavoriteRepository:
    @staticmethod
    def _collection():
        return get_database()["favorites"]

    @staticmethod
    async def add(user_id: str, trip_id: str) -> FavoriteRead:
        payload = {"user_id": user_id, "trip_id": trip_id}
        existing = await FavoriteRepository._collection().find_one(payload)
        if existing:
            return FavoriteRead.model_validate(with_string_id(existing))
        result = await FavoriteRepository._collection().insert_one(payload)
        doc = {"_id": result.inserted_id, **payload}
        return FavoriteRead.model_validate(with_string_id(doc))

    @staticmethod
    async def list_by_user(user_id: str) -> list[FavoriteRead]:
        cursor = FavoriteRepository._collection().find({"user_id": user_id}).sort("_id", -1)
        docs = await cursor.to_list(length=500)
        return [FavoriteRead.model_validate(with_string_id(d)) for d in docs]

    @staticmethod
    async def delete_by_id(user_id: str, favorite_id: str) -> bool:
        try:
            oid = ObjectId(favorite_id)
        except (InvalidId, TypeError):
            return False
        result = await FavoriteRepository._collection().delete_one({"_id": oid, "user_id": user_id})
        return result.deleted_count > 0


class BookingRepository:
    @staticmethod
    def _collection():
        return get_database()["bookings"]

    @staticmethod
    async def create(user_id: str, trip_id: str, travelers: int, notes: str | None) -> BookingRead:
        now = datetime.now(timezone.utc)
        payload = {
            "user_id": user_id,
            "trip_id": trip_id,
            "travelers": travelers,
            "notes": notes,
            "status": "confirmed",
            "created_at": now,
            "cancelled_at": None,
        }
        result = await BookingRepository._collection().insert_one(payload)
        doc = {"_id": result.inserted_id, **payload}
        return BookingRead.model_validate(with_string_id(doc))

    @staticmethod
    async def list_by_user(user_id: str) -> list[BookingRead]:
        cursor = BookingRepository._collection().find({"user_id": user_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=500)
        return [BookingRead.model_validate(with_string_id(d)) for d in docs]

    @staticmethod
    async def cancel(user_id: str, booking_id: str) -> BookingRead | None:
        try:
            oid = ObjectId(booking_id)
        except (InvalidId, TypeError):
            return None
        now = datetime.now(timezone.utc)
        updated = await BookingRepository._collection().find_one_and_update(
            {"_id": oid, "user_id": user_id, "status": {"$ne": "cancelled"}},
            {"$set": {"status": "cancelled", "cancelled_at": now}},
            return_document=ReturnDocument.AFTER,
        )
        if updated is None:
            return None
        return BookingRead.model_validate(with_string_id(updated))


class ReviewRepository:
    @staticmethod
    def _collection():
        return get_database()["reviews"]

    @staticmethod
    async def create(user_id: str, user_email: str, trip_id: str, rating: int, comment: str | None) -> ReviewRead:
        payload = {
            "user_id": user_id,
            "user_email": user_email,
            "trip_id": trip_id,
            "rating": rating,
            "comment": comment,
            "created_at": datetime.now(timezone.utc),
        }
        result = await ReviewRepository._collection().insert_one(payload)
        doc = {"_id": result.inserted_id, **payload}
        return ReviewRead.model_validate(with_string_id(doc))

    @staticmethod
    async def list_by_trip(trip_id: str) -> list[ReviewRead]:
        cursor = ReviewRepository._collection().find({"trip_id": trip_id}).sort("created_at", -1)
        docs = await cursor.to_list(length=500)
        return [ReviewRead.model_validate(with_string_id(d)) for d in docs]


class UserProfileRepository:
    @staticmethod
    def _users_collection():
        return get_database()["users"]

    @staticmethod
    def _preferences_collection():
        return get_database()["user_preferences"]

    @staticmethod
    async def update_profile(user_id: str, full_name: str | None, phone: str | None, avatar_url: str | None) -> UserProfileRead | None:
        try:
            oid = ObjectId(user_id)
        except (InvalidId, TypeError):
            return None
        updates = {"full_name": full_name, "phone": phone, "avatar_url": avatar_url}
        await UserProfileRepository._users_collection().update_one({"_id": oid}, {"$set": updates})
        doc = await UserProfileRepository._users_collection().find_one({"_id": oid})
        if doc is None:
            return None
        return UserProfileRead.model_validate(with_string_id(doc))

    @staticmethod
    async def get_preferences(user_id: str) -> UserPreferencesRead:
        doc = await UserProfileRepository._preferences_collection().find_one({"user_id": user_id})
        if doc is None:
            payload = {"user_id": user_id, "currency": "MAD", "language": "en", "interests": []}
            result = await UserProfileRepository._preferences_collection().insert_one(payload)
            doc = {"_id": result.inserted_id, **payload}
        return UserPreferencesRead.model_validate(with_string_id(doc))


class RoomRepository:
    @staticmethod
    def _collection():
        return get_database()["rooms"]

    @staticmethod
    async def create(trip_id: str, name: str, capacity: int, host_id: str) -> RoomRead:
        payload = {
            "trip_id": trip_id,
            "name": name,
            "capacity": capacity,
            "host_id": host_id,
            "members": [host_id],
            "created_at": datetime.now(timezone.utc),
        }
        result = await RoomRepository._collection().insert_one(payload)
        doc = {"_id": result.inserted_id, **payload}
        return RoomRead.model_validate(with_string_id(doc))

    @staticmethod
    async def get_by_id(room_id: str) -> RoomRead | None:
        try:
            oid = ObjectId(room_id)
        except (InvalidId, TypeError):
            return None
        doc = await RoomRepository._collection().find_one({"_id": oid})
        if doc is None:
            return None
        return RoomRead.model_validate(with_string_id(doc))

    @staticmethod
    async def join(room_id: str, user_id: str) -> RoomRead | None:
        try:
            oid = ObjectId(room_id)
        except (InvalidId, TypeError):
            return None
        updated = await RoomRepository._collection().find_one_and_update(
            {"_id": oid, "members": {"$ne": user_id}},
            {"$addToSet": {"members": user_id}},
            return_document=ReturnDocument.AFTER,
        )
        if updated is None:
            existing = await RoomRepository._collection().find_one({"_id": oid})
            if existing is None:
                return None
            return RoomRead.model_validate(with_string_id(existing))
        return RoomRead.model_validate(with_string_id(updated))


