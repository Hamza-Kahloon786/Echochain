"""
PDF Upload Routes — Extract suppliers, warehouses, and transport data from PDF files.
Uses pdfplumber + OpenAI GPT for intelligent extraction.
"""
import os
import tempfile
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query
from app.utils.auth import get_current_user
from app.database import get_db
from app.services.pdf_extraction_service import (
    extract_text_from_pdf,
    parse_suppliers_from_text,
    parse_warehouses_from_text,
    parse_transport_from_text,
    parse_all_from_text,
)
from app.utils.emission_factors import (
    calculate_supplier_emissions,
    calculate_warehouse_emissions,
    calculate_route_emissions,
)
from datetime import datetime

router = APIRouter()

ALLOWED_TYPES = ["application/pdf"]
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB


async def save_upload(file: UploadFile) -> str:
    """Save uploaded file to temp dir and return path."""
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only PDF files are accepted")
    contents = await file.read()
    if len(contents) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10MB)")
    tmp = tempfile.NamedTemporaryFile(delete=False, suffix=".pdf")
    tmp.write(contents)
    tmp.close()
    return tmp.name


@router.post("/extract-preview")
async def extract_preview(
    file: UploadFile = File(...),
    data_type: str = Query(default="all", description="all, suppliers, warehouses, or transport"),
    user_id: str = Depends(get_current_user),
):
    """
    Upload a PDF and preview extracted data WITHOUT saving to database.
    Lets the user review and confirm before importing.
    """
    file_path = await save_upload(file)
    try:
        text = extract_text_from_pdf(file_path)
        if not text or len(text.strip()) < 20:
            return {"success": False, "error": "Could not extract text from PDF. The file may be scanned/image-based."}

        if data_type == "suppliers":
            result = await parse_suppliers_from_text(text)
        elif data_type == "warehouses":
            result = await parse_warehouses_from_text(text)
        elif data_type == "transport":
            result = await parse_transport_from_text(text)
        else:
            result = await parse_all_from_text(text)

        result["text_preview"] = text[:500] + "..." if len(text) > 500 else text
        result["text_length"] = len(text)
        return result

    finally:
        os.unlink(file_path)


