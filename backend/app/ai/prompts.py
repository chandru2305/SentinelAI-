from typing import Dict


PROMPT_TEMPLATES: Dict[str, str] = {
    "prompt_injection": (
        "You are an AI security analyst. Assess the following user input for prompt injection risk. "
        "Respond with a JSON object containing risk, confidence, attack_type, reason, and recommendation. "
        "Use only the listed fields and do not include any additional commentary.\n\n"
        "Input:\n{text}\n"
        "If the input is safe, mark risk as Low and include a concise explanation."
    ),
    "jailbreak": (
        "You are an AI security analyst. Evaluate whether the following input attempts a jailbreak. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation. "
        "Do not add any extra text outside the JSON object.\n\n"
        "Input:\n{text}\n"
        "Use attack_type 'Jailbreak' when applicable."
    ),
    "malware": (
        "You are an AI threat detection engine. Analyze the text for malware intent or indicators. "
        "Return exactly one JSON object with risk, confidence, attack_type, reason, and recommendation.\n\n"
        "Input:\n{text}\n"
        "Use attack_type 'Malware' for malware-related threats."
    ),
    "phishing": (
        "You are an AI security analyst. Examine the text for phishing threats. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation only.\n\n"
        "Input:\n{text}\n"
        "Use attack_type 'Phishing' when phishing patterns are found."
    ),
    "xss": (
        "You are an AI security analyst. Analyze the text for cross-site scripting (XSS) or script injection patterns. "
        "Respond only with a JSON object containing risk, confidence, attack_type, reason, and recommendation.\n\n"
        "Input:\n{text}\n"
        "Use attack_type 'XSS' when XSS indicators are present."
    ),
    "sql_injection": (
        "You are an AI security analyst. Evaluate the text for SQL injection attempts. "
        "Output a JSON object with risk, confidence, attack_type, reason, and recommendation only.\n\n"
        "Input:\n{text}\n"
        "Use attack_type 'SQL Injection' when SQL injection is suspected."
    ),
    "data_exfiltration": (
        "You are an AI security analyst. Determine whether the text indicates data exfiltration or unauthorized data transfer. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation.\n\n"
        "Input:\n{text}\n"
        "Use attack_type 'Data Exfiltration' when data theft is indicated."
    ),
    "privilege_escalation": (
        "You are an AI security analyst. Determine if the text contains privilege escalation threats. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation.\n\n"
        "Input:\n{text}\n"
        "Use attack_type 'Privilege Escalation' when privilege abuse is present."
    ),
    "log_analysis": (
        "You are an AI analyst specialized in log analysis. Review the log contents and identify any suspicious events or security anomalies. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation only.\n\n"
        "Log:\n{text}\n"
        "Use attack_type 'Log Analysis' for suspicious activity patterns."
    ),
    "code_review": (
        "You are an AI security analyst. Review the provided code for vulnerabilities or suspicious logic. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation only.\n\n"
        "Code:\n{text}\n"
        "Use attack_type 'Code Review' for unsafe or insecure code patterns."
    ),
    "url_analysis": (
        "You are an AI security analyst. Analyze the provided URL or URL-containing text for phishing, malicious payloads, or suspicious redirects. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation only.\n\n"
        "URL/Text:\n{text}\n"
        "Use attack_type 'URL Analysis' when the URL appears malicious."
    ),
    "email_analysis": (
        "You are an AI security analyst. Examine the email text for phishing, social engineering, or malicious instruction patterns. "
        "Return a JSON object with risk, confidence, attack_type, reason, and recommendation only.\n\n"
        "Email:\n{text}\n"
        "Use attack_type 'Email Analysis' when the email contains malicious intent."
    ),
}
