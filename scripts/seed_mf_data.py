import asyncio
import os
import sys

# Add the project root to sys.path so we can import the app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.ext.asyncio import AsyncSession
from app.core.database import engine, Base, AsyncSessionLocal
from app.models.institutional_mf import InstitutionalMFData

async def seed_data() -> None:
    """
    Seeds the database with highly enriched mock enterprise data for Mutual Funds.
    """
    quant_small_cap = {
        "metadata": {
            "fund_house": "Quant Mutual Fund",
            "category": "Small Cap",
            "launch_date": "01-Jan-2013"
        },
        "performance": {
            "1Y": 65.4,
            "3Y": 42.1,
            "5Y": 35.8
        },
        "risk": {
            "standard_deviation": 22.5,
            "sharpe_ratio": 1.45,
            "beta": 1.12
        },
        "costs": {
            "expense_ratio": 0.58,
            "exit_load": "1% if redeemed within 1 year"
        },
        "portfolio": {
            "top_sectors": ["Financials", "Healthcare", "Services"],
            "top_holdings": ["Reliance Industries", "HDFC Bank", "ITC"]
        },
        "consistency": {
            "rolling_returns_3Y_avg": 25.4,
            "outperformed_benchmark_percentage": 78.5
        },
        "market_context": {
            "current_view": "Overweight on cyclicals, high momentum strategy."
        },
        "user_profile": {
            "ideal_for": "Aggressive investors with 7+ years time horizon."
        }
    }

    parag_parikh_flexi_cap = {
        "metadata": {
            "fund_house": "PPFAS Mutual Fund",
            "category": "Flexi Cap",
            "launch_date": "24-May-2013"
        },
        "performance": {
            "1Y": 35.2,
            "3Y": 24.5,
            "5Y": 22.1
        },
        "risk": {
            "standard_deviation": 14.2,
            "sharpe_ratio": 1.25,
            "beta": 0.78
        },
        "costs": {
            "expense_ratio": 0.65,
            "exit_load": "2% if redeemed within 1 year, 1% if within 2 years"
        },
        "portfolio": {
            "top_sectors": ["Financials", "Technology", "Consumer Staples"],
            "top_holdings": ["HDFC Bank", "Bajaj Holdings", "ITC", "Alphabet Inc", "Microsoft Corp"]
        },
        "consistency": {
            "rolling_returns_3Y_avg": 18.5,
            "outperformed_benchmark_percentage": 85.0
        },
        "market_context": {
            "current_view": "Value-oriented stock picking with international diversification."
        },
        "user_profile": {
            "ideal_for": "Long-term conservative equity investors with 5+ years time horizon."
        }
    }

    async with engine.begin() as conn:
        print("[*] Dropping existing tables to prevent conflicts...")
        await conn.run_sync(Base.metadata.drop_all)
        print("[*] Creating database tables...")
        await conn.run_sync(Base.metadata.create_all)

    async with AsyncSessionLocal() as session:
        print("[+] Seeding Quant Small Cap (125822)...")
        mf1 = InstitutionalMFData(
            scheme_code="125822",
            fund_name="Quant Small Cap Fund",
            enriched_data=quant_small_cap
        )
        
        print("[+] Seeding Parag Parikh Flexi Cap (122639)...")
        mf2 = InstitutionalMFData(
            scheme_code="122639",
            fund_name="Parag Parikh Flexi Cap Fund",
            enriched_data=parag_parikh_flexi_cap
        )

        session.add_all([mf1, mf2])
        await session.commit()
        print("✅ Data seeding complete!")

if __name__ == "__main__":
    asyncio.run(seed_data())
