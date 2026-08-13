from datetime import datetime
from typing import Optional
from uuid import uuid4

from sqlalchemy import Boolean, DateTime, JSON, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ThreatRecord(Base):
    __tablename__ = "threats"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    detected_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False, default=datetime.utcnow)
    source: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    category: Mapped[str] = mapped_column(String(80), nullable=False)
    rule_name: Mapped[str] = mapped_column(String(120), nullable=False, default='general')
    severity: Mapped[str] = mapped_column(String(20), nullable=False)
    risk_score: Mapped[int] = mapped_column(nullable=False)
    confidence: Mapped[int] = mapped_column(nullable=False)
    priority: Mapped[str] = mapped_column(String(30), nullable=False)
    indicators: Mapped[JSON] = mapped_column(JSON, nullable=False, default=list)
    mitre: Mapped[JSON] = mapped_column(JSON, nullable=False, default=dict)
    recommendation: Mapped[Text] = mapped_column(Text, nullable=False)
    raw_payload: Mapped[Optional[JSON]] = mapped_column(JSON, nullable=True)
    resolved: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    status: Mapped[str] = mapped_column(String(30), nullable=False, default="detected")
    processing_time: Mapped[float] = mapped_column(nullable=False, default=0.0)
