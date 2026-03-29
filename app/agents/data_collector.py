"""Data Collector Agent — Aggregates results from all specialized agents."""

from datetime import datetime, timezone
from app.agents.base import BaseAgent


class DataCollectorAgent(BaseAgent):
    name = "DataCollectorAgent"
    description = "Collects, normalizes, and merges outputs from all specialized agents into a unified payload."

    def process(self, payload: dict) -> dict:
        """
        Expected payload keys:
            money_health: result from MoneyHealthAgent
            tax_wizard: result from TaxWizardAgent
            portfolio_xray: result from PortfolioXRayAgent
            fire_planner: result from FIREPlannerAgent
            financial_news: result from FinancialNewsAgent (optional)
            doc_scanner: result from DocScannerAgent (optional)
        """
        # Normalize and validate each agent's output
        money_health = self._normalize(payload.get("money_health", {}), "MoneyHealthAgent")
        tax_wizard = self._normalize(payload.get("tax_wizard", {}), "TaxWizardAgent")
        portfolio_xray = self._normalize(payload.get("portfolio_xray", {}), "PortfolioXRayAgent")
        fire_planner = self._normalize(payload.get("fire_planner", {}), "FIREPlannerAgent")
        financial_news = self._normalize(payload.get("financial_news", {}), "FinancialNewsAgent")
        doc_scanner = self._normalize(payload.get("doc_scanner"), "DocScannerAgent")

        # Inject news impact into FIRE planner if available
        if financial_news and financial_news.get("news_impact") and fire_planner:
            fire_planner["newsImpact"] = financial_news["news_impact"]

        # Build unified MasterFinancialPayload
        master_payload = {
            "money_health": money_health,
            "tax_wizard": tax_wizard,
            "portfolio_xray": portfolio_xray,
            "fire_planner": fire_planner,
            "financial_news": financial_news,
            "doc_scanner": doc_scanner,
            "_collected_at": datetime.now(timezone.utc).isoformat(),
            "_agent_count": sum(1 for v in [money_health, tax_wizard, portfolio_xray, fire_planner] if v),
        }

        return self._add_provenance(master_payload)

    def _normalize(self, data, source_agent: str):
        """Normalize agent output — handle None, add source metadata."""
        if data is None:
            return None

        # Remove internal provenance keys from individual agent results
        cleaned = {k: v for k, v in data.items() if not k.startswith("_")}

        return cleaned
