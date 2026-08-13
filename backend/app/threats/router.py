from typing import List

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db_session
from app.threats.exceptions import ThreatDetectionError, ThreatValidationError
from app.threats.repository import SQLAlchemyThreatRepository
from app.threats.rules import RULES
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
    ThreatRuleSchema,
)
from app.threats.service import ThreatService
from app.auth.dependencies import get_current_user

router = APIRouter(prefix="/threats", tags=["threats"], dependencies=[Depends(get_current_user)])


def get_threat_service(db: Session = Depends(get_db_session)) -> ThreatService:
    repository = SQLAlchemyThreatRepository(db)
    return ThreatService(repository)


@router.get("/rules", response_model=List[ThreatRuleSchema])
def get_rules() -> List[ThreatRuleSchema]:
    return [rule.dict() for rule in RULES]


@router.get("/history", response_model=List[ThreatHistoryItem])
def get_history(limit: int = 50, service: ThreatService = Depends(get_threat_service)) -> List[ThreatHistoryItem]:
    return service.get_history(limit)


@router.get("/stats", response_model=ThreatStatsResponse)
def get_stats(service: ThreatService = Depends(get_threat_service)) -> ThreatStatsResponse:
    return service.get_stats()


@router.get("/recent", response_model=List[ThreatRecordSchema])
def get_recent(limit: int = 25, service: ThreatService = Depends(get_threat_service)) -> List[ThreatRecordSchema]:
    records = service.get_recent(limit)
    return [ThreatRecordSchema.from_orm(record) for record in records]


@router.get("/statistics", response_model=ThreatSummary)
def get_statistics(service: ThreatService = Depends(get_threat_service)) -> ThreatSummary:
    return service.get_statistics()


@router.post("/analyze", response_model=ThreatAnalysisResponse)
def analyze(request: ThreatAnalysisRequest, service: ThreatService = Depends(get_threat_service)) -> ThreatAnalysisResponse:
    try:
        return service.analyze(request)
    except ThreatValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except ThreatDetectionError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/scan", response_model=ThreatAnalysisResponse)
def scan(request: ThreatScanRequest, service: ThreatService = Depends(get_threat_service)) -> ThreatAnalysisResponse:
    try:
        return service.analyze(ThreatAnalysisRequest(
            text=request.text,
            logs=request.logs,
            url=request.url,
            headers=request.headers,
            body=request.body,
        ))
    except ThreatValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except ThreatDetectionError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/url", response_model=ThreatAnalysisResponse)
def analyze_url(request: ThreatURLRequest, service: ThreatService = Depends(get_threat_service)) -> ThreatAnalysisResponse:
    try:
        return service.analyze_url(request)
    except ThreatValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except ThreatDetectionError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.post("/file", response_model=ThreatAnalysisResponse)
def analyze_file(request: ThreatFileRequest, service: ThreatService = Depends(get_threat_service)) -> ThreatAnalysisResponse:
    try:
        return service.analyze_file(request)
    except ThreatValidationError as exc:
        raise HTTPException(status_code=422, detail=str(exc))
    except ThreatDetectionError as exc:
        raise HTTPException(status_code=500, detail=str(exc))


@router.get("/mitre")
def get_mitre(service: ThreatService = Depends(get_threat_service)) -> dict:
    return service.get_mitre_stats()


@router.get("/indicators")
def get_indicators(service: ThreatService = Depends(get_threat_service)) -> list:
    return service.get_indicators_stats()


@router.get("/intelligence")
def get_intelligence(service: ThreatService = Depends(get_threat_service)) -> dict:
    return service.get_intelligence_stats()
