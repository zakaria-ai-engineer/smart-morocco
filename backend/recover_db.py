"""
recover_db.py — Smart Morocco Database Recovery Script
=======================================================
Reads the actual .jpg filenames from backend/static/images/,
then rebuilds the MongoDB 'cities', 'trips', AND 'media' collections.

Run once from the backend/ directory:
    python recover_db.py
"""

import asyncio
import os
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv()

MONGODB_URI = os.getenv("MONGODB_URI",     "mongodb://localhost:27017")
DB_NAME     = os.getenv("MONGODB_DB_NAME", "smart_morocco")

# ── Known metadata for each city slug ────────────────────────────────────────
CITY_META: dict[str, dict] = {
    "marrakech":   {"name": "Marrakech",   "region": "Marrakech-Safi",             "category": "city",     "coordinates": {"lat": 31.6295, "lng": -7.9811}, "description": "Historic red city full of culture, souks, and iconic Jemaa el-Fna square.",         "highlights": ["Medina", "Jemaa el-Fna", "Majorelle Garden"]},
    "casablanca":  {"name": "Casablanca",  "region": "Casablanca-Settat",          "category": "city",     "coordinates": {"lat": 33.5731, "lng": -7.5898}, "description": "Economic heart with modern architecture and the iconic Hassan II Mosque.",          "highlights": ["Hassan II Mosque", "Corniche", "Old Medina"]},
    "rabat":       {"name": "Rabat",       "region": "Rabat-Salé-Kénitra",         "category": "city",     "coordinates": {"lat": 34.0209, "lng": -6.8416}, "description": "Elegant capital city by the ocean with UNESCO-listed medina.",                      "highlights": ["Kasbah des Oudaias", "Tour Hassan", "Chellah"]},
    "fes":         {"name": "Fes",         "region": "Fès-Meknès",                 "category": "city",     "coordinates": {"lat": 34.0181, "lng": -5.0078}, "description": "Spiritual and cultural center — home to the world's oldest university.",           "highlights": ["Chouara Tannery", "Al-Qarawiyyin", "Bou Inania Madrasa"]},
    "chefchaouen": {"name": "Chefchaouen", "region": "Tanger-Tétouan-Al Hoceïma", "category": "mountains","coordinates": {"lat": 35.1714, "lng": -5.2697}, "description": "Blue-washed mountain lanes in the Rif. Morocco's most photogenic city.",            "highlights": ["Blue Medina", "Ras el-Maa Waterfall", "Rif Mountains"]},
    "agadir":      {"name": "Agadir",      "region": "Souss-Massa",                "category": "beach",    "coordinates": {"lat": 30.4278, "lng": -9.5981}, "description": "Sunny Atlantic resort city with long beach promenade and warm winters.",            "highlights": ["Agadir Beach", "Souk El Had", "Crocoparc"]},
    "essaouira":   {"name": "Essaouira",   "region": "Marrakech-Safi",             "category": "beach",    "coordinates": {"lat": 31.5085, "lng": -9.7595}, "description": "Coastal town with historic ramparts, fresh seafood, and a windy beach.",            "highlights": ["Ramparts", "Port", "Windy Beach"]},
    "merzouga":    {"name": "Merzouga",    "region": "Drâa-Tafilalet",             "category": "desert",   "coordinates": {"lat": 31.0967, "lng": -4.0118}, "description": "Erg Chebbi dunes, camel treks, and unforgettable desert camps.",                   "highlights": ["Erg Chebbi", "Camel Trek", "Desert Camp"]},
    "ouarzazate":  {"name": "Ouarzazate",  "region": "Drâa-Tafilalet",             "category": "desert",   "coordinates": {"lat": 30.9189, "lng": -6.8934}, "description": "Gateway to the desert and cinema capital of Morocco.",                             "highlights": ["Aït Benhaddou", "Atlas Studios", "Draa Valley"]},
    "tangier":     {"name": "Tangier",     "region": "Tanger-Tétouan-Al Hoceïma", "category": "city",     "coordinates": {"lat": 35.7595, "lng": -5.8340}, "description": "Gateway to Africa with coastal charm, cafes, and a storied history.",              "highlights": ["Kasbah", "Cap Spartel", "Grand Socco"]},
    "el-jadida":   {"name": "El Jadida",   "region": "Casablanca-Settat",          "category": "beach",    "coordinates": {"lat": 33.2316, "lng": -8.5007}, "description": "Seaside heritage with Portuguese flair and a stunning cistern.",                   "highlights": ["Portuguese Cistern", "Cité Portugaise", "Beach"]},
    "ifrane":      {"name": "Ifrane",      "region": "Fès-Meknès",                 "category": "mountains","coordinates": {"lat": 33.5228, "lng": -5.1081}, "description": "Switzerland of Morocco — alpine climate, cedar forests, and ski resort nearby.",    "highlights": ["Cedar Forest", "Lion Statue", "Skiing at Mischliffen"]},
    "tetouan":     {"name": "Tetouan",     "region": "Tanger-Tétouan-Al Hoceïma", "category": "city",     "coordinates": {"lat": 35.5889, "lng": -5.3626}, "description": "Andalusian-influenced city with a UNESCO-listed medina.",                          "highlights": ["UNESCO Medina", "Royal Palace", "Andalusian Quarter"]},
    "al-hoceima":  {"name": "Al Hoceima",  "region": "Tanger-Tétouan-Al Hoceïma", "category": "beach",    "coordinates": {"lat": 35.2517, "lng": -3.9372}, "description": "Mediterranean jewel with crystal-clear waters and dramatic cliffs.",                "highlights": ["Quemado Beach", "National Park", "Rif Mountains"]},
    "asilah":      {"name": "Asilah",      "region": "Tanger-Tétouan-Al Hoceïma", "category": "beach",    "coordinates": {"lat": 35.4656, "lng": -6.0345}, "description": "Charming whitewashed Atlantic town famous for its murals and artistic spirit.",    "highlights": ["Ramparts", "Medina Murals", "Paradise Beach"]},
    "dakhla":      {"name": "Dakhla",      "region": "Dakhla-Oued Ed Dahab",       "category": "beach",    "coordinates": {"lat": 23.7136, "lng": -15.9355},"description": "Lagoon paradise for kitesurfing, fishing, and stunning sunsets.",                 "highlights": ["Dakhla Lagoon", "Kitesurfing", "White Dunes"]},
    "safi":        {"name": "Safi",        "region": "Marrakech-Safi",             "category": "city",     "coordinates": {"lat": 32.2994, "lng": -9.2372}, "description": "Historic port city famous for its ceramics and the Ksar el Bahr fortress.",       "highlights": ["Ksar el Bahr", "Pottery Quarter", "Medina"]},
    "tafraoute":   {"name": "Tafraoute",   "region": "Souss-Massa",                "category": "mountains","coordinates": {"lat": 29.7178, "lng": -8.9758}, "description": "Hidden gem in the Anti-Atlas with painted rocks and almond blossoms.",              "highlights": ["Painted Rocks", "Ameln Valley", "Almond Orchards"]},
    "taroudant":   {"name": "Taroudant",   "region": "Souss-Massa",                "category": "city",     "coordinates": {"lat": 30.4710, "lng": -8.8770}, "description": "The grandmother of Marrakech — intact ramparts, orange groves, and souks.",        "highlights": ["City Ramparts", "Souk Arabe", "Tioute Oasis"]},
    "zagora":      {"name": "Zagora",      "region": "Drâa-Tafilalet",             "category": "desert",   "coordinates": {"lat": 30.3268, "lng": -5.8388}, "description": "Gateway to the Draa Valley palmeraie and the deep Moroccan Sahara.",              "highlights": ["Draa Valley", "Timbuktu Sign", "Desert Camps"]},
}

