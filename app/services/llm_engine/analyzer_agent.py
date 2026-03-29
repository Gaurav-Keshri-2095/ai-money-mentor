# async def analyzer_node(state):
#     response_content = """
#     *Financial Master Plan:*
#     1. **Tax:** New Regime best hai, ₹75k save ho rahe hain.
#     2. **Health:** Emergency fund 3 months se kam hai, ₹50k liquid cash rakho.
#     3. **Retirement:** FIRE goal ke liye monthly SIP ₹10k badhani hogi.
#     4. **Portfolio:** Equity exposure 80% hai, thoda Gold/Debt mein diversify karo.
#     """
    
#     return {
#         "final_output": response_content,
#         "next_node": "compliance"
#     }

from langchain_groq import ChatGroq

async def analyzer_node(state):
    llm = ChatGroq(model_name="llama-3.3-70b-versatile")
    
    
    payload = state.get("master_financial_payload")
    
    if not payload:
        
        payload = state.get("analysis_reports", "No reports found")

    prompt = f"Analyze this financial data and give a master plan in Hinglish: {payload}"
    response = llm.invoke(prompt)
    
    return {"final_output": response.content}


