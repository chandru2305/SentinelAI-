from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.auth.dependencies import get_current_user, get_db_session
from app.auth.models import User
from app.ai_security.schemas import (
    AIAgentActionInspectRequest,
    AISecurityDecision,
    AISecurityInspectRequest,
    AISecurityMetricsResponse,
    AISecurityResponseInspectRequest,
    AISecurityResponseDecision,
)
from app.ai_security.service import AISecurityService

router = APIRouter()

def get_ai_security_service() -> AISecurityService:
    return AISecurityService()

@router.post("/inspect-prompt", response_model=AISecurityDecision)
def inspect_prompt(
    request: AISecurityInspectRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    service: AISecurityService = Depends(get_ai_security_service),
) -> AISecurityDecision:
    """Inspect user prompts or model inputs for prompt injection, jailbreaks, and sensitive data leakage."""
    return service.inspect_prompt(request, db)

@router.post("/inspect-agent-action", response_model=AISecurityDecision)
def inspect_agent_action(
    request: AIAgentActionInspectRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    service: AISecurityService = Depends(get_ai_security_service),
) -> AISecurityDecision:
    """Inspect autonomous AI agent tool calls and parameters for unsafe operations."""
    return service.inspect_agent_action(request, db)

@router.post("/inspect-response", response_model=AISecurityResponseDecision)
def inspect_response(
    request: AISecurityResponseInspectRequest,
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    service: AISecurityService = Depends(get_ai_security_service),
) -> AISecurityResponseDecision:
    """Inspect generated LLM output responses for secret key leakage, private credentials, and data exfiltration."""
    return service.inspect_llm_response(request, db)

@router.get("/metrics", response_model=AISecurityMetricsResponse)
def get_metrics(
    db: Session = Depends(get_db_session),
    current_user: User = Depends(get_current_user),
    service: AISecurityService = Depends(get_ai_security_service),
) -> AISecurityMetricsResponse:
    """Get aggregated telemetry on AI security inspections and blocked threats."""
    return service.get_metrics(db)