@router.post("/import-suppliers")
async def import_suppliers_from_pdf(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Upload PDF → extract suppliers → calculate emissions → save to DB."""
    file_path = await save_upload(file)
    try:
        text = extract_text_from_pdf(file_path)
        if not text or len(text.strip()) < 20:
            raise HTTPException(status_code=400, detail="Could not extract text from PDF")

        result = await parse_suppliers_from_text(text)
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Extraction failed"))

        db = get_db()
        imported = []
        for s in result.get("suppliers", []):
            doc = {
                "name": s.get("name", "Unknown"),
                "location": s.get("location", "UK"),
                "industry": s.get("industry", "General"),
                "annual_production_volume": s.get("annual_production_volume", 10000),
                "fuel_type": s.get("fuel_type", "natural_gas"),
                "fuel_consumed_litres": s.get("fuel_consumed_litres", 0),
                "electricity_kwh": s.get("electricity_kwh", 0),
                "emission_factor_scope3": s.get("emission_factor_scope3", 0.5),
                "user_id": user_id,
                "created_at": datetime.utcnow(),
                "imported_from": "pdf",
            }
            emissions = calculate_supplier_emissions(doc)
            doc.update(emissions)
            res = await db.suppliers.insert_one(doc)
            doc["id"] = str(res.inserted_id)
            imported.append({"name": doc["name"], "id": doc["id"], "total_emissions": doc["total_emissions"]})

        return {
            "success": True,
            "imported_count": len(imported),
            "suppliers": imported,
            "notes": result.get("extraction_notes", ""),
        }
    finally:
        os.unlink(file_path)


@router.post("/import-warehouses")
async def import_warehouses_from_pdf(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Upload PDF → extract warehouses → calculate emissions → save to DB."""
    file_path = await save_upload(file)
    try:
        text = extract_text_from_pdf(file_path)
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text")

        result = await parse_warehouses_from_text(text)
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Extraction failed"))

        db = get_db()
        imported = []
        for w in result.get("warehouses", []):
            doc = {
                "name": w.get("name", "Unknown"),
                "location": w.get("location", "UK"),
                "size_sqm": w.get("size_sqm", 1000),
                "electricity_kwh_monthly": w.get("electricity_kwh_monthly", 5000),
                "gas_kwh_monthly": w.get("gas_kwh_monthly", 2000),
                "refrigeration": w.get("refrigeration", False),
                "renewable_percentage": w.get("renewable_percentage", 0),
                "user_id": user_id,
                "created_at": datetime.utcnow(),
                "imported_from": "pdf",
            }
            emissions = calculate_warehouse_emissions(doc)
            doc.update(emissions)
            res = await db.warehouses.insert_one(doc)
            doc["id"] = str(res.inserted_id)
            imported.append({"name": doc["name"], "id": doc["id"], "total_emissions": doc["total_emissions"]})

        return {"success": True, "imported_count": len(imported), "warehouses": imported, "notes": result.get("extraction_notes", "")}
    finally:
        os.unlink(file_path)


@router.post("/import-transport")
async def import_transport_from_pdf(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Upload PDF → extract transport routes → calculate emissions → save to DB."""
    file_path = await save_upload(file)
    try:
        text = extract_text_from_pdf(file_path)
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text")

        result = await parse_transport_from_text(text)
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Extraction failed"))

        db = get_db()
        imported = []
        for t in result.get("transport_routes", []):
            doc = {
                "name": t.get("name", "Unknown Route"),
                "origin": t.get("origin", ""),
                "destination": t.get("destination", ""),
                "distance_km": t.get("distance_km", 100),
                "mode": t.get("mode", "road_diesel"),
                "weight_tonnes": t.get("weight_tonnes", 5),
                "trips_per_month": t.get("trips_per_month", 4),
                "user_id": user_id,
                "created_at": datetime.utcnow(),
                "imported_from": "pdf",
            }
            emissions = calculate_route_emissions(doc)
            doc.update(emissions)
            res = await db.transport_routes.insert_one(doc)
            doc["id"] = str(res.inserted_id)
            imported.append({"name": doc["name"], "id": doc["id"], "annual_emissions": doc["annual_emissions"]})

        return {"success": True, "imported_count": len(imported), "transport_routes": imported, "notes": result.get("extraction_notes", "")}
    finally:
        os.unlink(file_path)


@router.post("/import-all")
async def import_all_from_pdf(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    """Upload a single PDF → extract ALL data types → save everything to DB."""
    file_path = await save_upload(file)
    try:
        text = extract_text_from_pdf(file_path)
        if not text:
            raise HTTPException(status_code=400, detail="Could not extract text")

        result = await parse_all_from_text(text)
        if not result.get("success"):
            raise HTTPException(status_code=422, detail=result.get("error", "Extraction failed"))

        db = get_db()
        summary = {"suppliers": 0, "warehouses": 0, "transport_routes": 0}

        for s in result.get("suppliers", []):
            doc = {**s, "user_id": user_id, "created_at": datetime.utcnow(), "imported_from": "pdf"}
            doc.update(calculate_supplier_emissions(doc))
            await db.suppliers.insert_one(doc)
            summary["suppliers"] += 1

        for w in result.get("warehouses", []):
            doc = {**w, "user_id": user_id, "created_at": datetime.utcnow(), "imported_from": "pdf"}
            doc.update(calculate_warehouse_emissions(doc))
            await db.warehouses.insert_one(doc)
            summary["warehouses"] += 1

        for t in result.get("transport_routes", []):
            doc = {**t, "user_id": user_id, "created_at": datetime.utcnow(), "imported_from": "pdf"}
            doc.update(calculate_route_emissions(doc))
            await db.transport_routes.insert_one(doc)
            summary["transport_routes"] += 1

        return {
            "success": True,
            "summary": summary,
            "total_imported": sum(summary.values()),
            "notes": result.get("extraction_notes", ""),
        }
    finally:
        os.unlink(file_path)
