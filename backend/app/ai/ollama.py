import logging
import time
from typing import Any

from app.ai.client import HTTPClient
from app.core.config import settings
from app.ai.exceptions import AIProviderError, AIConfigurationError
from app.ai.models import AIModelInfo, AIStatusInfo
from app.ai.utilities import normalize_response

logger = logging.getLogger(__name__)


class OllamaProvider:
    def __init__(self) -> None:
        if not settings.ollama_url:
            raise AIConfigurationError('OLLAMA_URL is not configured')
        self.client = HTTPClient(settings.ollama_url, settings.ollama_timeout)
        self.model = settings.ollama_model

    def health(self) -> dict[str, Any]:
        try:
            response = self.client.get('/health')
            return normalize_response(response)
        except AIProviderError as exc:
            logger.error('Ollama health failed: %s', exc)
            raise

    def models(self) -> list[AIModelInfo]:
        try:
            raw_models = self.client.get('/models')
            normalized = normalize_response(raw_models)
            return [
                AIModelInfo(
                    name=str(model.get('name', 'unknown')),
                    loaded=bool(model.get('loaded', False)),
                    description=str(model.get('description', '')) if model.get('description') is not None else None,
                )
                for model in normalized
                if isinstance(model, dict)
            ]
        except AIProviderError as exc:
            logger.error('Ollama models failed: %s', exc)
            raise

    def generate(self, prompt: str, model: str | None = None) -> dict[str, Any]:
        request_model = model or self.model
        try:
            response = self.client.post(
                '/generate',
                json={
                    'model': request_model,
                    'prompt': prompt,
                    'timeout': int(settings.ollama_timeout),
                },
            )
            return normalize_response(response)
        except AIProviderError as exc:
            logger.error('Ollama generate failed: %s', exc)
            raise

    def change_model(self, model: str) -> bool:
        if not model:
            raise AIProviderError('Model name is required')
        self.model = model
        logger.info('Ollama model switched to %s', model)
        return True

    def status(self) -> AIStatusInfo:
        start = time.perf_counter()
        health = self.health()
        duration_ms = (time.perf_counter() - start) * 1000.0
        model = self.model or 'unknown'
        return AIStatusInfo(
            ollama_running=True,
            model=model,
            latency_ms=duration_ms,
            version=str(health.get('version', 'unknown')),
            vram_usage=str(health.get('vram_usage')) if health.get('vram_usage') is not None else None,
            ram_usage=str(health.get('ram_usage')) if health.get('ram_usage') is not None else None,
            tokens_per_sec=int(health.get('tokens_per_sec')) if health.get('tokens_per_sec') is not None else None,
            context_size=int(health.get('context_size')) if health.get('context_size') is not None else None,
            temperature=float(health.get('temperature')) if health.get('temperature') is not None else None,
        )
