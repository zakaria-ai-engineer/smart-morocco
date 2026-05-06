"""FastAPI application entrypoint."""

import logging
from contextlib import asynccontextmanager
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.database.connection import close_mongodb, startup_database
from app.database.mongo_seed import seed_collections_if_empty
from app.routes import ai, auth, bookings, cities, favorites, media, reviews, rooms, trips, users, places, group_trips

logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    app.state.mongodb_connected = False
    app.state.mongodb_error = None

    try:
        ok, err = await startup_database()
        if ok:
            app.state.mongodb_connected = True
            try:
                from app.database.connection import get_database
                await seed_collections_if_empty(get_database())
                logger.info("MongoDB seed check finished.")
            except Exception as exc:
                logger.exception("MongoDB seed failed after a successful ping")
                app.state.mongodb_seed_error = f"{type(exc).__name__}: {exc}"
        else:
            app.state.mongodb_error = err
            logger.error(f"MongoDB not initialized: {err}")
    except Exception as e:
        logger.error(f"Error during startup: {e}", exc_info=True)

    yield

    try:
        await close_mongodb()
    except Exception as e:
        logger.error(f"Error during shutdown: {e}", exc_info=True)
    finally:
        app.state.mongodb_connected = False


app = FastAPI(
    title="Smart Morocco Travel API",
    description="Travel planning and AI-assisted recommendations for Morocco.",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(cities.router, prefix="/cities", tags=["cities"])
app.include_router(trips.router, prefix="/trips", tags=["trips"])
app.include_router(ai.router, prefix="/ai", tags=["ai"])
app.include_router(auth.router, prefix="/auth", tags=["auth"])
app.include_router(favorites.router, prefix="/favorites", tags=["favorites"])
app.include_router(bookings.router, prefix="/bookings", tags=["bookings"])
app.include_router(reviews.router, prefix="/reviews", tags=["reviews"])
app.include_router(users.router, prefix="/users", tags=["users"])
app.include_router(rooms.router, prefix="/rooms", tags=["rooms"])
app.include_router(places.router, prefix="/places", tags=["places"])
app.include_router(media.router, prefix="/media", tags=["media"])
app.include_router(group_trips.router, prefix="/group-trips", tags=["group-trips"])

_static_dir = Path(__file__).resolve().parents[1] / "static"
_static_dir.mkdir(parents=True, exist_ok=True)
app.mount("/static", StaticFiles(directory=str(_static_dir)), name="static")


@app.get("/health", tags=["health"])
async def health(request: Request) -> dict[str, str | bool]:
    """Liveness plus MongoDB readiness (set during lifespan)."""
    return {
        "status": "ok",
        "mongodb": getattr(request.app.state, "mongodb_connected", False),
    }

if __name__ == "__main__":
    import uvicorn
    # Port 8001 matches VITE_API_BASE_URL=http://localhost:8001 in frontend/.env
    uvicorn.run("app.main:app", host="127.0.0.1", port=8001, reload=True)