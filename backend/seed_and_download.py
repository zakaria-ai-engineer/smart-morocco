"""
seed_and_download.py
====================
Run from the backend folder:
    python seed_and_download.py

What it does:
  1. Creates backend/static/images/ if it does not exist.
  2. Downloads a default fallback image  → static/images/default.jpg
  3. Downloads 20 unique Moroccan city images → static/images/<slug>.jpg
     (uses loremflickr.com with city + "morocco" keywords, follows redirects)
  4. Drops the existing 'cities' collection in MongoDB.
  5. Re-inserts 20 fully-populated city documents.

Requirements:
    pip install pymongo requests
"""

import os
import sys
import pathlib
import time
import requests
from pymongo import MongoClient

# ─────────────────────────────────────────────
# CONFIG  (reads from env, falls back to .env defaults)
# ─────────────────────────────────────────────
MONGODB_URI    = os.getenv("MONGODB_URI", "mongodb://localhost:27017")
MONGODB_DB     = os.getenv("MONGODB_DB_NAME", "travel")

SCRIPT_DIR     = pathlib.Path(__file__).resolve().parent
STATIC_DIR     = SCRIPT_DIR / "static" / "images"

# ─────────────────────────────────────────────
# CITY DATA  — 20 cities, fully populated
# ─────────────────────────────────────────────
CITIES = [
    {
        "slug":        "marrakech",
        "name":        "Marrakech",
        "region":      "Marrakech-Safi",
        "description": "The Red City — a labyrinth of souks, riads, and the iconic Jemaa el-Fna square.",
        "coordinates": {"lat": 31.6295, "lng": -7.9811},
        "category":    "city",
        "highlights":  ["Jemaa el-Fna", "Majorelle Garden", "Medina"],
    },
    {
        "slug":        "fes",
        "name":        "Fes",
        "region":      "Fès-Meknès",
        "description": "Spiritual and cultural heart of Morocco, home to the world's oldest university.",
        "coordinates": {"lat": 34.0181, "lng": -5.0078},
        "category":    "city",
        "highlights":  ["Chouara Tannery", "Al-Qarawiyyin", "Bou Inania Madrasa"],
    },
    {
        "slug":        "chefchaouen",
        "name":        "Chefchaouen",
        "region":      "Tanger-Tétouan-Al Hoceïma",
        "description": "The Blue Pearl of Morocco — mountain lanes washed in blue and white.",
        "coordinates": {"lat": 35.1714, "lng": -5.2697},
        "category":    "mountains",
        "highlights":  ["Blue Medina", "Ras el-Maa Waterfall", "Rif Mountains"],
    },
    {
        "slug":        "agadir",
        "name":        "Agadir",
        "region":      "Souss-Massa",
        "description": "Morocco's premier beach resort with a golden Atlantic promenade and warm winters.",
        "coordinates": {"lat": 30.4278, "lng": -9.5981},
        "category":    "beach",
        "highlights":  ["Agadir Beach", "Souk El Had", "Crocoparc"],
    },
    {
        "slug":        "merzouga",
        "name":        "Merzouga",
        "region":      "Drâa-Tafilalet",
        "description": "Gateway to Erg Chebbi — camel treks, desert camps, and Milky Way skies.",
        "coordinates": {"lat": 31.0967, "lng": -4.0118},
        "category":    "desert",
        "highlights":  ["Erg Chebbi Dunes", "Camel Trek", "Desert Camp"],
    },
    {
        "slug":        "essaouira",
        "name":        "Essaouira",
        "region":      "Marrakech-Safi",
        "description": "Wind-swept Atlantic ramparts, fresh seafood, and a thriving arts scene.",
        "coordinates": {"lat": 31.5085, "lng": -9.7595},
        "category":    "beach",
        "highlights":  ["Skala Ramparts", "Fish Port", "Gnaoua Festival"],
    },
    {
        "slug":        "rabat",
        "name":        "Rabat",
        "region":      "Rabat-Salé-Kénitra",
        "description": "Morocco's elegant capital — UNESCO medina, royal palaces, and ocean views.",
        "coordinates": {"lat": 34.0209, "lng": -6.8416},
        "category":    "city",
        "highlights":  ["Kasbah des Oudaias", "Tour Hassan", "Chellah"],
    },
    {
        "slug":        "casablanca",
        "name":        "Casablanca",
        "region":      "Casablanca-Settat",
        "description": "Economic powerhouse with the magnificent Hassan II Mosque and modern skyline.",
        "coordinates": {"lat": 33.5731, "lng": -7.5898},
        "category":    "city",
        "highlights":  ["Hassan II Mosque", "Corniche", "Old Medina"],
    },
    {
        "slug":        "tangier",
        "name":        "Tangier",
        "region":      "Tanger-Tétouan-Al Hoceïma",
        "description": "Where Africa meets Europe — a port city of cafés, art, and history.",
        "coordinates": {"lat": 35.7595, "lng": -5.8340},
        "category":    "city",
        "highlights":  ["Kasbah", "Cap Spartel", "Grand Socco"],
    },
    {
        "slug":        "ouarzazate",
        "name":        "Ouarzazate",
        "region":      "Drâa-Tafilalet",
        "description": "The door to the desert and Morocco's Hollywood — Aït Benhaddou awaits.",
        "coordinates": {"lat": 30.9189, "lng": -6.8934},
        "category":    "desert",
        "highlights":  ["Aït Benhaddou", "Atlas Studios", "Draa Valley"],
    },
    {
        "slug":        "dakhla",
        "name":        "Dakhla",
        "region":      "Dakhla-Oued Ed Dahab",
        "description": "Lagoon paradise — world-class kitesurfing, white dunes, and Atlantic sunsets.",
        "coordinates": {"lat": 23.7136, "lng": -15.9355},
        "category":    "beach",
        "highlights":  ["Dakhla Lagoon", "Kitesurfing", "White Dunes"],
    },
    {
        "slug":        "ifrane",
        "name":        "Ifrane",
        "region":      "Fès-Meknès",
        "description": "Switzerland of Morocco — alpine chalets, cedar forests, and Barbary macaques.",
        "coordinates": {"lat": 33.5228, "lng": -5.1081},
        "category":    "mountains",
        "highlights":  ["Cedar Forest", "Lion Statue", "Mischliffen Ski Resort"],
    },
    {
        "slug":        "tetouan",
        "name":        "Tetouan",
        "region":      "Tanger-Tétouan-Al Hoceïma",
        "description": "Andalusian jewel with a UNESCO medina and whitewashed streets.",
        "coordinates": {"lat": 35.5889, "lng": -5.3626},
        "category":    "city",
        "highlights":  ["UNESCO Medina", "Royal Palace", "Andalusian Quarter"],
    },
    {
        "slug":        "asilah",
        "name":        "Asilah",
        "region":      "Tanger-Tétouan-Al Hoceïma",
        "description": "Tiny Atlantic gem known for murals, pristine beaches, and Portuguese ramparts.",
        "coordinates": {"lat": 35.4651, "lng": -6.0340},
        "category":    "beach",
        "highlights":  ["Ramparts", "Street Art Festival", "Paradise Beach"],
    },
    {
        "slug":        "taroudant",
        "name":        "Taroudant",
        "region":      "Souss-Massa",
        "description": "Little Marrakech — ocher walls encircling a tranquil souk and argan groves.",
        "coordinates": {"lat": 30.4704, "lng": -8.8768},
        "category":    "city",
        "highlights":  ["City Walls", "Talborjt Square", "Souk"],
    },
    {
        "slug":        "zagora",
        "name":        "Zagora",
        "region":      "Drâa-Tafilalet",
        "description": "Oasis town on the Draa River — the southern gateway to the Moroccan Sahara.",
        "coordinates": {"lat": 30.3267, "lng": -5.8380},
        "category":    "desert",
        "highlights":  ["Draa Valley", "Timbuktu Sign", "Dunes de Tinfou"],
    },
    {
        "slug":        "al-hoceima",
        "name":        "Al Hoceima",
        "region":      "Tanger-Tétouan-Al Hoceïma",
        "description": "Hidden Mediterranean gem with crystal-clear bays and Rif mountain backdrop.",
        "coordinates": {"lat": 35.2518, "lng": -3.9372},
        "category":    "beach",
        "highlights":  ["Quemado Beach", "Cala Iris", "Al Hoceima National Park"],
    },
    {
        "slug":        "tafraoute",
        "name":        "Tafraoute",
        "region":      "Souss-Massa",
        "description": "Pink granite boulders and almond orchards deep in the Anti-Atlas mountains.",
        "coordinates": {"lat": 29.7167, "lng": -8.9667},
        "category":    "mountains",
        "highlights":  ["Painted Rocks", "Almond Festival", "Agard Oudad Rock"],
    },
    {
        "slug":        "el-jadida",
        "name":        "El Jadida",
        "region":      "Casablanca-Settat",
        "description": "Seaside heritage city with a stunning UNESCO Portuguese cistern.",
        "coordinates": {"lat": 33.2316, "lng": -8.5007},
        "category":    "beach",
        "highlights":  ["Portuguese Cistern", "Cité Portugaise", "El Jadida Beach"],
    },
    {
        "slug":        "safi",
        "name":        "Safi",
        "region":      "Marrakech-Safi",
        "description": "Sardine capital and pottery hub — dramatic Atlantic cliffs and a 16th-century kasbah.",
        "coordinates": {"lat": 32.2994, "lng": -9.2372},
        "category":    "city",
        "highlights":  ["Kechla Kasbah", "Pottery Hill", "Atlantic Cliffs"],
    },
]

