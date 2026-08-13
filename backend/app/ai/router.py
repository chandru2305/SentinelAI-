import logging
from typing import Any

from fastapi import APIRouter, HTTPException, Depends

from app.ai.exceptions import AIEngineError, AIProviderError, AIUnavailableError
from app.ai.schemas import (
    AIAnalyzeRequest,
    AIAnalyzeResponse,
    AIChangeModelRequest,
    AIChangeModelResponse,
    AIChatRequest,
    AIChatResponse,
    AIConnectivityResponse,
    AIModelsResponse,
    AIStatusResponse,
    AISecurityAnalysisRequest,
    AISecurityAnalysisResponse,
)
from app.ai.service import AIService
from app.auth.dependencies import get_current_user

router = APIRouter(tags=["ai"], dependencies=[Depends(get_current_user)])
service = AIService()
logger = logging.getLogger(__name__)


@router.post("/analyze", response_model=AIAnalyzeResponse)
def analyze(request: AIAnalyzeRequest) -> AIAnalyzeResponse:
    try:
        result = service.analyze_text(request.text, category=request.category or 'prompt_injection', model=request.model)
        return AIAnalyzeResponse(
            risk=result.risk,
            confidence=result.confidence,
            attack_type=result.attack_type,
            reason=result.reason,
            recommendation=result.recommendation,
        )
    except AIEngineError as exc:
        logger.error("AI analyze failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/analyze/log", response_model=AIAnalyzeResponse)
def analyze_log(request: AIAnalyzeRequest) -> AIAnalyzeResponse:
    try:
        result = service.analyze_log(request.text, model=request.model)
        return AIAnalyzeResponse(
            risk=result.risk,
            confidence=result.confidence,
            attack_type=result.attack_type,
            reason=result.reason,
            recommendation=result.recommendation,
        )
    except AIEngineError as exc:
        logger.error("AI log analysis failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/analyze/code", response_model=AIAnalyzeResponse)
def analyze_code(request: AIAnalyzeRequest) -> AIAnalyzeResponse:
    try:
        result = service.analyze_code(request.text, model=request.model)
        return AIAnalyzeResponse(
            risk=result.risk,
            confidence=result.confidence,
            attack_type=result.attack_type,
            reason=result.reason,
            recommendation=result.recommendation,
        )
    except AIEngineError as exc:
        logger.error("AI code review failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/analyze/url", response_model=AIAnalyzeResponse)
def analyze_url(request: AIAnalyzeRequest) -> AIAnalyzeResponse:
    try:
        result = service.analyze_url(request.text, model=request.model)
        return AIAnalyzeResponse(
            risk=result.risk,
            confidence=result.confidence,
            attack_type=result.attack_type,
            reason=result.reason,
            recommendation=result.recommendation,
        )
    except AIEngineError as exc:
        logger.error("AI URL analysis failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/analyze/email", response_model=AIAnalyzeResponse)
def analyze_email(request: AIAnalyzeRequest) -> AIAnalyzeResponse:
    try:
        result = service.analyze_email(request.text, model=request.model)
        return AIAnalyzeResponse(
            risk=result.risk,
            confidence=result.confidence,
            attack_type=result.attack_type,
            reason=result.reason,
            recommendation=result.recommendation,
        )
    except AIEngineError as exc:
        logger.error("AI email analysis failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/analyze/security", response_model=AISecurityAnalysisResponse)
def analyze_security(request: AISecurityAnalysisRequest) -> AISecurityAnalysisResponse:
    """Structured AI security analysis — always returns 200, even when AI is offline."""
    try:
        analysis = service.analyze_security_event(
            input_text=request.input,
            context=request.context or 'security event',
            model=request.model,
        )
        return AISecurityAnalysisResponse(success=True, analysis=analysis)
    except Exception as exc:
        logger.error("AI security analysis error: %s", exc)
        return AISecurityAnalysisResponse(success=False, error=str(exc))


@router.post("/chat", response_model=AIChatResponse)
def chat(request: AIChatRequest) -> AIChatResponse:
    try:
        response = service.chat(request.message, model=request.model)
        return AIChatResponse(message=response['message'])
    except AIEngineError as exc:
        logger.error("AI chat failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))


@router.post("/change-model", response_model=AIChangeModelResponse)
def change_model(request: AIChangeModelRequest) -> AIChangeModelResponse:
    try:
        success = service.change_model(request.model)
        return AIChangeModelResponse(ok=success, model=request.model, message=f'Model changed to {request.model}')
    except AIEngineError as exc:
        logger.error("AI model change failed: %s", exc)
        raise HTTPException(status_code=502, detail=str(exc))


@router.get("/status", response_model=AIStatusResponse)
def status() -> AIStatusResponse:
    """Always returns 200. available=false when Ollama is offline."""
    info = service.safe_status()
    return AIStatusResponse(
        available=info.available,
        status=info.status if hasattr(info, 'status') else ('online' if info.ollama_running else 'offline'),
        provider='ollama',
        ollama_running=info.ollama_running,
        model=info.model,
        latency_ms=info.latency_ms,
        version=info.version,
        message=info.message if hasattr(info, 'message') else None,
        vram_usage=info.vram_usage,
        ram_usage=info.ram_usage,
        tokens_per_sec=info.tokens_per_sec,
        context_size=info.context_size,
        temperature=info.temperature,
    )


@router.get("/models", response_model=AIModelsResponse)
def models() -> AIModelsResponse:
    try:
        raw_models = service.list_models()
        api_models = [
            {"name": model.name, "loaded": model.loaded, "description": model.description}
            for model in raw_models
        ]
        return AIModelsResponse(models=api_models)
    except AIProviderError as exc:
        logger.error("AI models failed: %s", exc)
        return AIModelsResponse(models=[])


@router.post("/test", response_model=AIConnectivityResponse)
def test_connection() -> AIConnectivityResponse:
    ok = service.test_connection()
    return AIConnectivityResponse(
        ok=ok,
        message="Ollama connectivity verified" if ok else "Ollama is offline or unreachable",
    )


def handle_ai_engine_error(_: Any, exc: AIEngineError) -> AIConnectivityResponse:
    logger.error("Unhandled AI engine exception: %s", exc)
    raise HTTPException(status_code=502, detail=str(exc))
