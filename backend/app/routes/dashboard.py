"""Dashboard data aggregation route."""
from fastapi import APIRouter, Depends
from app.database import get_db
from app.utils.auth import get_current_user
from app.services.forecasting_service import generate_historical_emissions

router = APIRouter()


@router.get("/")
async def get_dashboard(user_id: str = Depends(get_current_user)):
    db = get_db()

    # Count entities
    supplier_count = await db.suppliers.count_documents({"user_id": user_id})
    warehouse_count = await db.warehouses.count_documents({"user_id": user_id})
    transport_count = await db.transport_routes.count_documents({"user_id": user_id})

    # Aggregate emissions
    s1_total = 0
    s2_total = 0
    s3_total = 0
    all_sources = []

    async for doc in db.suppliers.find({"user_id": user_id}):
        s1_total += doc.get("scope1_emissions", 0)
        s2_total += doc.get("scope2_emissions", 0)
        s3_total += doc.get("scope3_emissions", 0)
        all_sources.append({
            "name": doc["name"], "type": "Supplier",
            "emissions": doc.get("total_emissions", 0),
            "category": "supplier"
        })

    async for doc in db.warehouses.find({"user_id": user_id}):
        s1_total += doc.get("scope1_emissions", 0)
        s2_total += doc.get("scope2_emissions", 0)
        all_sources.append({
            "name": doc["name"], "type": "Warehouse",
            "emissions": doc.get("total_emissions", 0),
            "category": "warehouse"
        })

    async for doc in db.transport_routes.find({"user_id": user_id}):
        s3_total += doc.get("annual_emissions", 0)
        all_sources.append({
            "name": doc["name"], "type": "Transport",
            "emissions": doc.get("annual_emissions", 0),
            "category": "transport"
        })

    total = round(s1_total + s2_total + s3_total, 2)

    # Get hotspots
    all_sources.sort(key=lambda x: x["emissions"], reverse=True)
    top_hotspots = all_sources[:6]

    # Monthly trend (simulated from total)
    monthly_trend = generate_historical_emissions(total, months=12) if total > 0 else []

    # Emissions by category
    supplier_total = sum(s["emissions"] for s in all_sources if s["category"] == "supplier")
    warehouse_total = sum(s["emissions"] for s in all_sources if s["category"] == "warehouse")
    transport_total = sum(s["emissions"] for s in all_sources if s["category"] == "transport")

    return {
        "total_emissions": total,
        "scope1": round(s1_total, 2),
        "scope2": round(s2_total, 2),
        "scope3": round(s3_total, 2),
        "supplier_count": supplier_count,
        "warehouse_count": warehouse_count,
        "transport_route_count": transport_count,
        "top_hotspots": top_hotspots,
        "monthly_trend": monthly_trend,
        "emissions_by_scope": {
            "scope1": round(s1_total, 2),
            "scope2": round(s2_total, 2),
            "scope3": round(s3_total, 2),
        },
        "emissions_by_category": [
            {"name": "Suppliers", "value": round(supplier_total, 2)},
            {"name": "Warehouses", "value": round(warehouse_total, 2)},
            {"name": "Transport", "value": round(transport_total, 2)},
        ],
    }
