import json
import re
from typing import Any

from app.ai.exceptions import AIParserError
from app.ai.schemas import AIAnalyzeResponse, AISecurityAnalysis

_SEVERITY_MAP = {
    'critical': 'CRITICAL',
    'high': 'HIGH',
    'medium': 'MEDIUM',
    'low': 'LOW',
    'info': 'INFO',
    'unknown': 'UNKNOWN',
}


def _extract_json(raw_text: str) -> dict[str, Any]:
    """Extract the first JSON object from raw text, even if surrounded by prose."""
    if not raw_text or not raw_text.strip():
        return {}

    # Try direct parse first
    try:
        result = json.loads(raw_text.strip())
        if isinstance(result, dict):
            return result
    except json.JSONDecodeError:
        pass

    # Try to find JSON block inside ```json ... ``` or plain braces
    match = re.search(r'```json\s*(\{.*?\})\s*```', raw_text, re.DOTALL)
    if not match:
        match = re.search(r'(\{[^{}]*(?:\{[^{}]*\}[^{}]*)?\})', raw_text, re.DOTALL)

    if match:
        try:
            result = json.loads(match.group(1))
            if isinstance(result, dict):
                return result
        except json.JSONDecodeError:
            pass

    return {}


def _normalize_severity(value: Any) -> str:
    if not value:
        return 'UNKNOWN'
    return _SEVERITY_MAP.get(str(value).lower().strip(), str(value).upper().strip())


def _normalize_confidence(value: Any) -> float:
    """Return confidence in [0.0, 1.0] regardless of whether AI returned 0-1 or 0-100."""
    try:
        f = float(value)
        if f > 1.0:
            f = f / 100.0
        return max(0.0, min(1.0, f))
    except (TypeError, ValueError):
        return 0.0


def _normalize_list(value: Any) -> list[str]:
    if isinstance(value, list):
        return [str(v).strip() for v in value if v]
    if isinstance(value, str) and value.strip():
        # Try comma-separated
        return [v.strip() for v in value.split(',') if v.strip()]
    return []


def parse_ai_response(raw_text: str) -> AIAnalyzeResponse:
    """Parse raw LLM response into a structured AIAnalyzeResponse.

    Never raises on malformed input — returns sensible fallback values instead.
    """
    payload = _extract_json(raw_text)

    # Fallback confidence: handle int 0-100 or float 0.0-1.0
    raw_conf = payload.get('confidence', 0)
    try:
        conf = int(raw_conf)
        if conf <= 1 and raw_conf != 1:
            conf = int(float(raw_conf) * 100)
        conf = max(0, min(100, conf))
    except (TypeError, ValueError):
        conf = 0

    return AIAnalyzeResponse(
        risk=str(payload.get('risk', 'Unknown')).strip() or 'Unknown',
        confidence=conf,
        attack_type=str(payload.get('attack_type', 'Unknown')).strip() or 'Unknown',
        reason=str(payload.get('reason', raw_text[:500] if raw_text else 'No reason provided')).strip(),
        recommendation=str(payload.get('recommendation', 'Review the input manually.')).strip(),
    )


def safe_parse_ai_payload(payload: Any) -> AIAnalyzeResponse:
    if isinstance(payload, dict):
        return parse_ai_response(json.dumps(payload))
    raise AIParserError('AI payload is not a valid JSON object')


def parse_security_analysis(raw_text: str) -> AISecurityAnalysis:
    """Parse raw LLM output into a structured AISecurityAnalysis.

    Always returns a valid object — uses fallback values on failure.
    """
    payload = _extract_json(raw_text)

    raw_conf = payload.get('confidence', payload.get('score', 0))
    confidence = _normalize_confidence(raw_conf)

    severity_raw = payload.get('severity', payload.get('risk', ''))
    severity = _normalize_severity(severity_raw)

    indicators = _normalize_list(payload.get('indicators', payload.get('indicator', [])))
    recommended_actions = _normalize_list(
        payload.get('recommended_actions', payload.get('recommendations', payload.get('recommendation', [])))
    )

    mitre_tactic = str(payload.get('mitre_tactic', payload.get('tactic', ''))).strip()
    mitre_technique = str(payload.get('mitre_technique', payload.get('technique', ''))).strip()
    threat_type = str(payload.get('threat_type', payload.get('attack_type', 'Unknown'))).strip() or 'Unknown'
    explanation = str(payload.get('explanation', payload.get('reason', raw_text[:500] if raw_text else ''))).strip()

    return AISecurityAnalysis(
        threat_type=threat_type,
        severity=severity,
        confidence=confidence,
        explanation=explanation,
        indicators=indicators,
        recommended_actions=recommended_actions,
        mitre_tactic=mitre_tactic,
        mitre_technique=mitre_technique,
    )
