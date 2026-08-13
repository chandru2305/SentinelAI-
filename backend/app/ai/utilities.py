import json
from typing import Any

from app.ai.exceptions import AIParserError


def normalize_response(payload: Any) -> dict[str, Any]:
    if isinstance(payload, dict):
        return payload
    if isinstance(payload, str):
        try:
            return json.loads(payload)
        except json.JSONDecodeError as exc:
            raise AIParserError('Unable to parse provider response') from exc
    raise AIParserError('Unsupported provider response type')
