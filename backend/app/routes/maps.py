"""Maps API routes for geocoding, distance calculation, and map data."""
import traceback
from fastapi import APIRouter, Depends, Query, HTTPException
from app.utils.auth import get_current_user
from app.services.maps_service import geocode_address, get_distance, get_map_data, batch_geocode
from app.services.openai_service import generate_hotspot_insights

router = APIRouter()


@router.get("/geocode")
async def geocode(address: str = Query(min_length=2)):
    """Geocode an address to lat/lng. Uses Google Maps or OpenRouteService."""
    return await geocode_address(address)


@router.get("/distance")
async def distance(
    origin: str = Query(min_length=2),
    destination: str = Query(min_length=2),
    mode: str = Query(default="driving"),
):
    """Calculate real distance between two locations."""
    return await get_distance(origin, destination, mode)


@router.get("/data")
async def map_data(user_id: str = Depends(get_current_user)):
    """Get all geocoded markers and routes for the interactive map."""
    try:
        return await get_map_data(user_id)
    except Exception as e:
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/batch-geocode")
async def batch(locations: list[str], user_id: str = Depends(get_current_user)):
    """Geocode multiple locations at once."""
    return await batch_geocode(locations)


@router.get("/hotspot-insights")
async def hotspot_insights(
    entity_type: str = Query(...),
    entity_name: str = Query(...),
    emissions: float = Query(...),
    location: str = Query(default=""),
    industry: str = Query(default=""),
    refrigeration: bool = Query(default=False),
    user_id: str = Depends(get_current_user),
):
    """Get AI-generated insights for a specific map hotspot marker."""
    extra = {}
    if industry:
        extra["industry"] = industry
    if entity_type == "warehouse":
        extra["refrigeration"] = refrigeration
    return await generate_hotspot_insights(entity_type, entity_name, emissions, location, extra)
