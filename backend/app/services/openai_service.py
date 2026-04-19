"""
OpenAI Integration Service
Powers: intelligent recommendations, natural-language report generation,
emissions analysis Q&A, and supplier risk assessment.
"""
import os
import json
from openai import AsyncOpenAI
from dotenv import load_dotenv

load_dotenv()

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")

client = AsyncOpenAI(api_key=OPENAI_API_KEY) if OPENAI_API_KEY else None


async def generate_ai_recommendations(emissions_data: dict) -> dict:
    """
    Use GPT to analyse emissions data and produce intelligent,
    context-specific reduction recommendations.
    """
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    prompt = f"""You are an expert UK carbon emissions consultant specialising in SME supply chains.
Analyse the following emissions data and provide specific, actionable recommendations.

EMISSIONS DATA:
- Scope 1 (Direct): {emissions_data.get('scope1_total', 0):.0f} kgCO2e
- Scope 2 (Energy): {emissions_data.get('scope2_total', 0):.0f} kgCO2e
- Scope 3 (Supply Chain): {emissions_data.get('scope3_total', 0):.0f} kgCO2e
- Total: {emissions_data.get('grand_total', 0):.0f} kgCO2e

TOP EMITTERS:
{json.dumps(emissions_data.get('hotspots', [])[:5], indent=2)}

SUPPLIERS:
{json.dumps(emissions_data.get('by_supplier', [])[:5], indent=2)}

TRANSPORT ROUTES:
{json.dumps(emissions_data.get('by_transport', [])[:5], indent=2)}

WAREHOUSES:
{json.dumps(emissions_data.get('by_warehouse', [])[:3], indent=2)}

Respond with a JSON object containing:
{{
  "summary": "2-3 sentence overall assessment",
  "risk_level": "low|medium|high|critical",
  "recommendations": [
    {{
      "title": "short title",
      "description": "detailed actionable description (2-3 sentences)",
      "category": "Supply Chain|Energy|Transport|Operations|Reporting",
      "priority": "High|Medium|Low",
      "potential_reduction_pct": <number>,
      "potential_reduction_kgco2e": <number>,
      "effort": "Low|Medium|High",
      "scope": "Scope 1|Scope 2|Scope 3|All",
      "timeframe": "Immediate|Short-term|Medium-term|Long-term",
      "uk_incentives": "any relevant UK schemes or incentives"
    }}
  ],
  "compliance_notes": "relevant SECR/UK ETS compliance observations",
  "quick_wins": ["list of 3 immediate actions"]
}}

Focus on UK-specific regulations (SECR, UK ETS, Net Zero Strategy).
Include specific UK government schemes and incentives where applicable.
Provide 5-8 recommendations sorted by impact.
Return ONLY valid JSON, no markdown."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a UK carbon emissions expert. Always respond with valid JSON only."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=2000,
        )
        content = response.choices[0].message.content.strip()
        # Clean potential markdown fences
        if content.startswith("```"):
            content = content.split("\n", 1)[1] if "\n" in content else content[3:]
        if content.endswith("```"):
            content = content[:-3]
        content = content.strip()
        if content.startswith("json"):
            content = content[4:].strip()

        result = json.loads(content)
        result["success"] = True
        result["source"] = "OpenAI GPT-4o-mini"
        return result

    except json.JSONDecodeError:
        return {"success": False, "error": "Failed to parse AI response as JSON", "raw": content[:500]}
    except Exception as e:
        return {"success": False, "error": str(e)}


async def generate_secr_report(emissions_data: dict, company_name: str = "Company") -> dict:
    """
    Generate a SECR-compliant narrative report section using GPT.
    """
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    prompt = f"""Generate a professional SECR (Streamlined Energy and Carbon Reporting) compliance report
narrative for the following company. This should be suitable for inclusion in a UK annual report.

Company: {company_name}
Reporting Period: April 2024 - March 2025

