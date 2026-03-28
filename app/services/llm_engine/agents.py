from app.services.calculators.tax_logic import calculate_tax_new_regime
from langchain_openai import ChatOpenAI

async def tax_wizard_node(state):
    print("--- LOG: Tax Wizard Analyzing ---")
    raw_data = state["raw_financial_data"]
    income = raw_data["user_profile"]["monthly_income"] * 12
    
    
    result = calculate_tax_new_regime(income)
    
   
    llm = ChatOpenAI(model="gpt-4o")
    prompt = f"""
    User Income: ₹{income}
    Calculated Tax (New Regime): ₹{result['tax_payable']}
    Explain this tax structure to a common Indian person in simple Hinglish. 
    Mention that according to Budget 2025-26, they are in a specific slab.
    """
    
    explanation = llm.invoke(prompt)
    
    return {
        "analysis_reports": [{"agent": "Tax Wizard", "report": explanation.content, "math": result}],
        "next_node": "portfolio_xray"
    }