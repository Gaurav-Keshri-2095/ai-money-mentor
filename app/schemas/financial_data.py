from typing import List
from pydantic import BaseModel, Field

# ==============================================================================
# 1. Account Aggregator (AA) Data Schemas
# ==============================================================================

class BankAccountSummary(BaseModel):
    """Schema representing the summary of an individual bank account."""
    bank_name: str = Field(..., description="The name of the banking institution (e.g., 'HDFC Bank').")
    account_type: str = Field(..., description="The type of bank account, such as 'Savings', 'Current', or 'Salary'.")
    current_balance: float = Field(..., description="The real-time available balance in the bank account.")
    average_monthly_inflow: float = Field(..., description="The calculated average monthly credits/deposits into this account over the last 6 months.")
    average_monthly_outflow: float = Field(..., description="The calculated average monthly debits/withdrawals from this account over the last 6 months.")

class MutualFundHolding(BaseModel):
    """Schema representing a specific mutual fund investment holding."""
    amc_name: str = Field(..., description="The name of the Asset Management Company (e.g., 'SBI Mutual Fund').")
    scheme_name: str = Field(..., description="The specific name of the mutual fund scheme the user is invested in.")
    isin_code: str = Field(..., description="International Securities Identification Number, a unique 12-character alphanumeric code identifying the mutual fund.")
    units_held: float = Field(..., description="The total number of mutual fund units currently held by the user.")
    average_purchase_price: float = Field(..., description="The weighted average Net Asset Value (NAV) at which the units were originally purchased.")

class LiabilitySummary(BaseModel):
    """Schema representing an outstanding loan or debt liability."""
    lender_name: str = Field(..., description="The name of the institution that issued the loan (e.g., 'ICICI Bank').")
    loan_type: str = Field(..., description="The category of the loan, such as 'Home Loan', 'Personal Loan', or 'Credit Card'.")
    outstanding_balance: float = Field(..., description="The total remaining principal amount that needs to be repaid.")
    emi_amount: float = Field(..., description="The Equated Monthly Installment (EMI) amount the user currently pays for this loan.")

class AAFinancialSnapshot(BaseModel):
    """Master schema holding the aggregated raw financial data snapshot of the user."""
    bank_accounts: List[BankAccountSummary] = Field(..., description="A list of all active bank accounts and their summaries for the user.")
    mutual_funds: List[MutualFundHolding] = Field(..., description="A list of all mutual fund investment holdings.")
    liabilities: List[LiabilitySummary] = Field(..., description="A list of all active loans, credit cards, and other debt obligations.")

# ==============================================================================
# 2. Agent-to-Agent Communication Schemas
# ==============================================================================

class MoneyHealthMetrics(BaseModel):
    """Schema emitted by the Health Diagnostic Agent representing core financial health indicators."""
    savings_rate_percentage: float = Field(..., description="The percentage of monthly income that the user is successfully saving or investing.")
    debt_to_income_ratio: float = Field(..., description="The proportion of the user's monthly income that goes towards paying debt EMIs.")
    emergency_fund_months: float = Field(..., description="The number of months the user can survive on their highly liquid assets if their primary income stops.")
    overall_health_score: int = Field(..., ge=0, le=100, description="An overall financial health score computed between 0 (critical) and 100 (excellent).")

class AnalyzerGapReport(BaseModel):
    """Schema emitted by the Analyzer Agent identifying missing information necessary for accurate advice."""
    is_profile_complete: bool = Field(..., description="Boolean indicating whether all required financial data points have been collected from the user.")
    missing_data_points: List[str] = Field(..., description="A list of specific data points that are missing (e.g., ['Risk Tolerance', 'Dependents']).")
    suggested_questions_for_user: List[str] = Field(..., description="A list of conversational questions the orchestrator should ask the user to gather the missing data points.")

class ComplianceReview(BaseModel):
    """Schema emitted by the Compliance Guardian representing the safety and regulatory check of proposed advice."""
    is_compliant: bool = Field(..., description="Boolean indicating whether the generated financial advice complies with all regulatory and ethical rules.")
    violation_flags: List[str] = Field(..., description="A list of specific compliance violations found in the proposed advice (empty if fully compliant).")
    sanitized_response: str = Field(..., description="The finalized, safe version of the advice with any non-compliant promises, guarantees, or disallowed suggestions removed.")
