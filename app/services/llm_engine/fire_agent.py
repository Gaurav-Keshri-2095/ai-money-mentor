import datetime

async def fire_planner_node(state):
    data = state["raw_financial_data"]
    profile = data['user_profile']
    
    annual_expenses = profile['monthly_expenses'] * 12
    target_corpus = annual_expenses * 30
    
    current_savings = sum(acc['balance'] for acc in data['accounts'])
    current_investments = sum(mf['current_value'] for mf in data['investments']['mutual_funds'])
    net_worth = current_savings + current_investments
    
    wealth_gap = max(0, target_corpus - net_worth)
    
    return {
        "analysis_reports": [{
            "agent": "FIRE Planner",
            "target_corpus": round(target_corpus, 2),
            "current_net_worth": round(net_worth, 2),
            "wealth_gap": round(wealth_gap, 2),
            "assumptions": {"inflation": "6%", "returns": "12%"},
            "timestamp": str(datetime.datetime.now())
        }]
    }