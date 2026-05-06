"""City schemas."""

from pydantic import BaseModel, Field, field_validator, ConfigDict


class Location(BaseModel):
    lat: float = 31.7917
    lng: float = -7.0926


class CityRead(BaseModel):
    model_config = ConfigDict(populate_by_name=True)

    id: str = Field(..., description="MongoDB ObjectId as string")
    slug: str = Field(..., examples=["marrakech"])
    name: str = Field(..., examples=["Marrakech"])
    region: str = Field(default="Morocco", examples=["Marrakech-Safi"])
    description: str = Field(default="A beautiful Moroccan destination.")
    image: str = Field(default="/static/images/default.jpg")
    images: list[str] = Field(default_factory=list)
    coordinates: Location = Field(default_factory=lambda: Location(lat=31.7917, lng=-7.0926))
    category: str = Field(default="city")
    highlights: list[str] = Field(default_factory=list)

    @classmethod
    def model_validate(cls, obj, *args, **kwargs):
        """Map 'location' -> 'coordinates' for backward compatibility with seed data."""
        if isinstance(obj, dict) and "coordinates" not in obj and "location" in obj:
            obj = dict(obj)
            obj["coordinates"] = obj.pop("location")
        return super().model_validate(obj, *args, **kwargs)

    @field_validator('image', mode='before')
    @classmethod
    def set_default_image(cls, v):
        if not v:
            return "/static/images/default.jpg"
        return v

    @field_validator('images', mode='before')
    @classmethod
    def set_default_images(cls, v):
        if not v or not isinstance(v, list):
            return []
        return [img if img else "/static/images/default.jpg" for img in v]

    @field_validator('coordinates', mode='before')
    @classmethod
    def coerce_coordinates(cls, v):
        """Accept both Location objects and raw dicts."""
        if v is None:
            return {"lat": 31.7917, "lng": -7.0926}
        return v
