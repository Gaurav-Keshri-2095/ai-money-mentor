"""MF Portfolio X-Ray Agent — TER analysis, overlap detection, consolidation advice."""

from app.agents.base import BaseAgent
from app.services.calculators.portfolio_analyzer import analyze_fund_holdings


class PortfolioXRayAgent(BaseAgent):
    name = "PortfolioXRayAgent"
    description = "Analyzes mutual fund TER, detects portfolio overlap, recommends consolidation."

    def process(self, payload: dict) -> dict:
        """
        Expected payload keys:
            funds: list of dicts with name, plan, category, aum, ter, direct_ter, nav
        """
        funds = payload.get("funds", [])
        if not funds:
            return self._add_provenance({
                "funds": [],
                "overlapAnalysis": None,
                "actions": [{
                    "title": "No Funds Found",
                    "description": "Add your mutual fund holdings to get portfolio analysis.",
                    "impact": None,
                    "action": "Upload your CAS statement or add funds manually.",
                }],
            })

        result = analyze_fund_holdings(funds)
        return self._add_provenance(result)
