"""
Real-Time UK Carbon Intensity Service
Uses the National Grid ESO Carbon Intensity API (free, no key required)
API Docs: https://carbon-intensity.github.io/api-definitions/
Base URL: https://api.carbonintensity.org.uk
"""
import httpx
from datetime import datetime, timedelta
from typing import Optional

BASE_URL = "https://api.carbonintensity.org.uk"


async def get_current_intensity() -> dict:
    """Get current national carbon intensity (gCO2/kWh)."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{BASE_URL}/intensity")
            resp.raise_for_status()
            data = resp.json()
            intensity = data["data"][0]
            return {
                "success": True,
                "from": intensity["from"],
                "to": intensity["to"],
                "forecast": intensity["intensity"]["forecast"],
                "actual": intensity["intensity"].get("actual"),
                "index": intensity["intensity"]["index"],
                "unit": "gCO2/kWh",
            }
    except Exception as e:
        return {"success": False, "error": str(e), "fallback_factor": 207.05}


async def get_intensity_for_date(date_str: str) -> dict:
    """Get carbon intensity data for a specific date (YYYY-MM-DD)."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{BASE_URL}/intensity/date/{date_str}")
            resp.raise_for_status()
            data = resp.json()
            half_hours = data["data"]
            # Calculate daily average
            actuals = [h["intensity"]["actual"] for h in half_hours if h["intensity"].get("actual")]
            forecasts = [h["intensity"]["forecast"] for h in half_hours if h["intensity"].get("forecast")]
            avg_actual = round(sum(actuals) / len(actuals), 1) if actuals else None
            avg_forecast = round(sum(forecasts) / len(forecasts), 1) if forecasts else None
            return {
                "success": True,
                "date": date_str,
                "avg_actual_intensity": avg_actual,
                "avg_forecast_intensity": avg_forecast,
                "data_points": len(half_hours),
                "unit": "gCO2/kWh",
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_intensity_range(start: str, end: str) -> dict:
    """Get carbon intensity data for a date range."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{BASE_URL}/intensity/{start}/{end}")
            resp.raise_for_status()
            data = resp.json()
            points = data["data"]
            actuals = [p["intensity"]["actual"] for p in points if p["intensity"].get("actual")]
            avg = round(sum(actuals) / len(actuals), 1) if actuals else None
            return {
                "success": True,
                "start": start,
                "end": end,
                "avg_intensity": avg,
                "data_points": len(points),
                "unit": "gCO2/kWh",
                "timeseries": [
                    {
                        "from": p["from"],
                        "intensity": p["intensity"].get("actual") or p["intensity"].get("forecast"),
                    }
                    for p in points
                ],
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_generation_mix() -> dict:
    """Get current UK electricity generation mix (wind, solar, gas, etc.)."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{BASE_URL}/generation")
            resp.raise_for_status()
            data = resp.json()
            mix = data["data"]["generationmix"]
            return {
                "success": True,
                "from": data["data"]["from"],
                "to": data["data"]["to"],
                "generation_mix": [
                    {"fuel": m["fuel"], "percentage": m["perc"]}
                    for m in mix
                ],
            }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_regional_intensity(region_id: int = None, postcode: str = None) -> dict:
    """
    Get regional carbon intensity.
    region_id: 1-17 (e.g., 13=London, 1=North Scotland)
    postcode: UK outcode (e.g., 'SW1')
    """
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            if postcode:
                resp = await client.get(f"{BASE_URL}/regional/postcode/{postcode}")
            elif region_id:
                resp = await client.get(f"{BASE_URL}/regional/regionid/{region_id}")
            else:
                resp = await client.get(f"{BASE_URL}/regional")

            resp.raise_for_status()
            data = resp.json()
            return {"success": True, "data": data["data"]}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def get_live_grid_factor_kwh() -> float:
    """
    Returns the current grid emission factor in kgCO2e/kWh.
    Falls back to DEFRA 2024 average if API is unavailable.
    """
    result = await get_current_intensity()
    if result["success"]:
        # API returns gCO2/kWh, convert to kgCO2/kWh
        intensity = result.get("actual") or result.get("forecast") or 207.05
        return round(intensity / 1000, 5)
    return 0.20705  # DEFRA 2024 fallback


async def get_48h_forecast() -> dict:
    """Get 48-hour ahead carbon intensity forecast."""
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(f"{BASE_URL}/intensity/date/{datetime.utcnow().strftime('%Y-%m-%d')}/fw48h")
            resp.raise_for_status()
            data = resp.json()
            return {
                "success": True,
                "forecasts": [
                    {
                        "from": p["from"],
                        "to": p["to"],
                        "forecast": p["intensity"]["forecast"],
                        "index": p["intensity"]["index"],
                    }
                    for p in data["data"]
                ],
            }
    except Exception as e:
        return {"success": False, "error": str(e)}
