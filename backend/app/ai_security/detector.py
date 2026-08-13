import re
from typing import Dict, List, Tuple, Any
from app.ai_security.schemas import AISecurityMatch

class AISecurityDetector:
    """Specialized Heuristic & Pattern Inspector for AI Security Threats."""

    def __init__(self) -> None:
        pass

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
        if re.search(r"(?:BEGIN (?:RSA|OPENSSH|PRIVATE) KEY|AKIA[0-9A-Z]{16}|[a-zA-Z0-9_-]{32,}\.(?:jwt|secret|key)|sk-[a-zA-Z0-9]{48})", text_to_check):
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

    def inspect_agent_action(self, agent_id: str, tool_name: str, tool_arguments: Dict[str, Any]) -> List[AISecurityMatch]:
        matches: List[AISecurityMatch] = []
        arg_str = str(tool_arguments)

        if re.search(r"\b(rm -rf|drop database|drop table|format c:|del /f /s|shutdown|reboot)\b", arg_str, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Unsafe Autonomous Agent Action",
                category="agent_threat",
                severity="CRITICAL",
                confidence=98,
                details=f"Agent '{agent_id}' invoked destructive tool command '{tool_name}'.",
                mitre_tactic="Impact",
                mitre_technique="T1485"
            ))

        if re.search(r"\b(eval\(|exec\(|system\(|passthru\(|popen\()\b", arg_str, re.IGNORECASE):
            matches.append(AISecurityMatch(
                rule_name="Malicious Code Execution Tool Parameter",
                category="agent_threat",
                severity="HIGH",
                confidence=95,
                details=f"Agent '{agent_id}' attempted arbitrary code execution via tool parameter.",
                mitre_tactic="Execution",
                mitre_technique="T1059"
            ))

        return matches
