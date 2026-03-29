"""Financial news endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import MutualFund
from app.api.dependencies import get_current_user
from app.agents.financial_news import FinancialNewsAgent

router = APIRouter(prefix="/news", tags=["Financial News"])


@router.get("/alerts")
def get_personalized_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get personalized market alerts based on user's portfolio."""
    funds = db.query(MutualFund).filter(MutualFund.user_id == current_user.id).all()

    fund_dicts = [
        {
            "name": f.name,
            "plan": f.plan,
            "category": f.category,
            "aum": f.aum,
        }
        for f in funds
    ]

    agent = FinancialNewsAgent()
    result = agent.process({"funds": fund_dicts})

    return {
        "sectors": result.get("user_sectors", []),
        "alerts": result.get("matched_alerts", []),
        "news": result.get("news_items", []),
    }


@router.get("/market")
def get_market_summary():
    """Get general market news summary (no auth required for demo)."""
    agent = FinancialNewsAgent()
    result = agent.process({"funds": []})

    return {
        "news": result.get("news_items", []),
    }
