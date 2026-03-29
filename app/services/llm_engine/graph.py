from langgraph.graph import StateGraph, END
from app.schemas.finance import FinancialState
from app.services.document_parser.aa_handler import aa_handler_node
from app.services.llm_engine.agents import tax_wizard_node
from app.services.llm_engine.health_agent import money_health_node
from app.services.llm_engine.portfolio_agent import portfolio_xray_node
from app.services.llm_engine.fire_agent import fire_planner_node
from app.services.llm_engine.collector import collector_node
from app.services.llm_engine.analyzer_agent import analyzer_node
from app.services.llm_engine.compliance_agent import compliance_guardian_node

workflow = StateGraph(FinancialState)

workflow.add_node("ingestor", aa_handler_node)
workflow.add_node("tax_wizard", tax_wizard_node)
workflow.add_node("money_health", money_health_node)
workflow.add_node("portfolio_xray", portfolio_xray_node)
workflow.add_node("fire_planner", fire_planner_node)
workflow.add_node("collector", collector_node)
workflow.add_node("analyzer", analyzer_node)
workflow.add_node("compliance", compliance_guardian_node)

workflow.set_entry_point("ingestor")

workflow.add_edge("ingestor", "tax_wizard")
workflow.add_edge("ingestor", "money_health")
workflow.add_edge("ingestor", "portfolio_xray")
workflow.add_edge("ingestor", "fire_planner")

workflow.add_edge("tax_wizard", "collector")
workflow.add_edge("money_health", "collector")
workflow.add_edge("portfolio_xray", "collector")
workflow.add_edge("fire_planner", "collector")

workflow.add_edge("collector", "analyzer")
workflow.add_edge("analyzer", "compliance")
workflow.add_edge("compliance", END)

app_graph = workflow.compile()