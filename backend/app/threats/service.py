from datetime import datetime
from typing import Any

from app.threats.detector import ThreatDetector
from app.threats.repository import SQLAlchemyThreatRepository
from app.threats.schemas import (
    ThreatAnalysisRequest,
    ThreatAnalysisResponse,
    ThreatFileRequest,
    ThreatHistoryItem,
    ThreatRecordSchema,
    ThreatScanRequest,
    ThreatStatsResponse,
    ThreatSummary,
    ThreatURLRequest,
)
from app.threats.scorer import ThreatScorer
from app.threats.exceptions import ThreatValidationError


class ThreatService:
    def __init__(self, repository: SQLAlchemyThreatRepository, detector: ThreatDetector | None = None, scorer: ThreatScorer | None = None) -> None:
        self.repository = repository
        self.detector = detector or ThreatDetector()
        self.scorer = scorer or ThreatScorer()

    def _normalize_request(self, request: ThreatAnalysisRequest) -> dict[str, Any]:
        if request.url:
            text = str(request.url)
            source = 'url'
        elif request.logs:
            text = request.logs
            source = 'logs'
        elif request.headers or request.body:
            header_text = f"Headers: {request.headers}" if request.headers else ''
            body_text = f"Body: {request.body}" if request.body else ''
            text = f"{header_text}\n{body_text}".strip()
            source = 'http'
        elif request.text:
            text = request.text
            source = 'text'
        else:
            raise ThreatValidationError('Request must contain text, logs, url, headers, or body content to analyze')

        return {
            'text': text,
            'source': source,
            'raw': {
                'text': request.text,
                'logs': request.logs,
                'url': str(request.url) if request.url else None,
                'headers': request.headers,
                'body': request.body,
            },
        }

    def analyze(self, request: ThreatAnalysisRequest) -> ThreatAnalysisResponse:
        data = self._normalize_request(request)
        start = datetime.utcnow()
        results = self.detector.analyze(payload=data['text'])
        score = self.scorer.score(results)
        consolidated_indicators = [indicator for result in results for indicator in result.indicators]
        recommendations = [result.recommendation for result in results]

        scanned_at = datetime.utcnow()
        processing_time = (scanned_at - start).total_seconds()

        from fastapi.encoders import jsonable_encoder
        record = self.repository.save_detection(
            input_data={
                'source': data['source'],
                'raw': data['raw'],
            },
            detected=bool(results),
            risk_score=score['risk_score'],
            severity=score['highest_severity'],
            confidence=score['confidence'],
            processing_time=processing_time,
            threats=[jsonable_encoder(result) for result in results],
        )

        try:
            from app.realtime.manager import manager
            import asyncio
            event_payload = {
                "event_type": "threat_detected" if record.status == "detected" or record.severity != "low" else "threat_cleared",
                "id": record.id,
                "time": record.detected_at.strftime("%H:%M:%S") if record.detected_at else "",
                "timestamp": record.detected_at.isoformat() if record.detected_at else "",
                "source": record.source or "",
                "threat": record.rule_name or record.category,
                "category": record.category,
                "rule_name": record.rule_name,
                "severity": record.severity,
                "risk_score": record.risk_score,
                "confidence": record.confidence,
                "priority": record.priority,
                "mitre": record.mitre or {},
                "status": record.status,
                "recommendation": record.recommendation or "",
            }
            
            # Setup/capture manager loop if not set
            if not manager.loop:
                try:
                    manager.loop = asyncio.get_running_loop()
                except RuntimeError:
                    pass
            
            # Broadcast safely
            if manager.loop and manager.loop.is_running():
                asyncio.run_coroutine_threadsafe(manager.broadcast(event_payload), manager.loop)
            else:
                try:
                    loop = asyncio.get_running_loop()
                    loop.create_task(manager.broadcast(event_payload))
                except RuntimeError:
                    # In extreme case, fallback to local loop run or log warning
                    pass
        except Exception as ws_err:
            import logging
            logging.getLogger(__name__).error(f"WebSocket broadcast error: {ws_err}")

        return ThreatAnalysisResponse(
            detected=bool(results),
            overall_risk=score['risk_score'],
            overall_severity=score['highest_severity'],
            processing_time=processing_time,
            threats=results,
            risk_score=score['risk_score'],
            highest_severity=score['highest_severity'],
            confidence=score['confidence'],
            priority=score['priority'],
            indicators=consolidated_indicators,
            recommendations=recommendations,
            mitre=[result.mitre for result in results],
            scanned_at=scanned_at,
        )

    def analyze_url(self, request: ThreatURLRequest) -> ThreatAnalysisResponse:
        return self.analyze(ThreatAnalysisRequest(url=request.url))

    def analyze_file(self, request: ThreatFileRequest) -> ThreatAnalysisResponse:
        return self.analyze(ThreatAnalysisRequest(text=request.content))

    def get_recent(self, limit: int = 25):
        return self.repository.list_recent(limit)

    def get_history(self, limit: int = 50):
        records = self.repository.list_history(limit)
        return [
            {
                'id': record.id,
                'timestamp': record.detected_at,
                'source': record.source,
                'category': record.category,
                'rule_name': record.rule_name,
                'input': record.raw_payload or {},
                'detected': record.status == 'detected',
                'risk_score': record.risk_score,
                'severity': record.severity,
                'confidence': record.confidence,
                'processing_time': record.processing_time,
                'status': record.status,
            }
            for record in records
        ]

    def get_stats(self) -> ThreatStatsResponse:
        stats = self.repository.get_stats()
        return ThreatStatsResponse(**stats)

    def get_statistics(self) -> ThreatSummary:
        stats = self.repository.get_stats()
        return ThreatSummary(**{
            'total_scans': stats['total_scans'],
            'threats_found': stats['threats_found'],
            'critical': stats['critical'],
            'high': stats['high'],
            'medium': stats['medium'],
            'low': stats['low'],
        })

    def clear_history(self) -> None:
        self.repository.clear_history()

    def get_mitre_stats(self) -> dict:
        return self.repository.get_mitre_stats()

    def get_indicators_stats(self) -> list:
        return self.repository.get_indicators_stats()

    def get_intelligence_stats(self) -> dict:
        return self.repository.get_intelligence_stats()
