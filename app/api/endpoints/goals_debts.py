"""Goals and Debts endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import FinancialGoal, DebtRecord
from app.schemas.finance import FinancialGoalInput, DebtRecordInput
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/goals", tags=["Goals & Debts"])


@router.get("/")
def get_goals(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all goals and debts."""
    goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == current_user.id).all()
    return [
        {
            "id": g.id,
            "name": g.name,
            "target": g.target_amount,
            "saved": g.saved_amount,
            "date": g.target_date,
        }
        for g in goals
    ]

@router.post("/")
def create_goal(
    goal_data: FinancialGoalInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = FinancialGoal(
        user_id=current_user.id,
        name=goal_data.name,
        target_amount=goal_data.target_amount,
        saved_amount=goal_data.saved_amount,
        target_date=goal_data.target_date,
    )
    db.add(goal)
    db.commit()
    db.refresh(goal)
    return {"id": goal.id, "message": "Goal created"}

@router.delete("/{goal_id}")
def delete_goal(
    goal_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    goal = db.query(FinancialGoal).filter(
        FinancialGoal.id == goal_id, FinancialGoal.user_id == current_user.id
    ).first()
    if not goal:
        raise HTTPException(status_code=404, detail="Goal not found")

    db.delete(goal)
    db.commit()
    return {"message": "Goal deleted"}

# --- Debts ---

@router.get("/debts")
def get_debts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    debts = db.query(DebtRecord).filter(DebtRecord.user_id == current_user.id).all()
    return [
        {
            "id": d.id,
            "name": d.name,
            "total": d.total_amount,
            "emi": d.emi,
            "remaining": d.remaining,
            "rate": d.interest_rate,
        }
        for d in debts
    ]

@router.post("/debts")
def create_debt(
    debt_data: DebtRecordInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    debt = DebtRecord(
        user_id=current_user.id,
        name=debt_data.name,
        total_amount=debt_data.total_amount,
        emi=debt_data.emi,
        remaining=debt_data.remaining,
        interest_rate=debt_data.interest_rate,
    )
    db.add(debt)
    db.commit()
    db.refresh(debt)
    return {"id": debt.id, "message": "Debt created"}

@router.delete("/debts/{debt_id}")
def delete_debt(
    debt_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    debt = db.query(DebtRecord).filter(
        DebtRecord.id == debt_id, DebtRecord.user_id == current_user.id
    ).first()
    if not debt:
        raise HTTPException(status_code=404, detail="Debt not found")

    db.delete(debt)
    db.commit()
    return {"message": "Debt deleted"}
