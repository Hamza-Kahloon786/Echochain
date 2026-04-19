"""
UK DEFRA Emission Factors & Calculation Engine
Based on: UK Government GHG Conversion Factors 2024
https://www.gov.uk/government/collections/greenhouse-gas-reporting-conversion-factors-2024
All values in kgCO2e

LIVE DATA SOURCES:
- Grid electricity factor: National Grid Carbon Intensity API (real-time)
- Fuel & transport factors: DEFRA 2024 (static, updated annually)
"""

# ─── DEFRA Fuel Emission Factors (kgCO2e per litre) ────
FUEL_EMISSION_FACTORS = {
    "diesel": 2.70,
    "petrol": 2.31,
    "natural_gas": 2.02,       # per cubic metre
    "lpg": 1.56,
    "fuel_oil": 3.18,
    "coal": 2.88,              # per kg
    "biofuel": 0.00,           # net zero (simplified)
}

# ─── UK Grid Electricity Factor (kgCO2e per kWh) ───────
# This is the DEFRA 2024 annual average fallback.
# For real-time calculations, use get_live_grid_factor() which
# calls the National Grid Carbon Intensity API.
GRID_ELECTRICITY_FACTOR = 0.20705  # 2024 UK annual average fallback

# Cache for live grid factor (updated when API is called)
_live_grid_factor_cache = {"value": None, "timestamp": None}

# ─── Transport Emission Factors (kgCO2e per tonne-km) ──
TRANSPORT_EMISSION_FACTORS = {
    "road_diesel": 0.10711,
    "road_petrol": 0.11340,
    "road_electric": 0.02500,
    "rail": 0.02780,
    "sea": 0.01610,
    "air": 0.60220,
}

# ─── Gas Emission Factor (kgCO2e per kWh of gas) ───────
GAS_EMISSION_FACTOR = 0.18254


def calculate_scope1_fuel(fuel_type: str, litres: float) -> float:
    """Scope 1: Direct fuel combustion emissions."""
    factor = FUEL_EMISSION_FACTORS.get(fuel_type, 2.70)
    return round(litres * factor, 2)


def calculate_scope2_electricity(kwh: float, renewable_pct: float = 0) -> float:
    """Scope 2: Purchased electricity emissions."""
    effective_kwh = kwh * (1 - renewable_pct / 100)
    return round(effective_kwh * GRID_ELECTRICITY_FACTOR, 2)


def calculate_scope2_gas(kwh: float) -> float:
    """Scope 2: Natural gas heating emissions (location-based)."""
    return round(kwh * GAS_EMISSION_FACTOR, 2)


def calculate_scope3_supplier(emission_factor: float, production_volume: float) -> float:
    """Scope 3: Upstream supply chain emissions."""
    return round(emission_factor * production_volume, 2)


def calculate_transport_emissions(mode: str, distance_km: float, weight_tonnes: float) -> float:
    """Transport emissions = factor * distance * weight."""
    factor = TRANSPORT_EMISSION_FACTORS.get(mode, 0.10711)
    return round(factor * distance_km * weight_tonnes, 2)


def calculate_supplier_emissions(supplier: dict) -> dict:
    """Calculate all scopes for a supplier."""
    s1 = calculate_scope1_fuel(
        supplier.get("fuel_type", "natural_gas"),
        supplier.get("fuel_consumed_litres", 0)
    )
    s2 = calculate_scope2_electricity(supplier.get("electricity_kwh", 0))
    s3 = calculate_scope3_supplier(
        supplier.get("emission_factor_scope3", 0.5),
        supplier.get("annual_production_volume", 0)
    )
    total = round(s1 + s2 + s3, 2)
    return {
        "scope1_emissions": s1,
        "scope2_emissions": s2,
        "scope3_emissions": s3,
        "total_emissions": total,
    }


def calculate_warehouse_emissions(warehouse: dict) -> dict:
    """Calculate Scope 1 & 2 for a warehouse."""
    s1 = calculate_scope2_gas(warehouse.get("gas_kwh_monthly", 0) * 12)
    s2 = calculate_scope2_electricity(
        warehouse.get("electricity_kwh_monthly", 0) * 12,
        warehouse.get("renewable_percentage", 0)
    )
    # Refrigeration surcharge (+30%)
    if warehouse.get("refrigeration", False):
        s2 = round(s2 * 1.3, 2)
    total = round(s1 + s2, 2)
    return {
        "scope1_emissions": s1,
        "scope2_emissions": s2,
        "total_emissions": total,
    }


def calculate_route_emissions(route: dict) -> dict:
    """Calculate transport route emissions."""
    per_trip = calculate_transport_emissions(
        route.get("mode", "road_diesel"),
        route.get("distance_km", 0),
        route.get("weight_tonnes", 1.0)
    )
    monthly = round(per_trip * route.get("trips_per_month", 1), 2)
    annual = round(monthly * 12, 2)
    return {
        "emissions_per_trip": per_trip,
        "monthly_emissions": monthly,
        "annual_emissions": annual,
    }