SEED_TRIPS = [
    {"title": "Sahara Desert Expedition",      "city": "Merzouga",    "price": 2890, "duration": 3, "tags": ["desert", "nature"],  "image": "/static/images/merzouga.jpg",    "description": "Erg Chebbi dunes with a camp night, sunset camel ride, and Berber hospitality.", "difficulty": "moderate"},
    {"title": "Agadir Beach Getaway",           "city": "Agadir",      "price": 2100, "duration": 4, "tags": ["beach", "nature"],   "image": "/static/images/agadir.jpg",      "description": "Atlantic breeze, promenade cafés, and optional surf or boat outings.", "difficulty": "easy"},
    {"title": "Marrakech Cultural Immersion",   "city": "Marrakech",   "price": 1950, "duration": 3, "tags": ["culture"],           "image": "/static/images/marrakech.jpg",   "description": "Medina craftsmanship, palaces, gardens, and the rhythm of Jemaa el-Fna.", "difficulty": "easy"},
    {"title": "Chefchaouen Blue City Trek",     "city": "Chefchaouen", "price": 1650, "duration": 2, "tags": ["nature", "culture"], "image": "/static/images/chefchaouen.jpg", "description": "Rif mountain trails, blue-washed alleys, and waterfall hikes nearby.", "difficulty": "moderate"},
    {"title": "Fes Heritage & Craft Tour",      "city": "Fes",         "price": 2200, "duration": 3, "tags": ["culture"],           "image": "/static/images/fes.jpg",         "description": "Explore the tanneries, madrasa, and artisan districts of Morocco's oldest city.", "difficulty": "easy"},
    {"title": "Essaouira Coastal Escape",       "city": "Essaouira",   "price": 1800, "duration": 2, "tags": ["beach", "culture"],  "image": "/static/images/essaouira.jpg",   "description": "Windswept ramparts, fresh seafood, and sunset walks by the Atlantic.", "difficulty": "easy"},
    {"title": "Ouarzazate & Kasbahs Road Trip", "city": "Ouarzazate",  "price": 3200, "duration": 4, "tags": ["desert", "culture"], "image": "/static/images/ouarzazate.jpg",  "description": "Visit Aït Benhaddou, Atlas Studios, and the dramatic Draa Valley.", "difficulty": "moderate"},
    {"title": "Casablanca City Weekend",        "city": "Casablanca",  "price": 1700, "duration": 2, "tags": ["culture"],           "image": "/static/images/casablanca.jpg",  "description": "Hassan II Mosque, the Corniche, and modern Moroccan dining.", "difficulty": "easy"},
    {"title": "Tangier Gateway Experience",     "city": "Tangier",     "price": 2000, "duration": 2, "tags": ["culture", "beach"],  "image": "/static/images/tangier.jpg",     "description": "The Kasbah, Cap Spartel lighthouse, and legendary café culture.", "difficulty": "easy"},
    {"title": "Rabat Capital Discovery",        "city": "Rabat",       "price": 1600, "duration": 2, "tags": ["culture"],           "image": "/static/images/rabat.jpg",       "description": "Kasbah des Oudaias, Tour Hassan, and the royal capital's elegant streets.", "difficulty": "easy"},
]


