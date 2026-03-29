"""Tax analysis endpoints."""

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import TaxProfile
from app.schemas.finance import TaxAnalysisRequest
from app.api.dependencies import get_current_user
from app.agents.tax_wizard import TaxWizardAgent

router = APIRouter(prefix="/tax", tags=["Tax Wizard"])


@router.post("/analyze")
def analyze_tax(
    request: TaxAnalysisRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Run tax optimization analysis."""
    # Build deduction records
    deduction_records = [
        {
            "section": d.section,
            "claimed": d.claimed,
            "limit": d.limit,
            "items": d.items,
        }
        for d in request.deductions
    ]

    # Calculate total deductions by type
    deductions_80c = sum(d.claimed for d in request.deductions if "80C" in d.section.upper())
    deductions_80d = sum(d.claimed for d in request.deductions if "80D" in d.section.upper())

    agent = TaxWizardAgent()
    result = agent.process({
        "gross_income": request.gross_income,
        "deductions_80c": deductions_80c,
        "deductions_80d": deductions_80d,
        "hra": request.hra_claimed,
        "deduction_records": deduction_records,
    })

    # Save tax profile to DB
    tax_profile = TaxProfile(
        user_id=current_user.id,
        gross_income=request.gross_income,
        regime=request.regime,
        deductions=deduction_records,
        hra_claimed=request.hra_claimed,
    )
    db.add(tax_profile)
    db.commit()

    return result


@router.get("/regime-comparison")
def get_regime_comparison(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get tax regime comparison using saved profile data."""
    tax_profile = (
        db.query(TaxProfile)
        .filter(TaxProfile.user_id == current_user.id)
        .order_by(TaxProfile.id.desc())
        .first()
    )

    if not tax_profile:
        # Use salary from user profile
        agent = TaxWizardAgent()
        return agent.process({
            "gross_income": current_user.salary,
            "deductions_80c": 0,
        })

    deductions_80c = sum(
        d.get("claimed", 0) for d in (tax_profile.deductions or []) if "80C" in d.get("section", "").upper()
    )
    deductions_80d = sum(
        d.get("claimed", 0) for d in (tax_profile.deductions or []) if "80D" in d.get("section", "").upper()
    )

    agent = TaxWizardAgent()
    return agent.process({
        "gross_income": tax_profile.gross_income,
        "deductions_80c": deductions_80c,
        "deductions_80d": deductions_80d,
        "hra": tax_profile.hra_claimed,
        "deduction_records": tax_profile.deductions or [],
    })
