# Chain scope AI — AI Carbon Intelligence Platform

> Full-stack SaaS platform that identifies carbon hotspots across UK supply chains, forecasts emission trends with ML, recommends actionable reductions, and visualises optimised transport routes on an interactive map.

---

## Features

| Module | What it does |
|---|---|
| **Carbon Hotspot Map** | Interactive Google Maps view — suppliers, warehouses, and transport routes plotted with live AI-generated insights per marker |
| **Scope 1 / 2 / 3 Tracking** | Automatic calculation using UK DEFRA 2024 emission factors for fuel, electricity, gas, and freight |
| **Supplier Management** | Full CRUD — bulk import via Excel/CSV with format guide popup |
| **Warehouse Tracking** | Electricity, gas, refrigeration surcharge, renewable % — per-facility emissions |
| **Transport Routes** | Road (diesel/petrol/EV), rail, sea, air — per-trip and annual CO₂e |
| **Route Optimisation Map** | Real road routes via Google Directions API, floating emission labels, switch-mode savings badges |
| **ML Forecasting** | RandomForest Regression — up to 12-month emission predictions with confidence bands |
| **Smart Recommendations** | Rule-based engine with High/Medium/Low priority actions and tab-based map integration |
| **Live UK Grid Intensity** | Real-time data from National Grid ESO — generation mix, regional intensity, 48-hour forecast |
| **AI Assistant** | GPT-powered recommendations, SECR compliance report generation, and natural-language Q&A |
| **Pricing & Payments** | Stripe Checkout — Starter / Pro / Enterprise plans, monthly & yearly billing, webhook lifecycle |
| **Authentication** | JWT + bcrypt, token validation on mount, per-user data isolation |
| **Excel / CSV Import** | `.xlsx`, `.xls`, `.csv` — normalised headers, validation, skip-and-report on bad rows |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite 5 + Tailwind CSS (custom `echo` + `carbon` palettes) |
| Routing | React Router v6 (nested protected routes) |
| Backend | FastAPI (Python 3.10+) |
| Database | MongoDB via Motor (async) |
| ML | scikit-learn RandomForest, pandas, numpy |
| Charts | Recharts |
| Maps | Google Maps JavaScript API + Directions API |
| Payments | Stripe Checkout + Webhooks |
| AI | OpenAI GPT-4o-mini |
| Auth | JWT (`python-jose`) + bcrypt (`passlib`) |
| Excel parsing | openpyxl + csv (built-in) |
| Live data | National Grid ESO Carbon Intensity API (no key required) |

---

## Project Structure

```
Chain scope AI/
├── .gitignore
├── README.md
│
├── backend/
│   ├── main.py                         # FastAPI app + router registration
│   ├── seed.py                         # Demo data seeder
│   ├── requirements.txt
│   ├── .env                            # Secrets (never commit)
│   ├── .env.example                    # Safe template to commit
│   └── app/
│       ├── database.py                 # Motor MongoDB connection
│       ├── models/
│       │   └── schemas.py              # Pydantic request/response models
│       ├── routes/
│       │   ├── auth.py                 # Register / Login / /me
│       │   ├── suppliers.py            # Supplier CRUD
│       │   ├── warehouses.py           # Warehouse CRUD
│       │   ├── transport.py            # Transport route CRUD
│       │   ├── emissions.py            # Aggregated emissions summary
│       │   ├── forecasting.py          # ML predictions endpoint
│       │   ├── recommendations.py      # Rule-based recommendations
│       │   ├── dashboard.py            # Dashboard aggregation
│       │   ├── live_data.py            # Grid intensity + AI endpoints
│       │   ├── maps.py                 # Geocoding + map data
│       │   ├── payments.py             # Stripe checkout / webhook
│       │   ├── excel_upload.py         # Bulk Excel/CSV import
│       │   └── pdf_upload.py           # PDF intelligence upload
│       ├── services/
│       │   ├── forecasting_service.py
│       │   ├── recommendations_service.py
│       │   ├── maps_service.py         # Geocoding, route resolution
│       │   └── openai_service.py       # GPT integration
│       └── utils/
│           ├── auth.py                 # JWT + bcrypt helpers
│           └── emission_factors.py     # DEFRA 2024 factors & calculations
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js                  # Dev proxy → localhost:8000
    ├── tailwind.config.js              # echo + carbon colour palettes
    ├── public/
    │   └── favicon.svg                 # Leaf logo favicon
    └── src/
        ├── main.jsx
        ├── App.jsx                     # Routes (public + protected)
        ├── index.css                   # Global styles + animation classes
        ├── context/
        │   └── AuthContext.jsx         # JWT auth state + token validation
        ├── components/
        │   ├── Layout.jsx              # Sidebar + top bar
        │   ├── Modal.jsx
        │   ├── SharedComponents.jsx    # StatCard, PageLoader, EmptyState, ScopeBar
        │   ├── ExcelUploader.jsx       # Format guide popup + file import modal
        │   └── RouteOptimizationMap.jsx # Google Maps + Directions API map
        ├── pages/
        │   ├── LandingPage.jsx         # Public marketing page
        │   ├── LoginPage.jsx
        │   ├── SignupPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── SuppliersPage.jsx
        │   ├── WarehousesPage.jsx
        │   ├── TransportPage.jsx
        │   ├── HotspotMapPage.jsx
        │   ├── ForecastingPage.jsx
        │   ├── RecommendationsPage.jsx
        │   ├── LiveGridPage.jsx
        │   ├── AIAssistantPage.jsx
        │   ├── PricingPage.jsx
        │   └── PaymentSuccessPage.jsx
        └── utils/
            └── api.js                  # Axios instance with auth interceptor
```

