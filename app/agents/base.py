"""Agent base class and registry."""

from abc import ABC, abstractmethod
from datetime import datetime, timezone
from typing import Any, Dict


class BaseAgent(ABC):
    """Base class for all AI Money Mentor agents."""

    name: str = "BaseAgent"
    description: str = ""

    @abstractmethod
    def process(self, payload: dict) -> dict:
        """Process the payload and return results."""
        pass

    def _add_provenance(self, result: dict) -> dict:
        """Add provenance metadata to the result."""
        result["_source_agent"] = self.name
        result["_timestamp"] = datetime.now(timezone.utc).isoformat()
        return result
