"""Excel/CSV bulk-import routes for Suppliers, Warehouses, and Transport."""
import csv
import io
import logging
import os
from datetime import datetime
from fastapi import APIRouter, UploadFile, File, HTTPException, Depends
from app.database import get_db
from app.utils.auth import get_current_user
from app.utils.emission_factors import (
    calculate_supplier_emissions,
    calculate_warehouse_emissions,
    calculate_route_emissions,
)

logger = logging.getLogger(__name__)
router = APIRouter()

MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB
ALLOWED_EXTENSIONS = {".xlsx", ".xls", ".csv"}


def _load_openpyxl():
    try:
        import openpyxl
        return openpyxl
    except ImportError:
        raise HTTPException(status_code=503, detail="openpyxl not installed. Run: pip install openpyxl")


def _check_file(file: UploadFile) -> str:
    """Validate extension and return it."""
    ext = os.path.splitext(file.filename or "")[1].lower()
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="Only .xlsx, .xls, and .csv files are accepted.")
    return ext


def _normalise_header(h) -> str:
    return str(h).strip().lower().replace(" ", "_") if h is not None else ""


def _read_file(content: bytes, ext: str):
    """Parse Excel or CSV bytes into (headers, list-of-dicts)."""
    if ext == ".csv":
        return _read_csv(content)
    return _read_workbook(content)


def _read_csv(content: bytes):
    try:
        text = content.decode("utf-8-sig")   # strip BOM if present
        reader = csv.reader(io.StringIO(text))
        rows = list(reader)
        if len(rows) < 2:
            raise HTTPException(status_code=400, detail="CSV must have a header row and at least one data row.")
        headers = [_normalise_header(h) for h in rows[0]]
        records = []
        for row in rows[1:]:
            if all(v.strip() == "" for v in row):
                continue
            records.append(dict(zip(headers, row)))
        return headers, records
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse CSV file: {e}")


def _read_workbook(content: bytes):
    openpyxl = _load_openpyxl()
    try:
        wb = openpyxl.load_workbook(io.BytesIO(content), data_only=True)
        ws = wb.active
        rows = list(ws.iter_rows(values_only=True))
        if len(rows) < 2:
            raise HTTPException(status_code=400, detail="Excel file must have a header row and at least one data row.")
        headers = [_normalise_header(h) for h in rows[0]]
        records = []
        for row in rows[1:]:
            if all(v is None for v in row):
                continue
            records.append(dict(zip(headers, row)))
        return headers, records
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Could not parse Excel file: {e}")


def _val(row: dict, *keys, default=None):
    """Return the first matching key value from a row dict."""
    for k in keys:
        v = row.get(k.lower().replace(" ", "_"))
        if v is not None:
            return v
    return default


def _float(v, default=0.0) -> float:
    try:
        return float(v)
    except (TypeError, ValueError):
        return default


def _bool(v) -> bool:
    if isinstance(v, bool):
        return v
    if isinstance(v, (int, float)):
        return bool(v)
    return str(v).strip().lower() in ("true", "yes", "1")


# ── Suppliers ──────────────────────────────────────────────────────────────

VALID_FUEL_TYPES = {"diesel", "petrol", "natural_gas", "lpg", "fuel_oil", "coal", "biofuel"}

@router.post("/import-suppliers")
async def import_suppliers(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    ext = _check_file(file)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB).")

    _, records = _read_file(content, ext)
    db = get_db()
    imported, errors = [], []

    for i, row in enumerate(records, start=2):
        try:
            name = str(_val(row, "supplier_name", "name", "supplier") or "").strip()
            if not name:
                errors.append(f"Row {i}: missing name/supplier_name")
                continue

            fuel_type = str(_val(row, "fuel_type", "fuel") or "natural_gas").strip().lower()
            if fuel_type not in VALID_FUEL_TYPES:
                fuel_type = "natural_gas"

            doc = {
                "name":                    name,
                "location":                str(_val(row, "location") or "").strip(),
                "industry":                str(_val(row, "industry") or "").strip(),
                "annual_production_volume":_float(_val(row, "annual_production_volume", "production_volume")),
                "fuel_type":               fuel_type,
                "fuel_consumed_litres":    _float(_val(row, "fuel_consumed_litres", "fuel_liters", "fuel_litres")),
                "electricity_kwh":         _float(_val(row, "electricity_kwh", "electricity")),
                "emission_factor_scope3":  _float(_val(row, "emission_factor_scope3", "scope3_factor"), 0.5),
                "user_id":                 user_id,
                "created_at":              datetime.utcnow(),
                "imported_from":           "excel",
            }
            doc.update(calculate_supplier_emissions(doc))
            result = await db.suppliers.insert_one(doc)
            doc["id"] = str(result.inserted_id)
            imported.append({"id": doc["id"], "name": name})

        except Exception as e:
            errors.append(f"Row {i}: {e}")

    logger.info(f"Excel supplier import: user={user_id} imported={len(imported)} errors={len(errors)}")
    return {"imported": len(imported), "errors": errors, "records": imported}


