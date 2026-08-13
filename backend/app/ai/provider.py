import abc
from typing import Any, Iterable

from app.ai.models import AIAnalyzeResult, AIModelInfo, AIStatusInfo


class AIProvider(abc.ABC):
    @abc.abstractmethod
    def health(self) -> dict[str, Any]:
        raise NotImplementedError

    @abc.abstractmethod
    def models(self) -> Iterable[AIModelInfo]:
        raise NotImplementedError

    @abc.abstractmethod
    def generate(self, prompt: str, model: str | None = None) -> dict[str, Any]:
        raise NotImplementedError

    @abc.abstractmethod
    def status(self) -> AIStatusInfo:
        raise NotImplementedError

    @abc.abstractmethod
    def change_model(self, model: str) -> bool:
        raise NotImplementedError


class AIProviderFactory:
    @staticmethod
    def create(provider_name: str = 'ollama') -> AIProvider:
        if provider_name == 'ollama':
            from app.ai.ollama import OllamaProvider

            return OllamaProvider()

        raise ValueError(f'Unsupported AI provider: {provider_name}')
