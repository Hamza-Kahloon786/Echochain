"""
Google Maps Integration Service
Provides geocoding and distance matrix calculations.
Uses Google Maps Platform API (requires API key with billing enabled).
Falls back to OpenRouteService or Haversine if Google key not available.
"""
import os
import httpx
from dotenv import load_dotenv

load_dotenv()

GOOGLE_MAPS_API_KEY = os.getenv("GOOGLE_MAPS_API_KEY", "")
OPENROUTE_API_KEY = os.getenv("OPENROUTE_API_KEY", "")


# ─── Google Maps Geocoding ──────────────────────────────
async def geocode_address(address: str) -> dict:
    """Convert an address string to lat/lng coordinates using Google Maps."""
    if GOOGLE_MAPS_API_KEY:
        return await _google_geocode(address)
    else:
        return await _openroute_geocode(address)


async def _google_geocode(address: str) -> dict:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/geocode/json",
                params={"address": address, "key": GOOGLE_MAPS_API_KEY},
            )
            data = resp.json()
            if data["status"] == "OK" and data["results"]:
                loc = data["results"][0]["geometry"]["location"]
                return {
                    "success": True,
                    "lat": loc["lat"],
                    "lng": loc["lng"],
                    "formatted_address": data["results"][0]["formatted_address"],
                    "source": "Google Maps",
                }
            return {"success": False, "error": f"Geocoding failed: {data['status']}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def _openroute_geocode(address: str) -> dict:
    """Fallback geocoding using OpenRouteService."""
    if not OPENROUTE_API_KEY:
        return {"success": False, "error": "No geocoding API key configured"}
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://api.openrouteservice.org/geocode/search",
                params={"api_key": OPENROUTE_API_KEY, "text": address, "size": 1},
            )
            data = resp.json()
            if data.get("features"):
                coords = data["features"][0]["geometry"]["coordinates"]
                return {
                    "success": True,
                    "lat": coords[1],
                    "lng": coords[0],
                    "formatted_address": data["features"][0]["properties"].get("label", address),
                    "source": "OpenRouteService",
                }
            return {"success": False, "error": "No results found"}
    except Exception as e:
        return {"success": False, "error": str(e)}


# ─── Google Maps Distance Matrix ────────────────────────
async def get_distance(origin: str, destination: str, mode: str = "driving") -> dict:
    """
    Calculate real driving/transit distance between two locations.
    Uses Google Maps Distance Matrix API if key available, otherwise OpenRouteService.
    """
    if GOOGLE_MAPS_API_KEY:
        return await _google_distance(origin, destination, mode)
    elif OPENROUTE_API_KEY:
        return await _openroute_distance(origin, destination)
    else:
        return _haversine_fallback(origin, destination)


async def _google_distance(origin: str, destination: str, mode: str = "driving") -> dict:
    try:
        async with httpx.AsyncClient(timeout=10) as client:
            resp = await client.get(
                "https://maps.googleapis.com/maps/api/distancematrix/json",
                params={
                    "origins": origin,
                    "destinations": destination,
                    "mode": mode,
                    "units": "metric",
                    "key": GOOGLE_MAPS_API_KEY,
                },
            )
            data = resp.json()
            if data["status"] == "OK":
                element = data["rows"][0]["elements"][0]
                if element["status"] == "OK":
                    return {
                        "success": True,
                        "distance_km": round(element["distance"]["value"] / 1000, 1),
                        "distance_text": element["distance"]["text"],
                        "duration_minutes": round(element["duration"]["value"] / 60, 0),
                        "duration_text": element["duration"]["text"],
                        "origin": data["origin_addresses"][0],
                        "destination": data["destination_addresses"][0],
                        "source": "Google Maps Distance Matrix",
                    }
            return {"success": False, "error": f"Distance Matrix failed: {data.get('status', 'unknown')}"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def _openroute_distance(origin: str, destination: str) -> dict:
    """Calculate distance via OpenRouteService directions API."""
    # First geocode both locations
    o = await _openroute_geocode(origin)
    d = await _openroute_geocode(destination)
    if not o.get("success") or not d.get("success"):
        return {"success": False, "error": "Could not geocode one or both locations"}

    try:
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.openrouteservice.org/v2/directions/driving-car",
                headers={"Authorization": OPENROUTE_API_KEY, "Content-Type": "application/json"},
                json={"coordinates": [[o["lng"], o["lat"]], [d["lng"], d["lat"]]]},
            )
            data = resp.json()
            if "routes" in data and data["routes"]:
                route = data["routes"][0]["summary"]
                return {
                    "success": True,
                    "distance_km": round(route["distance"] / 1000, 1),
                    "duration_minutes": round(route["duration"] / 60, 0),
                    "origin": origin,
                    "destination": destination,
                    "source": "OpenRouteService",
                }
            return {"success": False, "error": "No route found"}
    except Exception as e:
        return {"success": False, "error": str(e)}


def _haversine_fallback(origin: str, destination: str) -> dict:
    """Last resort - use haversine from distance_service."""
    from app.services.distance_service import estimate_road_distance
    return estimate_road_distance(origin, destination)