# loremflickr returns a real photo tagged with the keywords
def _loremflickr_url(slug: str) -> str:
    # Use city name (decoded slug) + morocco as keyword
    keyword = slug.replace("-", "+") + ",morocco"
    return f"https://loremflickr.com/800/600/{keyword}"

DEFAULT_IMAGE_URL = "https://loremflickr.com/800/600/morocco,landscape"


# ─────────────────────────────────────────────
# HELPERS
# ─────────────────────────────────────────────
def download_image(url: str, dest: pathlib.Path, label: str) -> bool:
    """Download *url* to *dest*. Returns True on success."""
    try:
        resp = requests.get(url, timeout=20, allow_redirects=True)
        resp.raise_for_status()
        content_type = resp.headers.get("Content-Type", "")
        if "image" not in content_type:
            print(f"  ⚠  {label}: unexpected content-type '{content_type}' — skipping")
            return False
        dest.write_bytes(resp.content)
        size_kb = len(resp.content) // 1024
        print(f"  ✅ {label} → {dest.name}  ({size_kb} KB)")
        return True
    except Exception as exc:
        print(f"  ❌ {label}: {exc}")
        return False


def build_city_doc(city: dict) -> dict:
    return {
        "slug":        city["slug"],
        "name":        city["name"],
        "region":      city["region"],
        "description": city["description"],
        "image":       f"/static/images/{city['slug']}.jpg",
        "images":      [f"/static/images/{city['slug']}.jpg"],
        "coordinates": city["coordinates"],
        "category":    city["category"],
        "highlights":  city.get("highlights", []),
    }


