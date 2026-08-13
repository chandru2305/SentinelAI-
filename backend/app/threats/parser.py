import re
from typing import Any, Dict, List, Optional

from app.threats.schemas import ThreatIndicator


SQLI_PATTERNS = [
    r"\b(select|union|update|delete|insert|drop|alter)\b",
    r"'\s*or\s*'1'='1",
    r"--",
    r";\s*--",
]

XSS_PATTERNS = [
    r"<script[^>]*>.*?</script>",
    r"javascript:\w+",
    r"onerror=|onload=|onclick=",
]

CMD_PATTERNS = [
    r"\b(?:bash|sh|cmd|powershell|pwsh|python|perl|ruby)\b",
    r"\b(?:&&|\|\||;|\$\(|\`|\>\>)\b",
]

URL_PHISHING_PATTERNS = [
    r"(?:login|secure|account|update|verify|bank|paypal|amazon|stripe)",
    r"(?:\.xyz|\.club|\.top|\.site|\.online|\.download)",
]

ENCODED_PATTERNS = [
    r"(?:[A-Za-z0-9+/]{40,}={0,2})",
    r"%[0-9A-Fa-f]{2}",
]

TRAVERSAL_PATTERNS = [
    r"\.\./",
    r"/etc/passwd",
    r"c:\\windows\\system32",
]

file_extension_indicators = {
    '.exe': 'Windows executable file',
    '.dll': 'Windows library file',
    '.bat': 'Batch script',
    '.ps1': 'PowerShell script',
    '.js': 'JavaScript file',
    '.jar': 'Java archive file',
    '.sh': 'Shell script',
}

suspicious_user_agents = [
    'curl/',
    'wget/',
    'sqlmap',
    'nmap/',
    'masscan',
]


def normalize_text(value: Any) -> str:
    if value is None:
        return ''
    if isinstance(value, dict):
        return ' '.join(str(item) for item in value.values())
    return str(value).strip()


def extract_indicators(input_data: Dict[str, Any]) -> List[ThreatIndicator]:
    indicators: List[ThreatIndicator] = []
    source = normalize_text(input_data.get('source') or '')
    payload = normalize_text(input_data.get('payload') or '')

    if any(re.search(pattern, payload, re.IGNORECASE) for pattern in SQLI_PATTERNS):
        indicators.append(ThreatIndicator(type='SQL Injection Pattern', value=payload, description='SQL keyword or injection token found.'))

    if any(re.search(pattern, payload, re.IGNORECASE) for pattern in XSS_PATTERNS):
        indicators.append(ThreatIndicator(type='XSS Pattern', value=payload, description='Possible cross-site scripting payload.'))

    if any(re.search(pattern, payload, re.IGNORECASE) for pattern in CMD_PATTERNS):
        indicators.append(ThreatIndicator(type='Command Injection Pattern', value=payload, description='Shell command or operator usage detected.'))

    if any(re.search(pattern, normalize_text(input_data.get('url')), re.IGNORECASE) for pattern in URL_PHISHING_PATTERNS):
        indicators.append(ThreatIndicator(type='Phishing URL', value=normalize_text(input_data.get('url')), description='Suspicious URL contains phishing keywords or unusual domain.'))

    if any(re.search(pattern, payload, re.IGNORECASE) for pattern in ENCODED_PATTERNS):
        indicators.append(ThreatIndicator(type='Encoded Payload', value=payload, description='Encoded data or escape sequences detected.'))

    if any(re.search(pattern, payload, re.IGNORECASE) for pattern in TRAVERSAL_PATTERNS):
        indicators.append(ThreatIndicator(type='Directory Traversal Pattern', value=payload, description='Path traversal string detected.'))

    if any(payload.lower().endswith(ext) for ext in file_extension_indicators):
        extension = next(ext for ext in file_extension_indicators if payload.lower().endswith(ext))
        indicators.append(ThreatIndicator(type='Suspicious File Extension', value=extension, description=file_extension_indicators[extension]))

    if any(agent in source.lower() for agent in suspicious_user_agents):
        indicators.append(ThreatIndicator(type='Suspicious User Agent', value=source, description='Known reconnaissance or scanner user agent was detected.'))

    if re.search(r"\b(password|passwd|token|secret|apikey|access_key|ssh_key|private_key)\b", payload, re.IGNORECASE):
        indicators.append(ThreatIndicator(type='Credential Leakage', value=payload, description='Potential exposed credentials or tokens found.'))

    return indicators
