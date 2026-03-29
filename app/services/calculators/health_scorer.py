"""Money Health Score calculator."""

from app.utils.constants import (
    HEALTH_WEIGHTS, EMERGENCY_FUND_TARGET_MONTHS,
    IDEAL_SAVINGS_RATE, MAX_DEBT_TO_INCOME,
)
from app.utils.formatters import severity_color


def compute_health_score(
    savings: float,
    monthly_expenses: float,
    monthly_income: float,
    total_debt_emi: float = 0,
    goal_target: float = 0,
    goal_saved: float = 0,
) -> dict:
    """
    Compute the Money Health Score (0-100) with breakdown.
    Returns MoneyHealthResult-compatible dict.
    """
    # ── 1. Liquidity Score (max 30) ──
    emergency_months = savings / monthly_expenses if monthly_expenses > 0 else 0
    if emergency_months >= EMERGENCY_FUND_TARGET_MONTHS:
        liquidity_score = HEALTH_WEIGHTS["liquidity"]["max"]
    elif emergency_months >= 3:
        liquidity_score = round(HEALTH_WEIGHTS["liquidity"]["max"] * (emergency_months / EMERGENCY_FUND_TARGET_MONTHS))
    else:
        liquidity_score = round(HEALTH_WEIGHTS["liquidity"]["max"] * (emergency_months / EMERGENCY_FUND_TARGET_MONTHS))
    liquidity_score = min(liquidity_score, HEALTH_WEIGHTS["liquidity"]["max"])

    # ── 2. Savings Rate Score (max 25) ──
    savings_rate = ((monthly_income - monthly_expenses) / monthly_income * 100) if monthly_income > 0 else 0
    savings_rate = max(savings_rate, 0)
    if savings_rate >= IDEAL_SAVINGS_RATE:
        savings_score = HEALTH_WEIGHTS["savings_rate"]["max"]
    else:
        savings_score = round(HEALTH_WEIGHTS["savings_rate"]["max"] * (savings_rate / IDEAL_SAVINGS_RATE))
    savings_score = min(savings_score, HEALTH_WEIGHTS["savings_rate"]["max"])

    # ── 3. Debt-to-Income Ratio Score (max 20) ──
    debt_to_income = (total_debt_emi / monthly_income * 100) if monthly_income > 0 else 0
    if debt_to_income == 0:
        debt_score = HEALTH_WEIGHTS["debt_ratio"]["max"]
    elif debt_to_income <= 20:
        debt_score = HEALTH_WEIGHTS["debt_ratio"]["max"]
    elif debt_to_income <= MAX_DEBT_TO_INCOME:
        debt_score = round(HEALTH_WEIGHTS["debt_ratio"]["max"] * (1 - (debt_to_income - 20) / 20))
    else:
        debt_score = round(HEALTH_WEIGHTS["debt_ratio"]["max"] * 0.3)
    debt_score = max(min(debt_score, HEALTH_WEIGHTS["debt_ratio"]["max"]), 0)

    # ── 4. Goal Progress Score (max 25) ──
    goal_progress = (goal_saved / goal_target * 100) if goal_target > 0 else 50
    goal_score = round(HEALTH_WEIGHTS["goal_progress"]["max"] * min(goal_progress / 100, 1))
    goal_score = min(goal_score, HEALTH_WEIGHTS["goal_progress"]["max"])

    # ── Total Score ──
    total_score = liquidity_score + savings_score + debt_score + goal_score

    # ── Emergency target ──
    emergency_target = monthly_expenses * 3  # 3-month minimum

    # ── Build breakdown ──
    breakdown = [
        {
            "label": "Liquidity",
            "score": liquidity_score,
            "max": HEALTH_WEIGHTS["liquidity"]["max"],
            "color": severity_color(liquidity_score / HEALTH_WEIGHTS["liquidity"]["max"] * 100),
        },
        {
            "label": "Savings Rate",
            "score": savings_score,
            "max": HEALTH_WEIGHTS["savings_rate"]["max"],
            "color": severity_color(savings_score / HEALTH_WEIGHTS["savings_rate"]["max"] * 100),
        },
        {
            "label": "Debt Ratio",
            "score": debt_score,
            "max": HEALTH_WEIGHTS["debt_ratio"]["max"],
            "color": severity_color(debt_score / HEALTH_WEIGHTS["debt_ratio"]["max"] * 100),
        },
        {
            "label": "Goal Progress",
            "score": goal_score,
            "max": HEALTH_WEIGHTS["goal_progress"]["max"],
            "color": severity_color(goal_score / HEALTH_WEIGHTS["goal_progress"]["max"] * 100),
        },
    ]

    # ── Build action recommendations ──
    actions = []

    # Emergency fund action
    if emergency_months < 3:
        actions.append({
            "severity": "critical",
            "title": "Emergency Fund: Critical Alert",
            "description": f"You currently have ₹{savings:,.0f} in savings against a monthly expense of ₹{monthly_expenses:,.0f} ({emergency_months:.1f} months).",
            "action": f"Pause discretionary investments until you build a reserve of ₹{emergency_target:,.0f} (3 months' cover). Consider sweeping this into a Liquid Mutual Fund or a high-yield savings account.",
        })
    elif emergency_months < EMERGENCY_FUND_TARGET_MONTHS:
        actions.append({
            "severity": "warning",
            "title": "Emergency Fund: Build Up",
            "description": f"You have {emergency_months:.1f} months of expenses saved. Target is {EMERGENCY_FUND_TARGET_MONTHS} months.",
            "action": f"Continue building towards ₹{monthly_expenses * EMERGENCY_FUND_TARGET_MONTHS:,.0f} (6 months' cover).",
        })
    else:
        actions.append({
            "severity": "success",
            "title": "Emergency Fund: Excellent",
            "description": f"You have {emergency_months:.1f} months of expenses saved (₹{savings:,.0f}). Well above the {EMERGENCY_FUND_TARGET_MONTHS}-month recommended buffer.",
            "action": "Consider moving excess emergency funds (above 6 months) into short-term debt funds for better returns.",
        })

    # Savings rate action
    if savings_rate < IDEAL_SAVINGS_RATE:
        actions.append({
            "severity": "warning",
            "title": "Savings Rate Below Target",
            "description": f"Your savings rate is {savings_rate:.0f}%, below the recommended {IDEAL_SAVINGS_RATE}% threshold.",
            "action": f"Automate a ₹{max(monthly_income * 0.05, 5000):,.0f} SIP on salary day so savings happen first, not last.",
        })
    else:
        actions.append({
            "severity": "success",
            "title": "Savings Rate: Outstanding",
            "description": f"Your {savings_rate:.0f}% savings rate far exceeds the {IDEAL_SAVINGS_RATE}% target. You are on an accelerated wealth-building path.",
            "action": "Maintain current discipline. Consider tax-loss harvesting at year-end to optimize further.",
        })

    return {
        "savings": savings,
        "monthlyExpenses": monthly_expenses,
        "emergencyMonths": round(emergency_months, 1),
        "emergencyTarget": emergency_target,
        "savingsRate": round(savings_rate),
        "debtToIncome": round(debt_to_income),
        "goalProgress": round(goal_progress),
        "breakdown": breakdown,
        "actions": actions,
        "overall_score": total_score,
    }
