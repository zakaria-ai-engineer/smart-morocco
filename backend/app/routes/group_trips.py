"""Group Travel Planner — REST CRUD + WebSocket real-time broadcast.

Collections used (auto-created on first write):
  group_trips  — itinerary documents
  group_messages — chat messages
  group_invitations — invite records
"""

from __future__ import annotations

import logging
from datetime import datetime, timezone
from typing import Any

from bson import ObjectId
from fastapi import APIRouter, HTTPException, WebSocket, WebSocketDisconnect, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.connection import get_database

logger = logging.getLogger(__name__)
router = APIRouter()


# ─── Helpers ──────────────────────────────────────────────────────────────────

def _db() -> AsyncIOMotorDatabase:
    return get_database()


def _oid(raw: str) -> ObjectId:
    try:
        return ObjectId(raw)
    except Exception:
        raise HTTPException(status_code=400, detail=f"Invalid id: {raw!r}")


def _serial(doc: dict[str, Any]) -> dict[str, Any]:
    """Convert ObjectId → str recursively."""
    out: dict[str, Any] = {}
    for k, v in doc.items():
        if isinstance(v, ObjectId):
            out[k] = str(v)
        elif isinstance(v, datetime):
            out[k] = v.isoformat()
        elif isinstance(v, dict):
            out[k] = _serial(v)
        elif isinstance(v, list):
            out[k] = [_serial(i) if isinstance(i, dict) else (str(i) if isinstance(i, ObjectId) else i) for i in v]
        else:
            out[k] = v
    return out


def _now() -> datetime:
    return datetime.now(timezone.utc)


# ─── WebSocket connection manager ─────────────────────────────────────────────

class ConnectionManager:
    def __init__(self) -> None:
        self.active_connections: dict[str, list[WebSocket]] = {}

    async def connect(self, trip_id: str, websocket: WebSocket) -> None:
        await websocket.accept()
        self.active_connections.setdefault(trip_id, []).append(websocket)
        logger.info("WS connected trip_id=%s  total=%s", trip_id, len(self.active_connections[trip_id]))

    def disconnect(self, trip_id: str, websocket: WebSocket) -> None:
        room = self.active_connections.get(trip_id, [])
        if websocket in room:
            room.remove(websocket)
        logger.info("WS disconnected trip_id=%s  remaining=%s", trip_id, len(room))

    async def broadcast(self, trip_id: str, message: Any) -> None:
        for conn in self.active_connections.get(trip_id, []):
            try:
                await conn.send_json(message)
            except Exception:
                pass


_manager = ConnectionManager()


# ═══════════════════════════════════════════════════════════════════════════════
# REST — GROUP TRIPS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("")
async def create_group_trip(data: dict) -> dict:
    """Create a new group trip. Body: {title, owner_id}"""
    title = (data.get("title") or "").strip()
    owner_id = (data.get("owner_id") or "anonymous").strip()
    if not title:
        raise HTTPException(status_code=422, detail="title is required")

    doc = {
        "title": title,
        "owner_id": owner_id,
        "members": [owner_id],
        "days": [
            {"id": 1, "title": "Arrival", "activities": []},
            {"id": 2, "title": "Exploration", "activities": []},
            {"id": 3, "title": "Departure", "activities": []}
        ],
        "version": 1,
        "created_at": _now(),
    }
    result = await _db().group_trips.insert_one(doc)
    return {"id": str(result.inserted_id), "title": title}


@router.get("")
async def list_group_trips() -> list[dict]:
    cursor = _db().group_trips.find().sort("created_at", -1).limit(50)
    return [_serial(doc) async for doc in cursor]


@router.get("/{trip_id}")
async def get_group_trip(trip_id: str) -> dict:
    doc = await _db().group_trips.find_one({"_id": _oid(trip_id)})
    if doc is None:
        raise HTTPException(status_code=404, detail="Trip not found")
    return _serial(doc)


@router.put("/{trip_id}/itinerary")
async def update_itinerary(trip_id: str, data: dict) -> dict:
    """Replace the days array with version control. Body: {days: [...], version: int}"""
    days = data.get("days", [])
    incoming_version = data.get("version", 1)

    trip = await _db().group_trips.find_one({"_id": _oid(trip_id)})
    if not trip:
        raise HTTPException(status_code=404, detail="Trip not found")

    db_version = trip.get("version", 1)
    if incoming_version != db_version:
        raise HTTPException(status_code=409, detail="Conflict: version mismatch")

    await _db().group_trips.update_one(
        {"_id": _oid(trip_id)},
        {"$set": {"days": days, "updated_at": _now()}, "$inc": {"version": 1}},
    )
    return {"status": "updated", "version": db_version + 1}


@router.delete("/{trip_id}")
async def delete_group_trip(trip_id: str) -> dict:
    await _db().group_trips.delete_one({"_id": _oid(trip_id)})
    return {"status": "deleted"}


# ═══════════════════════════════════════════════════════════════════════════════
# REST — MESSAGES
# ═══════════════════════════════════════════════════════════════════════════════

@router.get("/{trip_id}/messages")
async def get_messages(trip_id: str) -> list[dict]:
    cursor = _db().group_messages.find({"trip_id": trip_id}).sort("created_at", 1).limit(200)
    return [_serial(doc) async for doc in cursor]


@router.post("/{trip_id}/messages")
async def post_message(trip_id: str, data: dict) -> dict:
    """Body: {text, user, avatar, color}"""
    text = (data.get("text") or "").strip()
    if not text:
        raise HTTPException(status_code=422, detail="text is required")

    doc = {
        "trip_id": trip_id,
        "text": text,
        "user": data.get("user", "Anonymous"),
        "avatar": data.get("avatar", "?"),
        "color": data.get("color", "bg-slate-500"),
        "created_at": _now(),
    }
    result = await _db().group_messages.insert_one(doc)
    serialized = _serial({**doc, "_id": result.inserted_id})

    # Broadcast to room
    await _manager.broadcast(trip_id, {"type": "message", "message": serialized})
    return serialized


