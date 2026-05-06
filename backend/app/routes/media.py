from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.schemas.media import Media
from app.database.deps import get_mongo_db

router = APIRouter()

@router.get("/", response_model=list[Media])
async def get_all_media(db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    """Return all image-type media documents (all 20 cities)."""
    collection = db["media"]
    cursor = collection.find({"type": "image"})
    results = await cursor.to_list(length=100)
    return [Media(**doc) for doc in results]

@router.get("/category/{category}", response_model=list[Media])
async def get_media_by_category(category: str, db: AsyncIOMotorDatabase = Depends(get_mongo_db)):
    collection = db["media"]
    cursor = collection.find({"category": category.lower()})
    results = await cursor.to_list(length=100)

    if not results:
        return [
            Media(title=f"{category.title()} Image", type="image", url="/static/images/default.jpg", category=category)
        ]

    return [Media(**doc) for doc in results]

