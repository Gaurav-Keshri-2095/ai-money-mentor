"""Compliance & Regulatory Guardian — SEBI/RBI compliance firewall."""

import logging
from app.agents.base import BaseAgent
from app.utils.constants import MANDATORY_DISCLAIMERS, PROHIBITED_PHRASES

logger = logging.getLogger(__name__)


class ComplianceGuardianAgent(BaseAgent):
    name = "ComplianceGuardianAgent"
    description = "Ensures all financial advice complies with SEBI/RBI regulations."

    def process(self, payload: dict) -> dict:
        """
        Expected payload: the MasterFinancialPlan from AnalyzerAgent
        Scans all text fields for compliance violations.
        Returns the plan with compliance notes appended.
        """
        plan = payload.get("plan", {})
        violations = []

        # ── Scan all action text for prohibited phrases ──
        all_text = self._extract_all_text(plan)
        text_lower = all_text.lower()

        for phrase in PROHIBITED_PHRASES:
            if phrase in text_lower:
                violations.append(f"Prohibited phrase detected: '{phrase}'")

        # ── Build compliance notes ──
        compliance_notes = list(MANDATORY_DISCLAIMERS)

        # Add FIRE-specific disclaimers if FIRE data present
        fire = plan.get("firePlanner", {})
        if fire and fire.get("currentAge"):
            compliance_notes.insert(0, (
                "Monte Carlo simulations are based on randomized probability models "
                "of historical market behavior and do not guarantee future performance."
            ))
            compliance_notes.insert(1, (
                "Financial Independence targets are highly sensitive to inflation "
                "and personal withdrawal rates."
            ))
            compliance_notes.insert(2, (
                "This is an educational projection, not binding financial advice."
            ))

        # ── Result ──
        is_compliant = len(violations) == 0
        if not is_compliant:
            logger.warning(f"Compliance violations found: {violations}")

        # Update the plan with compliance notes
        plan["compliance"] = {"notes": compliance_notes}

        result = {
            "is_compliant": is_compliant,
            "violations": violations,
            "plan": plan,
            "disclaimers_added": len(compliance_notes),
        }
        return self._add_provenance(result)

    def _extract_all_text(self, obj, texts=None) -> str:
        """Recursively extract all string values from a nested dict/list."""
        if texts is None:
            texts = []

        if isinstance(obj, dict):
            for v in obj.values():
                self._extract_all_text(v, texts)
        elif isinstance(obj, list):
            for item in obj:
                self._extract_all_text(item, texts)
        elif isinstance(obj, str):
            texts.append(obj)

        return " ".join(texts)
