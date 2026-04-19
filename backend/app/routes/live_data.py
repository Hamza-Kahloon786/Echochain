"""
Live Data API Routes
Real-time carbon intensity, AI recommendations, emission factor lookups,
distance calculations, and SECR report generation.
"""
from fastapi import APIRouter, Depends, Query
from app.utils.auth import get_current_user
from app.database import get_db
from app.services.carbon_intensity_service import (
    get_current_intensity,
    get_intensity_for_date,
    get_generation_mix,
    get_regional_intensity,
    get_live_grid_factor_kwh,
    get_48h_forecast,
)
from app.services.climatiq_service import (
    estimate_electricity,
    estimate_fuel_combustion,
    estimate_freight,
    search_emission_factors,
)
from app.services.openai_service import (
    generate_ai_recommendations,
    generate_secr_report,
    analyze_emissions_query,
)
from app.services.distance_service import (
    estimate_road_distance,
    get_available_cities,
)
from pydantic import BaseModel
from typing import Optional

router = APIRouter()


# ═══════════════════════════════════════════════════════
# CARBON INTENSITY (National Grid — Free, No Key)
# ═══════════════════════════════════════════════════════

@router.get("/carbon-intensity/current")
async def live_carbon_intensity():
    """Get real-time UK grid carbon intensity (gCO2/kWh)."""
    return await get_current_intensity()


@router.get("/carbon-intensity/date/{date}")
async def carbon_intensity_by_date(date: str):
    """Get carbon intensity for a specific date (YYYY-MM-DD)."""
    return await get_intensity_for_date(date)


@router.get("/carbon-intensity/generation-mix")
async def live_generation_mix():
    """Get current UK electricity generation mix (wind, solar, gas, etc.)."""
    return await get_generation_mix()


@router.get("/carbon-intensity/regional")
async def regional_intensity(
    region_id: Optional[int] = None,
    postcode: Optional[str] = None,
):
    """Get regional carbon intensity. Use region_id (1-17) or UK postcode."""
    return await get_regional_intensity(region_id=region_id, postcode=postcode)


@router.get("/carbon-intensity/forecast")
async def grid_forecast_48h():
    """Get 48-hour carbon intensity forecast."""
    return await get_48h_forecast()


@router.get("/carbon-intensity/live-factor")
async def live_grid_factor():
    """Get current grid emission factor in kgCO2/kWh for Scope 2 calculations."""
    factor = await get_live_grid_factor_kwh()
    return {
        "grid_factor_kgco2_per_kwh": factor,
        "source": "National Grid Carbon Intensity API (live)" if factor != 0.20705 else "DEFRA 2024 (fallback)",
    }


# ═══════════════════════════════════════════════════════
# CLIMATIQ (Emission Factor Lookups — 250 calls/month free)
# ═══════════════════════════════════════════════════════

@router.get("/climatiq/electricity")
async def climatiq_estimate_electricity(kwh: float = Query(ge=0)):
    """Estimate electricity emissions using Climatiq + DEFRA factors."""
    return await estimate_electricity(kwh)


@router.get("/climatiq/fuel")
async def climatiq_estimate_fuel(
    fuel_type: str = Query(default="diesel"),
    volume_litres: float = Query(ge=0),
):
    """Estimate fuel combustion emissions using Climatiq."""
    return await estimate_fuel_combustion(fuel_type, volume_litres)


@router.get("/climatiq/freight")
async def climatiq_estimate_freight(
    mode: str = Query(default="road_diesel"),
    distance_km: float = Query(ge=0),
    weight_kg: float = Query(ge=0),
):
    """Estimate freight transport emissions using Climatiq."""
    return await estimate_freight(mode, distance_km, weight_kg)


@router.get("/climatiq/search")
async def climatiq_search_factors(
    query: str = Query(min_length=2),
    region: str = Query(default="GB"),
):
    """Search for DEFRA/BEIS emission factors via Climatiq."""
    return await search_emission_factors(query, region)


# ═══════════════════════════════════════════════════════
# OPENAI (AI Recommendations & Reports)
# ═══════════════════════════════════════════════════════

