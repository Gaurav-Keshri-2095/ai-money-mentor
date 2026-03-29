import os
from pathlib import Path

def create_project_structure(base_path: str = ".") -> None:
    structure = [
        "app/main.py",
        "app/core/config.py",
        "app/core/database.py",
        "app/api/dependencies.py",
        "app/api/public/__init__.py",
        "app/api/public/chat.py",
        "app/api/public/account_aggregator.py",
        "app/api/public/dashboard.py",
        "app/api/internal/__init__.py",
        "app/api/internal/analyzer.py",
        "app/api/internal/tax_wizard.py",
        "app/api/internal/compliance.py",
        "app/agents/__init__.py",
        "app/agents/orchestrator.py",
        "app/agents/analyzer_agent.py",
        "app/agents/tools/__init__.py",
        "app/schemas/__init__.py",
        "app/schemas/financial_data.py",
        "app/models/__init__.py",
        "app/models/user_profile.py",
    ]

    base_dir = Path(base_path)
    
    for file_path in structure:
        full_path = base_dir / file_path
        
        # Create directories if they don't exist
        full_path.parent.mkdir(parents=True, exist_ok=True)
        
        # Create file if it doesn't exist to avoid overwriting
        if not full_path.exists():
            full_path.touch()
            print(f"Created: {full_path}")
        else:
            print(f"Already exists: {full_path}")

    main_code = '''from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: e.g., connect to database, check agent statuses
    yield
    # Shutdown: e.g., dispose database engine connections

app = FastAPI(
    title="AI Money Mentor",
    description="Compliant, multi-agent financial advisory backend",
    version="1.0.0",
    lifespan=lifespan
)

# 1. Public API Router (Frontend-facing)
public_router = APIRouter(prefix="/api/v1", tags=["Public API"])

@public_router.get("/health")
async def public_health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Public API is routing correctly."}

# 2. Internal API Router (Agent-to-Agent APIs)
internal_router = APIRouter(prefix="/internal", tags=["Internal Agents"])

@internal_router.get("/health")
async def internal_health_check() -> dict[str, str]:
    return {"status": "ok", "message": "Internal Agent API is routing correctly."}

# Mount the separate routers to the main application
app.include_router(public_router)
app.include_router(internal_router)
'''

    db_code = '''import os
from collections.abc import AsyncGenerator
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine, async_sessionmaker
from sqlalchemy.orm import declarative_base

# Fallback URL for development; in production this should be injected securely via env vars
DATABASE_URL: str = os.getenv(
    "DATABASE_URL", 
    "postgresql+asyncpg://postgres:password@localhost:5432/aimoneymentor"
)

# Initialize the async SQLAlchemy engine
# pool_size and max_overflow are tailored for production concurrency
engine = create_async_engine(
    DATABASE_URL,
    echo=False,
    future=True,
    pool_pre_ping=True,  # Checks connection validity before checkout from pool
    pool_size=10,
    max_overflow=20
)

# Create the async session factory
AsyncSessionLocal = async_sessionmaker(
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False,
    autoflush=False
)

Base = declarative_base()

async def get_db_session() -> AsyncGenerator[AsyncSession, None]:
    """
    Dependency function yielding an async database session for API routes.
    Automatically handles session cleanup after request completion.
    """
    async with AsyncSessionLocal() as session:
        try:
            yield session
        finally:
            await session.close()
'''

    main_path = base_dir / "app/main.py"
    if main_path.stat().st_size == 0:
        main_path.write_text(main_code, encoding="utf-8")
        print(f"Wrote boilerplate to {main_path}")

    db_path = base_dir / "app/core/database.py"
    if db_path.stat().st_size == 0:
        db_path.write_text(db_code, encoding="utf-8")
        print(f"Wrote boilerplate to {db_path}")

if __name__ == "__main__":
    create_project_structure()
