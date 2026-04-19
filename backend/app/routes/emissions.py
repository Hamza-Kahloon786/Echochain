"""Emissions calculation and aggregation routes."""
from fastapi import APIRouter, Depends
from app.database import get_db
from app.utils.auth import get_current_user

router = APIRouter()


@router.get("/summary")
async def get_emissions_summary(user_id: str = Depends(get_current_user)):
    db = get_db()

    # Aggregate supplier emissions
    suppliers = []
    async for doc in db.suppliers.find({"user_id": user_id}):
        suppliers.append({
            "name": doc["name"],
            "location": doc.get("location", ""),
            "scope1_emissions": doc.get("scope1_emissions", 0),
            "scope2_emissions": doc.get("scope2_emissions", 0),
            "scope3_emissions": doc.get("scope3_emissions", 0),
            "total_emissions": doc.get("total_emissions", 0),
        })

    # Aggregate warehouse emissions
    warehouses = []
    async for doc in db.warehouses.find({"user_id": user_id}):
        warehouses.append({
            "name": doc["name"],
            "location": doc.get("location", ""),
            "scope1_emissions": doc.get("scope1_emissions", 0),
            "scope2_emissions": doc.get("scope2_emissions", 0),
            "total_emissions": doc.get("total_emissions", 0),
            "renewable_percentage": doc.get("renewable_percentage", 0),
        })

    # Aggregate transport emissions
    transport = []
    async for doc in db.transport_routes.find({"user_id": user_id}):
        transport.append({
            "name": doc["name"],
            "origin": doc.get("origin", ""),
            "destination": doc.get("destination", ""),
            "mode": doc.get("mode", ""),
            "emissions_per_trip": doc.get("emissions_per_trip", 0),
            "monthly_emissions": doc.get("monthly_emissions", 0),
            "annual_emissions": doc.get("annual_emissions", 0),
        })

    # Calculate totals
    s1_suppliers = sum(s["scope1_emissions"] for s in suppliers)
    s1_warehouses = sum(w["scope1_emissions"] for w in warehouses)
    s2_suppliers = sum(s["scope2_emissions"] for s in suppliers)
    s2_warehouses = sum(w["scope2_emissions"] for w in warehouses)
    s3_suppliers = sum(s["scope3_emissions"] for s in suppliers)
    s3_transport = sum(t["annual_emissions"] for t in transport)

    scope1_total = round(s1_suppliers + s1_warehouses, 2)
    scope2_total = round(s2_suppliers + s2_warehouses, 2)
    scope3_total = round(s3_suppliers + s3_transport, 2)
    grand_total = round(scope1_total + scope2_total + scope3_total, 2)

    # Identify hotspots (top emitters)
    all_sources = []
    for s in suppliers:
        all_sources.append({"name": s["name"], "type": "Supplier", "emissions": s["total_emissions"]})
    for w in warehouses:
        all_sources.append({"name": w["name"], "type": "Warehouse", "emissions": w["total_emissions"]})
    for t in transport:
        all_sources.append({"name": t["name"], "type": "Transport", "emissions": t["annual_emissions"]})

    all_sources.sort(key=lambda x: x["emissions"], reverse=True)
    hotspots = all_sources[:5]

    return {
        "scope1_total": scope1_total,
        "scope2_total": scope2_total,
        "scope3_total": scope3_total,
        "grand_total": grand_total,
        "by_supplier": suppliers,
        "by_warehouse": warehouses,
        "by_transport": transport,
        "hotspots": hotspots,
        "transport_emissions": s3_transport,
    }
