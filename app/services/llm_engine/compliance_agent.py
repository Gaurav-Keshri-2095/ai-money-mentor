# async def compliance_guardian_node(state):
#     advice = state["final_output"]
#     disclaimer = "\n\n⚠️ Disclaimer: Market risks apply. This is for hackathon demo purposes."
    
#     return {
#         "final_output": advice + disclaimer,
#         "is_compliant": True
#     }


from langchain_groq import ChatGroq

async def compliance_guardian_node(state):
    llm = ChatGroq(model_name="llama-3.3-70b-versatile")
    advice = state["final_output"]
    prompt = f"Check this for SEBI/RBI compliance. No direct buy/sell calls. Rewrite if needed: {advice}"
    
    response = llm.invoke(prompt)
    
    return {
        "final_output": response.content,
        "is_compliant": True
    }