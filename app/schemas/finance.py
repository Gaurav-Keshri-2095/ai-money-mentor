# from typing import Annotated , List ,Optional , TypedDict
# from operator import add

# class FinancialState(TypedDict):
#     user_profile: dict

#     raw_financial_data: Optional[dict]

#     analysis_reports: Annotated[List[dict], add]

#     final_output: str
    
#     is_compliant: bool
    
#     next_node: str


from typing import Annotated, List, Optional, TypedDict
import operator

class FinancialState(TypedDict):
    user_profile: dict
    raw_financial_data: Optional[dict]
    # Annotated with operator.add is CRITICAL for parallel nodes
    analysis_reports: Annotated[List[dict], operator.add] 
    master_financial_payload: Optional[dict]
    final_output: str
    is_compliant: bool