"""Analyzer Agent — The Core Brain. Synthesizes all agent data into master plan."""

import json
import logging
from app.agents.base import BaseAgent
from app.utils.formatters import score_verdict

logger = logging.getLogger(__name__)


class AnalyzerAgent(BaseAgent):
    name = "AnalyzerAgent"
    description = "Synthesizes data from all agents, generates overall score and master financial plan."

    def process(self, payload: dict) -> dict:
        """
        Expected payload: the MasterFinancialPayload from DataCollectorAgent
        Also requires user_info: {name, label, age, salary, monthly_expenses}
        """
        user_info = payload.get("user_info", {})
        collected = payload.get("collected_data", {})

        money_health = collected.get("money_health", {})
        tax_wizard = collected.get("tax_wizard", {})
        portfolio_xray = collected.get("portfolio_xray", {})
        fire_planner = collected.get("fire_planner", {})

        # ── Check data completeness ──
        missing_data = self._check_completeness(collected)
        if missing_data:
            return self._add_provenance({
                "is_complete": False,
                "missing_data": missing_data,
                "questions": self._generate_questions(missing_data),
            })

        # ── Calculate Overall Score ──
        overall_score = self._calculate_overall_score(money_health, tax_wizard, portfolio_xray, fire_planner)
        verdict = score_verdict(overall_score)

        # ── Build Master Financial Plan ──
        master_plan = {
            "id": f"plan-{user_info.get('name', 'user').lower().replace(' ', '-')}",
            "name": user_info.get("name", "User"),
            "label": user_info.get("label", ""),
            "age": user_info.get("age", 25),
            "salary": user_info.get("salary", 0),
            "monthlyExpenses": user_info.get("monthly_expenses", 0),
            "overallScore": overall_score,
            "scoreVerdict": verdict,
            "moneyHealth": money_health,
            "taxWizard": tax_wizard,
            "portfolioXRay": portfolio_xray,
            "firePlanner": fire_planner,
            "compliance": {"notes": []},  # Populated by ComplianceGuardian
        }

        return self._add_provenance(master_plan)

    def _check_completeness(self, collected: dict) -> list:
        """Check if required data is present."""
        missing = []
        mh = collected.get("money_health", {})
        if not mh or mh.get("monthlyExpenses", 0) == 0:
            missing.append("monthly_expenses")
        if not collected.get("tax_wizard"):
            missing.append("tax_data")
        return missing

    def _generate_questions(self, missing: list) -> list:
        """Generate targeted questions for missing data."""
        question_map = {
            "monthly_expenses": "What are your total monthly expenses (rent, food, transport, EMIs)?",
            "tax_data": "What is your annual gross income? Are you on the Old or New tax regime?",
            "savings": "What is your current savings/liquid balance?",
            "mutual_funds": "Do you have any mutual fund SIP investments? If so, which funds?",
            "goals": "Do you have any specific financial goals (emergency fund, house, retirement)?",
        }
        return [question_map.get(m, f"Please provide your {m} data.") for m in missing]

    def _calculate_overall_score(self, money_health, tax_wizard, portfolio_xray, fire_planner) -> int:
        """
        Calculate weighted overall score.
        Weights: Health 40%, Tax 20%, Portfolio 20%, FIRE 20%
        """
        # Health score from breakdown
        health_score = money_health.get("overall_score", 0)
        if "overall_score" not in money_health:
            # Sum breakdown scores
            health_score = sum(b.get("score", 0) for b in money_health.get("breakdown", []))

        # Tax score: based on how optimized tax is
        tax_score = 100
        if tax_wizard:
            remaining = tax_wizard.get("remaining80C", 0)
            max_80c = tax_wizard.get("max80C", 150000)
            utilization = ((max_80c - remaining) / max_80c * 100) if max_80c > 0 else 100
            # Also factor in regime optimization
            savings = tax_wizard.get("savings", 0)
            gross = tax_wizard.get("grossIncome", 1)
            savings_pct = min(savings / gross * 100 * 10, 100)  # Scale up
            tax_score = round((utilization + savings_pct) / 2)

        # Portfolio score: based on TER optimization and overlap
        port_score = 100
        if portfolio_xray:
            funds = portfolio_xray.get("funds", [])
            if funds:
                # Penalize regular plans and high TER diff
                regular_count = sum(1 for f in funds if f.get("plan") == "Regular")
                overlap = portfolio_xray.get("overlapAnalysis")
                overlap_penalty = 0
                if overlap:
                    overlap_penalty = min(overlap.get("overlapPercent", 0) * 0.4, 30)

                regular_penalty = (regular_count / len(funds)) * 40 if funds else 0
                port_score = max(round(100 - regular_penalty - overlap_penalty), 20)

        # FIRE score: based on probability of hitting target
        fire_score = 50
        if fire_planner:
            opt = fire_planner.get("optimizedTrajectory", {})
            fire_score = min(opt.get("probability", 50), 100)

        # Weighted average
        overall = round(
            health_score * 0.40 +
            tax_score * 0.20 +
            port_score * 0.20 +
            fire_score * 0.20
        )
        return min(max(overall, 0), 100)
