"""Groq LLM client wrapper for the AI Money Mentor agent system."""

import json
import logging
from typing import Optional
from groq import Groq
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize Groq client
_client: Optional[Groq] = None


def get_groq_client() -> Groq:
    """Get or create the Groq client singleton."""
    global _client
    if _client is None:
        _client = Groq(api_key=settings.GROQ_API_KEY)
    return _client


def llm_chat(
    system_prompt: str,
    user_message: str,
    temperature: float = 0.3,
    max_tokens: int = 2048,
    json_mode: bool = False,
) -> str:
    """
    Send a chat completion request to Groq.
    Returns the assistant's response text.
    """
    client = get_groq_client()

    kwargs = {
        "model": settings.GROQ_MODEL,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_message},
        ],
        "temperature": temperature,
        "max_tokens": max_tokens,
    }

    if json_mode:
        kwargs["response_format"] = {"type": "json_object"}

    try:
        response = client.chat.completions.create(**kwargs)
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise


def llm_chat_with_history(
    system_prompt: str,
    messages: list,
    temperature: float = 0.5,
    max_tokens: int = 1024,
) -> str:
    """
    Send chat with conversation history.
    messages: list of {"role": "user"/"assistant", "content": "..."}
    """
    client = get_groq_client()

    full_messages = [{"role": "system", "content": system_prompt}] + messages

    try:
        response = client.chat.completions.create(
            model=settings.GROQ_MODEL,
            messages=full_messages,
            temperature=temperature,
            max_tokens=max_tokens,
        )
        return response.choices[0].message.content
    except Exception as e:
        logger.error(f"Groq API error: {e}")
        raise


def llm_json(
    system_prompt: str,
    user_message: str,
    temperature: float = 0.2,
    max_tokens: int = 2048,
) -> dict:
    """
    Get a JSON response from the LLM.
    Parses the response and returns a dict.
    """
    response_text = llm_chat(
        system_prompt, user_message,
        temperature=temperature, max_tokens=max_tokens,
        json_mode=True,
    )

    try:
        return json.loads(response_text)
    except json.JSONDecodeError:
        # Try to extract JSON from markdown code blocks
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
            return json.loads(json_str)
        elif "```" in response_text:
            json_str = response_text.split("```")[1].split("```")[0].strip()
            return json.loads(json_str)
        logger.error(f"Failed to parse JSON response: {response_text[:200]}")
        return {}
