"""Forecasting API routes."""
from fastapi import APIRouter, Depends, Query
from app.database import get_db
from app.utils.auth import get_current_user
from app.services.forecasting_service import generate_historical_emissions, forecast_emissions_rf

router = APIRouter()


@router.get("/predict")
async def get_forecast(
    months_ahead: int = Query(default=12, ge=1, le=24),
    user_id: str = Depends(get_current_user)
):
    db = get_db()

    # Calculate current total emissions
    total = 0
    async for doc in db.suppliers.find({"user_id": user_id}):
        total += doc.get("total_emissions", 0)
    async for doc in db.warehouses.find({"user_id": user_id}):
        total += doc.get("total_emissions", 0)
    async for doc in db.transport_routes.find({"user_id": user_id}):
        total += doc.get("annual_emissions", 0)

    if total == 0:
        return {"forecasts": [], "model_used": "none", "rmse": None, "historical": []}

    # Generate historical data and forecast
    historical = generate_historical_emissions(total, months=24)
    forecast = forecast_emissions_rf(historical, months_ahead)
    forecast["historical"] = historical

    return forecast
