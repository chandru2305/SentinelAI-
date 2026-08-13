from typing import Dict, Optional

from app.threats.schemas import MitreMapping


MITRE_LIBRARY: Dict[str, MitreMapping] = {
    "SQL Injection": MitreMapping(
        technique="SQL Injection",
        technique_id="T1190",
        tactic="Initial Access",
        description="Adversaries may abuse SQL injection to execute unauthorized database queries.",
        reference="https://attack.mitre.org/techniques/T1190/",
    ),
    "Cross Site Scripting (XSS)": MitreMapping(
        technique="Cross Site Scripting (XSS)",
        technique_id="T1059.007",
        tactic="Execution",
        description="Injection of malicious script into trusted pages to run in another user's browser.",
        reference="https://attack.mitre.org/techniques/T1059/007/",
    ),
    "Command Injection": MitreMapping(
        technique="Command Injection",
        technique_id="T1059",
        tactic="Execution",
        description="Adversaries may execute arbitrary commands through vulnerable shells or interpreters.",
        reference="https://attack.mitre.org/techniques/T1059/",
    ),
}


def get_mitre_for_rule(rule_name: str) -> Optional[MitreMapping]:
    return MITRE_LIBRARY.get(rule_name)
