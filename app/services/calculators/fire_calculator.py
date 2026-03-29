"""FIRE (Financial Independence, Retire Early) calculator with Monte Carlo simulation."""

import random
import math
from app.utils.constants import (
    DEFAULT_INFLATION, DEFAULT_SAFE_WITHDRAWAL_RATE,
    NIFTY_HISTORICAL_RETURN, NIFTY_HISTORICAL_STDDEV,
    MONTE_CARLO_ITERATIONS,
)


def calculate_fire_number(
    monthly_expenses: float,
    years_to_retire: int,
    inflation: float = DEFAULT_INFLATION,
    swr: float = DEFAULT_SAFE_WITHDRAWAL_RATE,
) -> dict:
    """Calculate the FIRE corpus needed."""
    future_annual_expenses = (monthly_expenses * 12) * ((1 + inflation) ** years_to_retire)
    fire_number = future_annual_expenses / swr

    return {
        "fire_number": round(fire_number),
        "future_monthly_expenses": round(future_annual_expenses / 12),
        "future_annual_expenses": round(future_annual_expenses),
    }


def sip_future_value(
    monthly_sip: float,
    years: int,
    annual_return: float = NIFTY_HISTORICAL_RETURN,
    step_up_percent: float = 0,
) -> float:
    """
    Calculate future value of SIP with optional annual step-up.
    Uses standard SIP FV formula with year-by-year step-up.
    """
    total = 0
    monthly_return = annual_return / 12
    current_sip = monthly_sip

    for year in range(years):
        # FV of 12 months of SIP at this level, then grow remaining years
        remaining_months = (years - year) * 12
        for month in range(12):
            months_left = remaining_months - month
            total += current_sip * ((1 + monthly_return) ** months_left)

        # Step up for next year
        if step_up_percent > 0:
            current_sip *= (1 + step_up_percent / 100)

    return round(total)


def project_corpus(
    current_corpus: float,
    monthly_sip: float,
    years: int,
    annual_return: float = NIFTY_HISTORICAL_RETURN,
    step_up_percent: float = 0,
) -> float:
    """Project total corpus including current investments + future SIPs."""
    # Grow existing corpus
    future_current = current_corpus * ((1 + annual_return) ** years)
    # Add SIP future value
    sip_fv = sip_future_value(monthly_sip, years, annual_return, step_up_percent)
    return round(future_current + sip_fv)


def find_fire_age(
    current_age: int,
    current_corpus: float,
    monthly_sip: float,
    target_corpus: float,
    annual_return: float = NIFTY_HISTORICAL_RETURN,
    step_up_percent: float = 0,
    max_age: int = 70,
) -> int:
    """Find the age at which target corpus is reached."""
    for years in range(1, max_age - current_age + 1):
        projected = project_corpus(current_corpus, monthly_sip, years, annual_return, step_up_percent)
        if projected >= target_corpus:
            return current_age + years
    return max_age


def monte_carlo_simulation(
    current_corpus: float,
    monthly_sip: float,
    years: int,
    target_corpus: float,
    step_up_percent: float = 0,
    mean_return: float = NIFTY_HISTORICAL_RETURN,
    std_dev: float = NIFTY_HISTORICAL_STDDEV,
    iterations: int = MONTE_CARLO_ITERATIONS,
) -> dict:
    """
    Run Monte Carlo simulation to estimate probability of hitting target corpus.
    Returns probability, median corpus, and percentile ranges.
    """
    successes = 0
    final_values = []

    for _ in range(iterations):
        corpus = current_corpus
        sip = monthly_sip

        for year in range(years):
            # Random annual return from normal distribution
            annual_return = random.gauss(mean_return, std_dev)
            monthly_return = annual_return / 12

            # Add 12 months of SIP
            for _ in range(12):
                corpus += sip
                corpus *= (1 + monthly_return)

            # Step up
            if step_up_percent > 0:
                sip *= (1 + step_up_percent / 100)

        final_values.append(corpus)
        if corpus >= target_corpus:
            successes += 1

    final_values.sort()
    probability = round((successes / iterations) * 100)

    return {
        "probability": probability,
        "median_corpus": round(final_values[len(final_values) // 2]),
        "p10": round(final_values[int(iterations * 0.1)]),
        "p90": round(final_values[int(iterations * 0.9)]),
        "mean_corpus": round(sum(final_values) / iterations),
    }


def full_fire_analysis(
    current_age: int,
    target_age: int,
    monthly_sip: float,
    current_corpus: float,
    target_corpus: float,
    expected_return: float = NIFTY_HISTORICAL_RETURN,
    inflation: float = DEFAULT_INFLATION,
    step_up_percent: int = 10,
) -> dict:
    """
    Full FIRE analysis returning FIREPlannerResult-compatible dict.
    """
    years_to_target = target_age - current_age

    # Current trajectory (no step-up)
    current_hit_age = find_fire_age(
        current_age, current_corpus, monthly_sip, target_corpus, expected_return, 0
    )
    current_mc = monte_carlo_simulation(
        current_corpus, monthly_sip, current_hit_age - current_age,
        target_corpus, 0, expected_return
    )

    # Optimized trajectory (with step-up)
    optimized_hit_age = find_fire_age(
        current_age, current_corpus, monthly_sip, target_corpus, expected_return, step_up_percent
    )
    optimized_mc = monte_carlo_simulation(
        current_corpus, monthly_sip, optimized_hit_age - current_age,
        target_corpus, step_up_percent, expected_return
    )

    return {
        "currentAge": current_age,
        "targetAge": target_age,
        "monthlySIP": monthly_sip,
        "currentCorpus": current_corpus,
        "targetCorpus": target_corpus,
        "expectedReturn": expected_return,
        "inflation": inflation,
        "currentTrajectory": {
            "hitAge": current_hit_age,
            "probability": current_mc["probability"],
        },
        "optimizedTrajectory": {
            "hitAge": optimized_hit_age,
            "stepUp": step_up_percent,
            "probability": optimized_mc["probability"],
        },
    }
