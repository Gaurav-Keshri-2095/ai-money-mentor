"""FIRE Planner endpoints."""

from fastapi import APIRouter, Depends
from app.models.user import User
from app.schemas.finance import FIRERequest
from app.api.dependencies import get_current_user
from app.agents.fire_planner import FIREPlannerAgent

router = APIRouter(prefix="/fire", tags=["FIRE Planner"])


@router.post("/simulate")
def simulate_fire(
    request: FIRERequest,
    current_user: User = Depends(get_current_user),
):
    """Run full FIRE simulation with Monte Carlo."""
    agent = FIREPlannerAgent()
    return agent.process({
        "current_age": request.current_age,
        "target_age": request.target_age,
        "monthly_sip": request.monthly_sip,
        "current_corpus": request.current_corpus,
        "target_corpus": request.target_corpus,
        "step_up_percent": request.step_up_percent,
        "expected_return": request.expected_return,
        "inflation": request.inflation,
    })


@router.post("/project")
def quick_project(
    request: FIRERequest,
    current_user: User = Depends(get_current_user),
):
    """Quick projection without full Monte Carlo (faster)."""
    from app.services.calculators.fire_calculator import (
        find_fire_age, project_corpus, calculate_fire_number,
    )

    years = request.target_age - request.current_age
    fire_num = calculate_fire_number(
        monthly_expenses=request.current_corpus / 12 if request.current_corpus > 0 else 50000,
        years_to_retire=years,
    )

    # Current trajectory (no step-up)
    current_hit_age = find_fire_age(
        request.current_age, request.current_corpus,
        request.monthly_sip, request.target_corpus,
        request.expected_return, 0,
    )

    # Optimized (with step-up)
    optimized_hit_age = find_fire_age(
        request.current_age, request.current_corpus,
        request.monthly_sip, request.target_corpus,
        request.expected_return, request.step_up_percent,
    )

    projected = project_corpus(
        request.current_corpus, request.monthly_sip,
        years, request.expected_return, request.step_up_percent,
    )

    return {
        "fire_number": fire_num,
        "projected_corpus": projected,
        "current_hit_age": current_hit_age,
        "optimized_hit_age": optimized_hit_age,
        "years_saved": current_hit_age - optimized_hit_age,
    }
