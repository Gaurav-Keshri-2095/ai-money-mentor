"""Money Health Agent — computes financial health score and recommendations."""

from app.agents.base import BaseAgent
from app.services.calculators.health_scorer import compute_health_score


class MoneyHealthAgent(BaseAgent):
    name = "MoneyHealthAgent"
    description = "Analyzes emergency fund, savings rate, debt ratio, and goal progress."

    def process(self, payload: dict) -> dict:
        """
        Expected payload keys:
            savings, monthly_expenses, monthly_income, total_debt_emi,
            goal_target, goal_saved
        """
        result = compute_health_score(
            savings=payload.get("savings", 0),
            monthly_expenses=payload.get("monthly_expenses", 0),
            monthly_income=payload.get("monthly_income", 0),
            total_debt_emi=payload.get("total_debt_emi", 0),
            goal_target=payload.get("goal_target", 0),
            goal_saved=payload.get("goal_saved", 0),
        )
        return self._add_provenance(result)
