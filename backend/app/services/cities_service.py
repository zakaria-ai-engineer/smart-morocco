"""Cities service."""

from app.database.repositories import CityRepository
from app.schemas.city import CityRead


class CitiesService:
    def __init__(self, city_repo: CityRepository | None = None) -> None:
        self._cities = city_repo or CityRepository()

    async def list_cities(self) -> list[CityRead]:
        return await self._cities.list_all()

    async def get_city(self, city_id: str) -> CityRead | None:
        return await self._cities.get_by_id(city_id)