# ── Warehouses ─────────────────────────────────────────────────────────────

@router.post("/import-warehouses")
async def import_warehouses(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    ext = _check_file(file)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB).")

    _, records = _read_file(content, ext)
    db = get_db()
    imported, errors = [], []

    for i, row in enumerate(records, start=2):
        try:
            name = str(_val(row, "name", "warehouse_name", "facility_name") or "").strip()
            if not name:
                errors.append(f"Row {i}: missing name")
                continue

            doc = {
                "name":                    name,
                "location":                str(_val(row, "location") or "").strip(),
                "size_sqm":                _float(_val(row, "size_sqm", "size", "area_sqm")),
                "electricity_kwh_monthly": _float(_val(row, "electricity_kwh_monthly", "electricity_kwh", "electricity")),
                "gas_kwh_monthly":         _float(_val(row, "gas_kwh_monthly", "gas_kwh", "gas")),
                "refrigeration":           _bool(_val(row, "refrigeration", "has_refrigeration")),
                "renewable_percentage":    _float(_val(row, "renewable_percentage", "renewable_pct", "renewable")),
                "user_id":                 user_id,
                "created_at":              datetime.utcnow(),
                "imported_from":           "excel",
            }
            doc.update(calculate_warehouse_emissions(doc))
            result = await db.warehouses.insert_one(doc)
            doc["id"] = str(result.inserted_id)
            imported.append({"id": doc["id"], "name": name})

        except Exception as e:
            errors.append(f"Row {i}: {e}")

    logger.info(f"Excel warehouse import: user={user_id} imported={len(imported)} errors={len(errors)}")
    return {"imported": len(imported), "errors": errors, "records": imported}


# ── Transport ──────────────────────────────────────────────────────────────

VALID_MODES = {"road_diesel", "road_petrol", "road_electric", "rail", "sea", "air"}
MODE_ALIASES = {
    "road": "road_diesel", "diesel": "road_diesel", "truck": "road_diesel",
    "petrol": "road_petrol", "electric": "road_electric", "ev": "road_electric",
    "train": "rail", "railway": "rail",
    "ship": "sea", "shipping": "sea", "ocean": "sea",
    "plane": "air", "flight": "air", "aviation": "air",
}

@router.post("/import-transport")
async def import_transport(
    file: UploadFile = File(...),
    user_id: str = Depends(get_current_user),
):
    ext = _check_file(file)
    content = await file.read()
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large (max 10 MB).")

    _, records = _read_file(content, ext)
    db = get_db()
    imported, errors = [], []

    for i, row in enumerate(records, start=2):
        try:
            name = str(_val(row, "route_name", "name", "route") or "").strip()
            if not name:
                errors.append(f"Row {i}: missing route_name/name")
                continue

            raw_mode = str(_val(row, "transport_mode", "mode") or "road_diesel").strip().lower()
            mode = raw_mode if raw_mode in VALID_MODES else MODE_ALIASES.get(raw_mode, "road_diesel")

            doc = {
                "name":           name,
                "origin":         str(_val(row, "origin", "from") or "").strip(),
                "destination":    str(_val(row, "destination", "to") or "").strip(),
                "distance_km":    _float(_val(row, "distance_km", "distance")),
                "mode":           mode,
                "weight_tonnes":  _float(_val(row, "weight_tonnes", "quantity_tons", "weight"), 1.0),
                "trips_per_month":_float(_val(row, "trips_per_month", "trips"), 1.0),
                "user_id":        user_id,
                "created_at":     datetime.utcnow(),
                "imported_from":  "excel",
            }
            doc.update(calculate_route_emissions(doc))
            result = await db.transport_routes.insert_one(doc)
            doc["id"] = str(result.inserted_id)
            imported.append({"id": doc["id"], "name": name})

        except Exception as e:
            errors.append(f"Row {i}: {e}")

    logger.info(f"Excel transport import: user={user_id} imported={len(imported)} errors={len(errors)}")
    return {"imported": len(imported), "errors": errors, "records": imported}