# ─────────────────────────────────────────────
# STEP 1 — DOWNLOAD IMAGES
# ─────────────────────────────────────────────
def step1_download_images() -> None:
    print("\n" + "═" * 55)
    print("  STEP 1 — Downloading Images")
    print("═" * 55)

    STATIC_DIR.mkdir(parents=True, exist_ok=True)
    print(f"  Directory: {STATIC_DIR}\n")

    # Default fallback
    dest = STATIC_DIR / "default.jpg"
    if dest.exists():
        print(f"  ⏭  default.jpg already exists — skipping")
    else:
        download_image(DEFAULT_IMAGE_URL, dest, "default")

    # City images
    failed: list[str] = []
    for city in CITIES:
        slug = city["slug"]
        dest = STATIC_DIR / f"{slug}.jpg"

        if dest.exists() and dest.stat().st_size > 5_000:
            print(f"  ⏭  {slug}.jpg already exists — skipping")
            continue

        url = _loremflickr_url(slug)
        ok = download_image(url, dest, city["name"])
        if not ok:
            failed.append(slug)
        # Be polite to the image service
        time.sleep(0.4)

    if failed:
        print(f"\n  ⚠  Failed to download: {', '.join(failed)}")
        print("     Those cities will use default.jpg as fallback.")
    else:
        print("\n  ✅ All images downloaded successfully.")


# ─────────────────────────────────────────────
# STEP 2 — SEED MONGODB
# ─────────────────────────────────────────────
def step2_seed_mongodb() -> None:
    print("\n" + "═" * 55)
    print("  STEP 2 — Seeding MongoDB")
    print("═" * 55)
    print(f"  URI    : {MONGODB_URI}")
    print(f"  DB     : {MONGODB_DB}\n")

    try:
        client = MongoClient(MONGODB_URI, serverSelectionTimeoutMS=8_000)
        client.admin.command("ping")
        print("  ✅ Connected to MongoDB\n")
    except Exception as exc:
        print(f"  ❌ Cannot connect to MongoDB: {exc}")
        print("     Make sure mongod is running and MONGODB_URI is correct.")
        sys.exit(1)

    db = client[MONGODB_DB]
    col = db["cities"]

    # Drop existing
    col.drop()
    print("  🗑  Dropped existing 'cities' collection.")

    # Build and insert documents
    docs = [build_city_doc(c) for c in CITIES]
    result = col.insert_many(docs)
    print(f"  ✅ Inserted {len(result.inserted_ids)} city documents.\n")

    # Verify
    count = col.count_documents({})
    print(f"  🔍 Verification: {count} documents in 'cities' collection.\n")

    # Print summary table
    print(f"  {'Name':<18} {'Category':<12} {'Region'}")
    print(f"  {'-'*18} {'-'*12} {'-'*28}")
    for doc in col.find({}, {"name": 1, "category": 1, "region": 1, "_id": 0}).sort("name", 1):
        print(f"  {doc['name']:<18} {doc['category']:<12} {doc['region']}")

    client.close()
    print("\n  ✅ MongoDB seeding complete.")


# ─────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────
if __name__ == "__main__":
    print("\n🇲🇦  Smart Morocco — Seed & Image Downloader")
    print("    " + "─" * 50)

    step1_download_images()
    step2_seed_mongodb()

    print("\n" + "=" * 55)
    print("  ALL DONE -- restart the FastAPI server now.")
    print("=" * 55 + "\n")
