"""Tax Wizard Agent — Indian income tax optimization with regime comparison."""

from app.agents.base import BaseAgent
from app.services.calculators.tax_calculator import compare_regimes


class TaxWizardAgent(BaseAgent):
    name = "TaxWizardAgent"
    description = "Computes Old vs New regime tax, recommends optimal strategy."

    def process(self, payload: dict) -> dict:
        """
        Expected payload keys:
            gross_income, deductions_80c, deductions_80d, hra,
            section_24b, nps_80ccd, other_deductions, deduction_records
        """
        result = compare_regimes(
            gross_income=payload.get("gross_income", 0),
            deductions_80c=payload.get("deductions_80c", 0),
            deductions_80d=payload.get("deductions_80d", 0),
            hra=payload.get("hra", 0),
            section_24b=payload.get("section_24b", 0),
            nps_80ccd=payload.get("nps_80ccd", 0),
            other_deductions=payload.get("other_deductions", 0),
        )

        # Attach deduction records if provided
        deduction_records = payload.get("deduction_records", [])
        if deduction_records:
            result["deductions"] = deduction_records
        else:
            # Build basic records from available data
            deductions = []
            if payload.get("deductions_80c", 0) > 0:
                deductions.append({
                    "section": "80C",
                    "claimed": payload["deductions_80c"],
                    "limit": 150000,
                    "items": "ELSS, PPF, LIC, EPF",
                })
            if payload.get("deductions_80d", 0) > 0:
                deductions.append({
                    "section": "80D",
                    "claimed": payload["deductions_80d"],
                    "limit": 25000,
                    "items": "Health Insurance",
                })
            if payload.get("hra", 0) > 0:
                deductions.append({
                    "section": "HRA",
                    "claimed": payload["hra"],
                    "limit": payload.get("hra_limit", 120000),
                    "items": "House Rent Allowance",
                })
            if not deductions:
                deductions.append({
                    "section": "80C",
                    "claimed": 0,
                    "limit": 150000,
                    "items": "ELSS, PPF, LIC, EPF",
                })
            result["deductions"] = deductions

        return self._add_provenance(result)
