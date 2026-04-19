"""Recommendations API routes."""
from fastapi import APIRouter, Depends
from app.database import get_db
from app.utils.auth import get_current_user
from app.services.recommendations_service import generate_recommendations

router = APIRouter()


@router.get("/")
async def get_recommendations(user_id: str = Depends(get_current_user)):
    db = get_db()

    # Gather all emissions data
    suppliers = []
    async for doc in db.suppliers.find({"user_id": user_id}):
        suppliers.append({
            "name": doc["name"],
            "total_emissions": doc.get("total_emissions", 0),
            "scope3_emissions": doc.get("scope3_emissions", 0),
        })

    warehouses = []
    async for doc in db.warehouses.find({"user_id": user_id}):
        warehouses.append({
            "name": doc["name"],
            "total_emissions": doc.get("total_emissions", 0),
            "renewable_percentage": doc.get("renewable_percentage", 0),
        })

    transport = []
    async for doc in db.transport_routes.find({"user_id": user_id}):
        transport.append({
            "name": doc["name"],
            "origin": doc.get("origin", ""),
            "destination": doc.get("destination", ""),
            "mode": doc.get("mode", ""),
            "annual_emissions": doc.get("annual_emissions", 0),
        })

    s1 = sum(s.get("total_emissions", 0) - s.get("scope3_emissions", 0) for s in suppliers) + \
         sum(w.get("total_emissions", 0) for w in warehouses)
    s3 = sum(s.get("scope3_emissions", 0) for s in suppliers) + \
         sum(t.get("annual_emissions", 0) for t in transport)
    total = s1 + s3

    emissions_data = {
        "scope1_total": round(s1 * 0.3, 2),
        "scope2_total": round(s1 * 0.7, 2),
        "scope3_total": round(s3, 2),
        "grand_total": round(total, 2),
        "by_supplier": suppliers,
        "by_warehouse": warehouses,
        "by_transport": transport,
        "transport_emissions": sum(t["annual_emissions"] for t in transport),
    }

    return generate_recommendations(emissions_data)
