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
