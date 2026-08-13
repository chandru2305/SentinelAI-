import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.auth.dependencies import get_db_session, get_current_user
from app.threats.repository import SQLAlchemyThreatRepository

router = APIRouter(dependencies=[Depends(get_current_user)])
logger = logging.getLogger(__name__)


def _get_threat_repo(db: Session = Depends(get_db_session)) -> SQLAlchemyThreatRepository:
    return SQLAlchemyThreatRepository(db)


@router.get("/summary")
def get_dashboard_summary(repo: SQLAlchemyThreatRepository = Depends(_get_threat_repo)) -> dict:
    """Real dashboard summary metrics from the threats database."""
    try:
        stats = repo.get_stats()
    except Exception as exc:
        logger.error("Failed to get dashboard stats: %s", exc)
        stats = {
            "total_scans": 0, "threats_found": 0,
            "critical": 0, "high": 0, "medium": 0, "low": 0,
            "average_confidence": 0, "last_scan": None, "recent_threats": 0,
        }

    # Derive AI status from ai service (reuse Module 7)
    ai_available = False
    try:
        from app.ai.service import AIService
        ai_svc = AIService()
        ai_info = ai_svc.safe_status()
        ai_available = ai_info.available
    except Exception:
        pass

    return {
        "threats_detected": stats.get("total_scans", 0),
        "threats_blocked": stats.get("threats_found", 0),
        "critical_threats": stats.get("critical", 0),
        "high_threats": stats.get("high", 0),
        "medium_threats": stats.get("medium", 0),
        "low_threats": stats.get("low", 0),
        "average_confidence": stats.get("average_confidence", 0),
        "recent_threats": stats.get("recent_threats", 0),
        "system_health": 100,
        "ai_status": "active" if ai_available else "offline",
    }


@router.get("/activity")
def get_dashboard_activity(repo: SQLAlchemyThreatRepository = Depends(_get_threat_repo)) -> list[dict]:
    """Real recent threat activity from the database."""
    try:
        records = repo.list_recent(limit=15)
    except Exception as exc:
        logger.error("Failed to get dashboard activity: %s", exc)
        return []

    activity = []
    for rec in records:
        detected_at = rec.detected_at
        time_str = detected_at.strftime("%H:%M:%S") if detected_at else ""
        activity.append({
            "id": rec.id,
            "time": time_str,
            "threat": rec.rule_name or rec.category,
            "severity": rec.severity,
            "status": rec.status,
            "source": rec.source or "",
            "confidence": rec.confidence,
            "risk_score": rec.risk_score,
            "rule_name": rec.rule_name,
        })
    return activity


@router.get("/alerts")
def get_dashboard_alerts(repo: SQLAlchemyThreatRepository = Depends(_get_threat_repo)) -> list[dict]:
    """Real security alerts from recent high/critical threat detections."""
    try:
        records = repo.list_recent(limit=25)
    except Exception as exc:
        logger.error("Failed to get dashboard alerts: %s", exc)
        return []

    alerts = []
    for rec in records:
        # Only surface detected (non-cleared) threats as alerts
        if rec.status == "cleared":
            continue
        detected_at = rec.detected_at
        # Compute relative time
        if detected_at:
            try:
                now = datetime.now(timezone.utc)
                dt_aware = detected_at if detected_at.tzinfo else detected_at.replace(tzinfo=timezone.utc)
                delta = now - dt_aware
                total_seconds = int(delta.total_seconds())
                if total_seconds < 60:
                    time_str = f"{total_seconds}s ago"
                elif total_seconds < 3600:
                    time_str = f"{total_seconds // 60}m ago"
                elif total_seconds < 86400:
                    time_str = f"{total_seconds // 3600}h ago"
                else:
                    time_str = f"{total_seconds // 86400}d ago"
            except Exception:
                time_str = ""
        else:
            time_str = ""

        alerts.append({
            "id": rec.id,
            "title": rec.rule_name or rec.category,
            "description": rec.recommendation or "",
            "severity": rec.severity,
            "time": time_str,
            "source": rec.source or "",
        })

    return alerts[:10]


@router.get("/system")
def get_dashboard_system() -> dict:
    """Real system status using AI service and database."""
    ai_status = "Offline"
    model_loaded = "N/A"
    ai_confidence = 0.0
    response_time_ms = 0.0

    try:
        from app.ai.service import AIService
        ai_svc = AIService()
        ai_info = ai_svc.safe_status()
        ai_status = "Running" if ai_info.available else "Offline"
        model_loaded = ai_info.model or "—"
        response_time_ms = ai_info.latency_ms or 0.0
    except Exception:
        pass

    # Get last scan time from DB
    last_scan = "N/A"
    threats_analyzed = 0
    try:
        from app.database.session import SessionLocal
        from app.threats.repository import SQLAlchemyThreatRepository as TRepo
        db = SessionLocal()
        try:
            trepo = TRepo(db)
            stats = trepo.get_stats()
            threats_analyzed = stats.get("total_scans", 0)
            avg_conf = stats.get("average_confidence", 0)
            ai_confidence = float(avg_conf) if avg_conf else 0.0
            last = stats.get("last_scan")
            if last:
                now = datetime.now(timezone.utc)
                dt_aware = last if last.tzinfo else last.replace(tzinfo=timezone.utc)
                delta = now - dt_aware
                total_seconds = int(delta.total_seconds())
                if total_seconds < 60:
                    last_scan = f"{total_seconds}s ago"
                elif total_seconds < 3600:
                    last_scan = f"{total_seconds // 60}m ago"
                else:
                    last_scan = f"{total_seconds // 3600}h ago"
        finally:
            db.close()
    except Exception:
        pass

    return {
        "ollama_status": ai_status,
        "model_loaded": model_loaded,
        "last_scan": last_scan,
        "ai_confidence": ai_confidence,
        "response_time_ms": response_time_ms,
        "threats_analyzed": threats_analyzed,
        "timestamp": datetime.now(timezone.utc).isoformat(),
    }
