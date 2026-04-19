"""
ML Forecasting Service
Uses RandomForest for feature-based prediction and
generates time-series forecasts for emissions trends.
"""
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.metrics import mean_squared_error
from datetime import datetime, timedelta
import random


def generate_historical_emissions(total_current: float, months: int = 24) -> list:
    """Generate simulated historical monthly emissions data for forecasting."""
    data = []
    base = total_current / 12  # monthly average
    for i in range(months):
        month_date = datetime.now() - timedelta(days=30 * (months - i))
        # Add seasonal variation and slight upward trend
        seasonal = np.sin(2 * np.pi * i / 12) * base * 0.15
        trend = base * (0.85 + 0.15 * (i / months))
        noise = random.gauss(0, base * 0.05)
        value = max(0, trend + seasonal + noise)
        data.append({
            "date": month_date.strftime("%Y-%m-%d"),
            "month": month_date.strftime("%Y-%m"),
            "emissions": round(value, 2)
        })
    return data


def forecast_emissions_rf(historical: list, months_ahead: int = 12) -> dict:
    """
    RandomForest-based emissions forecasting.
    Uses month index and seasonal features to predict future emissions.
    """
    if len(historical) < 6:
        # Not enough data, return simple projection
        avg = np.mean([h["emissions"] for h in historical]) if historical else 100
        forecasts = []
        for i in range(months_ahead):
            future_date = datetime.now() + timedelta(days=30 * (i + 1))
            forecasts.append({
                "month": future_date.strftime("%Y-%m"),
                "predicted_emissions": round(avg, 2),
                "lower_bound": round(avg * 0.85, 2),
                "upper_bound": round(avg * 1.15, 2),
            })
        return {"forecasts": forecasts, "model_used": "simple_average", "rmse": None}

    # Prepare features: month_index, month_of_year, sin/cos seasonality
    X = []
    y = []
    for i, h in enumerate(historical):
        month_of_year = int(h["month"].split("-")[1])
        X.append([
            i,
            month_of_year,
            np.sin(2 * np.pi * month_of_year / 12),
            np.cos(2 * np.pi * month_of_year / 12),
        ])
        y.append(h["emissions"])

    X = np.array(X)
    y = np.array(y)

    # Train RandomForest
    model = RandomForestRegressor(n_estimators=100, random_state=42, max_depth=6)
    model.fit(X, y)

    # Calculate RMSE on training data
    y_pred_train = model.predict(X)
    rmse = round(float(np.sqrt(mean_squared_error(y, y_pred_train))), 2)

    # Predict future
    forecasts = []
    n = len(historical)
    for i in range(months_ahead):
        future_date = datetime.now() + timedelta(days=30 * (i + 1))
        month_of_year = future_date.month
        features = np.array([[
            n + i,
            month_of_year,
            np.sin(2 * np.pi * month_of_year / 12),
            np.cos(2 * np.pi * month_of_year / 12),
        ]])
        pred = model.predict(features)[0]
        # Confidence interval using training std
        std = np.std(y_pred_train - y) * 1.5
        forecasts.append({
            "month": future_date.strftime("%Y-%m"),
            "predicted_emissions": round(max(0, pred), 2),
            "lower_bound": round(max(0, pred - std), 2),
            "upper_bound": round(pred + std, 2),
        })

    return {
        "forecasts": forecasts,
        "model_used": "RandomForest Regression",
        "rmse": rmse,
    }


def predict_what_if(current_emissions: dict, changes: dict) -> dict:
    """
    What-if scenario analysis.
    changes: dict with keys like 'supplier_reduction_pct', 'transport_switch_mode', etc.
    """
    result = current_emissions.copy()

    if "supplier_reduction_pct" in changes:
        pct = changes["supplier_reduction_pct"] / 100
        result["scope3_total"] = round(result.get("scope3_total", 0) * (1 - pct), 2)

    if "renewable_increase_pct" in changes:
        pct = changes["renewable_increase_pct"] / 100
        result["scope2_total"] = round(result.get("scope2_total", 0) * (1 - pct), 2)

    if "transport_reduction_pct" in changes:
        pct = changes["transport_reduction_pct"] / 100
        scope3_transport = result.get("transport_emissions", 0)
        result["scope3_total"] = round(
            result.get("scope3_total", 0) - scope3_transport * pct, 2
        )

    result["grand_total"] = round(
        result.get("scope1_total", 0) + result.get("scope2_total", 0) + result.get("scope3_total", 0), 2
    )
    return result
