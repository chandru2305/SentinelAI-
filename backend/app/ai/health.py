from app.ai.schemas import AIStatusResponse
from app.ai.ollama import OllamaProvider


def get_ai_health() -> AIStatusResponse:
    provider = OllamaProvider()
    return provider.status()
