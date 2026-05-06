import asyncio
from motor.motor_asyncio import AsyncIOMotorClient

# Connect to MongoDB
MONGO_URI = "mongodb://localhost:27017"
client = AsyncIOMotorClient(MONGO_URI)
db = client["smart_morocco"]

cities_data = [
    {
        "slug": "marrakech",
        "name": "Marrakech",
        "region": "Marrakech-Safi",
        "description": "Known as the Red City, famous for its bustling medina, souks, and historic palaces.",
        "image": "/static/images/cities/marrakech.jpg",
        "location": {"lat": 31.6295, "lng": -7.9811},
        "category": "city"
    },
    {
        "slug": "casablanca",
        "name": "Casablanca",
        "region": "Casablanca-Settat",
        "description": "Morocco's economic capital, featuring the stunning Hassan II Mosque.",
        "image": "/static/images/cities/casablanca.jpg",
        "location": {"lat": 33.5731, "lng": -7.5898},
        "category": "city"
    },
    {
        "slug": "rabat",
        "name": "Rabat",
        "region": "Rabat-Salé-Kénitra",
        "description": "The capital city, blending Islamic and French-colonial heritage.",
        "image": "/static/images/cities/rabat.jpg",
        "location": {"lat": 34.0209, "lng": -6.8416},
        "category": "city"
    },
    {
        "slug": "fes",
        "name": "Fes",
        "region": "Fès-Meknès",
        "description": "The cultural and spiritual heart of Morocco with the oldest university in the world.",
        "image": "/static/images/cities/fes.jpg",
        "location": {"lat": 34.0181, "lng": -5.0078},
        "category": "city"
    },
    {
        "slug": "chefchaouen",
        "name": "Chefchaouen",
        "region": "Tanger-Tetouan-Al Hoceima",
        "description": "The famous Blue Pearl of Morocco, nestled in the Rif Mountains.",
        "image": "/static/images/cities/chefchaouen.jpg",
        "location": {"lat": 35.1714, "lng": -5.2697},
        "category": "city"
    },
    {
        "slug": "agadir",
        "name": "Agadir",
        "region": "Souss-Massa",
        "description": "A modern resort city renowned for its wide beaches and golf courses.",
        "image": "/static/images/cities/agadir.jpg",
        "location": {"lat": 30.4278, "lng": -9.5981},
        "category": "city"
    },
    {
        "slug": "essaouira",
        "name": "Essaouira",
        "region": "Marrakech-Safi",
        "description": "A charming coastal city known for its strong winds, making it a surfer's paradise.",
        "image": "/static/images/cities/essaouira.jpg",
        "location": {"lat": 31.5085, "lng": -9.7595},
        "category": "city"
    },
    {
        "slug": "merzouga",
        "name": "Merzouga",
        "region": "Drâa-Tafilalet",
        "description": "The gateway to the immense sand dunes of the Sahara Desert.",
        "image": "/static/images/cities/merzouga.jpg",
        "location": {"lat": 31.0994, "lng": -4.0127},
        "category": "city"
    },
    {
        "slug": "ouarzazate",
        "name": "Ouarzazate",
        "region": "Drâa-Tafilalet",
        "description": "The door of the desert and Morocco's Hollywood, home to Atlas Studios.",
        "image": "/static/images/cities/ouarzazate.jpg",
        "location": {"lat": 30.9335, "lng": -6.9370},
        "category": "city"
    },
    {
        "slug": "tangier",
        "name": "Tangier",
        "region": "Tanger-Tetouan-Al Hoceima",
        "description": "A major city in northwestern Morocco, a historic gateway between Africa and Europe.",
        "image": "/static/images/cities/tangier.jpg",
        "location": {"lat": 35.7595, "lng": -5.8340},
        "category": "city"
    },
    {
        "slug": "el-jadida",
        "name": "El Jadida",
        "region": "Casablanca-Settat",
        "description": "A port city with a preserved Portuguese walled city.",
        "image": "/static/images/cities/el_jadida.jpg",
        "location": {"lat": 33.2316, "lng": -8.5007},
        "category": "city"
    }
]

async def seed():
    for doc in cities_data:
        if not doc.get("image"):
            doc["image"] = "/static/images/default.jpg"
        if not doc.get("description"):
            doc["description"] = "A beautiful city in Morocco."
        
        await db.cities.update_one(
            {"slug": doc["slug"]},
            {"$set": doc},
            upsert=True
        )
    print("Database seeded with all required cities.")
    
    # Rename location to coordinates in all documents
    await db.cities.update_many(
        {"location": {"$exists": True}},
        [{"$set": {"coordinates": "$location"}}]
    )
    await db.cities.update_many(
        {"location": {"$exists": True}},
        {"$unset": {"location": ""}}
    )
    
    # Update any existing documents with missing fields
    await db.cities.update_many(
        {"image": {"$exists": False}},
        {"$set": {"image": "/static/images/default.jpg"}}
    )
    await db.cities.update_many(
        {"image": None},
        {"$set": {"image": "/static/images/default.jpg"}}
    )
    await db.cities.update_many(
        {"description": {"$exists": False}},
        {"$set": {"description": "A beautiful place to visit."}}
    )
    await db.cities.update_many(
        {"description": None},
        {"$set": {"description": "A beautiful place to visit."}}
    )
    await db.cities.update_many(
        {"category": {"$exists": False}},
        {"$set": {"category": "city"}}
    )
    await db.cities.update_many(
        {"category": None},
        {"$set": {"category": "city"}}
    )

asyncio.run(seed())
