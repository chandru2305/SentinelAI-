import time
from typing import Any


class SimpleCache:
    def __init__(self, ttl_seconds: int = 60) -> None:
        self.ttl_seconds = ttl_seconds
        self._store: dict[str, tuple[float, Any]] = {}

    def get(self, key: str) -> Any | None:
        value = self._store.get(key)
        if not value:
            return None
        timestamp, payload = value
        if time.time() - timestamp > self.ttl_seconds:
            self._store.pop(key, None)
            return None
        return payload

    def set(self, key: str, value: Any) -> None:
        self._store[key] = (time.time(), value)

    def clear(self) -> None:
        self._store.clear()
