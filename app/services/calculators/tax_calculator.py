"""Indian income tax calculator — Old & New regime with full deduction support."""

from app.utils.constants import (
    OLD_REGIME_SLABS, NEW_REGIME_SLABS,
    OLD_REGIME_STANDARD_DEDUCTION, NEW_REGIME_STANDARD_DEDUCTION,
    HEALTH_EDUCATION_CESS, SECTION_80C_LIMIT,
)


def _compute_tax_on_slabs(taxable_income: float, slabs: list) -> float:
    """Compute tax using a slab schedule."""
    tax = 0
    prev_limit = 0
    for limit, rate in slabs:
        if taxable_income <= prev_limit:
            break
        bracket_income = min(taxable_income, limit) - prev_limit
        tax += bracket_income * rate
        prev_limit = limit
    return tax


def compute_old_regime_tax(
    gross_income: float,
    deductions_80c: float = 0,
    deductions_80d: float = 0,
    hra: float = 0,
    section_24b: float = 0,
    nps_80ccd: float = 0,
    other_deductions: float = 0,
) -> dict:
    """
    Compute tax under Old Regime with all deductions.
    Returns dict with tax details.
    """
    # Standard deduction
    income_after_sd = gross_income - OLD_REGIME_STANDARD_DEDUCTION

    # Apply deductions
    total_80c = min(deductions_80c, SECTION_80C_LIMIT)
    total_deductions = total_80c + deductions_80d + hra + section_24b + nps_80ccd + other_deductions

    taxable_income = max(income_after_sd - total_deductions, 0)
    base_tax = _compute_tax_on_slabs(taxable_income, OLD_REGIME_SLABS)

    # Rebate u/s 87A: if taxable income <= 5L, tax = 0 (old regime)
    if taxable_income <= 500000:
        base_tax = 0

    cess = base_tax * HEALTH_EDUCATION_CESS
    total_tax = base_tax + cess

    return {
        "gross_income": gross_income,
        "standard_deduction": OLD_REGIME_STANDARD_DEDUCTION,
        "total_deductions": total_deductions,
        "deductions_breakdown": {
            "80C": total_80c,
            "80D": deductions_80d,
            "HRA": hra,
            "24b": section_24b,
            "80CCD": nps_80ccd,
            "other": other_deductions,
        },
        "taxable_income": taxable_income,
        "base_tax": round(base_tax),
        "cess": round(cess),
        "total_tax": round(total_tax),
    }


def compute_new_regime_tax(gross_income: float) -> dict:
    """
    Compute tax under New Regime (no deductions except standard deduction).
    """
    taxable_income = max(gross_income - NEW_REGIME_STANDARD_DEDUCTION, 0)
    base_tax = _compute_tax_on_slabs(taxable_income, NEW_REGIME_SLABS)

    # Rebate u/s 87A: if taxable income <= 7L, tax = 0 (new regime)
    if taxable_income <= 700000:
        base_tax = 0

    cess = base_tax * HEALTH_EDUCATION_CESS
    total_tax = base_tax + cess

    return {
        "gross_income": gross_income,
        "standard_deduction": NEW_REGIME_STANDARD_DEDUCTION,
        "total_deductions": NEW_REGIME_STANDARD_DEDUCTION,
        "taxable_income": taxable_income,
        "base_tax": round(base_tax),
        "cess": round(cess),
        "total_tax": round(total_tax),
    }


def compare_regimes(
    gross_income: float,
    deductions_80c: float = 0,
    deductions_80d: float = 0,
    hra: float = 0,
    section_24b: float = 0,
    nps_80ccd: float = 0,
    other_deductions: float = 0,
) -> dict:
    """
    Compare Old vs New regime and recommend the best option.
    Returns the full TaxWizardResult-compatible dict.
    """
    old = compute_old_regime_tax(
        gross_income, deductions_80c, deductions_80d, hra, section_24b, nps_80ccd, other_deductions
    )
    new = compute_new_regime_tax(gross_income)

    old_tax = old["total_tax"]
    new_tax = new["total_tax"]

    recommendation = "new" if new_tax < old_tax else "old"
    savings = abs(old_tax - new_tax)

    remaining_80c = max(SECTION_80C_LIMIT - deductions_80c, 0)

    # Build actions
    actions = []
    if recommendation == "new":
        actions.append({
            "title": "Switch to New Tax Regime",
            "description": f"Switching to the New Tax Regime will save you exactly ₹{savings:,.0f} in taxes this financial year based on your current deductions.",
        })
        if remaining_80c > 0:
            actions.append({
                "title": "Or: Maximize Old Regime",
                "description": f"If you prefer the Old Regime, you must deploy ₹{remaining_80c:,.0f} into ELSS or PPF before March 31st to maximize tax efficiency.",
            })
    else:
        if remaining_80c > 0:
            # Calculate tax saved by maximizing 80C
            max_old = compute_old_regime_tax(
                gross_income, SECTION_80C_LIMIT, deductions_80d, hra, section_24b, nps_80ccd, other_deductions
            )
            additional_savings = old_tax - max_old["total_tax"]
            actions.append({
                "title": "Maximize Section 80C",
                "description": f"You currently have ₹{remaining_80c:,.0f} left in your Section 80C limit.",
            })
            actions.append({
                "title": f"Action: Deploy ₹{remaining_80c:,.0f} in ELSS",
                "description": f"Investing this ₹{remaining_80c:,.0f} in an ELSS Mutual Fund before March 31st will reduce your final tax liability by ₹{additional_savings:,.0f}.",
            })
        else:
            actions.append({
                "title": "Stay on Old Regime",
                "description": f"Your deductions make the Old Regime ₹{savings:,.0f} cheaper than the New Regime. Well optimized!",
            })

    return {
        "currentRegime": "Old",
        "grossIncome": gross_income,
        "claimed80C": deductions_80c,
        "max80C": SECTION_80C_LIMIT,
        "remaining80C": remaining_80c,
        "oldRegimeTax": old_tax,
        "newRegimeTax": new_tax,
        "savings": savings,
        "recommendation": recommendation,
        "actions": actions,
        "deductions": [],  # Populated by the agent from user's actual deduction records
    }
