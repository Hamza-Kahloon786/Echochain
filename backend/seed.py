"""
Seed script: Populates MongoDB with demo data for EchoChain.
Run: python seed.py
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
from app.utils.auth import hash_password
from app.utils.emission_factors import (
    calculate_supplier_emissions,
    calculate_warehouse_emissions,
    calculate_route_emissions,
)
from datetime import datetime

MONGODB_URL = "mongodb://localhost:27017"
DATABASE_NAME = "echochain"

DEMO_USER = {
    "email": "demo@echochain.uk",
    "password": hash_password("demo123"),
    "company_name": "GreenLogistics UK Ltd",
}

SUPPLIERS = [
    {"name": "SteelWorks Birmingham", "location": "Birmingham, UK", "industry": "Steel Manufacturing",
     "annual_production_volume": 50000, "fuel_type": "natural_gas", "fuel_consumed_litres": 120000,
     "electricity_kwh": 800000, "emission_factor_scope3": 1.2},
    {"name": "PackageCo Manchester", "location": "Manchester, UK", "industry": "Packaging",
     "annual_production_volume": 200000, "fuel_type": "diesel", "fuel_consumed_litres": 15000,
     "electricity_kwh": 150000, "emission_factor_scope3": 0.3},
    {"name": "ChemSupply Leeds", "location": "Leeds, UK", "industry": "Chemicals",
     "annual_production_volume": 30000, "fuel_type": "natural_gas", "fuel_consumed_litres": 80000,
     "electricity_kwh": 500000, "emission_factor_scope3": 2.5},
    {"name": "TextilePro Leicester", "location": "Leicester, UK", "industry": "Textiles",
     "annual_production_volume": 100000, "fuel_type": "natural_gas", "fuel_consumed_litres": 25000,
     "electricity_kwh": 200000, "emission_factor_scope3": 0.8},
    {"name": "ElectroParts Bristol", "location": "Bristol, UK", "industry": "Electronics",
     "annual_production_volume": 75000, "fuel_type": "diesel", "fuel_consumed_litres": 8000,
     "electricity_kwh": 350000, "emission_factor_scope3": 0.6},
    {"name": "FoodIngredients Norfolk", "location": "Norfolk, UK", "industry": "Food Processing",
     "annual_production_volume": 500000, "fuel_type": "natural_gas", "fuel_consumed_litres": 60000,
     "electricity_kwh": 400000, "emission_factor_scope3": 0.4},
    {"name": "GlassMakers Sunderland", "location": "Sunderland, UK", "industry": "Glass Manufacturing",
     "annual_production_volume": 40000, "fuel_type": "natural_gas", "fuel_consumed_litres": 95000,
     "electricity_kwh": 600000, "emission_factor_scope3": 1.8},
    {"name": "PlasticRecycle Cardiff", "location": "Cardiff, UK", "industry": "Recycled Plastics",
     "annual_production_volume": 150000, "fuel_type": "diesel", "fuel_consumed_litres": 12000,
     "electricity_kwh": 250000, "emission_factor_scope3": 0.2},
    {"name": "MetalFab Sheffield", "location": "Sheffield, UK", "industry": "Metal Fabrication",
     "annual_production_volume": 60000, "fuel_type": "natural_gas", "fuel_consumed_litres": 70000,
     "electricity_kwh": 450000, "emission_factor_scope3": 1.0},
    {"name": "PaperMill Kent", "location": "Kent, UK", "industry": "Paper & Pulp",
     "annual_production_volume": 300000, "fuel_type": "natural_gas", "fuel_consumed_litres": 40000,
     "electricity_kwh": 350000, "emission_factor_scope3": 0.35},
]

WAREHOUSES = [
    {"name": "London Distribution Hub", "location": "London, UK", "size_sqm": 5000,
     "electricity_kwh_monthly": 45000, "gas_kwh_monthly": 12000, "refrigeration": True, "renewable_percentage": 20},
    {"name": "Midlands Storage Centre", "location": "Coventry, UK", "size_sqm": 8000,
     "electricity_kwh_monthly": 35000, "gas_kwh_monthly": 18000, "refrigeration": False, "renewable_percentage": 0},
    {"name": "Glasgow Cold Store", "location": "Glasgow, UK", "size_sqm": 3000,
     "electricity_kwh_monthly": 55000, "gas_kwh_monthly": 8000, "refrigeration": True, "renewable_percentage": 45},
    {"name": "Bristol Logistics Park", "location": "Bristol, UK", "size_sqm": 6500,
     "electricity_kwh_monthly": 28000, "gas_kwh_monthly": 15000, "refrigeration": False, "renewable_percentage": 10},
]

TRANSPORT_ROUTES = [
    {"name": "Birmingham-London Express", "origin": "Birmingham", "destination": "London",
     "distance_km": 190, "mode": "road_diesel", "weight_tonnes": 12, "trips_per_month": 20},
    {"name": "Manchester-Glasgow Rail", "origin": "Manchester", "destination": "Glasgow",
     "distance_km": 350, "mode": "rail", "weight_tonnes": 25, "trips_per_month": 8},
    {"name": "Leeds-Bristol Haulage", "origin": "Leeds", "destination": "Bristol",
     "distance_km": 340, "mode": "road_diesel", "weight_tonnes": 15, "trips_per_month": 12},
    {"name": "London-Rotterdam Shipping", "origin": "London", "destination": "Rotterdam",
     "distance_km": 360, "mode": "sea", "weight_tonnes": 100, "trips_per_month": 4},
    {"name": "UK-Shanghai Air Freight", "origin": "London Heathrow", "destination": "Shanghai",
     "distance_km": 9200, "mode": "air", "weight_tonnes": 5, "trips_per_month": 2},
    {"name": "Cardiff-London Electric", "origin": "Cardiff", "destination": "London",
     "distance_km": 250, "mode": "road_electric", "weight_tonnes": 8, "trips_per_month": 15},
    {"name": "Sheffield-Sunderland Diesel", "origin": "Sheffield", "destination": "Sunderland",
     "distance_km": 180, "mode": "road_diesel", "weight_tonnes": 10, "trips_per_month": 10},
]


async def seed():
    client = AsyncIOMotorClient(MONGODB_URL)
    db = client[DATABASE_NAME]

    # Clear existing data
    await db.users.delete_many({})
    await db.suppliers.delete_many({})
    await db.warehouses.delete_many({})
    await db.transport_routes.delete_many({})

    # Create demo user
    result = await db.users.insert_one(DEMO_USER)
    user_id = str(result.inserted_id)
    print(f"Created demo user: {DEMO_USER['email']} (id: {user_id})")

    # Seed suppliers
    for s in SUPPLIERS:
        s["user_id"] = user_id
        s["created_at"] = datetime.utcnow()
        emissions = calculate_supplier_emissions(s)
        s.update(emissions)
        await db.suppliers.insert_one(s)
    print(f"Seeded {len(SUPPLIERS)} suppliers")

    # Seed warehouses
    for w in WAREHOUSES:
        w["user_id"] = user_id
        w["created_at"] = datetime.utcnow()
        emissions = calculate_warehouse_emissions(w)
        w.update(emissions)
        await db.warehouses.insert_one(w)
    print(f"Seeded {len(WAREHOUSES)} warehouses")

    # Seed transport routes
    for t in TRANSPORT_ROUTES:
        t["user_id"] = user_id
        t["created_at"] = datetime.utcnow()
        emissions = calculate_route_emissions(t)
        t.update(emissions)
        await db.transport_routes.insert_one(t)
    print(f"Seeded {len(TRANSPORT_ROUTES)} transport routes")

    print("\n✅ Seed complete!")
    print(f"Login: demo@echochain.uk / demo123")

    client.close()


if __name__ == "__main__":
    asyncio.run(seed())
