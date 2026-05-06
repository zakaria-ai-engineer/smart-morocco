"""Trip routes."""

from fastapi import APIRouter, Depends, HTTPException, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_mongo_db
from app.schemas.trip import TripRead
from app.services.trips_service import TripsService

router = APIRouter()
_service = TripsService()


@router.get("", response_model=list[TripRead])
async def list_trips(
    city: str | None = Query(default=None, description="Optional city filter"),
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> list[TripRead]:
    try:
        if city:
            return await _service.list_by_city(city)
        return await _service.list_trips()
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {type(exc).__name__}") from exc


@router.get("/search", response_model=list[TripRead])
async def search_trips(
    q: str = Query(..., min_length=1),
    _: AsyncIOMotorDatabase = Depends(get_mongo_db),
) -> list[TripRead]:
    return await _service.search(q)


@router.get("/city/{city}", response_model=list[TripRead])
async def list_trips_by_city(city: str, _: AsyncIOMotorDatabase = Depends(get_mongo_db)) -> list[TripRead]:
    return await _service.list_by_city(city)


@router.get("/id/{trip_id}", response_model=TripRead)
async def get_trip_by_id(trip_id: str, _: AsyncIOMotorDatabase = Depends(get_mongo_db)) -> TripRead:
    trip = await _service.get_trip(trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return trip


@router.get("/{trip_id}", response_model=TripRead)
async def get_trip(trip_id: str, _: AsyncIOMotorDatabase = Depends(get_mongo_db)) -> TripRead:
    trip = await _service.get_trip(trip_id)
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found.")
    return trip
