"""Task Distributor Agent — Routes data to relevant specialized agents."""

import logging
from app.agents.base import BaseAgent

logger = logging.getLogger(__name__)


class TaskDistributorAgent(BaseAgent):
    name = "TaskDistributorAgent"
    description = "Analyzes the unified payload and determines which agents to invoke."

    def process(self, payload: dict) -> dict:
        """
        Analyzes what data is present and returns a routing decision.
        
        Expected payload: unified user financial data
        Returns: dict with agent flags and trimmed payloads for each agent
        """
        tasks = {}

        # ── Money Health (always runs if income data exists) ──
        if payload.get("monthly_income", 0) > 0 or payload.get("salary", 0) > 0:
            monthly_income = payload.get("monthly_income", payload.get("salary", 0) / 12)
            tasks["money_health"] = {
                "should_run": True,
                "payload": {
                    "savings": payload.get("savings", 0),
                    "monthly_expenses": payload.get("monthly_expenses", 0),
                    "monthly_income": monthly_income,
                    "total_debt_emi": payload.get("total_debt_emi", 0),
                    "goal_target": payload.get("goal_target", 0),
                    "goal_saved": payload.get("goal_saved", 0),
                },
            }
        else:
            tasks["money_health"] = {"should_run": False, "reason": "No income data"}

        # ── Tax Wizard (needs income data) ──
        if payload.get("salary", 0) > 0 or payload.get("gross_income", 0) > 0:
            tasks["tax_wizard"] = {
                "should_run": True,
                "payload": {
                    "gross_income": payload.get("gross_income", payload.get("salary", 0)),
                    "deductions_80c": payload.get("deductions_80c", 0),
                    "deductions_80d": payload.get("deductions_80d", 0),
                    "hra": payload.get("hra", 0),
                    "section_24b": payload.get("section_24b", 0),
                    "nps_80ccd": payload.get("nps_80ccd", 0),
                    "deduction_records": payload.get("deduction_records", []),
                },
            }
        else:
            tasks["tax_wizard"] = {"should_run": False, "reason": "No salary/income data"}

        # ── Portfolio X-Ray (needs MF data) ──
        funds = payload.get("funds", [])
        if funds:
            tasks["portfolio_xray"] = {
                "should_run": True,
                "payload": {"funds": funds},
            }
        else:
            tasks["portfolio_xray"] = {"should_run": False, "reason": "No mutual fund data"}

        # ── FIRE Planner (needs age and income) ──
        if payload.get("age", 0) > 0:
            tasks["fire_planner"] = {
                "should_run": True,
                "payload": {
                    "current_age": payload.get("age", 25),
                    "target_age": payload.get("target_retirement_age", 50),
                    "monthly_sip": payload.get("monthly_sip", 10000),
                    "current_corpus": payload.get("current_corpus", payload.get("savings", 0)),
                    "target_corpus": payload.get("target_corpus", 50000000),
                    "expected_return": payload.get("expected_return", 0.12),
                    "inflation": payload.get("inflation", 0.06),
                    "step_up_percent": payload.get("step_up_percent", 10),
                },
            }
        else:
            tasks["fire_planner"] = {"should_run": False, "reason": "No age data"}

        # ── Financial News (always runs when portfolio data exists) ──
        tasks["financial_news"] = {
            "should_run": True,
            "payload": {"funds": funds},
        }

        # Summary
        active = [k for k, v in tasks.items() if v.get("should_run")]
        logger.info(f"Task distribution: {len(active)} agents will run: {active}")

        return self._add_provenance({
            "tasks": tasks,
            "active_agents": active,
            "total_agents": len(active),
        })
