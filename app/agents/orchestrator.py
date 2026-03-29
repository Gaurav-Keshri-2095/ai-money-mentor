"""Orchestrator Agent — Main entry point for the multi-agent pipeline."""

import logging
from app.agents.base import BaseAgent
from app.agents.task_distributor import TaskDistributorAgent
from app.agents.money_health import MoneyHealthAgent
from app.agents.tax_wizard import TaxWizardAgent
from app.agents.portfolio_xray import PortfolioXRayAgent
from app.agents.fire_planner import FIREPlannerAgent
from app.agents.financial_news import FinancialNewsAgent
from app.agents.data_collector import DataCollectorAgent
from app.agents.analyzer import AnalyzerAgent
from app.agents.compliance_guardian import ComplianceGuardianAgent

logger = logging.getLogger(__name__)


class OrchestratorAgent(BaseAgent):
    name = "OrchestratorAgent"
    description = "Orchestrates the full multi-agent financial analysis pipeline."

    def __init__(self):
        self.task_distributor = TaskDistributorAgent()
        self.money_health = MoneyHealthAgent()
        self.tax_wizard = TaxWizardAgent()
        self.portfolio_xray = PortfolioXRayAgent()
        self.fire_planner = FIREPlannerAgent()
        self.financial_news = FinancialNewsAgent()
        self.data_collector = DataCollectorAgent()
        self.analyzer = AnalyzerAgent()
        self.compliance = ComplianceGuardianAgent()

    def process(self, payload: dict) -> dict:
        """
        Full pipeline execution:
        1. Task Distributor → determines which agents to run
        2. Specialized Agents → run in parallel (simulated sequentially here)
        3. Data Collector → aggregates results
        4. Analyzer → synthesizes master plan
        5. Compliance Guardian → validates and stamps approval

        Expected payload:
            user_info: {name, label, age, salary, monthly_expenses}
            + all financial data (savings, funds, deductions, goals, debts, etc.)
        """
        user_info = payload.get("user_info", {})
        logger.info(f"Orchestrator: Starting analysis for {user_info.get('name', 'Unknown')}")

        # ── Step 1: Task Distribution ──
        distribution = self.task_distributor.process(payload)
        tasks = distribution.get("tasks", {})
        logger.info(f"Orchestrator: {distribution.get('total_agents', 0)} agents activated")

        # ── Step 2: Run Specialized Agents ──
        results = {}

        if tasks.get("money_health", {}).get("should_run"):
            try:
                results["money_health"] = self.money_health.process(
                    tasks["money_health"]["payload"]
                )
            except Exception as e:
                logger.error(f"MoneyHealthAgent failed: {e}")
                results["money_health"] = self._default_money_health()

        if tasks.get("tax_wizard", {}).get("should_run"):
            try:
                results["tax_wizard"] = self.tax_wizard.process(
                    tasks["tax_wizard"]["payload"]
                )
            except Exception as e:
                logger.error(f"TaxWizardAgent failed: {e}")
                results["tax_wizard"] = self._default_tax_wizard()

        if tasks.get("portfolio_xray", {}).get("should_run"):
            try:
                results["portfolio_xray"] = self.portfolio_xray.process(
                    tasks["portfolio_xray"]["payload"]
                )
            except Exception as e:
                logger.error(f"PortfolioXRayAgent failed: {e}")
                results["portfolio_xray"] = {"funds": [], "overlapAnalysis": None, "actions": []}

        if tasks.get("fire_planner", {}).get("should_run"):
            try:
                results["fire_planner"] = self.fire_planner.process(
                    tasks["fire_planner"]["payload"]
                )
            except Exception as e:
                logger.error(f"FIREPlannerAgent failed: {e}")
                results["fire_planner"] = self._default_fire_planner(payload)

        if tasks.get("financial_news", {}).get("should_run"):
            try:
                results["financial_news"] = self.financial_news.process(
                    tasks["financial_news"]["payload"]
                )
            except Exception as e:
                logger.error(f"FinancialNewsAgent failed: {e}")
                results["financial_news"] = {"matched_alerts": [], "news_impact": None}

        # ── Step 3: Data Collection ──
        collected = self.data_collector.process(results)

        # ── Step 4: Analysis & Synthesis ──
        master_plan = self.analyzer.process({
            "user_info": user_info,
            "collected_data": collected,
        })

        # ── Step 5: Compliance Check ──
        compliance_result = self.compliance.process({"plan": master_plan})
        final_plan = compliance_result.get("plan", master_plan)

        logger.info(f"Orchestrator: Analysis complete. Score: {final_plan.get('overallScore', '?')}")
        return final_plan

    def _default_money_health(self):
        return {
            "savings": 0, "monthlyExpenses": 0, "emergencyMonths": 0,
            "emergencyTarget": 0, "savingsRate": 0, "debtToIncome": 0,
            "goalProgress": 0, "breakdown": [], "actions": [],
        }

    def _default_tax_wizard(self):
        return {
            "currentRegime": "Old", "grossIncome": 0, "claimed80C": 0,
            "max80C": 150000, "remaining80C": 150000, "oldRegimeTax": 0,
            "newRegimeTax": 0, "savings": 0, "recommendation": "new",
            "actions": [], "deductions": [],
        }

    def _default_fire_planner(self, payload):
        age = payload.get("age", 25)
        return {
            "currentAge": age, "targetAge": 50, "monthlySIP": 10000,
            "currentCorpus": 0, "targetCorpus": 50000000,
            "expectedReturn": 0.12, "inflation": 0.06,
            "currentTrajectory": {"hitAge": 55, "probability": 50},
            "optimizedTrajectory": {"hitAge": 50, "stepUp": 10, "probability": 65},
        }
