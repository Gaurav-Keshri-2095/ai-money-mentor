"""Accounts endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import Account
from app.schemas.finance import AccountInput
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/accounts", tags=["Accounts"])


@router.get("/")
def get_accounts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all accounts for the user."""
    accounts = db.query(Account).filter(Account.user_id == current_user.id).all()
    return [
        {
            "id": a.id,
            "name": a.name,
            "type": a.account_type,
            "balance": a.balance,
        }
        for a in accounts
    ]


@router.post("/")
def create_account(
    acc_data: AccountInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new account."""
    acc = Account(
        user_id=current_user.id,
        name=acc_data.name,
        account_type=acc_data.account_type,
        balance=acc_data.balance,
    )
    db.add(acc)
    db.commit()
    db.refresh(acc)
    return {"id": acc.id, "message": "Account created"}


@router.delete("/{acc_id}")
def delete_account(
    acc_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete an account."""
    acc = db.query(Account).filter(
        Account.id == acc_id, Account.user_id == current_user.id
    ).first()
    if not acc:
        raise HTTPException(status_code=404, detail="Account not found")

    db.delete(acc)
    db.commit()
    return {"message": "Account deleted"}
