"""User profile and preferences schemas."""

from pydantic import BaseModel, Field


class UserProfileUpdateRequest(BaseModel):
    full_name: str | None = Field(default=None, max_length=120)
    phone: str | None = Field(default=None, max_length=40)
    avatar_url: str | None = Field(default=None, max_length=500)


class UserProfileRead(BaseModel):
    id: str
    email: str
    full_name: str | None = None
    phone: str | None = None
    avatar_url: str | None = None


class UserPreferencesRead(BaseModel):
    id: str
    user_id: str
    currency: str = "MAD"
    language: str = "en"
    interests: list[str] = Field(default_factory=list)
