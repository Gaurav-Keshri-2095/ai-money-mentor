"""SQLAlchemy User model."""

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Float, DateTime, Boolean
from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    hashed_password = Column(String, nullable=False)

    # Financial profile
    age = Column(Integer, default=25)
    salary = Column(Float, default=0)  # Annual gross income
    monthly_expenses = Column(Float, default=0)
    savings = Column(Float, default=0)
    risk_profile = Column(String, default="moderate")  # conservative, moderate, aggressive

    # Settings
    tax_regime = Column(String, default="old")  # old or new
    is_active = Column(Boolean, default=True)

    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))
