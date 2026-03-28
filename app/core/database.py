import os
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
