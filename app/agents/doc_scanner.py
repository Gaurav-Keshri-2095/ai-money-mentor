"""Doc Scanner Agent — Extract structured financial data from uploaded documents."""

import logging
from app.agents.base import BaseAgent
from app.services.llm_engine.client import llm_json
from app.services.llm_engine.prompts import DOC_SCANNER_PROMPT

logger = logging.getLogger(__name__)


def _extract_text_from_pdf(file_path: str) -> str:
    """Extract text from a PDF file."""
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            text += page.extract_text() or ""
        return text
    except Exception as e:
        logger.error(f"PDF extraction failed: {e}")
        return ""


def _extract_text_from_image(file_path: str) -> str:
    """Extract text from an image using LLM vision (fallback: return empty)."""
    # For now, return placeholder — full OCR requires additional setup
    logger.info(f"Image extraction requested for: {file_path}")
    return ""


class DocScannerAgent(BaseAgent):
    name = "DocScannerAgent"
    description = "Extracts structured financial data from Form 16, CAS statements, bank statements."

    def process(self, payload: dict) -> dict:
        """
        Expected payload keys:
            file_path: path to the uploaded document
            file_type: 'pdf' or 'image'
            document_type: 'form16', 'cas', 'bank_statement' (optional hint)
        """
        file_path = payload.get("file_path", "")
        file_type = payload.get("file_type", "pdf")

        # Extract raw text
        if file_type == "pdf":
            raw_text = _extract_text_from_pdf(file_path)
        else:
            raw_text = _extract_text_from_image(file_path)

        if not raw_text:
            return self._add_provenance({
                "success": False,
                "error": "Could not extract text from document.",
                "extracted_data": {},
            })

        # Use LLM to parse extracted text into structured data
        try:
            doc_type = payload.get("document_type", "unknown")
            user_msg = f"Document type hint: {doc_type}\n\nExtracted text:\n{raw_text[:4000]}"

            extracted = llm_json(DOC_SCANNER_PROMPT, user_msg)

            return self._add_provenance({
                "success": True,
                "document_type": doc_type,
                "extracted_data": extracted,
                "raw_text_length": len(raw_text),
            })
        except Exception as e:
            logger.error(f"LLM parsing failed: {e}")
            return self._add_provenance({
                "success": False,
                "error": str(e),
                "extracted_data": {},
            })
