from langchain_openai import ChatOpenAI

async def analyzer_node(state):
    llm = ChatOpenAI(model="gpt-4o")
    payload = state["master_financial_payload"]
    
    prompt = f"""
    Analyze this Unified Financial Payload: {payload}
    
    Task:
    1. Summarize Tax, Health, Portfolio, and FIRE status.
    2. Identify top 3 financial gaps.
    3. Suggest a month-by-month action plan.
    
    Tone: Professional, empathetic, and Hinglish.
    """
    
    response = llm.invoke(prompt)
    
    return {
        "final_output": response.content,
        "next_node": "compliance"
    }