"""Pydantic schemas for EchoChain data models."""
from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum


# ─── Auth ───────────────────────────────────────────────
class UserCreate(BaseModel):
    email: str
    password: str
    company_name: str
    full_name: str = ""
    company_phone: str = ""
    company_address: str = ""

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    company_name: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Suppliers ──────────────────────────────────────────
class SupplierCreate(BaseModel):
    name: str
    location: str
    industry: str
    annual_production_volume: float = Field(ge=0, description="Units produced per year")
    fuel_type: str = "natural_gas"
    fuel_consumed_litres: float = Field(ge=0, default=0)
    electricity_kwh: float = Field(ge=0, default=0)
    emission_factor_scope3: float = Field(ge=0, default=0.5, description="kgCO2e per unit produced")

class SupplierResponse(SupplierCreate):
    id: str
    user_id: str
    scope1_emissions: float = 0
    scope2_emissions: float = 0
    scope3_emissions: float = 0
    total_emissions: float = 0
    created_at: datetime = None


# ─── Warehouses ─────────────────────────────────────────
class WarehouseCreate(BaseModel):
    name: str
    location: str
    size_sqm: float = Field(ge=0)
    electricity_kwh_monthly: float = Field(ge=0)
    gas_kwh_monthly: float = Field(ge=0, default=0)
    refrigeration: bool = False
    renewable_percentage: float = Field(ge=0, le=100, default=0)

class WarehouseResponse(WarehouseCreate):
    id: str
    user_id: str
    scope1_emissions: float = 0
    scope2_emissions: float = 0
    total_emissions: float = 0
    created_at: datetime = None


# ─── Transport ──────────────────────────────────────────
class TransportMode(str, Enum):
    road_diesel = "road_diesel"
    road_petrol = "road_petrol"
    road_electric = "road_electric"
    rail = "rail"
    sea = "sea"
    air = "air"

class TransportRouteCreate(BaseModel):
    name: str
    origin: str
    destination: str
    distance_km: float = Field(ge=0)
    mode: TransportMode
    weight_tonnes: float = Field(ge=0, default=1.0)
    trips_per_month: int = Field(ge=0, default=1)

class TransportRouteResponse(TransportRouteCreate):
    id: str
    user_id: str
    emissions_per_trip: float = 0
    monthly_emissions: float = 0
    annual_emissions: float = 0
    created_at: datetime = None


# ─── Emissions ──────────────────────────────────────────
class EmissionsSummary(BaseModel):
    scope1_total: float
    scope2_total: float
    scope3_total: float
    grand_total: float
    by_supplier: list = []
    by_warehouse: list = []
    by_transport: list = []
    hotspots: list = []


# ─── Forecasting ────────────────────────────────────────
class ForecastRequest(BaseModel):
    months_ahead: int = Field(ge=1, le=24, default=12)

class ForecastResult(BaseModel):
    month: str
    predicted_emissions: float
    lower_bound: float
    upper_bound: float

class ForecastResponse(BaseModel):
    forecasts: List[ForecastResult]
    model_used: str
    rmse: Optional[float] = None


# ─── Recommendations ────────────────────────────────────
class Recommendation(BaseModel):
    id: int
    category: str
    priority: str
    title: str
    description: str
    potential_reduction_pct: float
    potential_reduction_kgco2e: float
    effort: str
    scope: str

class RecommendationsResponse(BaseModel):
    recommendations: List[Recommendation]
    total_potential_reduction: float
    total_potential_reduction_pct: float


# ─── Dashboard ──────────────────────────────────────────
class DashboardData(BaseModel):
    total_emissions: float
    scope1: float
    scope2: float
    scope3: float
    supplier_count: int
    warehouse_count: int
    transport_route_count: int
    top_hotspots: list
    monthly_trend: list
    emissions_by_scope: dict
    emissions_by_category: list
