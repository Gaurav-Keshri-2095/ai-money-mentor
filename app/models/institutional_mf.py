from sqlalchemy import Column, String
from sqlalchemy.dialects.postgresql import JSONB
from app.core.database import Base

class InstitutionalMFData(Base):
    """
    Database model representing institutional-grade Mutual Fund data.
    """
    __tablename__ = "institutional_mf_data"

    scheme_code = Column(String, primary_key=True, index=True)
    fund_name = Column(String, nullable=False)
    enriched_data = Column(JSONB, nullable=False)
