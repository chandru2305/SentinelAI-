from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class AISecurityInspectRequest(BaseModel):
    prompt: str = Field(..., min_length=1, max_length=16384, description="User prompt or AI input text")
    system_prompt: Optional[str] = Field(None, max_length=8192, description="Optional system prompt context")
    conversation_history: Optional[List[Dict[str, str]]] = Field(default_factory=list, description="Recent conversation turns")
    agent_id: Optional[str] = Field(None, max_length=128, description="Identifier of the AI agent if applicable")

class AISecurityMatch(BaseModel):
    rule_name: str
    category: str
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW
    confidence: int  # 0 - 100
    details: str
    mitre_tactic: Optional[str] = None
    mitre_technique: Optional[str] = None

class AISecurityDecision(BaseModel):
    allowed: bool
    action: str  # BLOCK, WARN, ALLOW
    overall_risk: int  # 0 - 100
    severity: str  # CRITICAL, HIGH, MEDIUM, LOW, INFO
    threat_count: int
    matches: List[AISecurityMatch]
    explanation: str
    remediation: str
    processing_time_ms: float
    timestamp: str

class AIAgentActionInspectRequest(BaseModel):
    agent_id: str = Field(..., min_length=1, max_length=128)
    tool_name: str = Field(..., min_length=1, max_length=256)
    tool_arguments: Dict[str, Any] = Field(default_factory=dict)
    context: Optional[str] = Field(None, max_length=4096)

class AISecurityMetricsResponse(BaseModel):
    total_inspections: int
    threats_blocked: int
    prompt_injections: int
    jailbreak_attempts: int
    agent_violations: int
    avg_risk_score: float
