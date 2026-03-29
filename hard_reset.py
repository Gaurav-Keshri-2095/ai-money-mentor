import os
import sys
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

# Add project root
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import Base, engine, SessionLocal
from app.models.user import User
from app.core.security import get_password_hash
from seed_db import seed_database

def hard_reset():
    db_path = "ai_money_mentor.db"
    
    # 1. Clear existing DB
    if os.path.exists(db_path):
        try:
            os.remove(db_path)
            print(f"Removed {db_path}")
        except Exception as e:
            print(f"Error removing DB: {e}")
            return

    # 2. Init Schema
    print("Initializing Database schema...")
    Base.metadata.create_all(bind=engine)

    # 3. Create Default User
    print("Creating default user: test@example.com / password123")
    db = SessionLocal()
    default_user = User(
        email="test@example.com",
        name="Test User",
        hashed_password=get_password_hash("password123"),
        salary=1800000,
        age=29,
        monthly_expenses=90000,
        savings=80000
    )
    db.add(default_user)
    db.commit()
    db.refresh(default_user)
    db.close()

    # 4. Run existing seed script
    print("Running seed_db.py to populate agent data...")
    seed_database()
    
    print("\n✅ HARD RESET COMPLETE.")
    print("User: test@example.com")
    print("Pass: password123")

if __name__ == "__main__":
    hard_reset()
