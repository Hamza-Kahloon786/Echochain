"""
Climatiq API Service — Real-time emission factor lookups.
Uses official DEFRA, EPA, ADEME factors via Climatiq REST API.
Docs: https://www.climatiq.io/docs
Free tier: 250 API calls/month
"""
import httpx
import os
from dotenv import load_dotenv

load_dotenv()

CLIMATIQ_API_KEY = os.getenv("CLIMATIQ_API_KEY", "")
BASE_URL = "https://api.climatiq.io"
HEADERS = {
    "Authorization": f"Bearer {CLIMATIQ_API_KEY}",
    "Content-Type": "application/json",
}


async def estimate_emissions(activity_id: str, parameters: dict) -> dict:
    """
    General emission estimation via Climatiq.
    activity_id: e.g., 'electricity-supply_grid-source_supplier_mix'
    parameters: e.g., {"energy": 1000, "energy_unit": "kWh"}
    """
    if not CLIMATIQ_API_KEY:
        return {"success": False, "error": "CLIMATIQ_API_KEY not configured"}

    payload = {
        "emission_factor": {
            "activity_id": activity_id,
            "data_version": "^21",
        },
        "parameters": parameters,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{BASE_URL}/data/v1/estimate",
                json=payload,
                headers=HEADERS,
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "co2e": data.get("co2e"),
                "co2e_unit": data.get("co2e_unit"),
                "emission_factor": {
                    "name": data.get("emission_factor", {}).get("name"),
                    "source": data.get("emission_factor", {}).get("source"),
                    "year": data.get("emission_factor", {}).get("year"),
                    "region": data.get("emission_factor", {}).get("region"),
                },
                "constituent_gases": data.get("constituent_gases"),
            }
    except httpx.HTTPStatusError as e:
        return {"success": False, "error": f"HTTP {e.response.status_code}: {e.response.text}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def estimate_electricity(kwh: float, region: str = "GB") -> dict:
    """Estimate emissions from electricity consumption using Climatiq."""
    return await estimate_emissions(
        activity_id="electricity-supply_grid-source_supplier_mix",
        parameters={"energy": kwh, "energy_unit": "kWh"},
    )


async def estimate_fuel_combustion(fuel_type: str, volume: float, unit: str = "l") -> dict:
    """
    Estimate Scope 1 emissions from fuel combustion.
    fuel_type: 'diesel', 'petrol', 'natural_gas', etc.
    """
    # Map common fuel types to Climatiq activity IDs
    fuel_activity_map = {
        "diesel": "fuel_type_diesel-fuel_use_transport",
        "petrol": "fuel_type_motor_gasoline-fuel_use_transport",
        "natural_gas": "fuel_type_natural_gas-fuel_use_stationary_combustion",
        "lpg": "fuel_type_lpg-fuel_use_stationary_combustion",
        "fuel_oil": "fuel_type_residual_fuel_oil-fuel_use_stationary_combustion",
        "coal": "fuel_type_coal_industrial_coking-fuel_use_stationary_combustion",
    }
    activity_id = fuel_activity_map.get(fuel_type)
    if not activity_id:
        return {"success": False, "error": f"Unknown fuel type: {fuel_type}"}

    return await estimate_emissions(
        activity_id=activity_id,
        parameters={"volume": volume, "volume_unit": unit},
    )


async def estimate_freight(mode: str, distance_km: float, weight_kg: float) -> dict:
    """
    Estimate freight transport emissions using Climatiq's freight endpoint.
    mode: 'road', 'rail', 'sea', 'air'
    """
    if not CLIMATIQ_API_KEY:
        return {"success": False, "error": "CLIMATIQ_API_KEY not configured"}

    # Map transport modes to Climatiq freight modes
    mode_map = {
        "road_diesel": "road",
        "road_petrol": "road",
        "road_electric": "road",
        "rail": "rail",
        "sea": "sea",
        "air": "air",
    }
    freight_mode = mode_map.get(mode, "road")

    payload = {
        "route": [
            {"transport_mode": freight_mode, "distance": distance_km, "distance_unit": "km"}
        ],
        "cargo": {"weight": weight_kg, "weight_unit": "kg"},
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{BASE_URL}/freight/v2/intermodal",
                json=payload,
                headers=HEADERS,
            )
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "co2e": data.get("co2e"),
                "co2e_unit": data.get("co2e_unit"),
                "distance_km": distance_km,
                "weight_kg": weight_kg,
                "mode": freight_mode,
            }
    except httpx.HTTPStatusError as e:
        return {"success": False, "error": f"HTTP {e.response.status_code}: {e.response.text}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def search_emission_factors(query: str, region: str = "GB", source: str = "BEIS") -> dict:
    """Search for emission factors in Climatiq database."""
    if not CLIMATIQ_API_KEY:
        return {"success": False, "error": "CLIMATIQ_API_KEY not configured"}

    payload = {
        "query": query,
        "region": region,
        "source": source,
        "results_per_page": 10,
    }
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                f"{BASE_URL}/data/v1/search",
                json=payload,
                headers=HEADERS,
            )
            resp.raise_for_status()
            data = resp.json()
            factors = []
            for r in data.get("results", []):
                factors.append({
                    "activity_id": r.get("activity_id"),
                    "name": r.get("name"),
                    "category": r.get("category"),
                    "source": r.get("source"),
                    "region": r.get("region"),
                    "year": r.get("year"),
                    "unit_type": r.get("unit_type"),
                    "factor": r.get("factor"),
                })
            return {"success": True, "total": data.get("total_results", 0), "factors": factors}
    except Exception as e:
        return {"success": False, "error": str(e)}
