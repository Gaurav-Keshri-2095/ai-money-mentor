"""Chat endpoint — LLM-powered financial assistant."""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.models.user import User
from app.models.portfolio import ChatMessage
from app.schemas.finance import ChatRequest, ChatResponse
from app.api.dependencies import get_current_user
from app.services.llm_engine.client import llm_chat_with_history
from app.services.llm_engine.prompts import CHAT_SYSTEM_PROMPT

router = APIRouter(prefix="/chat", tags=["Chat"])


@router.post("/", response_model=ChatResponse)
def chat(
    request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Send a message to the AI financial advisor."""
    # Build user context
    context = f"""User Profile:
- Name: {current_user.name}
- Age: {current_user.age}
- Annual Income: ₹{current_user.salary:,.0f}
- Monthly Expenses: ₹{current_user.monthly_expenses:,.0f}
- Savings: ₹{current_user.savings:,.0f}
- Tax Regime: {current_user.tax_regime}
- Risk Profile: {current_user.risk_profile}"""

    if request.context:
        context += f"\n\nAdditional Context:\n{request.context}"

    # Load recent chat history (last 10 messages)
    recent_messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.id.desc())
        .limit(10)
        .all()
    )
    recent_messages.reverse()

    # Build message history
    messages = []
    if context:
        messages.append({"role": "user", "content": f"[CONTEXT] {context}"})
        messages.append({"role": "assistant", "content": "I have your financial profile. How can I help?"})

    for msg in recent_messages:
        messages.append({"role": msg.role, "content": msg.content})

    # Add current message
    messages.append({"role": "user", "content": request.message})

    # Get LLM response
    try:
        response_text = llm_chat_with_history(
            system_prompt=CHAT_SYSTEM_PROMPT,
            messages=messages,
            temperature=0.5,
            max_tokens=512,
        )
    except Exception as e:
        logger.error(f"AI Chat Execution Error: {str(e)}")
        # Fallback to rule-based responses
        response_text = _fallback_response(request.message)
        if "Connection" in str(e) or "API" in str(e):
             response_text = f"🤖 [System Notice: AI connection issues detected. Falling back to local brain.]\n\n{response_text}"

    # Save messages to DB
    db.add(ChatMessage(user_id=current_user.id, role="user", content=request.message))
    db.add(ChatMessage(user_id=current_user.id, role="assistant", content=response_text))
    db.commit()

    return ChatResponse(role="bot", text=response_text)


@router.get("/history")
def get_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Get chat history for current user."""
    messages = (
        db.query(ChatMessage)
        .filter(ChatMessage.user_id == current_user.id)
        .order_by(ChatMessage.id.asc())
        .limit(50)
        .all()
    )

    return [
        {"role": msg.role, "text": msg.content}
        for msg in messages
    ]


@router.delete("/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    """Clear chat history."""
    db.query(ChatMessage).filter(ChatMessage.user_id == current_user.id).delete()
    db.commit()
    return {"message": "Chat history cleared"}


def _fallback_response(message: str) -> str:
    """Rule-based fallback when LLM is unavailable."""
    lower = message.lower()
    tips = {
        "save": "Try the 50/30/20 rule: 50% needs, 30% wants, 20% savings. Automate your SIP on salary day.",
        "mutual fund": "For beginners, start with a Nifty 50 index fund via SIP. Keep a 5+ year horizon.",
        "tax": "Maximize Section 80C (₹1.5L via ELSS/PPF), 80D (health insurance), and HRA.",
        "emergency": "Keep 6 months of expenses in a liquid fund or high-yield savings account.",
        "debt": "Pay off high-interest debt first (credit cards > personal loans). Keep EMIs under 40% of take-home.",
        "invest": "Start with: 1) Emergency fund 2) Term insurance 3) Health insurance 4) Index fund SIP.",
        "retire": "Use FIRE formula: Annual expenses × 28-33. Start SIPs early for compound growth.",
        "insurance": "Get term insurance = 10-15x annual income. Health = ₹10L+ cover. Avoid ULIPs.",
    }

    for key, tip in tips.items():
        if key in lower:
            return tip

    return "I can help with: saving, mutual funds, tax planning, emergency funds, debt management, budgeting, investing, and retirement. Ask me anything!"
