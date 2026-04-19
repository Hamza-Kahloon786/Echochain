"""Supplier CRUD routes with emissions calculation."""
from fastapi import APIRouter, HTTPException, Depends
from app.database import get_db
from app.models.schemas import SupplierCreate, SupplierResponse
from app.utils.auth import get_current_user
from app.utils.emission_factors import calculate_supplier_emissions
from bson import ObjectId
from datetime import datetime

router = APIRouter()


def supplier_doc_to_response(doc: dict) -> dict:
    doc["id"] = str(doc.pop("_id"))
    doc["user_id"] = str(doc.get("user_id", ""))
    return doc


@router.post("/", response_model=SupplierResponse)
async def create_supplier(supplier: SupplierCreate, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = supplier.model_dump()
    doc["user_id"] = user_id
    doc["created_at"] = datetime.utcnow()

    emissions = calculate_supplier_emissions(doc)
    doc.update(emissions)

    result = await db.suppliers.insert_one(doc)
    doc["_id"] = result.inserted_id
    return supplier_doc_to_response(doc)


@router.get("/")
async def list_suppliers(user_id: str = Depends(get_current_user)):
    db = get_db()
    cursor = db.suppliers.find({"user_id": user_id})
    suppliers = []
    async for doc in cursor:
        suppliers.append(supplier_doc_to_response(doc))
    return suppliers


@router.get("/{supplier_id}")
async def get_supplier(supplier_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = await db.suppliers.find_one({"_id": ObjectId(supplier_id), "user_id": user_id})
    if not doc:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return supplier_doc_to_response(doc)


@router.put("/{supplier_id}")
async def update_supplier(supplier_id: str, supplier: SupplierCreate, user_id: str = Depends(get_current_user)):
    db = get_db()
    doc = supplier.model_dump()
    emissions = calculate_supplier_emissions(doc)
    doc.update(emissions)
    doc["user_id"] = user_id

    result = await db.suppliers.update_one(
        {"_id": ObjectId(supplier_id), "user_id": user_id},
        {"$set": doc}
    )
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")

    updated = await db.suppliers.find_one({"_id": ObjectId(supplier_id)})
    return supplier_doc_to_response(updated)


@router.delete("/{supplier_id}")
async def delete_supplier(supplier_id: str, user_id: str = Depends(get_current_user)):
    db = get_db()
    result = await db.suppliers.delete_one({"_id": ObjectId(supplier_id), "user_id": user_id})
    if result.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Supplier not found")
    return {"message": "Supplier deleted"}
