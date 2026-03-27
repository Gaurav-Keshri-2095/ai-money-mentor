from typing import Annotated , list ,Optional , TypedDict
from operator import add

class FinancialState(TypedDict):
    user_profile: dict

    raw_financial_data: Optional[dict]

    analysis_reports: Annotated[List[dict], add]

    final_output: str
    
    is_compliant: bool
    
    next_node: str