Emissions Data:
- Scope 1: {emissions_data.get('scope1_total', 0):.0f} kgCO2e (direct fuel combustion)
- Scope 2: {emissions_data.get('scope2_total', 0):.0f} kgCO2e (purchased electricity)
- Scope 3: {emissions_data.get('scope3_total', 0):.0f} kgCO2e (supply chain & transport)
- Total: {emissions_data.get('grand_total', 0):.0f} kgCO2e

Number of suppliers: {len(emissions_data.get('by_supplier', []))}
Number of warehouses: {len(emissions_data.get('by_warehouse', []))}
Number of transport routes: {len(emissions_data.get('by_transport', []))}

Write a professional report with these sections:
1. Energy and Carbon Report Statement
2. Methodology (mention DEFRA 2024 conversion factors, UK GHG Protocol)
3. Emissions Summary Table (text format)
4. Intensity Ratio (per £ revenue or per employee - use placeholder)
5. Energy Efficiency Actions Taken
6. Future Targets

Keep it professional, concise, and compliant with UK SECR requirements.
Output as plain text suitable for a report document."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a UK sustainability reporting specialist who writes SECR-compliant reports."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.2,
            max_tokens=2000,
        )
        content = response.choices[0].message.content.strip()
        return {
            "success": True,
            "report": content,
            "source": "OpenAI GPT-4o-mini",
            "compliance_standard": "UK SECR",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def analyze_emissions_query(question: str, emissions_data: dict) -> dict:
    """
    Let users ask natural-language questions about their emissions.
    e.g., "Why are my Scope 3 emissions so high?"
    """
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    prompt = f"""You are an AI carbon emissions analyst for a UK company.
The user is asking a question about their emissions data. Answer clearly and helpfully.

THEIR EMISSIONS DATA:
{json.dumps(emissions_data, indent=2, default=str)}

USER QUESTION: {question}

Provide a clear, specific, data-driven answer. Reference specific numbers from their data.
Suggest improvements where relevant. Keep your answer concise (3-5 paragraphs max)."""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful UK carbon emissions analyst. Be specific and data-driven."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.4,
            max_tokens=1000,
        )
        return {
            "success": True,
            "answer": response.choices[0].message.content.strip(),
            "source": "OpenAI GPT-4o-mini",
        }
    except Exception as e:
        return {"success": False, "error": str(e)}


async def generate_hotspot_insights(entity_type: str, entity_name: str,
                                     emissions: float, location: str = "",
                                     extra: dict = None) -> dict:
    """Generate fast AI insights for a single map hotspot marker."""
    if not client:
        return {"success": False, "error": "OPENAI_API_KEY not configured"}

    extra_info = ""
    if extra:
        if entity_type == "supplier" and extra.get("industry"):
            extra_info = f"Industry: {extra['industry']}."
        elif entity_type == "warehouse" and extra.get("refrigeration") is not None:
            extra_info = f"Refrigeration: {'Yes' if extra['refrigeration'] else 'No'}."

    prompt = f"""You are a UK carbon emissions expert. Provide targeted reduction advice for this specific {entity_type}.

{entity_type.upper()}: {entity_name}
Location: {location or 'UK'}
Annual Emissions: {emissions:,.0f} kgCO2e
{extra_info}

Respond ONLY with this JSON (no markdown):
{{
  "risk_level": "low|medium|high|critical",
  "summary": "One sentence assessment of this {entity_type}'s carbon risk.",
  "actions": [
    {{"title": "action title", "detail": "specific step (1-2 sentences)", "saving_pct": <5-40>, "effort": "Low|Medium|High"}},
    {{"title": "action title", "detail": "specific step (1-2 sentences)", "saving_pct": <5-40>, "effort": "Low|Medium|High"}},
    {{"title": "action title", "detail": "specific step (1-2 sentences)", "saving_pct": <5-40>, "effort": "Low|Medium|High"}}
  ],
  "uk_scheme": "Most relevant UK incentive or regulation for this entity"
}}"""

    try:
        response = await client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "UK carbon expert. Return only valid JSON."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.3,
            max_tokens=600,
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
