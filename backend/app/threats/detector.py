import re
from typing import Any, Dict, List, Tuple

from app.threats.mitre import get_mitre_for_rule
from app.threats.parser import extract_indicators, normalize_text
from app.threats.rules import RULES
from app.threats.schemas import ThreatIndicator, ThreatResult


class ThreatDetector:
    def __init__(self) -> None:
        self.rules = RULES

    def _match_rule(self, rule_name: str, payload: str, headers: Dict[str, Any], url: str, body: str) -> Tuple[bool, List[ThreatIndicator], str]:
        normalized_payload = normalize_text(payload)
        normalized_url = normalize_text(url)
        normalized_body = normalize_text(body)
        normalized_headers = ' '.join(f'{k}:{v}' for k, v in headers.items())
        detection_text = ' '.join([normalized_payload, normalized_url, normalized_body, normalized_headers])

        if rule_name == 'SQL Injection' and re.search(r"\b(select|union|update|delete|insert|drop|alter)\b", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'SQL injection tokens or control flow detected.'

        if rule_name == 'Cross Site Scripting (XSS)' and re.search(r"<script[^>]*>.*?</script>|javascript:\w+|onerror=|onload=|onclick=", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Potential XSS payload or browser script visible in request data.'

        if rule_name == 'Command Injection' and re.search(r"\b(?:bash|sh|cmd|powershell|pwsh|python|perl|ruby)\b|(?:&&|\|\||;|\$\(|`|>>)", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Command injection indicators found in user input.'

        if rule_name == 'Prompt Injection' and re.search(r"\b(ignore all previous instructions|disregard.*instruction|remember to|your output should|you are now)\b", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Prompt manipulation language detected in AI input.'

        if rule_name == 'Phishing URL' and re.search(r"(?:login|secure|account|verify|bank|paypal|amazon|stripe)|(?:\.xyz|\.club|\.top|\.site|\.online|\.download)", normalized_url, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Suspicious URL pattern suggests phishing behavior.'

        if rule_name == 'Malware Indicator' and re.search(r"(?:trojan|malware|ransomware|virus|worm|exploit|payload)", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Malware-related keywords present in the content.'

        if rule_name == 'Credential Leakage' and re.search(r"\b(password|passwd|token|secret|apikey|access_key|ssh_key|private_key)\b", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Potential credential or secret exposure detected.'

        if rule_name == 'Reverse Shell Detection' and re.search(r"\b(?:nc|ncat|bash -i|python -c|powershell -nop|Invoke-Expression|IEX)\b", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Reverse shell patterns identified.'

        if rule_name == 'Encoded Payload Detection' and re.search(r"[A-Za-z0-9+/]{40,}={0,2}|%[0-9A-Fa-f]{2}", detection_text):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Encoded or obfuscated payload detected.'

        if rule_name == 'Directory Traversal' and re.search(r"\.\./|/etc/passwd|c:\\windows\\system32", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Directory traversal or sensitive path discovered.'

        if rule_name == 'Ransomware Indicator' and re.search(r"\b(encrypt|ransom|decrypt|extort|payment|bitcoin)\b", detection_text, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Ransomware-related keywords or threat language detected.'

        if rule_name == 'Suspicious File Extension' and any(normalized_payload.lower().endswith(ext) for ext in ['.exe', '.dll', '.bat', '.ps1', '.js', '.jar', '.sh']):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Dangerous file extension observed in input.'

        if rule_name == 'Dangerous HTTP Header' and re.search(r"host:|x-forwarded-for:|transfer-encoding:|content-length:", normalized_headers, re.IGNORECASE):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Potentially dangerous or malformed HTTP header detected.'

        if rule_name == 'Suspicious User Agent' and any(agent in normalized_headers.lower() for agent in ['curl/', 'wget/', 'sqlmap', 'nmap/', 'masscan']):
            return True, extract_indicators({'payload': payload, 'url': url, 'source': normalized_headers}), 'Reconnaissance tool or malicious user agent string detected.'

        return False, [], ''

    def analyze(self, payload: str = '', logs: str = '', headers: dict[str, str] | None = None, url: str = '', body: str = '') -> list[ThreatResult]:
        headers = headers or {}
        results: list[ThreatResult] = []

        for rule in self.rules:
            matched, indicators, details = self._match_rule(rule.rule_name, payload, headers, url, body)
            if matched:
                mitre = get_mitre_for_rule(rule.rule_name) or rule.mitre
                result = ThreatResult(
                    category=rule.category,
                    rule_name=rule.rule_name,
                    severity=rule.severity,
                    risk_score=0,
                    confidence=rule.confidence,
                    priority=rule.priority,
                    indicators=indicators,
                    mitre=mitre,
                    recommendation=rule.recommended_action,
                    details=details,
                )
                results.append(result)

        return results
