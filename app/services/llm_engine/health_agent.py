import datetime

def calculate_health_score(metrics):
    """Simple weighted scoring algorithm (0-100)."""
    score = 0
  
    score += min(40, (metrics['emergency_fund_months'] / 6) * 40)
   
    score += min(30, (metrics['savings_rate'] / 30) * 30)
  
    score += max(0, 30 - (metrics['dti_ratio'] - 10))
    return round(score, 2)

async def money_health_node(state):
    print("--- LOG: Money Health Agent Calculating ---")
    data = state["raw_financial_data"]
    
    income = data['user_profile']['monthly_income']
    expenses = data['user_profile']['monthly_expenses']
    savings = sum(acc['balance'] for acc in data['accounts'])
    emi = sum(loan['emi'] for loan in data['liabilities'] if 'emi' in loan)

  
    ef_months = round(savings / expenses, 2) if expenses > 0 else 0
  
    savings_rate = round(((income - expenses) / income) * 100, 2)

    dti_ratio = round((emi / income) * 100, 2)

    metrics = {
        "emergency_fund_months": ef_months,
        "savings_rate": savings_rate,
        "dti_ratio": dti_ratio
    }
    
    health_score = calculate_health_score(metrics)
    
  
    alerts = []
    if dti_ratio > 40: alerts.append("⚠️ High Debt! DTI ratio 40% se zyada hai.")
    if ef_months < 3: alerts.append("🚨 Emergency fund kam hai. Kam se kam 3 months ka buffer rakho.")
    if data['insurance']['term_insurance'] == 0: alerts.append("🛡️ Missing Term Insurance! Protection zaroori hai.")

    return {
        "analysis_reports": [{
            "agent": "Money Health",
            "score": health_score,
            "metrics": metrics,
            "alerts": alerts,
            "timestamp": str(datetime.datetime.now())
        }]
    }