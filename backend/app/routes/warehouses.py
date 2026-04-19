"""Warehouse CRUD routes with emissions calculation."""
from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.models.schemas import WarehouseCreate, WarehouseResponse
from app.utils.auth import get_current_user
from app.utils.emission_factors import calculate_warehouse_emissions
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def wh_doc_to_response(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc.get("user_id", ""))
    return doc


@router.post("/", response_model=WarehouseResponse)
async def create_warehouse(warehouse: WarehouseCreate, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = warehouse.model_dump()
    doc["user_id"] = user_id
    doc["created_at"] = datetime.utcnow()
    emissions = calculate_warehouse_emissions(doc)
    doc.update(emissions)
    result = await db.warehouses.insert_one(doc)
    doc["_id"] = result.inserted_id
    return wh_doc_to_response(doc)


@router.get("/")
async def list_warehouses(user_id: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.warehouses.find({"user_id": user_id})
    items = []
    async for doc in cursor:
        items.append(wh_doc_to_response(doc))
    return items


@router.get("/{warehouse_id}")
async def get_warehouse(warehouse_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = await db.warehouses.find_one({"_id": ObjectId(warehouse_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return wh_doc_to_response(doc)


@router.put("/{warehouse_id}")
async def update_warehouse(warehouse_id: str, warehouse: WarehouseCreate, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = warehouse.model_dump()
    emissions = calculate_warehouse_emissions(doc)
    doc.update(emissions)
    doc["user_id"] = user_id
    result = await db.warehouses.update_one(
        {"_id": ObjectId(warehouse_id), "user_id": user_id}, {"$set": doc}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    updated = await db.warehouses.find_one({"_id": ObjectId(warehouse_id)})
    return wh_doc_to_response(updated)


@router.delete("/{warehouse_id}")
async def delete_warehouse(warehouse_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    result = await db.warehouses.delete_one({"_id": ObjectId(warehouse_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Warehouse not found")
    return {"message": "Warehouse deleted"}
