"""Document upload endpoints."""

import os
import uuid
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import Account, Transaction, TaxProfile
from app.api.dependencies import get_current_user
from app.agents.doc_scanner import DocScannerAgent

router = APIRouter(prefix="/documents", tags=["Documents"])

UPLOAD_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(__file__)))), "uploads")


@router.post("/upload")
async def upload_document(
    file: UploadFile = File(...),
    document_type: str = "auto",
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Upload a financial document and automatically update the user's dashboard.
    """
    # Validate file type
    allowed_types = ["application/pdf", "image/png", "image/jpeg"]
    if file.content_type not in allowed_types:
        raise HTTPException(status_code=400, detail="Only PDF and image files are supported.")

    # Create uploads directory
    os.makedirs(UPLOAD_DIR, exist_ok=True)

    # Save file
    ext = file.filename.split(".")[-1] if file.filename else "pdf"
    filename = f"{current_user.id}_{uuid.uuid4().hex[:8]}.{ext}"
    file_path = os.path.join(UPLOAD_DIR, filename)

    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)

    # Determine file type
    actual_file_type = "pdf" if file.content_type == "application/pdf" else "image"

    # Run doc scanner agent
    agent = DocScannerAgent()
    result = agent.process({
        "file_path": file_path,
        "file_type": actual_file_type,
        "document_type": document_type,
    })

    if not result.get("success"):
        return {
            "filename": filename,
            "success": False,
            "error": result.get("error"),
        }

    extracted = result.get("extracted_data", {})
    summary = []

    # 1. Process Bank Info (Accounts)
    bank_info = extracted.get("bank_info")
    if bank_info and isinstance(bank_info, dict):
        acc_name = bank_info.get("bank_name") or "Extracted Account"
        acc_type = bank_info.get("account_type") or "Savings"
        balance = bank_info.get("balance") or 0

        # Update or create account
        existing_acc = db.query(Account).filter(Account.user_id == current_user.id, Account.name == acc_name).first()
        if existing_acc:
            existing_acc.balance = balance
            summary.append(f"Updated balance for {acc_name}")
        else:
            new_acc = Account(user_id=current_user.id, name=acc_name, account_type=acc_type, balance=balance)
            db.add(new_acc)
            summary.append(f"Created new account: {acc_name}")

    # 2. Process Recent Transactions
    txs = extracted.get("recent_transactions")
    if txs and isinstance(txs, list):
        added_count = 0
        for tx in txs:
            # Basic duplicate check
            desc = tx.get("description", "")
            amt = tx.get("amount", 0)
            date = tx.get("date", "")
            
            dup = db.query(Transaction).filter(
                Transaction.user_id == current_user.id,
                Transaction.description == desc,
                Transaction.amount == amt,
                Transaction.date == date
            ).first()
            
            if not dup:
                new_tx = Transaction(
                    user_id=current_user.id,
                    date=date,
                    description=desc,
                    amount=amt,
                    transaction_type=tx.get("transaction_type", "expense"),
                    category=tx.get("category", "Other")
                )
                db.add(new_tx)
                added_count += 1
        
        if added_count > 0:
            summary.append(f"Imported {added_count} new transactions")

    # 3. Process Salary Slip / Form 16
    salary = extracted.get("gross_income") or extracted.get("total_income")
    if salary and isinstance(salary, (int, float)) and salary > 0:
        current_user.salary = salary
        summary.append(f"Updated annual salary to ₹{salary:,.0f}")

    db.commit()

    return {
        "filename": filename,
        "success": True,
        "extraction_result": result,
        "summary": summary,
        "import_count": len(summary)
    }
