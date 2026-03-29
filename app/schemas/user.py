"""Pydantic schemas for user authentication and profile."""

from pydantic import BaseModel, EmailStr
from typing import Optional


class UserCreate(BaseModel):
    email: str
    name: str
    password: str
    age: Optional[int] = 25
    salary: Optional[float] = 0
    monthly_expenses: Optional[float] = 0


class UserLogin(BaseModel):
    email: str
    password: str


class UserProfile(BaseModel):
    id: int
    email: str
    name: str
    age: int
    salary: float
    monthly_expenses: float
    savings: float
    risk_profile: str
    tax_regime: str

    model_config = {"from_attributes": True}


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    salary: Optional[float] = None
    monthly_expenses: Optional[float] = None
    savings: Optional[float] = None
    risk_profile: Optional[str] = None
    tax_regime: Optional[str] = None


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserProfile
