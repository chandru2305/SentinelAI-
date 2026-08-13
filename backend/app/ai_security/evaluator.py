import time
from typing import Dict, List, Optional, Tuple
from app.ai.service import AIService
from app.ai_security.schemas import AISecurityMatch

class AISecurityEvaluator:
    """Semantic AI Evaluator using Ollama with heuristic fallback."""

    def __init__(self, ai_service: Optional[AIService] = None) -> None:
        self.ai_service = ai_service or AIService()

    def evaluate_intent(self, prompt: str, matches: List[AISecurityMatch]) -> Tuple[int, str, str, str]:
        """
        Returns (overall_risk, severity, explanation, remediation)
        """
        if not matches:
            return 0, "LOW", "No malicious AI patterns or prompt injections identified.", "Allow prompt to proceed to LLM pipeline."

        max_confidence = max(m.confidence for m in matches)
        has_critical = any(m.severity == "CRITICAL" for m in matches)
        has_high = any(m.severity == "HIGH" for m in matches)

        if has_critical:
            risk = max(90, max_confidence)
            severity = "CRITICAL"
        elif has_high:
            risk = max(70, max_confidence)
            severity = "HIGH"
        else:
            risk = max(40, max_confidence)
            severity = "MEDIUM"

        matched_names = ", ".join(set(m.rule_name for m in matches))
        explanation = f"Detected dangerous AI interaction pattern(s): {matched_names}. Details: {matches[0].details}"
        remediation = "Filter or sanitize the input to strip instruction overrides and system role hijacking tokens prior to sending to the model."

        return risk, severity, explanation, remediation
