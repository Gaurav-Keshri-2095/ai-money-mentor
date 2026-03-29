import os
import sys

# Add the project root to sys.path so we can import 'app'
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.core.database import SessionLocal
from app.models.user import User
from app.models.portfolio import MutualFund, TaxProfile, FinancialGoal, DebtRecord

def seed_database():
    db = SessionLocal()
    users = db.query(User).all()
    
    if not users:
        print("No users found in database to seed.")
        return

    for user in users:
        print(f"Seeding details for {user.email}...")
        
        # 1. Update basic income stats
        if not user.salary or user.salary == 0:
            user.salary = 1800000  # 18 LPA
            user.monthly_expenses = 90000
            user.savings = 80000
            user.age = 29
        
        # 2. Add Mutual Funds if empty
        existing_funds = db.query(MutualFund).filter(MutualFund.user_id == user.id).count()
        if existing_funds == 0:
            funds = [
                MutualFund(user_id=user.id, name="HDFC Flexi Cap Fund", plan="Regular", category="Equity", aum=120000, ter=1.85, direct_ter=0.90, nav=0),
                MutualFund(user_id=user.id, name="SBI Bluechip Fund", plan="Regular", category="Large Cap", aum=85000, ter=1.92, direct_ter=0.95, nav=0),
                MutualFund(user_id=user.id, name="ICICI Pru Technology Fund", plan="Direct", category="Sectoral", aum=45000, ter=1.20, direct_ter=1.20, nav=0),
            ]
            db.add_all(funds)
            
        # 3. Add Tax Profile if empty
        existing_tax = db.query(TaxProfile).filter(TaxProfile.user_id == user.id).count()
        if existing_tax == 0:
            tax = TaxProfile(
                user_id=user.id,
                regime="old",
                deductions=[
                    {"section": "80C", "claimed": 40000, "limit": 150000},
                    {"section": "80D", "claimed": 0, "limit": 25000},
                    {"section": "HRA", "claimed": 120000, "limit": 120000}
                ]
            )
            db.add(tax)
            
        # 4. Add Goals if empty
        existing_goals = db.query(FinancialGoal).filter(FinancialGoal.user_id == user.id).count()
        if existing_goals == 0:
            db.add(FinancialGoal(user_id=user.id, name="Early Retirement", target_amount=20000000, saved_amount=250000, target_date="2045-01-01"))
            
        # 5. Add Debt if empty
        existing_debt = db.query(DebtRecord).filter(DebtRecord.user_id == user.id).count()
        if existing_debt == 0:
            db.add(DebtRecord(user_id=user.id, name="Auto Loan", total_amount=800000, remaining=600000, emi=18000, interest_rate=8.5))

    db.commit()
    print("Database seeding completed! Your API has full dummy data now.")
    db.close()

if __name__ == "__main__":
    seed_database()
