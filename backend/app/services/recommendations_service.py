"""
Rule-Based Recommendations Engine
Analyzes emissions data and generates actionable reduction suggestions.
"""


def generate_recommendations(emissions_data: dict) -> dict:
    """Generate prioritized recommendations based on emissions analysis."""
    recommendations = []
    rec_id = 1
    total = emissions_data.get("grand_total", 0)
    if total == 0:
        return {"recommendations": [], "total_potential_reduction": 0, "total_potential_reduction_pct": 0}

    s1 = emissions_data.get("scope1_total", 0)
    s2 = emissions_data.get("scope2_total", 0)
    s3 = emissions_data.get("scope3_total", 0)
    suppliers = emissions_data.get("by_supplier", [])
    warehouses = emissions_data.get("by_warehouse", [])
    transport = emissions_data.get("by_transport", [])

    # ─── Scope 3: Supplier Optimisation ─────────────────
    if s3 > total * 0.3:
        reduction = round(s3 * 0.15, 2)
        recommendations.append({
            "id": rec_id, "category": "Supply Chain", "priority": "High",
            "title": "Switch to lower-carbon suppliers",
            "description": "Your Scope 3 supply chain emissions account for a significant portion of total emissions. Consider engaging with suppliers who have lower emission intensities or carbon reduction commitments. Request environmental data from your top 5 suppliers.",
            "potential_reduction_pct": 15,
            "potential_reduction_kgco2e": reduction,
            "effort": "Medium", "scope": "Scope 3",
        })
        rec_id += 1

    # High-emission individual suppliers
    for sup in sorted(suppliers, key=lambda x: x.get("total_emissions", 0), reverse=True)[:3]:
        if sup.get("total_emissions", 0) > total * 0.1:
            reduction = round(sup["total_emissions"] * 0.2, 2)
            recommendations.append({
                "id": rec_id, "category": "Supply Chain", "priority": "High",
                "title": f"Review supplier: {sup.get('name', 'Unknown')}",
                "description": f"This supplier contributes {round(sup['total_emissions']/total*100,1)}% of your total emissions ({round(sup['total_emissions'],0)} kgCO2e). Consider negotiating carbon targets, switching to a greener alternative, or consolidating orders to reduce frequency.",
                "potential_reduction_pct": round(sup["total_emissions"] / total * 20, 1),
                "potential_reduction_kgco2e": reduction,
                "effort": "Medium", "scope": "Scope 3",
            })
            rec_id += 1

    # ─── Scope 2: Energy Optimisation ───────────────────
    if s2 > total * 0.15:
        reduction = round(s2 * 0.30, 2)
        recommendations.append({
            "id": rec_id, "category": "Energy", "priority": "High",
            "title": "Switch to renewable electricity tariff",
            "description": "Moving to a 100% renewable electricity tariff (REGO-backed) could significantly reduce Scope 2 emissions. Many UK business energy suppliers now offer competitive green tariffs.",
            "potential_reduction_pct": round(s2 / total * 30, 1),
            "potential_reduction_kgco2e": reduction,
            "effort": "Low", "scope": "Scope 2",
        })
        rec_id += 1

    # Warehouse-specific recommendations
    for wh in warehouses:
        if wh.get("renewable_percentage", 0) < 50:
            wh_emissions = wh.get("total_emissions", 0)
            reduction = round(wh_emissions * 0.25, 2)
            recommendations.append({
                "id": rec_id, "category": "Energy", "priority": "Medium",
                "title": f"Install solar panels at {wh.get('name', 'warehouse')}",
                "description": f"This warehouse currently uses only {wh.get('renewable_percentage', 0)}% renewable energy. On-site solar PV could reduce grid dependency and lower Scope 2 emissions by up to 25%. UK government incentives like SEG may apply.",
                "potential_reduction_pct": round(wh_emissions / total * 25, 1),
                "potential_reduction_kgco2e": reduction,
                "effort": "High", "scope": "Scope 2",
            })
            rec_id += 1

    # ─── Scope 1 & Transport ───────────────────────────
    for route in sorted(transport, key=lambda x: x.get("annual_emissions", 0), reverse=True)[:3]:
        if route.get("mode") in ("road_diesel", "road_petrol", "air"):
            r_emissions = route.get("annual_emissions", 0)
            if r_emissions > total * 0.05:
                if route["mode"] == "air":
                    alt = "rail or sea freight"
                    pct = 60
                else:
                    alt = "electric vehicles or rail"
                    pct = 40
                reduction = round(r_emissions * pct / 100, 2)
                recommendations.append({
                    "id": rec_id, "category": "Transport", "priority": "High",
                    "title": f"Switch route '{route.get('name', '')}' to {alt}",
                    "description": f"This route ({route.get('origin')}->{route.get('destination')}) emits {round(r_emissions, 0)} kgCO2e/year via {route['mode']}. Switching to {alt} could reduce emissions by up to {pct}%.",
                    "potential_reduction_pct": round(r_emissions / total * pct, 1),
                    "potential_reduction_kgco2e": reduction,
                    "effort": "Medium", "scope": "Scope 3",
                })
                rec_id += 1

    # ─── General Recommendations ────────────────────────
    recommendations.append({
        "id": rec_id, "category": "Reporting", "priority": "Low",
        "title": "Automate SECR/UK ETS compliance reporting",
        "description": "Use EchoChain's reporting module to auto-generate SECR-compliant reports. This saves consultant costs (£5k-£30k) and ensures accuracy.",
        "potential_reduction_pct": 0,
        "potential_reduction_kgco2e": 0,
        "effort": "Low", "scope": "All",
    })
    rec_id += 1

    if s1 > 0:
        reduction = round(s1 * 0.10, 2)
        recommendations.append({
            "id": rec_id, "category": "Operations", "priority": "Medium",
            "title": "Implement fuel efficiency programme",
            "description": "Driver training, route optimisation, and regular vehicle maintenance can reduce direct fuel consumption by 10-15%. Consider telematics for monitoring.",
            "potential_reduction_pct": round(s1 / total * 10, 1),
            "potential_reduction_kgco2e": reduction,
            "effort": "Low", "scope": "Scope 1",
        })

    total_reduction = sum(r["potential_reduction_kgco2e"] for r in recommendations)
    total_pct = round(total_reduction / total * 100, 1) if total > 0 else 0

    # Sort by priority
    priority_order = {"High": 0, "Medium": 1, "Low": 2}
    recommendations.sort(key=lambda x: priority_order.get(x["priority"], 3))

    return {
        "recommendations": recommendations,
        "total_potential_reduction": round(total_reduction, 2),
        "total_potential_reduction_pct": min(total_pct, 100),
    }
