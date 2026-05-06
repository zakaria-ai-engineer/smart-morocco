"""City routes."""

from fastapi import APIRouter, Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.deps import get_mongo_db
from app.schemas.city import CityRead
from app.schemas.common import StandardResponse
from app.services.cities_service import CitiesService

router = APIRouter()
_service = CitiesService()


@router.get("", response_model=StandardResponse[list[CityRead]])
async def list_cities(_: AsyncIOMotorDatabase = Depends(get_mongo_db)) -> StandardResponse[list[CityRead]]:
    try:
        data = await _service.list_cities()
        if not data:
            return StandardResponse(success=True, source="fallback", data=[])
        return StandardResponse(success=True, source="mongodb", data=data)
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=500, detail=f"Unexpected error: {type(exc).__name__}") from exc


@router.get("/{city_id}", response_model=CityRead)
async def get_city(city_id: str, _: AsyncIOMotorDatabase = Depends(get_mongo_db)) -> CityRead:
    city = await _service.get_city(city_id)
    if city is None:
        raise HTTPException(status_code=404, detail="City not found.")
    return city
