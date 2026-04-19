"""
PDF Upload & AI Extraction Service
Extracts supplier, warehouse, and transport data from uploaded PDFs
using pdfplumber for text extraction + OpenAI GPT for intelligent parsing.
"""
import os
import json
import tempfile
import pdfplumber
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


def extract_text_from_pdf(file_path: str) -> str:
    """Extract all text from a PDF file."""
    text = ""
    with pdfplumber.open(file_path) as pdf:
        for page in pdf.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n\n"
            # Also try extracting tables
            tables = page.extract_tables()
            for table in tables:
                for row in table:
                    if row:
                        text += " | ".join([str(cell) if cell else "" for cell in row]) + "\n"
                text += "\n"
    return text.strip()


async def parse_suppliers_from_text(text: str) -> dict:
    """Use GPT to extract supplier data from PDF text."""
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    prompt = f"""Extract supplier information from the following document text.
Return a JSON array of suppliers. Each supplier should have these fields:
- name (string, required)
- location (string, required - city/region)
- industry (string, required)
- annual_production_volume (number, estimated units per year, default 10000)
- fuel_type (string: "natural_gas", "diesel", "petrol", "lpg", "fuel_oil", "coal", "biofuel" - default "natural_gas")
- fuel_consumed_litres (number, annual fuel in litres, default 0)
- electricity_kwh (number, annual electricity in kWh, default 0)
- emission_factor_scope3 (number, kgCO2e per unit produced, default 0.5)

Extract as many suppliers as you can find. If specific values aren't mentioned, make reasonable estimates based on the industry type and UK averages.

DOCUMENT TEXT:
{text[:6000]}

Respond with ONLY a JSON object in this format, no markdown:
{{"suppliers": [...], "extraction_notes": "brief note about what was found"}}"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You extract structured data from documents. Always respond with valid JSON only, no markdown fences."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=3000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        if content.startswith("json"):
            content = content[4:].strip()

        result = json.loads(content)
        result["success"] = True
        result["source"] = "PDF extraction via OpenAI"
        return result
    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse AI response", "raw": content[:500]}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def parse_warehouses_from_text(text: str) -> dict:
    """Use GPT to extract warehouse/facility data from PDF text."""
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    prompt = f"""Extract warehouse/facility information from the following document text.
Return a JSON array of warehouses. Each warehouse should have these fields:
- name (string, required)
- location (string, required)
- size_sqm (number, floor area in square metres, default 1000)
- electricity_kwh_monthly (number, monthly electricity usage, default 5000)
- gas_kwh_monthly (number, monthly gas usage, default 2000)
- refrigeration (boolean, whether it has cold storage, default false)
- renewable_percentage (number 0-100, % of electricity from renewables, default 0)

Extract as many warehouses/facilities as you can find. Estimate values based on UK averages if not specified.

DOCUMENT TEXT:
{text[:6000]}

Respond with ONLY a JSON object, no markdown:
{{"warehouses": [...], "extraction_notes": "brief note"}}"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You extract structured data from documents. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=3000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        if content.startswith("json"):
            content = content[4:].strip()

        result = json.loads(content)
        result["success"] = True
        return result
    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse AI response"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def parse_transport_from_text(text: str) -> dict:
    """Use GPT to extract transport route data from PDF text."""
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    prompt = f"""Extract transport/logistics route information from the following document text.
Return a JSON array of transport routes. Each route should have these fields:
- name (string, required - descriptive name like "London-Birmingham Delivery")
- origin (string, required - city name)
- destination (string, required - city name)
- distance_km (number, estimated distance in km)
- mode (string: "road_diesel", "road_petrol", "road_electric", "rail", "sea", "air" - default "road_diesel")
- weight_tonnes (number, cargo weight per trip, default 5)
- trips_per_month (integer, number of monthly trips, default 4)

Extract as many routes as you can find. Estimate UK road distances if not specified.

DOCUMENT TEXT:
{text[:6000]}

Respond with ONLY a JSON object, no markdown:
{{"transport_routes": [...], "extraction_notes": "brief note"}}"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You extract structured data from documents. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=3000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        if content.startswith("json"):
            content = content[4:].strip()

        result = json.loads(content)
        result["success"] = True
        return result
    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse AI response"}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def parse_all_from_text(text: str) -> dict:
    """Extract all data types from a single PDF in one GPT call."""
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    prompt = f"""Analyse the following document and extract ALL supply chain data into three categories.
This is for a UK carbon emissions tracking platform.

DOCUMENT TEXT:
{text[:8000]}

Return a JSON object with ALL three arrays. Estimate reasonable UK values where data is missing.

{{
  "suppliers": [
    {{
      "name": "string",
      "location": "string (UK city)",
      "industry": "string",
      "annual_production_volume": number,
      "fuel_type": "natural_gas|diesel|petrol|lpg|fuel_oil|coal|biofuel",
      "fuel_consumed_litres": number,
      "electricity_kwh": number,
      "emission_factor_scope3": number (kgCO2e per unit, 0.1-3.0)
    }}
  ],
  "warehouses": [
    {{
      "name": "string",
      "location": "string",
      "size_sqm": number,
      "electricity_kwh_monthly": number,
      "gas_kwh_monthly": number,
      "refrigeration": boolean,
      "renewable_percentage": number (0-100)
    }}
  ],
  "transport_routes": [
    {{
      "name": "string (Origin-Destination Description)",
      "origin": "string",
      "destination": "string",
      "distance_km": number,
      "mode": "road_diesel|road_petrol|road_electric|rail|sea|air",
      "weight_tonnes": number,
      "trips_per_month": integer
    }}
  ],
  "extraction_notes": "summary of what was extracted and any assumptions made"
}}

Respond with ONLY valid JSON, no markdown fences."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a supply chain data extraction expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=4000,
        )
        content = response.choices[0].message.content.strip()
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        if content.startswith("json"):
            content = content[4:].strip()

        result = json.loads(content)
        result["success"] = True
        result["source"] = "PDF bulk extraction via OpenAI"
        return result
    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse AI response", "raw": content[:500] if 'content' in dir() else ""}
    except Exception as e:
        return {"success": False, "error": str(e)}
