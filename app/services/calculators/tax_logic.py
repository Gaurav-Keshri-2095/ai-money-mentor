def calculate_tax_new_regime(annual_income: float) -> dict:
    """
    FY 2025-26 New Tax Regime calculation.
    """
   
    taxable_income = max(0, annual_income - 75000)
    tax = 0
    
    
    slabs = [
        (400000, 0.00),  # Up to 4L: 0%
        (800000, 0.05),  # 4L to 8L: 5%
        (1200000, 0.10), # 8L to 12L: 10%
        (1600000, 0.15), # 12L to 16L: 15%
        (2000000, 0.20), # 16L to 20L: 20%
        (float('inf'), 0.25) # Above 20L: 25%
    ]
    
    previous_limit = 0
    for limit, rate in slabs:
        if taxable_income > previous_limit:
            taxable_amount = min(taxable_income, limit) - previous_limit
            tax += taxable_amount * rate
            previous_limit = limit
        else:
            break
            
    return {
        "taxable_income": taxable_income,
        "tax_payable": tax,
        "regime": "New"
    }

def calculate_tax_old_regime(annual_income: float, deductions: float) -> dict:
    """
    FY 2025-26 Old Tax Regime calculation (requires deductions).
    """
    taxable_income = max(0, annual_income - deductions - 50000) 
    tax = 0
    
    return {"tax_payable": 0, "regime": "Old"} 