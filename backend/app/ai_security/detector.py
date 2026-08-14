import re
from typing import Dict, List, Tuple, Any, Optional
from app.ai_security.schemas import AISecurityMatch, AISecurityIndicator

class AISecurityDetector:
    """Specialized Heuristic & Pattern Inspector for AI Security Threats."""

    def __init__(self) -> None:
        pass

    @staticmethod
    def mask_secret(value: str, secret_type: str = "GENERIC") -> str:
        """Safely redacts raw sensitive credentials for safe metadata persistence and WebSocket broadcasting."""
        if not value:
            return "[REDACTED]"
        val = value.strip()
        if secret_type == "API_KEY":
            if val.startswith("sk-") and len(val) > 8:
                return f"sk-****{val[-4:]}"
            if val.startswith("AKIA") and len(val) > 8:
                return f"AKIA****{val[-4:]}"
            if val.startswith("ghp_") and len(val) > 8:
                return f"ghp_****{val[-4:]}"
            return f"{val[:3]}****{val[-3:]}" if len(val) >= 8 else "****"

        if secret_type == "JWT_TOKEN":
            parts = val.split(".")
            if len(parts) >= 2:
                p1 = parts[0][:4] if len(parts[0]) >= 4 else "eyJ"
                return f"{p1}****.[REDACTED]"
            return "eyJ****.[REDACTED]"

        if secret_type == "PRIVATE_KEY":
            return "-----BEGIN PRIVATE KEY... [REDACTED]-----"

        if secret_type == "DB_CREDENTIAL":
            # Mask username:password in database URLs (e.g., postgres://user:pass@host)
            return re.sub(r"://([^:@\s]+):([^@\s]+)@", r"://\1:****@", val)

        if secret_type == "PASSWORD":
            return re.sub(r'("?(?:password|passwd|secret|api_key|access_token)"?\s*[:=]\s*["\'])[^\'"\s]+(["\'])', r'\1****\2', val, flags=re.IGNORECASE)

        return f"{val[:3]}****" if len(val) >= 6 else "****"

    def inspect(self, prompt: str, system_prompt: str = "", conversation_history: List[Dict[str, str]] = None) -> List[AISecurityMatch]:
        matches: List[AISecurityMatch] = []
        text_to_check = f"{prompt} {system_prompt}".strip()
        
        # 1. Prompt Injection Patterns
        if re.search(r"\b(ignore|disregard|override|forget)\b.*?\b(previous|all|system|above)\b.*?\b(instructions|rules|prompts|guidelines)\b", text_to_check, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Direct Prompt Injection",
                category="prompt_injection",
                severity="HIGH",
                confidence=95,
                details="Attempt to override or disregard system instructions detected.",
                mitre_tactic="Initial Access",
                mitre_technique="T1190"
            ))

        if re.search(r"\b(you are now|act as|pretend to be|roleplay as)\b.*?\b(unfiltered|unrestricted|god mode|root|admin)\b", text_to_check, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="System Role Hijacking",
                category="prompt_injection",
                severity="HIGH",
                confidence=90,
                details="Attempt to force model into an unrestricted security persona.",
                mitre_tactic="Execution",
                mitre_technique="T1059.007"
            ))

        # 2. Jailbreak Attack Signatures
        if re.search(r"\b(DAN|Do Anything Now|Developer Mode|Jailbreak|DUDE|AIM|Mongo Tom)\b", text_to_check, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Jailbreak Signature (DAN/DevMode)",
                category="jailbreak",
                severity="CRITICAL",
                confidence=98,
                details="Known jailbreak attack pattern signature identified.",
                mitre_tactic="Defense Evasion",
                mitre_technique="T1027"
            ))

        if re.search(r"\b(hypothetical|educational|fictional)\b.*?\b(scenario|universe|game)\b.*?\b(no safety|no ethics|bypass|ignore restrictions)\b", text_to_check, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Hypothetical Framing Bypass",
                category="jailbreak",
                severity="MEDIUM",
                confidence=85,
                details="Attempt to bypass ethical filters using hypothetical scenario framing.",
                mitre_tactic="Defense Evasion",
                mitre_technique="T1027"
            ))

        # 3. System Prompt Extraction
        if re.search(r"\b(print|repeat|output|show|display|reveal)\b.*?\b(system prompt|initial instructions|above text|developer message|hidden prompt)\b", text_to_check, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="System Prompt Extraction",
                category="system_prompt_extraction",
                severity="HIGH",
                confidence=92,
                details="User input requests disclosure of secret system prompt instructions.",
                mitre_tactic="Credential Access",
                mitre_technique="T1552"
            ))

        # 4. Sensitive Data Disclosure & Exfiltration
        if re.search(r"(?:-----BEGIN [A-Z\s]+KEY-----|AKIA[0-9A-Z]{16}|[a-zA-Z0-9_-]{32,}\.(?:jwt|secret|key)|sk-[a-zA-Z0-9_-]{20,}|ghp_[a-zA-Z0-9]{36})", text_to_check):
            matches.append(AISecurityMatch(
                rule_name="Sensitive API Secret Disclosure",
                category="data_leakage",
                severity="CRITICAL",
                confidence=99,
                details="High-entropy private key or API token string present in AI input.",
                mitre_tactic="Exfiltration",
                mitre_technique="T1041"
            ))

        return matches

    def inspect_agent_action(self, agent_id: str, action: str, tool_name: str, target: Optional[str], parameters: Dict[str, Any]) -> List[AISecurityMatch]:
        matches: List[AISecurityMatch] = []
        arg_str = str(parameters)
        target_str = str(target) if target else ""

        # Check action, tool, target, and args for dangerous patterns
        combined_str = f"{action} {tool_name} {target_str} {arg_str}"

        if re.search(r"\b(rm -rf|drop database|drop table|format c:|del /f /s|shutdown|reboot)\b", combined_str, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Unsafe Autonomous Agent Action",
                category="agent_threat",
                severity="CRITICAL",
                confidence=98,
                details=f"Agent '{agent_id}' attempted a highly destructive command.",
                mitre_tactic="Impact",
                mitre_technique="T1485"
            ))

        if re.search(r"\b(eval\(|exec\(|system\(|passthru\(|popen\()\b", combined_str, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Malicious Code Execution",
                category="agent_threat",
                severity="HIGH",
                confidence=95,
                details=f"Agent '{agent_id}' attempted arbitrary code execution.",
                mitre_tactic="Execution",
                mitre_technique="T1059"
            ))

        return matches

    def inspect_response(self, response: str, context: Optional[str] = None) -> Tuple[List[AISecurityMatch], List[AISecurityIndicator]]:
        """
        Inspects LLM output response text for secret disclosure, exposed credentials, private keys, and data exfiltration.
        """
        matches: List[AISecurityMatch] = []
        indicators: List[AISecurityIndicator] = []

        # 1. API Keys (OpenAI sk-, AWS AKIA, GitHub ghp_)
        api_key_matches = re.findall(r"(sk-[a-zA-Z0-9_-]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})", response)
        for key in set(api_key_matches):
            masked = self.mask_secret(key, "API_KEY")
            indicators.append(AISecurityIndicator(type="API_KEY", location="response", masked_value=masked))
            matches.append(AISecurityMatch(
                rule_name="LLM Output API Secret Leakage",
                category="data_leakage",
                severity="CRITICAL",
                confidence=99,
                details=f"Exposed API secret key ({masked}) detected in generated LLM output response.",
                mitre_tactic="Exfiltration",
                mitre_technique="T1041"
            ))

        # 2. Private Keys (RSA / OpenSSH / EC / DSA / Generic)
        if re.search(r"-----BEGIN (?:[A-Z0-9_-]+\s+)?PRIVATE KEY-----", response, re.IGNORECASE):
            masked = self.mask_secret("-----BEGIN RSA PRIVATE KEY-----", "PRIVATE_KEY")
            indicators.append(AISecurityIndicator(type="PRIVATE_KEY", location="response", masked_value=masked))
            matches.append(AISecurityMatch(
                rule_name="Private Key Exposure in Output",
                category="data_leakage",
                severity="CRITICAL",
                confidence=99,
                details="Private cryptographic key certificate header discovered in model generation output.",
                mitre_tactic="Credential Access",
                mitre_technique="T1552"
            ))

        # 3. JWT Tokens
        jwt_matches = re.findall(r"\b(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+)\b", response)
        for jwt in set(jwt_matches):
            masked = self.mask_secret(jwt, "JWT_TOKEN")
            indicators.append(AISecurityIndicator(type="JWT_TOKEN", location="response", masked_value=masked))
            matches.append(AISecurityMatch(
                rule_name="Exposed JWT Bearer Token",
                category="data_leakage",
                severity="HIGH",
                confidence=96,
                details=f"Live JSON Web Token ({masked}) embedded in model output string.",
                mitre_tactic="Credential Access",
                mitre_technique="T1552"
            ))

        # 4. Database Connection Strings with Credentials
        db_urls = re.findall(r"\b(?:postgres|postgresql|mysql|mongodb|redis):\/\/[a-zA-Z0-9_-]+:[^@\s]+@[a-zA-Z0-9_.-]+(?:\:[0-9]+)?(?:\/[a-zA-Z0-9_.-]+)?", response, re.IGNORECASE)
        for db_url in set(db_urls):
            masked = self.mask_secret(db_url, "DB_CREDENTIAL")
            indicators.append(AISecurityIndicator(type="DB_CREDENTIAL", location="response", masked_value=masked))
            matches.append(AISecurityMatch(
                rule_name="Exposed Database Credentials URL",
                category="data_leakage",
                severity="CRITICAL",
                confidence=98,
                details=f"Database connection string containing plaintext credentials ({masked}) exposed in model output.",
                mitre_tactic="Credential Access",
                mitre_technique="T1552"
            ))

        # 5. Hardcoded Credentials / Passwords in Output
        pwd_matches = re.findall(r'("?(?:password|passwd|secret|access_token)"?\s*[:=]\s*["\']([^"\'\s]{6,})["\'])', response, re.IGNORECASE)
        for full_match, secret_val in set(pwd_matches):
            masked = f'"{full_match.split(":")[0].strip()}": "****"'
            indicators.append(AISecurityIndicator(type="PASSWORD", location="response", masked_value=masked))
            matches.append(AISecurityMatch(
                rule_name="Plaintext Password Disclosure",
                category="data_leakage",
                severity="HIGH",
                confidence=92,
                details="Plaintext authentication password or secret property revealed in generated output.",
                mitre_tactic="Credential Access",
                mitre_technique="T1552"
            ))

        # 6. Malicious Downstream Instructions / Exfiltration Commands
        if re.search(r"\b(curl|wget)\b.*?\b(https?:\/\/[^\s]+)\b.*?\b(password|token|key|secret|credential)\b", response, re.IGNORECASE):
            indicators.append(AISecurityIndicator(type="EXFILTRATION_COMMAND", location="response", masked_value="curl [EXFILTRATION_TARGET]"))
            matches.append(AISecurityMatch(
                rule_name="Downstream Secret Exfiltration Command",
                category="data_leakage",
                severity="CRITICAL",
                confidence=95,
                details="Generated model response contains curl/wget commands attempting secret transfer to external host.",
                mitre_tactic="Exfiltration",
                mitre_technique="T1041"
            ))

        return matches, indicators

    def inspect_rag_document(self, content: str) -> Tuple[List[AISecurityMatch], List[AISecurityIndicator]]:
        """
        Inspects RAG document chunks for Indirect Prompt Injections, Document Poisoning, and Data Leakage.
        """
        matches: List[AISecurityMatch] = []
        indicators: List[AISecurityIndicator] = []
        text_to_check = content.strip()

        # 1. Indirect Prompt Injection
        if re.search(r"\b(system (override|note)|new instructions|ignore (previous|all|above)|forget (previous|all|above)|important instructions?)\b.*?:?", text_to_check, re.IGNORECASE) and re.search(r"\b(you must|act as|print|output)\b", text_to_check, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Indirect Prompt Injection",
                category="prompt_injection",
                severity="CRITICAL",
                confidence=95,
                details="Hidden instructions attempting to hijack the LLM detected in document chunk.",
                mitre_tactic="Initial Access",
                mitre_technique="T1190"
            ))

        # 2. Document Poisoning (e.g. injecting biases or malicious data)
        # Check for excessive repetition of URLs with malicious CTA or SEO spam patterns
        urls = re.findall(r"https?:\/\/[^\s]+", text_to_check, re.IGNORECASE)
        if len(urls) >= 5 and re.search(r"\b(click|visit|download|buy)\b", text_to_check, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Document Poisoning (Spam/Malicious Links)",
                category="document_poisoning",
                severity="HIGH",
                confidence=85,
                details="Suspiciously high concentration of URLs with manipulative calls to action.",
                mitre_tactic="Initial Access",
                mitre_technique="T1190"
            ))

        # 3. Data Leakage (Reuse existing response inspection logic for secrets in RAG docs)
        api_key_matches = re.findall(r"(sk-[a-zA-Z0-9_-]{20,}|AKIA[0-9A-Z]{16}|ghp_[a-zA-Z0-9]{36})", text_to_check)
        for key in set(api_key_matches):
            masked = self.mask_secret(key, "API_KEY")
            indicators.append(AISecurityIndicator(type="API_KEY", location="rag_document", masked_value=masked))
            matches.append(AISecurityMatch(
                rule_name="Exposed API Secret in Document",
                category="data_leakage",
                severity="CRITICAL",
                confidence=99,
                details=f"API secret key ({masked}) detected in source document.",
                mitre_tactic="Credential Access",
                mitre_technique="T1552"
            ))
            
        jwt_matches = re.findall(r"\b(eyJ[a-zA-Z0-9_-]{10,}\.eyJ[a-zA-Z0-9_-]{10,}\.[a-zA-Z0-9_-]+)\b", text_to_check)
        for jwt in set(jwt_matches):
            masked = self.mask_secret(jwt, "JWT_TOKEN")
            indicators.append(AISecurityIndicator(type="JWT_TOKEN", location="rag_document", masked_value=masked))
            matches.append(AISecurityMatch(
                rule_name="Exposed JWT in Document",
                category="data_leakage",
                severity="HIGH",
                confidence=96,
                details=f"JSON Web Token ({masked}) embedded in source document.",
                mitre_tactic="Credential Access",
                mitre_technique="T1552"
            ))

        return matches, indicators
