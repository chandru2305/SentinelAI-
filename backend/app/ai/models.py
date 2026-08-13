from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AIAnalyzeResult:
    risk: str
    confidence: int
    attack_type: str
    reason: str
    recommendation: str


@dataclass
class AIModelInfo:
    name: str
    loaded: bool = False
    description: Optional[str] = None


@dataclass
class AIStatusInfo:
    ollama_running: bool
    model: str
    latency_ms: float
    version: str
    available: bool = True
    status: str = 'online'
    message: Optional[str] = None
    vram_usage: Optional[str] = None
    ram_usage: Optional[str] = None
    tokens_per_sec: Optional[int] = None
    context_size: Optional[int] = None
    temperature: Optional[float] = None
