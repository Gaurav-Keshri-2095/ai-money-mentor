# def collector_node(state):
#     print("--- LOG: Data Collector Standardizing & Batching ---")
#     reports = state["analysis_reports"]
    

#     master_payload = {
#         "profile_summary": state["user_profile"],
#         "provenance": [],
#         "data_blocks": {},
#         "metadata": {
#             "total_agents_processed": len(reports),
#             "status": "Ready for Synthesis"
#         }
#     }
    
#     for report in reports:
#         agent_name = report['agent']
   
#         master_payload["provenance"].append({
#             "source_agent": agent_name,
#             "timestamp": report.get("timestamp")
#         })
#         master_payload["data_blocks"][agent_name] = report
        
#     return {
#         "master_financial_payload": master_payload,
#         "next_node": "analyzer"
#     }


async def collector_node(state):
    print("--- LOG: Data Collector Standardizing & Batching ---")
    
    reports = state.get("analysis_reports", [])
    user = state.get("user_profile", {})

    # Data ko structure karo
    combined_data = {
        "user_context": user,
        "agent_findings": reports,
        "total_reports": len(reports)
    }

    
    return {"master_financial_payload": combined_data}