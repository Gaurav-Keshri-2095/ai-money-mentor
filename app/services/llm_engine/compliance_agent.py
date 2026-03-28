from langchain_openai import ChatOpenAI

async def compliance_guardian_node(state):
    llm = ChatOpenAI(model="gpt-4o")
    advice = state["final_output"]
    
    prompt = f"""
    Review this financial advice for SEBI/RBI Compliance: {advice}
    
    Rules:
    - No specific stock 'BUY/SELL' recommendations.
    - No guaranteed returns promises.
    - Must mention 'Market risks'.
    
    If non-compliant, rewrite it. If compliant, return it as is.
    """
    
    response = llm.invoke(prompt)
    
    return {
        "final_output": response.content,
        "is_compliant": True
    }