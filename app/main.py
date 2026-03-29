"""FastAPI application factory."""

import logging
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import init_db
from app.api.endpoints import auth, health_score, portfolio, tax_wizard, fire, chat, documents, news

# Configure logging
logging.basicConfig(
    level=logging.INFO if settings.DEBUG else logging.WARNING,
    format="%(asctime)s | %(name)s | %(levelname)s | %(message)s",
)

logger = logging.getLogger(__name__)


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title=settings.APP_NAME,
        description="Multi-agent AI financial advisor for Indian personal finance",
        version="1.0.0",
        docs_url="/docs",
        redoc_url="/redoc",
    )

    # CORS
    app.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins_list,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    from app.api.endpoints import (
        auth, health_score, portfolio, 
        tax_wizard, fire, chat, documents, news,
        transactions, accounts, goals_debts
    )

    # Register routes
    app.include_router(auth.router, prefix="/api")
    app.include_router(health_score.router, prefix="/api")
    app.include_router(portfolio.router, prefix="/api")
    app.include_router(tax_wizard.router, prefix="/api")
    app.include_router(fire.router, prefix="/api")
    app.include_router(chat.router, prefix="/api")
    app.include_router(documents.router, prefix="/api")
    app.include_router(news.router, prefix="/api")
    app.include_router(transactions.router, prefix="/api")
    app.include_router(accounts.router, prefix="/api")
    app.include_router(goals_debts.router, prefix="/api")

    @app.on_event("startup")
    def on_startup():
        logger.info(f"Starting {settings.APP_NAME}...")
        init_db()
        logger.info("Database initialized.")

    @app.get("/")
    def root():
        return {
            "app": settings.APP_NAME,
            "version": "1.0.0",
            "docs": "/docs",
            "agents": [
                "OrchestratorAgent", "TaskDistributorAgent",
                "MoneyHealthAgent", "TaxWizardAgent",
                "PortfolioXRayAgent", "FIREPlannerAgent",
                "FinancialNewsAgent", "DocScannerAgent",
                "DataCollectorAgent", "AnalyzerAgent",
                "ComplianceGuardianAgent",
            ],
        }

    @app.get("/health")
    def health():
        return {"status": "healthy"}

    return app


app = create_app()
from contextlib import asynccontextmanager
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
