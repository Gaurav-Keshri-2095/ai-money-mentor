"""FIRE Planner Agent — Monte Carlo simulations for early retirement."""

from app.agents.base import BaseAgent
from app.services.calculators.fire_calculator import full_fire_analysis


class FIREPlannerAgent(BaseAgent):
    name = "FIREPlannerAgent"
    description = "Projects retirement trajectory with Monte Carlo simulations and SIP step-up optimization."

    def process(self, payload: dict) -> dict:
        """
        Expected payload keys:
            current_age, target_age, monthly_sip, current_corpus,
            target_corpus, expected_return, inflation, step_up_percent
        """
        result = full_fire_analysis(
            current_age=payload.get("current_age", 25),
            target_age=payload.get("target_age", 50),
            monthly_sip=payload.get("monthly_sip", 10000),
            current_corpus=payload.get("current_corpus", 0),
            target_corpus=payload.get("target_corpus", 50000000),
            expected_return=payload.get("expected_return", 0.12),
            inflation=payload.get("inflation", 0.06),
            step_up_percent=payload.get("step_up_percent", 10),
        )
        return self._add_provenance(result)