async def recover():
    script_dir = Path(__file__).resolve().parent
    images_dir = script_dir / "static" / "images"

    if not images_dir.exists():
        print(f"❌  Folder not found: {images_dir}")
        return

    jpg_files = sorted(p for p in images_dir.iterdir() if p.suffix.lower() == ".jpg")
    print(f"📁  Found {len(jpg_files)} image(s) in {images_dir}\n")

    client = AsyncIOMotorClient(MONGODB_URI)
    db = client[DB_NAME]

    cities_col    = db["cities"]
    trips_col     = db["trips"]
    media_col     = db["media"]
    users_col     = db["users"]
    favorites_col = db["favorites"]

    # ── Rebuild cities ────────────────────────────────────────────────────────
    await cities_col.drop()
    print("🗑️   Dropped 'cities' collection.")
    city_docs = []
    for jpg in jpg_files:
        slug = jpg.stem
        meta = CITY_META.get(slug, {})
        fallback = " ".join(w.capitalize() for w in slug.replace("-", " ").split())
        city_docs.append({
            "slug":        slug,
            "name":        meta.get("name", fallback),
            "region":      meta.get("region", "Morocco"),
            "description": meta.get("description", "A beautiful destination in Morocco."),
            "image":       f"/static/images/{jpg.name}",
            "coordinates": meta.get("coordinates", {"lat": 31.7917, "lng": -7.0926}),
            "category":    meta.get("category", "city"),
            "highlights":  meta.get("highlights", []),
        })
        print(f"  ✅  {meta.get('name', fallback):20s}  →  /static/images/{jpg.name}")
    await cities_col.insert_many(city_docs)
    print(f"\n✅  Inserted {len(city_docs)} city docs.\n")

    # ── Rebuild media ─────────────────────────────────────────────────────────
    await media_col.drop()
    print("🗑️   Dropped 'media' collection.")
    media_docs = []
    for jpg in jpg_files:
        slug = jpg.stem
        meta = CITY_META.get(slug, {})
        fallback = " ".join(w.capitalize() for w in slug.replace("-", " ").split())
        city_name = meta.get("name", fallback)
        media_docs.append({
            "title":    f"{city_name} Landscapes",
            "type":     "image",
            "url":      f"/static/images/{jpg.name}",
            "category": slug,
            "tags":     ["travel", "morocco"],
        })
    await media_col.insert_many(media_docs)
    await media_col.create_index([("type", 1), ("category", 1)])
    print(f"✅  Inserted {len(media_docs)} media docs.\n")

    # ── Rebuild trips ─────────────────────────────────────────────────────────
    await trips_col.drop()
    print("🗑️   Dropped 'trips' collection.")
    await trips_col.insert_many([dict(t) for t in SEED_TRIPS])
    print(f"✅  Inserted {len(SEED_TRIPS)} trip docs.\n")

    # ── Indexes ───────────────────────────────────────────────────────────────
    await users_col.create_index("email", unique=True)
    await favorites_col.create_index([("user_id", 1), ("trip_id", 1)], unique=True)
    print("✅  Indexes verified.\n")

    client.close()
    print("🎉  Recovery complete! Restart your backend to serve the new data.")


if __name__ == "__main__":
    asyncio.run(recover())
