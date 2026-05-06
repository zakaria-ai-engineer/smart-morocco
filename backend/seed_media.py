"""
seed_media.py
=============
Run from the backend folder:
    python seed_media.py

What it does:
  1. Connects to MongoDB.
  2. Drops the existing 'media' collection to clear old broken links.
  3. Inserts 20 clean media documents mapping to the 20 newly downloaded city images.
"""

import os
import sys
import datetime
from pymongo import MongoClient

# Configure from environment variables (matches backend/.env)
MONGODB_URI = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB  = os.getenv("MONGODB_DB_NAME", "travel")

CITIES_DATA = [
    {"slug": "marrakech",   "name": "Marrakech",   "tags": ["city", "medina", "travel", "culture"]},
    {"slug": "fes",         "name": "Fes",         "tags": ["city", "history", "travel", "culture"]},
    {"slug": "chefchaouen", "name": "Chefchaouen", "tags": ["mountains", "blue city", "travel"]},
    {"slug": "agadir",      "name": "Agadir",      "tags": ["beach", "resort", "travel", "ocean"]},
    {"slug": "merzouga",    "name": "Merzouga",    "tags": ["desert", "dunes", "sahara", "travel"]},
    {"slug": "essaouira",   "name": "Essaouira",   "tags": ["beach", "medina", "travel", "culture"]},
    {"slug": "rabat",       "name": "Rabat",       "tags": ["city", "capital", "travel", "history"]},
    {"slug": "casablanca",  "name": "Casablanca",  "tags": ["city", "modern", "travel", "coast"]},
    {"slug": "tangier",     "name": "Tangier",     "tags": ["city", "coast", "travel", "mediterranean"]},
    {"slug": "ouarzazate",  "name": "Ouarzazate",  "tags": ["desert", "kasbah", "travel", "cinema"]},
    {"slug": "dakhla",      "name": "Dakhla",      "tags": ["beach", "desert", "travel", "lagoon"]},
    {"slug": "ifrane",      "name": "Ifrane",      "tags": ["mountains", "nature", "travel", "forest"]},
    {"slug": "tetouan",     "name": "Tetouan",     "tags": ["city", "culture", "travel", "history"]},
    {"slug": "asilah",      "name": "Asilah",      "tags": ["beach", "art", "travel", "coast"]},
    {"slug": "taroudant",   "name": "Taroudant",   "tags": ["city", "history", "travel", "walls"]},
    {"slug": "zagora",      "name": "Zagora",      "tags": ["desert", "oasis", "travel", "sahara"]},
    {"slug": "al-hoceima",  "name": "Al Hoceima",  "tags": ["beach", "mediterranean", "travel", "nature"]},
    {"slug": "tafraoute",   "name": "Tafraoute",   "tags": ["mountains", "nature", "travel", "rocks"]},
    {"slug": "el-jadida",   "name": "El Jadida",   "tags": ["beach", "history", "travel", "coast"]},
    {"slug": "safi",        "name": "Safi",        "tags": ["city", "coast", "travel", "pottery"]}
]

def main():
    # Force UTF-8 output on Windows terminals
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

    print("\n🇲🇦  Smart Morocco — Media Seeder")
    print("    " + "─" * 40)
    print(f"  URI : {MONGODB_URI}")
    print(f"  DB  : {MONGODB_DB}\n")

    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=5000)
        client.admin.command("ping")
        print("  ✅ Connected to MongoDB.")
    except Exception as exc:
        print(f"  ❌ Cannot connect to MongoDB: {exc}")
        sys.exit(1)

    db = client[MONGODB_DB]
    media_col = db["media"]

    # 1. Drop the existing collection
    media_col.drop()
    print("  🗑  Dropped existing 'media' collection.")

    # 2. Prepare 20 new documents
    docs = []
    now = datetime.datetime.now(datetime.timezone.utc)
    
    for city in CITIES_DATA:
        docs.append({
            "title": f"{city['name']} Cityscape",
            "type": "image",
            "url": f"/static/images/{city['slug']}.jpg",
            "category": city['slug'],
            "tags": city['tags'],
            "created_at": now
        })

    # 3. Insert into MongoDB
    if docs:
        result = media_col.insert_many(docs)
        print(f"  ✅ Inserted {len(result.inserted_ids)} new media documents.")
    
    # 4. Verify & Index
    count = media_col.count_documents({})
    print(f"  🔍 Verification: {count} total documents in 'media'.")
    
    # Recreate the compound index for fast lookups (matches main backend logic)
    media_col.create_index([("type", 1), ("category", 1), ("created_at", -1)])
    print("  ✅ Indexes recreated.")

    client.close()
    print("\n  🎉 Media seeding complete. You can now restart your backend.")

if __name__ == "__main__":
    main()
