from datetime import datetime
from typing import Any, Dict, List, Optional

from pydantic import BaseModel, Field, HttpUrl


class ThreatIndicator(BaseModel):
    type: str
    value: str
    description: str


class MitreMapping(BaseModel):
    technique: str
    technique_id: str
    tactic: str
    description: str
    reference: HttpUrl


class ThreatRuleSchema(BaseModel):
    rule_name: str
    description: str
    severity: str
    category: str
    confidence: int
    priority: str
    mitre: MitreMapping
    recommended_action: str
    enabled: bool = True


class ThreatAnalysisRequest(BaseModel):
    text: Optional[str] = Field(None, description="Free-form text to analyze")
    logs: Optional[str] = Field(None, description="Log content to analyze")
    url: Optional[HttpUrl] = Field(None, description="Suspicious URL to analyze")
    headers: Optional[Dict[str, str]] = Field(None, description="HTTP headers to analyze")
    body: Optional[str] = Field(None, description="HTTP request body or payload to analyze")


class ThreatScanRequest(BaseModel):
    text: Optional[str] = Field(None, description="Free-form text to scan")
    logs: Optional[str] = Field(None, description="Log content to scan")
    url: Optional[HttpUrl] = Field(None, description="Suspicious URL to scan")
    headers: Optional[Dict[str, str]] = Field(None, description="HTTP headers to scan")
    body: Optional[str] = Field(None, description="HTTP request body or payload to scan")


class ThreatURLRequest(BaseModel):
    url: HttpUrl


class ThreatFileRequest(BaseModel):
    filename: Optional[str] = Field(None, description="Original filename for the uploaded file")
    content: str


class ThreatHistoryItem(BaseModel):
    id: str
    timestamp: datetime
    source: Optional[str]
    category: str
    rule_name: str
    input: Dict[str, Any]
    detected: bool
    risk_score: int
    severity: str
    confidence: int
    processing_time: float
    status: str


class ThreatStatsResponse(BaseModel):
    total_scans: int
    threats_found: int
    critical: int
    high: int
    medium: int
    low: int
    average_confidence: int
    last_scan: Optional[datetime]
    recent_threats: int


class ThreatSummary(BaseModel):
    total_scans: int
    threats_found: int
    critical: int
    high: int
    medium: int
    low: int


class ThreatResult(BaseModel):
    category: str
    rule_name: str
    severity: str
    risk_score: int
    confidence: int
    priority: str
    indicators: List[ThreatIndicator]
    mitre: MitreMapping
    recommendation: str
    details: Optional[str]


class ThreatAnalysisResponse(BaseModel):
    detected: bool
    overall_risk: int
    overall_severity: str
    processing_time: float
    threats: List[ThreatResult]
    risk_score: int
    highest_severity: str
    confidence: int
    priority: str
    indicators: List[ThreatIndicator]
    recommendations: List[str]
    mitre: List[MitreMapping]
    scanned_at: datetime


class ThreatRecordSchema(BaseModel):
    id: str
    detected_at: datetime
    source: Optional[str]
    input: Dict[str, Any] = Field(default_factory=dict)
    category: str
    rule_name: str
    severity: str
    risk_score: int
    confidence: int
    priority: str
    indicators: List[ThreatIndicator]
    mitre: Optional[MitreMapping] = None
    recommendation: str
    status: str
    processing_time: float

    class Config:
        from_attributes = True
