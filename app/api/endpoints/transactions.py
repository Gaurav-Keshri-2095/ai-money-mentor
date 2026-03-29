"""Transactions endpoints."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import Transaction
from app.schemas.finance import TransactionInput
from app.api.dependencies import get_current_user

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/")
def get_transactions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get all transactions for the user."""
    transactions = db.query(Transaction).filter(Transaction.user_id == current_user.id).all()
    return [
        {
            "id": t.id,
            "date": t.date,
            "description": t.description,
            "amount": t.amount,
            "type": t.transaction_type,
            "category": t.category,
        }
        for t in transactions
    ]


@router.post("/")
def create_transaction(
    tx_data: TransactionInput,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Add a new transaction."""
    tx = Transaction(
        user_id=current_user.id,
        date=tx_data.date,
        description=tx_data.description,
        amount=tx_data.amount,
        transaction_type=tx_data.transaction_type,
        category=tx_data.category,
    )
    db.add(tx)
    
    # Optional logic: Update user balance or savings based on transaction
    # We will leave that out for now to avoid side effects
    
    db.commit()
    db.refresh(tx)
    return {"id": tx.id, "message": "Transaction created"}


@router.delete("/{tx_id}")
def delete_transaction(
    tx_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Delete a transaction."""
    tx = db.query(Transaction).filter(
        Transaction.id == tx_id, Transaction.user_id == current_user.id
    ).first()
    if not tx:
        raise HTTPException(status_code=404, detail="Transaction not found")

    db.delete(tx)
    db.commit()
    return {"message": "Transaction deleted"}
