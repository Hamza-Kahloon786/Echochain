"""
EchoChain - AI-Assisted Carbon Hotspot Identifier
FastAPI Backend Server
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.database import connect_db, close_db
from app.routes import suppliers, warehouses, transport, emissions, forecasting, recommendations, dashboard, auth, live_data, pdf_upload, maps, payments, excel_upload


@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()


app = FastAPI(
    title="EchoChain API",
    description="AI-Assisted Carbon Hotspot Identifier for UK Supply Chains",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(suppliers.router, prefix="/api/suppliers", tags=["Suppliers"])
app.include_router(warehouses.router, prefix="/api/warehouses", tags=["Warehouses"])
app.include_router(transport.router, prefix="/api/transport", tags=["Transport Routes"])
app.include_router(emissions.router, prefix="/api/emissions", tags=["Emissions"])
app.include_router(forecasting.router, prefix="/api/forecasting", tags=["Forecasting"])
app.include_router(recommendations.router, prefix="/api/recommendations", tags=["Recommendations"])
app.include_router(dashboard.router, prefix="/api/dashboard", tags=["Dashboard"])
app.include_router(live_data.router, prefix="/api/live", tags=["Live Data & AI"])
app.include_router(pdf_upload.router, prefix="/api/pdf", tags=["PDF Upload"])
app.include_router(maps.router,     prefix="/api/maps",     tags=["Maps & Geocoding"])
app.include_router(payments.router,      prefix="/api/payments",      tags=["Payments"])
app.include_router(excel_upload.router,  prefix="/api/excel",          tags=["Excel Import"])


@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "EchoChain API"}
