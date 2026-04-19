# 🌿 EchoChain — AI-Assisted Carbon Hotspot Identifier

> A full-stack web platform that identifies carbon hotspots across UK supply chains, predicts emissions trends using ML, and recommends actionable reductions.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18 + Vite + Tailwind CSS |
| Backend | FastAPI (Python) |
| Database | MongoDB (via Motor async driver) |
| ML | scikit-learn (RandomForest), historical trend analysis |
| Charts | Recharts |
| Auth | JWT + bcrypt |

## Features

- **Scope 1, 2, 3 Emissions Calculation** — using UK DEFRA 2024 conversion factors
- **Supplier Management** — CRUD with automatic emissions calculation
- **Warehouse Tracking** — electricity, gas, refrigeration, renewable % tracking
- **Transport Routes** — road, rail, sea, air with per-trip/monthly/annual emissions
- **ML Forecasting** — RandomForest Regression with confidence bands
- **Smart Recommendations** — rule-based engine with prioritised reduction actions
- **Interactive Dashboard** — live charts, scope breakdown, hotspot ranking
- **JWT Authentication** — secure user sessions with per-user data isolation

## Project Structure

```
echochain/
├── backend/
│   ├── main.py                    # FastAPI entry point
│   ├── seed.py                    # Demo data seeder
│   ├── requirements.txt
│   ├── .env                       # Config (MongoDB URL, JWT secret)
│   └── app/
│       ├── database.py            # MongoDB connection (Motor)
│       ├── models/
│       │   └── schemas.py         # Pydantic models
│       ├── routes/
│       │   ├── auth.py            # Register / Login / JWT
│       │   ├── suppliers.py       # Supplier CRUD
│       │   ├── warehouses.py      # Warehouse CRUD
│       │   ├── transport.py       # Transport route CRUD
│       │   ├── emissions.py       # Aggregated emissions summary
│       │   ├── forecasting.py     # ML predictions endpoint
│       │   ├── recommendations.py # Smart recommendations
│       │   └── dashboard.py       # Dashboard aggregation
│       ├── services/
│       │   ├── forecasting_service.py    # RandomForest ML engine
│       │   └── recommendations_service.py # Rule-based recommendation engine
│       └── utils/
│           ├── auth.py            # JWT + password hashing
│           └── emission_factors.py # DEFRA 2024 factors & calculations
│
└── frontend/
    ├── index.html
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── postcss.config.js
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── context/
        │   └── AuthContext.jsx
        ├── components/
        │   ├── Layout.jsx
        │   ├── Modal.jsx
        │   └── SharedComponents.jsx
        ├── pages/
        │   ├── LoginPage.jsx
        │   ├── DashboardPage.jsx
        │   ├── SuppliersPage.jsx
        │   ├── WarehousesPage.jsx
        │   ├── TransportPage.jsx
        │   ├── ForecastingPage.jsx
        │   └── RecommendationsPage.jsx
        └── utils/
            └── api.js
```

## Setup & Running

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Backend

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Configure API keys in .env (already pre-filled)
# CLIMATIQ_API_KEY=your_key
# OPENAI_API_KEY=your_key
# Carbon Intensity API needs NO key

# Seed demo data
python seed.py

# Start server
uvicorn main:app --reload --port 8000
```

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 3. Open

Visit **http://localhost:5173** and log in with:
- Email: `demo@echochain.uk`
- Password: `demo123`

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Get JWT token |
| GET/POST | /api/suppliers/ | List/Create suppliers |
| PUT/DELETE | /api/suppliers/{id} | Update/Delete supplier |
| GET/POST | /api/warehouses/ | List/Create warehouses |
| PUT/DELETE | /api/warehouses/{id} | Update/Delete warehouse |
| GET/POST | /api/transport/ | List/Create transport routes |
| PUT/DELETE | /api/transport/{id} | Update/Delete route |
| GET | /api/emissions/summary | Full emissions breakdown |
| GET | /api/forecasting/predict | ML emissions forecast |
| GET | /api/recommendations/ | Smart reduction recommendations |
| GET | /api/dashboard/ | Dashboard aggregation |
| **Live Data & AI** | | |
| GET | /api/live/carbon-intensity/current | Real-time UK grid intensity (National Grid) |
| GET | /api/live/carbon-intensity/generation-mix | Current UK generation mix |
| GET | /api/live/carbon-intensity/regional | Regional intensity by postcode |
| GET | /api/live/carbon-intensity/forecast | 48-hour grid forecast |
| GET | /api/live/carbon-intensity/live-factor | Live kgCO₂/kWh for Scope 2 |
| GET | /api/live/climatiq/electricity | Climatiq electricity emissions |
| GET | /api/live/climatiq/fuel | Climatiq fuel emissions |
| GET | /api/live/climatiq/freight | Climatiq freight emissions |
| GET | /api/live/climatiq/search | Search DEFRA factors via Climatiq |
| GET | /api/live/ai/recommendations | GPT-powered reduction strategies |
| POST | /api/live/ai/ask | Natural-language emissions Q&A |
| GET | /api/live/ai/secr-report | AI-generated SECR compliance report |
| GET | /api/live/distance/calculate | UK city distance calculator |

## Live API Integrations

| API | Purpose | Auth | Cost |
|-----|---------|------|------|
| National Grid Carbon Intensity | Real-time UK grid emissions (gCO₂/kWh) | No key needed | Free |
| Climatiq | Official DEFRA/BEIS emission factors | API key | Free (250 calls/mo) |
| OpenAI GPT-4o-mini | AI recommendations, SECR reports, Q&A | API key | Pay-per-use |
| Haversine Distance | UK city-to-city distance calculator | No key needed | Free |

## DEFRA Emission Factors Used

- **Fuel**: diesel 2.70, petrol 2.31, natural gas 2.02 kgCO₂e/litre
- **Electricity**: 0.20705 kgCO₂e/kWh (UK grid 2024)
- **Gas heating**: 0.18254 kgCO₂e/kWh
- **Transport**: road diesel 0.107, rail 0.028, sea 0.016, air 0.602 kgCO₂e/tonne-km

## Compliance Support

- SECR (Streamlined Energy and Carbon Reporting)
- UK ETS (UK Emissions Trading Scheme)
- Net Zero Freight Strategy

## License

MIT
