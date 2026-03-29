"""Indian financial constants — tax slabs, SEBI rules, MF overlap matrices."""

# ── Indian Tax Slabs FY 2025-26 ──

OLD_REGIME_SLABS = [
    (250000, 0.00),    # 0 - 2.5L: Nil
    (500000, 0.05),    # 2.5L - 5L: 5%
    (1000000, 0.20),   # 5L - 10L: 20%
    (float("inf"), 0.30),  # 10L+: 30%
]

NEW_REGIME_SLABS = [
    (300000, 0.00),    # 0 - 3L: Nil
    (700000, 0.05),    # 3L - 7L: 5%
    (1000000, 0.10),   # 7L - 10L: 10%
    (1200000, 0.15),   # 10L - 12L: 15%
    (1500000, 0.20),   # 12L - 15L: 20%
    (float("inf"), 0.30),  # 15L+: 30%
]

# Standard deduction
OLD_REGIME_STANDARD_DEDUCTION = 50000
NEW_REGIME_STANDARD_DEDUCTION = 75000

# Cess
HEALTH_EDUCATION_CESS = 0.04

# Section limits
SECTION_80C_LIMIT = 150000
SECTION_80D_SELF_LIMIT = 25000
SECTION_80D_PARENTS_LIMIT = 50000  # For senior citizen parents
SECTION_80D_PARENTS_LIMIT_NORMAL = 25000
NPS_80CCD_LIMIT = 50000

# ── FIRE Constants ──
DEFAULT_INFLATION = 0.06
DEFAULT_SAFE_WITHDRAWAL_RATE = 0.035  # Conservative for India
NIFTY_HISTORICAL_RETURN = 0.12
NIFTY_HISTORICAL_STDDEV = 0.18  # Annualized volatility
MONTE_CARLO_ITERATIONS = 1000

# ── Health Score Weights ──
HEALTH_WEIGHTS = {
    "liquidity": {"max": 30, "label": "Liquidity"},
    "savings_rate": {"max": 25, "label": "Savings Rate"},
    "debt_ratio": {"max": 20, "label": "Debt Ratio"},
    "goal_progress": {"max": 25, "label": "Goal Progress"},
}

EMERGENCY_FUND_TARGET_MONTHS = 6
IDEAL_SAVINGS_RATE = 20
MAX_DEBT_TO_INCOME = 40

# ── MF Overlap Matrix (top Indian large-cap mutual funds) ──
# Maps fund pairs to approximate stock overlap percentage
# Based on publicly available portfolio holdings data
MF_OVERLAP_MATRIX = {
    ("Axis Bluechip Fund", "SBI Bluechip Fund"): {
        "overlap_percent": 68,
        "stocks": [
            {"name": "HDFC Bank", "weight1": 9.2, "weight2": 8.8},
            {"name": "Reliance Industries", "weight1": 8.5, "weight2": 7.9},
            {"name": "ICICI Bank", "weight1": 7.8, "weight2": 8.1},
            {"name": "Infosys", "weight1": 6.2, "weight2": 5.9},
            {"name": "TCS", "weight1": 5.8, "weight2": 6.3},
            {"name": "Larsen & Toubro", "weight1": 4.5, "weight2": 4.2},
            {"name": "Bharti Airtel", "weight1": 4.1, "weight2": 3.8},
            {"name": "ITC", "weight1": 3.8, "weight2": 4.5},
        ],
    },
    ("Quant Small Cap Fund", "Nippon India Growth Fund"): {
        "overlap_percent": 65,
        "stocks": [
            {"name": "Reliance Industries", "weight1": 5.2, "weight2": 4.8},
            {"name": "HDFC Bank", "weight1": 4.1, "weight2": 3.6},
            {"name": "Jio Financial", "weight1": 3.8, "weight2": 3.2},
            {"name": "Adani Enterprises", "weight1": 3.5, "weight2": 2.9},
            {"name": "LIC", "weight1": 2.8, "weight2": 3.1},
        ],
    },
    ("HDFC Mid-Cap Opportunities", "Kotak Emerging Equity"): {
        "overlap_percent": 52,
        "stocks": [
            {"name": "Persistent Systems", "weight1": 4.2, "weight2": 3.8},
            {"name": "Coforge", "weight1": 3.5, "weight2": 3.1},
            {"name": "Max Healthcare", "weight1": 3.2, "weight2": 2.9},
        ],
    },
}

# ── Compliance Rules ──
MANDATORY_DISCLAIMERS = [
    "Mutual Fund investments are subject to market risks, read all scheme related documents carefully.",
    "Past performance does not guarantee future results.",
    "This analysis is for informational and educational purposes only.",
    "Please consult a registered SEBI Investment Adviser (RIA) before making investment decisions.",
]

PROHIBITED_PHRASES = [
    "guaranteed returns",
    "risk-free investment",
    "sure profit",
    "no loss",
    "100% safe",
    "guaranteed income",
]

# ── Sector Mapping for News Agent ──
SECTOR_KEYWORDS = {
    "banking": ["HDFC Bank", "ICICI Bank", "SBI", "Kotak", "Axis Bank", "bank", "banking", "RBI", "repo rate"],
    "it": ["Infosys", "TCS", "Wipro", "HCL Tech", "Tech Mahindra", "IT sector", "software"],
    "pharma": ["Sun Pharma", "Dr Reddy", "Cipla", "Lupin", "pharma", "healthcare"],
    "energy": ["Reliance", "ONGC", "BPCL", "oil", "gas", "energy", "crude"],
    "auto": ["Tata Motors", "Maruti", "M&M", "Bajaj Auto", "auto", "EV"],
    "fmcg": ["ITC", "HUL", "Nestle", "Britannia", "FMCG", "consumer"],
    "infra": ["Larsen & Toubro", "UltraTech", "Adani", "infrastructure"],
    "telecom": ["Bharti Airtel", "Jio", "Vodafone", "telecom", "5G"],
}
