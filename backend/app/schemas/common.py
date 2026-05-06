from typing import Any, Generic, TypeVar, List
from pydantic import BaseModel

T = TypeVar("T")

class StandardResponse(BaseModel, Generic[T]):
    success: bool = True
    source: str
    data: T
