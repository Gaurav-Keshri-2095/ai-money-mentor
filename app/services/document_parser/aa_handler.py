import json
import os
from typing import Dict

def fetch_mock_data() -> Dict:
    """
    test_data.json se financial data read karta hai development ke liye.
    """

    current_dir = os.path.dirname(os.path.abspath(__file__))
    file_path = os.path.join(current_dir, "..", "..", "data", "test_data.json")
    
    try:
        with open(file_path, "r") as f:
            data = json.load(f)
            return data
    except FileNotFoundError:
        return {"error": "test_data.json file nahi mili", "status": "FAILURE"}
    except json.JSONDecodeError:
        return {"error": "JSON format mein galti hai", "status": "FAILURE"}


def aa_handler_node(state):
    """
    LangGraph node jo state ko update karega raw data ke sath.
    """
    print("--- LOG: Fetching Mock Financial Data ---")
    
  
    data = fetch_mock_data()
    

    return {
        "raw_financial_data": data,
        "next_node": "tax_wizard" 
    }