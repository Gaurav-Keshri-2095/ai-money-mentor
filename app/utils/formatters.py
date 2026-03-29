"""Formatting utilities for Indian currency and financial values."""


def fmt_inr(amount: float) -> str:
    """Format amount in Indian Rupee notation with commas."""
    if amount < 0:
        return "-" + fmt_inr(-amount)
    amount = round(amount)
    s = str(amount)
    if len(s) <= 3:
        return f"₹{s}"
    # Indian numbering: last 3 digits, then groups of 2
    last_three = s[-3:]
    remaining = s[:-3]
    groups = []
    while remaining:
        groups.insert(0, remaining[-2:])
        remaining = remaining[:-2]
    return "₹" + ",".join(groups) + "," + last_three


def fmt_lakhs(amount: float) -> str:
    """Format as Lakhs."""
    return f"₹{amount / 100000:.1f}L"


def fmt_crores(amount: float) -> str:
    """Format as Crores."""
    return f"₹{amount / 10000000:.1f} Cr"


def fmt_smart(amount: float) -> str:
    """Smart format: Cr for >= 1Cr, L for >= 1L, else INR."""
    if amount >= 10000000:
        return fmt_crores(amount)
    elif amount >= 100000:
        return fmt_lakhs(amount)
    else:
        return fmt_inr(amount)


def fmt_percent(value: float, decimals: int = 1) -> str:
    """Format as percentage."""
    return f"{value:.{decimals}f}%"


def severity_color(score: float, thresholds: tuple = (80, 60)) -> str:
    """Return hex color based on score thresholds."""
    good, warn = thresholds
    if score >= good:
        return "#22c55e"  # green
    elif score >= warn:
        return "#f59e0b"  # amber
    else:
        return "#ef4444"  # red


def score_verdict(score: int) -> str:
    """Return text verdict for overall score."""
    if score >= 85:
        return "Excellent"
    elif score >= 70:
        return "Good"
    elif score >= 55:
        return "Needs Attention"
    else:
        return "Critical"