---

## Setup

### Prerequisites

- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)
- Google Maps API key (Maps JavaScript API + Directions API enabled)
- OpenAI API key
- Stripe account + secret key (optional — only needed for payments)

---

### 1. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
source venv/bin/activate        # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template and fill in your values
cp .env.example .env
```

**`backend/.env` variables:**

```env
MONGODB_URL=mongodb://localhost:27017
DATABASE_NAME=Chain scope AI
SECRET_KEY=change-this-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

OPENAI_API_KEY=sk-...
GOOGLE_MAPS_API_KEY=AIza...

# Stripe (optional — leave blank to skip payment features)
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_STARTER_MONTHLY_PRICE_ID=price_...
STRIPE_STARTER_YEARLY_PRICE_ID=price_...
STRIPE_PRO_MONTHLY_PRICE_ID=price_...
STRIPE_PRO_YEARLY_PRICE_ID=price_...

FRONTEND_URL=http://localhost:5173
```

```bash
# (Optional) Seed demo data
python seed.py

# Start the API server
uvicorn main:app --reload --port 8000
```

API docs available at **http://localhost:8000/docs**

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Copy environment template
cp .env.example .env
```

**`frontend/.env` variables:**

```env
VITE_GOOGLE_MAPS_API_KEY=AIza...
```

```bash
# Start the dev server
npm run dev
```

Open **http://localhost:5173**

---

## API Reference

### Auth

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Create account |
| POST | `/api/auth/login` | Get JWT token |
| GET | `/api/auth/me` | Validate token / get current user |

### Data (all require Bearer token)

| Method | Endpoint | Description |
|---|---|---|
| GET / POST | `/api/suppliers/` | List / create suppliers |
| PUT / DELETE | `/api/suppliers/{id}` | Update / delete supplier |
| GET / POST | `/api/warehouses/` | List / create warehouses |
| PUT / DELETE | `/api/warehouses/{id}` | Update / delete warehouse |
| GET / POST | `/api/transport/` | List / create transport routes |
| PUT / DELETE | `/api/transport/{id}` | Update / delete route |
| POST | `/api/excel/import-suppliers` | Bulk import suppliers (Excel/CSV) |
| POST | `/api/excel/import-warehouses` | Bulk import warehouses (Excel/CSV) |
| POST | `/api/excel/import-transport` | Bulk import transport routes (Excel/CSV) |

### Analytics

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/dashboard/` | Dashboard KPIs + charts |
| GET | `/api/emissions/summary` | Full Scope 1/2/3 breakdown |
| GET | `/api/forecasting/predict` | ML emission forecast (up to 12 months) |
| GET | `/api/recommendations/` | Prioritised reduction recommendations |
| GET | `/api/maps/data` | Geocoded markers + routes for map |

### Live Data & AI

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/live/carbon-intensity/current` | Real-time UK grid intensity |
| GET | `/api/live/carbon-intensity/generation-mix` | Current UK generation mix |
| GET | `/api/live/carbon-intensity/regional` | Regional intensity by postcode |
| GET | `/api/live/carbon-intensity/forecast` | 48-hour grid forecast |
| GET | `/api/live/ai/recommendations` | GPT-powered reduction strategies |
| POST | `/api/live/ai/ask` | Natural-language emissions Q&A |
| GET | `/api/live/ai/secr-report` | AI-generated SECR compliance report |

### Payments

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/payments/create-checkout` | Start Stripe Checkout session |
| POST | `/api/payments/verify-session` | Activate subscription after payment |
| POST | `/api/payments/webhook` | Stripe event webhook (signature verified) |
| GET | `/api/payments/subscription` | Current user subscription status |

---

## DEFRA 2024 Emission Factors

| Source | Factor |
|---|---|
| Diesel | 2.70 kgCO₂e / litre |
| Petrol | 2.31 kgCO₂e / litre |
| Natural gas | 2.02 kgCO₂e / litre |
| UK electricity (grid) | 0.20705 kgCO₂e / kWh |
| Gas heating | 0.18254 kgCO₂e / kWh |
| Road freight (diesel) | 0.10711 kgCO₂e / tonne-km |
| Rail freight | 0.02780 kgCO₂e / tonne-km |
| Sea freight | 0.01610 kgCO₂e / tonne-km |
| Air freight | 0.60220 kgCO₂e / tonne-km |

---

## Compliance

- **SECR** — Streamlined Energy and Carbon Reporting (UK mandatory for large companies)
- **UK ETS** — UK Emissions Trading Scheme
- **GHG Protocol** — Scope 1, 2, and 3 categorisation
- **Net Zero Freight Strategy** — Transport mode optimisation recommendations

---

## License

MIT
