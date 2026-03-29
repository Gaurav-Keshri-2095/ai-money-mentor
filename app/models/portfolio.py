"""SQLAlchemy models for financial data."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, JSON, Text
from app.core.database import Base


class MutualFund(Base):
    __tablename__ = "mutual_funds"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    plan = Column(String, default="Regular")  # Regular or Direct
    category = Column(String, default="")  # Large Cap, Mid Cap, Small Cap, etc.
    aum = Column(Float, default=0)  # Amount invested
    ter = Column(Float, default=0)  # Total Expense Ratio
    direct_ter = Column(Float, default=0)  # Direct plan TER for comparison
    nav = Column(Float, default=0)
    units = Column(Float, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class TaxProfile(Base):
    __tablename__ = "tax_profiles"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    financial_year = Column(String, default="2025-26")
    gross_income = Column(Float, default=0)
    regime = Column(String, default="old")

    # Deductions stored as JSON: [{"section": "80C", "claimed": 40000, "limit": 150000, "items": "ELSS, PPF"}]
    deductions = Column(JSON, default=list)
    hra_claimed = Column(Float, default=0)
    section_24b = Column(Float, default=0)  # Home loan interest

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class FinancialGoal(Base):
    __tablename__ = "financial_goals"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    target_amount = Column(Float, default=0)
    saved_amount = Column(Float, default=0)
    target_date = Column(String, default="")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class DebtRecord(Base):
    __tablename__ = "debt_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    total_amount = Column(Float, default=0)
    emi = Column(Float, default=0)
    remaining = Column(Float, default=0)
    interest_rate = Column(Float, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Account(Base):
    __tablename__ = "accounts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    name = Column(String, nullable=False)
    account_type = Column(String, default="Savings")  # Savings, Current, FD, etc.
    balance = Column(Float, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    date = Column(String, nullable=False)
    description = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    transaction_type = Column(String, nullable=False)  # income or expense
    category = Column(String, default="Other")

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class ChatMessage(Base):
    __tablename__ = "chat_messages"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    role = Column(String, nullable=False)  # user or assistant
    content = Column(Text, nullable=False)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))


class AnalysisCache(Base):
    """Caches the latest full analysis result for a user."""
    __tablename__ = "analysis_cache"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)

    result_json = Column(JSON, nullable=False)  # Full MasterFinancialPlan JSON
    overall_score = Column(Integer, default=0)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
