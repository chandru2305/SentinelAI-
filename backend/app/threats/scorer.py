from typing import List

from app.threats.schemas import ThreatResult


SEVERITY_WEIGHTS = {
    'critical': 1.0,
    'high': 0.85,
    'medium': 0.65,
    'low': 0.4,
}

PRIORITY_MAP = {
    'P1': 'Critical',
    'P2': 'High',
    'P3': 'Medium',
    'P4': 'Low',
}


class ThreatScorer:
    def score(self, results: List[ThreatResult]) -> dict[str, object]:
        if not results:
            return {
                'risk_score': 0,
                'highest_severity': 'none',
                'confidence': 0,
                'priority': 'None',
            }

        severity_order = ['critical', 'high', 'medium', 'low']
        highest_severity = min(results, key=lambda item: severity_order.index(item.severity)).severity
        average_confidence = sum(item.confidence for item in results) // len(results)
        risk_score = min(
            100,
            int(sum(SEVERITY_WEIGHTS.get(item.severity, 0.4) * item.confidence for item in results) / max(len(results), 1)),
        )
        priority = PRIORITY_MAP.get(results[0].priority, 'Medium')

        return {
            'risk_score': risk_score,
            'highest_severity': highest_severity,
            'confidence': average_confidence,
            'priority': priority,
        }
