"""Portfolio management endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import MutualFund
from app.schemas.finance import MutualFundInput, PortfolioXRayResult
from app.api.dependencies import get_current_user
from app.agents.portfolio_xray import PortfolioXRayAgent

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/")
def get_portfolio(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get user's mutual fund holdings."""
    funds = db.query(MutualFund).filter(MutualFund.user_id == current_user.id).all()
    return [
        {
            "id": f.id,
            "name": f.name,
            "plan": f.plan,
            "category": f.category,
            "aum": f.aum,
            "ter": f.ter,
            "directTer": f.direct_ter,
            "nav": f.nav,
            "units": f.units,
        }
        for f in funds
    ]


@router.post("/")
def add_fund(
    fund_data: MutualFundInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a mutual fund holding."""
    fund = MutualFund(
        user_id=current_user.id,
        name=fund_data.name,
        plan=fund_data.plan,
        category=fund_data.category,
        aum=fund_data.aum,
        ter=fund_data.ter,
        direct_ter=fund_data.direct_ter,
        nav=fund_data.nav,
    )
    db.add(fund)
    db.commit()
    db.refresh(fund)
    return {"id": fund.id, "message": "Fund added successfully"}


@router.post("/bulk")
def add_funds_bulk(
    funds: List[MutualFundInput],
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add multiple mutual fund holdings at once."""
    # Clear existing funds first
    db.query(MutualFund).filter(MutualFund.user_id == current_user.id).delete()

    for fund_data in funds:
        fund = MutualFund(
            user_id=current_user.id,
            name=fund_data.name,
            plan=fund_data.plan,
            category=fund_data.category,
            aum=fund_data.aum,
            ter=fund_data.ter,
            direct_ter=fund_data.direct_ter,
            nav=fund_data.nav,
        )
        db.add(fund)

    db.commit()
    return {"message": f"{len(funds)} funds added successfully"}


@router.delete("/{fund_id}")
def delete_fund(
    fund_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a mutual fund holding."""
    fund = db.query(MutualFund).filter(
        MutualFund.id == fund_id, MutualFund.user_id == current_user.id
    ).first()
    if not fund:
        raise HTTPException(status_code=404, detail="Fund not found")

    db.delete(fund)
    db.commit()
    return {"message": "Fund deleted"}


@router.post("/xray")
def run_xray(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run Portfolio X-Ray analysis on current holdings."""
    funds = db.query(MutualFund).filter(MutualFund.user_id == current_user.id).all()

    if not funds:
        raise HTTPException(status_code=400, detail="No funds in portfolio. Add funds first.")

    fund_dicts = [
        {
            "name": f.name,
            "plan": f.plan,
            "category": f.category,
            "aum": f.aum,
            "ter": f.ter,
            "direct_ter": f.direct_ter,
            "nav": f.nav,
        }
        for f in funds
    ]

    agent = PortfolioXRayAgent()
    return agent.process({"funds": fund_dicts})
