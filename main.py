import asyncio
import os
from dotenv import load_dotenv
from app.services.llm_engine.graph import app_graph

load_dotenv()

async def run_money_mentor():
    initial_state = {
        "user_profile": {"age": 25, "monthly_income": 80000, "monthly_expenses": 35000},
        "raw_financial_data": None,
        "analysis_reports": [],
        "master_financial_payload": None,
        "final_output": "",
        "is_compliant": False
    }

    print("--- 🚀 Executing AI Money Mentor Graph ---")
    
    
    final_state = await app_graph.ainvoke(initial_state)
    
    print("\n" + "="*50)
    print("📜 FINAL MASTER FINANCIAL PLAN")
    print("="*50)
    print(final_state["final_output"])
    print("="*50)

if __name__ == "__main__":
    asyncio.run(run_money_mentor())