from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl


class AIAnalyzeRequest(BaseModel):
    text: str = Field(..., min_length=1, max_length=8192)
    category: Optional[str] = Field(
        'prompt_injection',
        description='Optional analysis category: prompt_injection, jailbreak, malware, phishing, xss, sql_injection, data_exfiltration, privilege_escalation, log_analysis, code_review, url_analysis, email_analysis',
    )
    model: Optional[str] = Field(None, description='Optional model name override')


class AIChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=4096)
    model: Optional[str] = Field(None, description='Optional model name override')


class AIChatResponse(BaseModel):
    message: str


class AIChangeModelRequest(BaseModel):
    model: str = Field(..., min_length=1)


class AIAnalyzeResponse(BaseModel):
    risk: str
    confidence: int
    attack_type: str
    reason: str
    recommendation: str
    summary: Optional[str] = None
    threat_type: Optional[str] = None
    severity: Optional[str] = None
    risk_score: Optional[int] = None
    recommendations: Optional[List[str]] = None
    indicators: Optional[List[str]] = None
    mitre: Optional[List[Dict[str, Any]]] = None
    provider: Optional[str] = None
    model: Optional[str] = None
    raw_output: Optional[Any] = None


class AIStatusResponse(BaseModel):
    available: bool = True
    status: str = 'online'
    provider: str = 'ollama'
    ollama_running: bool
    model: str
    latency_ms: float
    version: str
    message: Optional[str] = None
    vram_usage: Optional[str] = None
    ram_usage: Optional[str] = None
    tokens_per_sec: Optional[int] = None
    context_size: Optional[int] = None
    temperature: Optional[float] = None


class AIModelInfo(BaseModel):
    name: str
    loaded: bool = False
    description: Optional[str] = None


class AIModelsResponse(BaseModel):
    models: List[AIModelInfo]


class AIConnectivityResponse(BaseModel):
    ok: bool
    message: str


class AIChangeModelResponse(BaseModel):
    ok: bool
    model: str
    message: str


# ── Structured security-analysis schema ─────────────────────────────────────

class AISecurityAnalysis(BaseModel):
    """Structured AI threat-analysis result."""
    threat_type: str = 'Unknown'
    severity: str = 'UNKNOWN'
    confidence: float = 0.0
    explanation: str = ''
    indicators: List[str] = Field(default_factory=list)
    recommended_actions: List[str] = Field(default_factory=list)
    mitre_tactic: str = ''
    mitre_technique: str = ''


class AISecurityAnalysisRequest(BaseModel):
    input: str = Field(..., min_length=1, max_length=8192, description='Security content to analyze')
    context: Optional[str] = Field(None, max_length=512, description='Optional context hint (e.g. web request, log)')
    model: Optional[str] = Field(None, description='Optional model override')


class AISecurityAnalysisResponse(BaseModel):
    success: bool
    analysis: Optional[AISecurityAnalysis] = None
    error: Optional[str] = None
