# from app.services.calculators.tax_logic import calculate_tax_new_regime
# import datetime

# async def tax_wizard_node(state):
#     raw_data = state["raw_financial_data"]
#     income = raw_data["user_profile"]["monthly_income"] * 12
#     result = calculate_tax_new_regime(income)
    
#     explanation_content = f"Bhai, Budget 2025-26 ke hisaab se tumhara tax ₹{result['tax_payable']} banta hai. New regime best hai."

#     return {
#         "analysis_reports": [{
#             "agent": "Tax Wizard", 
#             "report": explanation_content, 
#             "math": result,
#             "timestamp": str(datetime.datetime.now())
#         }],
#         "next_node": "portfolio_xray"
#     }


from app.services.calculators.tax_logic import calculate_tax_new_regime
from langchain_groq import ChatGroq
import datetime

async def tax_wizard_node(state):
    raw_data = state["raw_financial_data"]
    income = raw_data["user_profile"]["monthly_income"] * 12
    result = calculate_tax_new_regime(income)
    
    # Using Llama 3.3 70B - Super Fast!
    llm = ChatGroq(model_name="llama-3.3-70b-versatile")
    prompt = f"Income: {income}, Tax: {result['tax_payable']}. Explain in Hinglish for a common man."
    
    explanation = llm.invoke(prompt)
    
    return {
        "analysis_reports": [{
            "agent": "Tax Wizard", 
            "report": explanation.content, 
            "math": result,
            "timestamp": str(datetime.datetime.now())
        }],
        "next_node": "portfolio_xray"
    }