"""
UK Distance Calculator — No API key required.
Uses Haversine formula + database of UK city coordinates.
Falls back to straight-line distance * 1.3 road factor for unknown cities.
"""
import math

# UK city coordinates (latitude, longitude)
UK_CITIES = {
    "london": (51.5074, -0.1278),
    "birmingham": (52.4862, -1.8904),
    "manchester": (53.4808, -2.2426),
    "leeds": (53.8008, -1.5491),
    "glasgow": (55.8642, -4.2518),
    "edinburgh": (55.9533, -3.1883),
    "liverpool": (53.4084, -2.9916),
    "bristol": (51.4545, -2.5879),
    "sheffield": (53.3811, -1.4701),
    "newcastle": (54.9783, -1.6178),
    "nottingham": (52.9548, -1.1581),
    "cardiff": (51.4816, -3.1791),
    "belfast": (54.5973, -5.9301),
    "southampton": (50.9097, -1.4044),
    "coventry": (52.4068, -1.5197),
    "leicester": (52.6369, -1.1398),
    "sunderland": (54.9069, -1.3838),
    "aberdeen": (57.1497, -2.0943),
    "swansea": (51.6214, -3.9436),
    "oxford": (51.7520, -1.2577),
    "cambridge": (52.2053, 0.1218),
    "brighton": (50.8225, -0.1372),
    "norwich": (52.6309, 1.2974),
    "exeter": (50.7184, -3.5339),
    "york": (53.9591, -1.0815),
    "hull": (53.7676, -0.3274),
    "portsmouth": (50.8198, -1.0880),
    "plymouth": (50.3755, -4.1427),
    "stoke-on-trent": (53.0027, -2.1794),
    "wolverhampton": (52.5870, -2.1288),
    "derby": (52.9225, -1.4746),
    "reading": (51.4543, -0.9781),
    "london heathrow": (51.4700, -0.4543),
    "gatwick": (51.1537, -0.1821),
    "stansted": (51.8860, 0.2389),
    "norfolk": (52.6140, 1.0260),
    "kent": (51.2787, 0.5217),
    # European ports for sea freight
    "rotterdam": (51.9244, 4.4777),
    "calais": (50.9513, 1.8587),
    "amsterdam": (52.3676, 4.9041),
    "hamburg": (53.5511, 9.9937),
    "le havre": (49.4944, 0.1079),
    "antwerp": (51.2194, 4.4025),
    # International airports for air freight
    "shanghai": (31.2304, 121.4737),
    "new york": (40.7128, -74.0060),
    "dubai": (25.2048, 55.2708),
    "hong kong": (22.3193, 114.1694),
    "tokyo": (35.6762, 139.6503),
    "singapore": (1.3521, 103.8198),
    "mumbai": (19.0760, 72.8777),
    "los angeles": (34.0522, -118.2437),
}


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    """Calculate straight-line distance between two points in km."""
    R = 6371  # Earth's radius in km
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = (
        math.sin(dlat / 2) ** 2
        + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    )
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return round(R * c, 1)


def estimate_road_distance(origin: str, destination: str) -> dict:
    """
    Estimate road distance between UK cities.
    Returns straight-line * 1.3 factor for road routing.
    """
    o = origin.lower().strip()
    d = destination.lower().strip()

    o_coords = UK_CITIES.get(o)
    d_coords = UK_CITIES.get(d)

    if not o_coords or not d_coords:
        return {
            "success": False,
            "error": f"City not found: {o if not o_coords else d}",
            "suggestion": "Enter the distance manually or try a major UK city name",
        }

    straight_line = haversine_km(o_coords[0], o_coords[1], d_coords[0], d_coords[1])

    # Apply road factor (roads are ~1.3x straight-line distance in UK)
    road_distance = round(straight_line * 1.3, 1)

    return {
        "success": True,
        "origin": origin,
        "destination": destination,
        "straight_line_km": straight_line,
        "estimated_road_km": road_distance,
        "road_factor": 1.3,
        "note": "Estimated using Haversine formula with 1.3x road correction factor",
    }


def get_available_cities() -> list:
    """Return list of available cities for distance calculation."""
    return sorted(UK_CITIES.keys())
