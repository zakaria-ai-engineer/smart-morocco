from typing import Optional
from pydantic import BaseModel

class Media(BaseModel):
    title: str
    type: str
    url: str
    category: Optional[str] = None
