"""Transport route CRUD with emissions calculation."""
from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.models.schemas import TransportRouteCreate, TransportRouteResponse
from app.utils.auth import get_current_user
from app.utils.emission_factors import calculate_route_emissions
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def route_doc_to_response(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc.get("user_id", ""))
    return doc


@router.post("/", response_model=TransportRouteResponse)
async def create_route(route: TransportRouteCreate, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = route.model_dump()
    doc["user_id"] = user_id
    doc["created_at"] = datetime.utcnow()
    emissions = calculate_route_emissions(doc)
    doc.update(emissions)
    result = await db.transport_routes.insert_one(doc)
    doc["_id"] = result.inserted_id
    return route_doc_to_response(doc)


@router.get("/")
async def list_routes(user_id: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.transport_routes.find({"user_id": user_id})
    items = []
    async for doc in cursor:
        items.append(route_doc_to_response(doc))
    return items


@router.get("/{route_id}")
async def get_route(route_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = await db.transport_routes.find_one({"_id": ObjectId(route_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Route not found")
    return route_doc_to_response(doc)


@router.put("/{route_id}")
async def update_route(route_id: str, route: TransportRouteCreate, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = route.model_dump()
    emissions = calculate_route_emissions(doc)
    doc.update(emissions)
    doc["user_id"] = user_id
    result = await db.transport_routes.update_one(
        {"_id": ObjectId(route_id), "user_id": user_id}, {"$set": doc}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Route not found")
    updated = await db.transport_routes.find_one({"_id": ObjectId(route_id)})
    return route_doc_to_response(updated)


@router.delete("/{route_id}")
async def delete_route(route_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    result = await db.transport_routes.delete_one({"_id": ObjectId(route_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Route not found")
    return {"message": "Route deleted"}
