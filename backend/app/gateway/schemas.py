from typing import Any, Dict, List, Optional
from pydantic import BaseModel, Field

class GatewayMessage(BaseModel):
    role: str = Field(..., description="Message role, e.g. 'system', 'user', 'assistant'")
    content: str = Field(..., description="The content of the message")

class GatewayChatRequest(BaseModel):
    provider: str = Field(default="ollama", description="Upstream AI provider (e.g. ollama)")
    model: Optional[str] = Field(None, description="Target model (e.g. llama3.2)")
    messages: List[GatewayMessage] = Field(..., min_items=1, description="Chat messages")
    rag_context: Optional[List[str]] = Field(None, description="Optional RAG context to inspect alongside prompt")
    agent_id: Optional[str] = Field(None, description="Optional Agent ID if the request originates from an Agent")

class GatewaySecurityEvent(BaseModel):
    decision: str = Field(..., description="Policy decision: ALLOW, WARN, BLOCK")
    risk_score: int = Field(..., description="Calculated risk score 0-100")
    threat_type: Optional[str] = Field(None, description="Primary threat category if detected")
    message: str = Field(..., description="Human readable description")

class GatewayChatResponse(BaseModel):
    request_id: str = Field(..., description="Unique correlation ID for this gateway interaction")
    decision: str = Field(..., description="Final gateway decision: ALLOW, WARN, BLOCK")
    request_security: GatewaySecurityEvent
    response_security: Optional[GatewaySecurityEvent] = None
    final_response: Optional[str] = Field(None, description="The upstream response (if ALLOW/WARN)")
    upstream_latency_ms: Optional[float] = Field(None, description="Upstream inference latency")

class GatewayStatusResponse(BaseModel):
    gateway_online: bool
    provider_available: bool
    active_provider: str
    active_model: str
    security_engine_available: bool
