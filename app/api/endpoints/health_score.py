from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text, func
from datetime import datetime, timedelta, timezone

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import MutualFund, TaxProfile, FinancialGoal, DebtRecord, AnalysisCache, Account, Transaction
from app.schemas.finance import AnalysisRequest, MasterFinancialPlan
from app.api.dependencies import get_current_user
from app.agents.orchestrator import OrchestratorAgent

router = APIRouter(prefix="/analysis", tags=["Financial Analysis"])


def _build_pipeline_payload(user: User, request: AnalysisRequest, db: Session) -> dict:
    """Build the complete payload for the orchestrator from DB + request overrides."""
    # 1. Dynamic Savings (Sum of all account balances)
    calculated_savings = db.query(func.sum(Account.balance)).filter(Account.user_id == user.id).scalar() or 0
    
    # 2. Dynamic Monthly Expenses (Sum of 'expense' transactions in last 30 days)
    thirty_days_ago = (datetime.now(timezone.utc) - timedelta(days=30)).strftime("%Y-%m-%d")
    calculated_monthly_expenses = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id,
        Transaction.transaction_type == "expense",
        Transaction.date >= thirty_days_ago
    ).scalar() or 0
    
    # 3. Dynamic Monthly Income (Sum of 'income' transactions in last 30 days)
    calculated_monthly_income = db.query(func.sum(Transaction.amount)).filter(
        Transaction.user_id == user.id,
        Transaction.transaction_type == "income",
        Transaction.date >= thirty_days_ago
    ).scalar() or 0

    # User basics (request overrides DB values)
    age = request.age or user.age
    salary = request.salary or user.salary
    
    # Final Payload Values (Priority: Request > Calculated > Static Profile)
    # If no transactions exist, fallback to static profile
    monthly_expenses = request.monthly_expenses or calculated_monthly_expenses or user.monthly_expenses
    savings = request.savings or calculated_savings or user.savings
    
    # Income fallback
    monthly_income = calculated_monthly_income or (salary / 12 if salary > 0 else 0)

    # Load MF holdings from DB
    funds_db = db.query(MutualFund).filter(MutualFund.user_id == user.id).all()
    funds = [
        {
            "name": f.name,
            "plan": f.plan,
            "category": f.category,
            "aum": f.aum,
            "ter": f.ter,
            "direct_ter": f.direct_ter,
            "nav": f.nav,
        }
        for f in funds_db
    ]

    # Load tax profile
    tax_profile = db.query(TaxProfile).filter(TaxProfile.user_id == user.id).order_by(TaxProfile.id.desc()).first()
    deductions_80c = 0
    deductions_80d = 0
    hra = 0
    deduction_records = []
    if tax_profile:
        for d in (tax_profile.deductions or []):
            section = d.get("section", "").upper()
            claimed = d.get("claimed", 0)
            if "80C" in section:
                deductions_80c = claimed
            elif "80D" in section:
                deductions_80d += claimed
            elif "HRA" in section:
                hra = claimed
            deduction_records.append(d)

    # Load goals
    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == user.id).all()
    goal_target = sum(g.target_amount for g in goals)
    goal_saved = sum(g.saved_amount for g in goals)

    # Load debts
    debts = db.query(DebtRecord).filter(DebtRecord.user_id == user.id).all()
    total_debt_emi = sum(d.emi for d in debts)

    # Monthly SIP estimation (sum of SIP-type MF investments / 12 or use monthly_sip from request)
    monthly_sip = request.monthly_sip or max(sum(f.aum for f in funds_db) / 60, 10000)  # rough estimate

    return {
        "user_info": {
            "name": user.name,
            "label": "",
            "age": age,
            "salary": salary,
            "monthly_expenses": monthly_expenses,
        },
        "age": age,
        "salary": salary,
        "monthly_income": salary / 12 if salary > 0 else 0,
        "monthly_expenses": monthly_expenses,
        "savings": savings,
        "gross_income": salary,
        "deductions_80c": deductions_80c,
        "deductions_80d": deductions_80d,
        "hra": hra,
        "deduction_records": deduction_records,
        "funds": funds,
        "goal_target": goal_target,
        "goal_saved": goal_saved,
        "total_debt_emi": total_debt_emi,
        "target_retirement_age": request.target_retirement_age or 50,
        "monthly_sip": monthly_sip,
        "current_corpus": savings + sum(f.aum for f in funds_db),
        "target_corpus": request.target_corpus or 50000000,
    }


@router.post("/full")
def run_full_analysis(
    request: AnalysisRequest = AnalysisRequest(),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run the full multi-agent analysis pipeline."""
    # Build payload
    payload = _build_pipeline_payload(current_user, request, db)

    # Run orchestrator pipeline
    orchestrator = OrchestratorAgent()
    result = orchestrator.process(payload)

    # Cache result
    cache = AnalysisCache(
        user_id=current_user.id,
        result_json=result,
        overall_score=result.get("overallScore", 0),
    )
    db.add(cache)
    db.commit()

    return result


@router.get("/score/{user_id}")
def get_cached_score(
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get the latest cached analysis result."""
    if current_user.id != user_id:
        raise HTTPException(status_code=403, detail="Access denied")

    cache = (
        db.query(AnalysisCache)
        .filter(AnalysisCache.user_id == user_id)
        .order_by(AnalysisCache.id.desc())
        .first()
    )

    if not cache:
        raise HTTPException(status_code=404, detail="No analysis found. Run /analysis/full first.")

    return cache.result_json
