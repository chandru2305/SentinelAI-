import logging
from typing import Any

import httpx

from app.core.config import settings
from app.ai.exceptions import AIProviderError, AIConfigurationError, AIUnavailableError

logger = logging.getLogger(__name__)

_CONNECT_TIMEOUT = 5.0  # seconds to establish connection


class HTTPClient:
    def __init__(self, base_url: str | None = None, timeout: float | None = None) -> None:
        if not base_url:
            raise AIConfigurationError('Base URL is required for HTTPClient')
        self.base_url = base_url.rstrip('/')
        self.timeout = timeout or settings.ollama_timeout

    def _client(self) -> httpx.Client:
        return httpx.Client(
            base_url=self.base_url,
            timeout=httpx.Timeout(self.timeout, connect=_CONNECT_TIMEOUT),
        )

    def get(self, path: str, params: dict[str, Any] | None = None) -> Any:
        try:
            with self._client() as client:
                response = client.get(path, params=params)
                response.raise_for_status()
                return response.json()
        except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
            logger.warning('AI provider unreachable: %s %s', self.base_url, exc)
            raise AIUnavailableError(f'AI provider unreachable at {self.base_url}') from exc
        except httpx.TimeoutException as exc:
            logger.warning('AI provider timed out: %s %s', self.base_url, exc)
            raise AIUnavailableError(f'AI provider timed out at {self.base_url}') from exc
        except httpx.HTTPError as exc:
            logger.error('HTTP GET failed: %s %s %s', self.base_url, path, exc)
            raise AIProviderError(f'HTTP GET request failed for {path}') from exc

    def post(self, path: str, json: dict[str, Any] | None = None) -> Any:
        try:
            with self._client() as client:
                response = client.post(path, json=json)
                response.raise_for_status()
                return response.json()
        except (httpx.ConnectError, httpx.ConnectTimeout) as exc:
            logger.warning('AI provider unreachable: %s %s', self.base_url, exc)
            raise AIUnavailableError(f'AI provider unreachable at {self.base_url}') from exc
        except httpx.TimeoutException as exc:
            logger.warning('AI provider timed out: %s %s', self.base_url, exc)
            raise AIUnavailableError(f'AI provider timed out at {self.base_url}') from exc
        except httpx.HTTPError as exc:
            logger.error('HTTP POST failed: %s %s %s', self.base_url, path, exc)
            raise AIProviderError(f'HTTP POST request failed for {path}') from exc