@router.get("/ai/recommendations")
async def ai_powered_recommendations(user_id: str = Depends(get_current_user)):
    """Generate AI-powered (GPT) emission reduction recommendations."""
    db = get_db()

    # Gather all emissions data for this user
    suppliers, warehouses, transport, hotspots = [], [], [], []
    s1, s2, s3 = 0, 0, 0

    async for doc in db.suppliers.find({"user_id": user_id}):
        s = {"name": doc["name"], "total_emissions": doc.get("total_emissions", 0),
             "scope1_emissions": doc.get("scope1_emissions", 0),
             "scope2_emissions": doc.get("scope2_emissions", 0),
             "scope3_emissions": doc.get("scope3_emissions", 0)}
        suppliers.append(s)
        s1 += doc.get("scope1_emissions", 0)
        s2 += doc.get("scope2_emissions", 0)
        s3 += doc.get("scope3_emissions", 0)

    async for doc in db.warehouses.find({"user_id": user_id}):
        w = {"name": doc["name"], "total_emissions": doc.get("total_emissions", 0),
             "renewable_percentage": doc.get("renewable_percentage", 0)}
        warehouses.append(w)
        s1 += doc.get("scope1_emissions", 0)
        s2 += doc.get("scope2_emissions", 0)

    async for doc in db.transport_routes.find({"user_id": user_id}):
        t = {"name": doc["name"], "mode": doc.get("mode", ""), "origin": doc.get("origin", ""),
             "destination": doc.get("destination", ""), "annual_emissions": doc.get("annual_emissions", 0)}
        transport.append(t)
        s3 += doc.get("annual_emissions", 0)

    total = round(s1 + s2 + s3, 2)

    # Build hotspots
    all_src = [{"name": s["name"], "type": "Supplier", "emissions": s["total_emissions"]} for s in suppliers]
    all_src += [{"name": w["name"], "type": "Warehouse", "emissions": w["total_emissions"]} for w in warehouses]
    all_src += [{"name": t["name"], "type": "Transport", "emissions": t["annual_emissions"]} for t in transport]
    all_src.sort(key=lambda x: x["emissions"], reverse=True)

    emissions_data = {
        "scope1_total": round(s1, 2), "scope2_total": round(s2, 2),
        "scope3_total": round(s3, 2), "grand_total": total,
        "by_supplier": suppliers, "by_warehouse": warehouses,
        "by_transport": transport, "hotspots": all_src[:5],
    }

    return await generate_ai_recommendations(emissions_data)


class AskQuestion(BaseModel):
    question: str


@router.post("/ai/ask")
async def ask_emissions_question(body: AskQuestion, user_id: str = Depends(get_current_user)):
    """Ask a natural-language question about your emissions."""
    db = get_db()

    # Quick emissions summary
    s1, s2, s3 = 0, 0, 0
    suppliers, transport = [], []

    async for doc in db.suppliers.find({"user_id": user_id}):
        s1 += doc.get("scope1_emissions", 0)
        s2 += doc.get("scope2_emissions", 0)
        s3 += doc.get("scope3_emissions", 0)
        suppliers.append({"name": doc["name"], "total": doc.get("total_emissions", 0)})

    async for doc in db.warehouses.find({"user_id": user_id}):
        s1 += doc.get("scope1_emissions", 0)
        s2 += doc.get("scope2_emissions", 0)

    async for doc in db.transport_routes.find({"user_id": user_id}):
        s3 += doc.get("annual_emissions", 0)
        transport.append({"name": doc["name"], "mode": doc.get("mode"), "annual": doc.get("annual_emissions", 0)})

    data = {
        "scope1": round(s1, 2), "scope2": round(s2, 2), "scope3": round(s3, 2),
        "total": round(s1 + s2 + s3, 2),
        "top_suppliers": sorted(suppliers, key=lambda x: x["total"], reverse=True)[:5],
        "transport": transport,
    }

    return await analyze_emissions_query(body.question, data)


@router.get("/ai/secr-report")
async def generate_report(user_id: str = Depends(get_current_user)):
    """Generate a SECR-compliant report using AI."""
    db = get_db()
    user = await db.users.find_one({"_id": __import__("bson").ObjectId(user_id)})
    company = user.get("company_name", "Company") if user else "Company"

    s1, s2, s3 = 0, 0, 0
    suppliers, warehouses, transport = [], [], []

    async for doc in db.suppliers.find({"user_id": user_id}):
        s1 += doc.get("scope1_emissions", 0)
        s2 += doc.get("scope2_emissions", 0)
        s3 += doc.get("scope3_emissions", 0)
        suppliers.append(doc["name"])

    async for doc in db.warehouses.find({"user_id": user_id}):
        s1 += doc.get("scope1_emissions", 0)
        s2 += doc.get("scope2_emissions", 0)
        warehouses.append(doc["name"])

    async for doc in db.transport_routes.find({"user_id": user_id}):
        s3 += doc.get("annual_emissions", 0)
        transport.append(doc["name"])

    emissions_data = {
        "scope1_total": round(s1, 2), "scope2_total": round(s2, 2),
        "scope3_total": round(s3, 2), "grand_total": round(s1 + s2 + s3, 2),
        "by_supplier": suppliers, "by_warehouse": warehouses, "by_transport": transport,
    }

    return await generate_secr_report(emissions_data, company)


# ═══════════════════════════════════════════════════════
# DISTANCE CALCULATOR (Free — Haversine, no API key)
# ═══════════════════════════════════════════════════════

@router.get("/distance/calculate")
async def calculate_distance(
    origin: str = Query(min_length=2),
    destination: str = Query(min_length=2),
):
    """Estimate road distance between two UK cities (no API key needed)."""
    return estimate_road_distance(origin, destination)


@router.get("/distance/cities")
async def list_available_cities():
    """List all cities available for distance calculation."""
    return {"cities": get_available_cities()}
