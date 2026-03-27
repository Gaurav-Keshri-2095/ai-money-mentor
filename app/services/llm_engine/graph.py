from langgraph.graph import StateGraph, END


workflow = StateGraph(FinancialState)


workflow.add_node("ingestor", aa_ingestor_node)

workflow.add_node("tax_wizard", tax_agent_node)
workflow.add_node("portfolio_xray", portfolio_agent_node)

workflow.add_node("analyzer", analyzer_node)
workflow.add_node("compliance", compliance_guardian_node)


workflow.set_entry_point("ingestor")
workflow.add_edge("ingestor", "tax_wizard")
workflow.add_edge("ingestor", "portfolio_xray")
# After parallel tasks, go to analyzer
workflow.add_edge(["tax_wizard", "portfolio_xray"], "analyzer")
workflow.add_edge("analyzer", "compliance")
workflow.add_edge("compliance", END)

app_graph = workflow.compile()