# ═══════════════════════════════════════════════════════════════════════════════
# REST — INVITATIONS
# ═══════════════════════════════════════════════════════════════════════════════

@router.post("/invite")
async def invite_friend(data: dict) -> dict:
    """Body: {trip_id, email}"""
    trip_id = (data.get("trip_id") or "").strip()
    email = (data.get("email") or "").strip()
    if not trip_id or not email:
        raise HTTPException(status_code=422, detail="trip_id and email are required")

    trip = await _db().group_trips.find_one({"_id": _oid(trip_id)})
    if trip is None:
        raise HTTPException(status_code=404, detail="Trip not found")

    doc = {
        "trip_id": trip_id,
        "email": email,
        "status": "pending",
        "created_at": _now(),
    }
    result = await _db().group_invitations.insert_one(doc)
    # Return a generated invite link (relative path)
    return {"id": str(result.inserted_id), "status": "sent", "link": f"/invite/{result.inserted_id}"}


@router.get("/invite/{invite_id}")
async def get_invite(invite_id: str) -> dict:
    invite = await _db().group_invitations.find_one({"_id": _oid(invite_id)})
    if not invite:
        raise HTTPException(status_code=404, detail="Invitation not found")
    return _serial(invite)


@router.post("/invite/accept")
async def accept_invite(data: dict) -> dict:
    """Body: {invite_id, user_id}"""
    invite_id = (data.get("invite_id") or "").strip()
    user_id = (data.get("user_id") or "").strip()
    if not invite_id or not user_id:
        raise HTTPException(status_code=422, detail="invite_id and user_id are required")

    invite = await _db().group_invitations.find_one({"_id": _oid(invite_id)})
    if invite is None:
        raise HTTPException(status_code=404, detail="Invitation not found")

    await _db().group_trips.update_one(
        {"_id": _oid(invite["trip_id"])},
        {"$addToSet": {"members": user_id}},
    )
    await _db().group_invitations.update_one(
        {"_id": _oid(invite_id)},
        {"$set": {"status": "accepted"}},
    )
    return {"status": "joined", "trip_id": invite["trip_id"]}


# ═══════════════════════════════════════════════════════════════════════════════
# WEBSOCKET
# ═══════════════════════════════════════════════════════════════════════════════

@router.websocket("/ws/{trip_id}")
async def websocket_endpoint(websocket: WebSocket, trip_id: str, user_id: str = Query(None)) -> None:
    """Real-time broadcast room per trip_id with Security and Diffing."""
    
    # 1. SECURITY: Check membership
    trip = await _db().group_trips.find_one({"_id": _oid(trip_id)})
    if not trip:
        await websocket.close(code=1008, reason="Trip not found")
        return

    # If user_id is provided, verify membership
    if user_id and user_id not in trip.get("members", []):
        await websocket.close(code=1008, reason="Unauthorized")
        return

    await _manager.connect(trip_id, websocket)

    # Broadcast presence
    if user_id:
        await _manager.broadcast(trip_id, {"type": "presence", "user": user_id, "status": "online"})

    try:
        while True:
            data = await websocket.receive_json()
            msg_type = data.get("type", "")

            # 2. DIFF-BASED REAL-TIME SYNC
            if msg_type == "activity_added":
                day_id = data.get("dayId")
                activity = data.get("activity")
                await _db().group_trips.update_one(
                    {"_id": _oid(trip_id), "days.id": day_id},
                    {"$push": {"days.$.activities": activity}, "$inc": {"version": 1}}
                )
                await _manager.broadcast(trip_id, data)

            elif msg_type == "activity_removed":
                day_id = data.get("dayId")
                act_id = data.get("actId")
                await _db().group_trips.update_one(
                    {"_id": _oid(trip_id), "days.id": day_id},
                    {"$pull": {"days.$.activities": {"id": act_id}}, "$inc": {"version": 1}}
                )
                await _manager.broadcast(trip_id, data)
                
            elif msg_type == "activity_reordered":
                day_id = data.get("dayId")
                new_activities = data.get("activities")
                await _db().group_trips.update_one(
                    {"_id": _oid(trip_id), "days.id": day_id},
                    {"$set": {"days.$.activities": new_activities}, "$inc": {"version": 1}}
                )
                await _manager.broadcast(trip_id, data)

            elif msg_type == "message":
                raw = data.get("message", {})
                text = (raw.get("text") or "").strip()
                if text:
                    doc = {
                        "trip_id": trip_id,
                        "text": text,
                        "user": raw.get("user", "Anonymous"),
                        "avatar": raw.get("avatar", "?"),
                        "color": raw.get("color", "bg-slate-500"),
                        "created_at": _now(),
                    }
                    result = await _db().group_messages.insert_one(doc)
                    serialized = _serial({**doc, "_id": result.inserted_id})
                    await _manager.broadcast(trip_id, {"type": "message", "message": serialized})
            
            elif msg_type == "typing":
                # Broadcast typing indicator
                await _manager.broadcast(trip_id, {
                    "type": "typing",
                    "user": data.get("user", "Someone")
                })

            else:
                # Fallback for generic full updates or other messages
                await _manager.broadcast(trip_id, data)

    except WebSocketDisconnect:
        _manager.disconnect(trip_id, websocket)
        if user_id:
            await _manager.broadcast(trip_id, {"type": "presence", "user": user_id, "status": "offline"})
    except Exception as exc:
        logger.exception("WS error trip_id=%s: %s", trip_id, exc)
        _manager.disconnect(trip_id, websocket)
