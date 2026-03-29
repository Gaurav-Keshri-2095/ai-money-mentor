"""Pydantic schemas for financial analysis results — matches frontend JSON structures exactly."""

from pydantic import BaseModel
from typing import List, Optional, Any


# ── Money Health Agent ──

class ScoreBreakdownItem(BaseModel):
    label: str
    score: int
    max: int
    color: str


class HealthAction(BaseModel):
    severity: str  # critical, warning, success
    title: str
    description: str
    action: str


class MoneyHealthResult(BaseModel):
    savings: float
    monthlyExpenses: float
    emergencyMonths: float
    emergencyTarget: float
    savingsRate: float
    debtToIncome: float
    goalProgress: float
    breakdown: List[ScoreBreakdownItem]
    actions: List[HealthAction]


# ── Tax Wizard Agent ──

class DeductionItem(BaseModel):
    section: str
    claimed: float
    limit: float
    items: str


class TaxAction(BaseModel):
    title: str
    description: str


class TaxWizardResult(BaseModel):
    currentRegime: str
    grossIncome: float
    claimed80C: float
    max80C: float
    remaining80C: float
    oldRegimeTax: float
    newRegimeTax: float
    savings: float
    recommendation: str  # 'old' or 'new'
    actions: List[TaxAction]
    deductions: List[DeductionItem]


# ── Portfolio X-Ray Agent ──

class FundHolding(BaseModel):
    name: str
    plan: str
    category: str
    aum: float
    ter: float
    directTer: float
    terDiff: float
    tenYearLoss: float
    nav: float


class OverlappingStock(BaseModel):
    name: str
    weight1: float
    weight2: float


class SecondOverlap(BaseModel):
    fund1: str
    fund2: str
    overlapPercent: int


class OverlapAnalysis(BaseModel):
    fund1: str
    fund2: str
    overlapPercent: int
    overlappingStocks: List[OverlappingStock]
    secondOverlap: Optional[SecondOverlap] = None


class PortfolioAction(BaseModel):
    title: str
    description: str
    impact: Optional[str] = None
    action: str


class PortfolioXRayResult(BaseModel):
    funds: List[FundHolding]
    overlapAnalysis: Optional[OverlapAnalysis] = None
    actions: List[PortfolioAction]


# ── FIRE Planner Agent ──

class TrajectoryResult(BaseModel):
    hitAge: int
    probability: int
    stepUp: Optional[int] = None


class NewsImpact(BaseModel):
    headline: str
    relevance: str


class FIREPlannerResult(BaseModel):
    currentAge: int
    targetAge: int
    monthlySIP: float
    currentCorpus: float
    targetCorpus: float
    expectedReturn: float
    inflation: float
    currentTrajectory: TrajectoryResult
    optimizedTrajectory: TrajectoryResult
    newsImpact: Optional[NewsImpact] = None


# ── Compliance Guardian ──

class ComplianceResult(BaseModel):
    notes: List[str]


# ── Master Financial Plan (Full Response) ──

class MasterFinancialPlan(BaseModel):
    id: Optional[str] = None
    name: str
    label: str
    age: int
    salary: float
    monthlyExpenses: float
    overallScore: int
    scoreVerdict: str
    moneyHealth: MoneyHealthResult
    taxWizard: TaxWizardResult
    portfolioXRay: PortfolioXRayResult
    firePlanner: FIREPlannerResult
    compliance: ComplianceResult


# ── API Request Schemas ──

class AnalysisRequest(BaseModel):
    """Full analysis request — can override user DB values."""
    age: Optional[int] = None
    salary: Optional[float] = None
    monthly_expenses: Optional[float] = None
    savings: Optional[float] = None
    tax_regime: Optional[str] = None
    target_retirement_age: Optional[int] = None
    monthly_sip: Optional[float] = None
    target_corpus: Optional[float] = None


class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None


class ChatResponse(BaseModel):
    role: str
    text: str


class MutualFundInput(BaseModel):
    name: str
    plan: str = "Regular"
    category: str = ""
    aum: float = 0
    ter: float = 0
    direct_ter: float = 0
    nav: float = 0


class TaxDeductionInput(BaseModel):
    section: str
    claimed: float
    limit: float
    items: str = ""


class TaxAnalysisRequest(BaseModel):
    gross_income: float
    regime: str = "old"
    deductions: List[TaxDeductionInput] = []
    hra_claimed: float = 0


class FIRERequest(BaseModel):
    current_age: int
    target_age: int = 50
    monthly_sip: float = 10000
    current_corpus: float = 0
    target_corpus: float = 50000000
    step_up_percent: int = 10
    expected_return: float = 0.12
    inflation: float = 0.06

# ── CRUD Schemas ──

class TransactionInput(BaseModel):
    date: str
    description: str
    amount: float
    transaction_type: str
    category: str

class AccountInput(BaseModel):
    name: str
    account_type: str = "Savings"
    balance: float

class FinancialGoalInput(BaseModel):
    name: str
    target_amount: float
    saved_amount: float = 0
    target_date: str

class DebtRecordInput(BaseModel):
    name: str
    total_amount: float
    emi: float
    remaining: float = 0
    interest_rate: float = 0

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
