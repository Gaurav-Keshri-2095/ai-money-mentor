"""Mutual Fund Portfolio Analyzer — TER impact, overlap detection."""

from app.utils.constants import MF_OVERLAP_MATRIX


def calculate_ter_impact(
    aum: float,
    regular_ter: float,
    direct_ter: float,
    years: int = 10,
    expected_return: float = 0.12,
) -> float:
    """
    Calculate the cost of holding Regular vs Direct plan over N years.
    Returns the approximate loss in rupees.
    """
    if regular_ter <= direct_ter:
        return 0

    # Value with Regular plan TER
    regular_value = aum * ((1 + expected_return - regular_ter / 100) ** years)
    # Value with Direct plan TER
    direct_value = aum * ((1 + expected_return - direct_ter / 100) ** years)

    loss = direct_value - regular_value
    return round(max(loss, 0))


def analyze_fund_holdings(funds: list) -> dict:
    """
    Analyze a list of fund holdings for TER issues and overlap.
    
    funds: list of dicts with keys: name, plan, category, aum, ter, direct_ter, nav
    
    Returns PortfolioXRayResult-compatible dict.
    """
    analyzed_funds = []
    actions = []

    for f in funds:
        ter = f.get("ter", 0)
        direct_ter = f.get("direct_ter", ter)
        ter_diff = round(ter - direct_ter, 2)
        ten_year_loss = calculate_ter_impact(f.get("aum", 0), ter, direct_ter) if ter_diff > 0 else 0

        analyzed_funds.append({
            "name": f["name"],
            "plan": f.get("plan", "Regular"),
            "category": f.get("category", ""),
            "aum": f.get("aum", 0),
            "ter": ter,
            "directTer": direct_ter,
            "terDiff": ter_diff,
            "tenYearLoss": ten_year_loss,
            "nav": f.get("nav", 0),
        })

        # Generate TER switch action
        if ter_diff > 0.3 and ten_year_loss > 50000:
            actions.append({
                "title": "Switch to Direct Plans",
                "description": f"Your {f['name']} ({f.get('plan', 'Regular')}) is charging a TER of {ter}%. The Direct plan charges {direct_ter}%.",
                "impact": f"Over 10 years, this {ter_diff}% difference will cost you approximately ₹{ten_year_loss / 100000:.1f} Lakhs in lost compounding.",
                "action": "Initiate a switch from Regular to Direct plans via your broker. Ensure you account for the 10% LTCG tax on equity above ₹1.25L if applicable.",
            })

    # ── Overlap Detection ──
    overlap_analysis = None
    fund_names = [f["name"] for f in funds]

    # Check every pair against the overlap matrix
    primary_overlap = None
    secondary_overlap = None

    for i, f1 in enumerate(fund_names):
        for f2 in fund_names[i + 1:]:
            key = (f1, f2) if (f1, f2) in MF_OVERLAP_MATRIX else (f2, f1) if (f2, f1) in MF_OVERLAP_MATRIX else None
            if key:
                overlap_data = MF_OVERLAP_MATRIX[key]
                if primary_overlap is None or overlap_data["overlap_percent"] > primary_overlap.get("overlapPercent", 0):
                    if primary_overlap:
                        secondary_overlap = primary_overlap
                    primary_overlap = {
                        "fund1": key[0],
                        "fund2": key[1],
                        "overlapPercent": overlap_data["overlap_percent"],
                        "overlappingStocks": [
                            {"name": s["name"], "weight1": s["weight1"], "weight2": s["weight2"]}
                            for s in overlap_data.get("stocks", [])
                        ],
                    }
                elif secondary_overlap is None:
                    secondary_overlap = {
                        "fund1": key[0],
                        "fund2": key[1],
                        "overlapPercent": overlap_data["overlap_percent"],
                    }

    if primary_overlap:
        if secondary_overlap:
            primary_overlap["secondOverlap"] = secondary_overlap
        overlap_analysis = primary_overlap

        # Add overlap action
        actions.append({
            "title": f"Redundancy Alert: {primary_overlap['overlapPercent']}% Overlap",
            "description": f"You hold {primary_overlap['fund1']} and {primary_overlap['fund2']}. Our X-Ray detects a {primary_overlap['overlapPercent']}% stock overlap between these two. You are paying two fund managers to hold the exact same top 10 stocks.",
            "impact": "Combined AUM in overlapping funds is duplicating exposure.",
            "action": "Consider consolidating into a single Nifty 50 Index Fund to reduce TER to ~0.2% while maintaining the same market exposure.",
        })

        if secondary_overlap:
            actions.append({
                "title": f"Secondary Overlap: {secondary_overlap['overlapPercent']}%",
                "description": f"Your {secondary_overlap['fund1']} and {secondary_overlap['fund2']} also show a {secondary_overlap['overlapPercent']}% stock overlap.",
                "impact": "Sector concentration risk is elevated due to similar holdings.",
                "action": "Consider replacing one with a Flexi-Cap fund for better diversification.",
            })

    return {
        "funds": analyzed_funds,
        "overlapAnalysis": overlap_analysis,
        "actions": actions,
    }