# ─── Batch Geocoding ────────────────────────────────────
async def batch_geocode(locations: list) -> list:
    """Geocode multiple location strings."""
    results = []
    for loc in locations:
        result = await geocode_address(loc)
        result["original_query"] = loc
        results.append(result)
    return results


# ─── Map Data Aggregation ───────────────────────────────
async def _geocode_and_cache(db, collection: str, doc_id, address: str, lat_field="lat", lng_field="lng"):
    """Return cached coords from DB, or geocode + save them if missing."""
    geo = await geocode_address(address)
    if isinstance(geo, dict) and geo.get("success"):
        await db[collection].update_one(
            {"_id": doc_id},
            {"$set": {lat_field: geo["lat"], lng_field: geo["lng"]}},
        )
        return geo["lat"], geo["lng"]
    return None, None


async def get_map_data(user_id: str) -> dict:
    """
    Get all geocoded locations for map display.
    Coordinates are cached in MongoDB — geocoding only happens once per record.
    Subsequent loads are instant (pure DB reads).
    """
    import asyncio
    from app.database import get_db
    db = get_db()

    supplier_docs = await db.suppliers.find({"user_id": user_id}).to_list(length=500)
    warehouse_docs = await db.warehouses.find({"user_id": user_id}).to_list(length=500)
    transport_docs = await db.transport_routes.find({"user_id": user_id}).to_list(length=500)

    markers = []
    routes = []

    # ── Suppliers ────────────────────────────────────────
    async def resolve_supplier(doc):
        lat = doc.get("lat")
        lng = doc.get("lng")
        if lat is None or lng is None:
            lat, lng = await _geocode_and_cache(db, "suppliers", doc["_id"], doc.get("location", ""))
        if lat is not None:
            return {
                "type": "supplier",
                "name": doc["name"],
                "lat": lat,
                "lng": lng,
                "emissions": doc.get("total_emissions", 0),
                "location": doc.get("location", ""),
                "industry": doc.get("industry", ""),
            }
        return None

    # ── Warehouses ───────────────────────────────────────
    async def resolve_warehouse(doc):
        lat = doc.get("lat")
        lng = doc.get("lng")
        if lat is None or lng is None:
            lat, lng = await _geocode_and_cache(db, "warehouses", doc["_id"], doc.get("location", ""))
        if lat is not None:
            return {
                "type": "warehouse",
                "name": doc["name"],
                "lat": lat,
                "lng": lng,
                "emissions": doc.get("total_emissions", 0),
                "location": doc.get("location", ""),
                "refrigeration": doc.get("refrigeration", False),
            }
        return None

    # ── Transport routes ─────────────────────────────────
    async def resolve_route(doc):
        o_lat = doc.get("origin_lat")
        o_lng = doc.get("origin_lng")
        d_lat = doc.get("dest_lat")
        d_lng = doc.get("dest_lng")

        geocode_tasks = []
        need_origin = o_lat is None or o_lng is None
        need_dest = d_lat is None or d_lng is None

        if need_origin:
            geocode_tasks.append(geocode_address(doc.get("origin", "")))
        if need_dest:
            geocode_tasks.append(geocode_address(doc.get("destination", "")))

        if geocode_tasks:
            results = await asyncio.gather(*geocode_tasks, return_exceptions=True)
            idx = 0
            if need_origin:
                geo = results[idx]; idx += 1
                if isinstance(geo, dict) and geo.get("success"):
                    o_lat, o_lng = geo["lat"], geo["lng"]
                    await db.transport_routes.update_one(
                        {"_id": doc["_id"]},
                        {"$set": {"origin_lat": o_lat, "origin_lng": o_lng}},
                    )
            if need_dest:
                geo = results[idx]
                if isinstance(geo, dict) and geo.get("success"):
                    d_lat, d_lng = geo["lat"], geo["lng"]
                    await db.transport_routes.update_one(
                        {"_id": doc["_id"]},
                        {"$set": {"dest_lat": d_lat, "dest_lng": d_lng}},
                    )

        if o_lat is not None and d_lat is not None:
            return {
                "name": doc["name"],
                "origin": {"lat": o_lat, "lng": o_lng, "name": doc.get("origin", "")},
                "destination": {"lat": d_lat, "lng": d_lng, "name": doc.get("destination", "")},
                "mode": doc.get("mode", "road_diesel"),
                "annual_emissions": doc.get("annual_emissions", 0),
                "distance_km": doc.get("distance_km", 0),
                "weight_tonnes": doc.get("weight_tonnes", 1),
                "trips_per_month": doc.get("trips_per_month", 1),
            }
        return None

    # Run all concurrently
    all_results = await asyncio.gather(
        *[resolve_supplier(d) for d in supplier_docs],
        *[resolve_warehouse(d) for d in warehouse_docs],
        *[resolve_route(d) for d in transport_docs],
        return_exceptions=True,
    )

    for item in all_results:
        if not isinstance(item, dict):
            continue
        if item.get("type") in ("supplier", "warehouse"):
            markers.append(item)
        elif "origin" in item:
            routes.append(item)

    return {"markers": markers, "routes": routes}
