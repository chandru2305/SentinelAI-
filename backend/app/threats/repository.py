from typing import List

from sqlalchemy import func
from sqlalchemy.orm import Session

from app.threats.models import ThreatRecord
from app.threats.schemas import ThreatResult


class SQLAlchemyThreatRepository:
    def __init__(self, session: Session) -> None:
        self.session = session

    def save_detection(
        self,
        input_data: dict[str, object],
        detected: bool,
        risk_score: int,
        severity: str,
        confidence: int,
        processing_time: float,
        threats: list[dict[str, object]],
    ) -> ThreatRecord:
        primary_result = threats[0] if threats else None
        record = ThreatRecord(
            source=input_data.get('source'),
            category=primary_result['category'] if primary_result else 'general',
            rule_name=primary_result.get('rule_name') if primary_result else 'general',
            severity=severity,
            risk_score=risk_score,
            confidence=confidence,
            priority=primary_result['priority'] if primary_result else 'P4',
            indicators=[indicator for indicator in primary_result['indicators']] if primary_result else [],
            mitre=primary_result['mitre'] if primary_result else {},
            recommendation=primary_result['recommendation'] if primary_result else 'No threats detected.',
            raw_payload=input_data,
            status='detected' if detected else 'cleared',
            processing_time=processing_time,
        )
        self.session.add(record)
        self.session.commit()
        self.session.refresh(record)
        return record

    def list_recent(self, limit: int = 25) -> List[ThreatRecord]:
        return (
            self.session.query(ThreatRecord)
            .order_by(ThreatRecord.detected_at.desc())
            .limit(limit)
            .all()
        )

    def list_history(self, limit: int = 50) -> List[ThreatRecord]:
        return (
            self.session.query(ThreatRecord)
            .order_by(ThreatRecord.detected_at.desc())
            .limit(limit)
            .all()
        )

    def get_stats(self) -> dict[str, object]:
        total = self.session.query(ThreatRecord).count()
        critical = self.session.query(ThreatRecord).filter(ThreatRecord.severity == 'critical').count()
        high = self.session.query(ThreatRecord).filter(ThreatRecord.severity == 'high').count()
        medium = self.session.query(ThreatRecord).filter(ThreatRecord.severity == 'medium').count()
        low = self.session.query(ThreatRecord).filter(ThreatRecord.severity == 'low').count()
        average_confidence = int(self.session.query(func.avg(ThreatRecord.confidence)).scalar() or 0)
        last_scan = self.session.query(ThreatRecord).order_by(ThreatRecord.detected_at.desc()).first()
        return {
            'total_scans': total,
            'threats_found': critical + high + medium + low,
            'critical': critical,
            'high': high,
            'medium': medium,
            'low': low,
            'average_confidence': average_confidence,
            'last_scan': last_scan.detected_at if last_scan else None,
            'recent_threats': min(total, 5),
        }

    def clear_history(self) -> None:
        self.session.query(ThreatRecord).delete()
        self.session.commit()

    def get_mitre_stats(self) -> dict[str, list]:
        records = self.session.query(ThreatRecord).all()
        tactic_counts = {}
        technique_counts = {}
        for r in records:
            if not r.mitre or not isinstance(r.mitre, dict):
                continue
            tactic = r.mitre.get("tactic")
            if tactic:
                tactic_counts[tactic] = tactic_counts.get(tactic, 0) + 1
            tech_id = r.mitre.get("technique_id")
            if tech_id:
                if tech_id not in technique_counts:
                    technique_counts[tech_id] = {
                        "technique_id": tech_id,
                        "technique": r.mitre.get("technique") or r.rule_name,
                        "tactic": tactic or "Unknown",
                        "count": 0,
                        "severity": r.severity,
                        "last_detected": r.detected_at.isoformat() if r.detected_at else None
                    }
                tech_data = technique_counts[tech_id]
                tech_data["count"] += 1
                if r.detected_at and (not tech_data["last_detected"] or r.detected_at.isoformat() > tech_data["last_detected"]):
                    tech_data["last_detected"] = r.detected_at.isoformat()
                    tech_data["severity"] = r.severity
        return {
            "tactics": [{"tactic": t, "count": c} for t, c in tactic_counts.items()],
            "techniques": list(technique_counts.values())
        }

    def get_indicators_stats(self) -> list[dict]:
        records = self.session.query(ThreatRecord).all()
        indicator_map = {}
        for r in records:
            if not r.indicators or not isinstance(r.indicators, list):
                continue
            for ind in r.indicators:
                if not isinstance(ind, dict):
                    continue
                val = ind.get("value")
                ind_type = ind.get("type") or "unknown"
                if not val:
                    continue
                key = (val, ind_type)
                timestamp_str = r.detected_at.isoformat() if r.detected_at else None
                if key not in indicator_map:
                    indicator_map[key] = {
                        "indicator": val,
                        "type": ind_type,
                        "first_seen": timestamp_str,
                        "last_seen": timestamp_str,
                        "count": 0,
                        "categories": set()
                    }
                ind_data = indicator_map[key]
                ind_data["count"] += 1
                if r.category:
                    ind_data["categories"].add(r.category)
                if timestamp_str:
                    if not ind_data["first_seen"] or timestamp_str < ind_data["first_seen"]:
                        ind_data["first_seen"] = timestamp_str
                    if not ind_data["last_seen"] or timestamp_str > ind_data["last_seen"]:
                        ind_data["last_seen"] = timestamp_str
        result_list = []
        for key, data in indicator_map.items():
            data["categories"] = list(data["categories"])
            result_list.append(data)
        return result_list

    def get_intelligence_stats(self) -> dict:
        records = self.session.query(ThreatRecord).all()
        categories = {}
        severity_dist = {"critical": 0, "high": 0, "medium": 0, "low": 0}
        
        for r in records:
            # Categories
            if r.category:
                categories[r.category] = categories.get(r.category, 0) + 1
            # Severity
            sev = r.severity.lower() if r.severity else "medium"
            if sev in severity_dist:
                severity_dist[sev] += 1
            else:
                severity_dist[sev] = severity_dist.get(sev, 0) + 1

        recent_categories = [{"category": cat, "count": cnt} for cat, cnt in categories.items()]
        mitre_data = self.get_mitre_stats()
        
        # Sort techniques by count descending for top list
        top_techniques = sorted(mitre_data["techniques"], key=lambda x: x["count"], reverse=True)[:5]
        indicators = self.get_indicators_stats()

        return {
            "recent_categories": recent_categories,
            "severity_distribution": severity_dist,
            "top_techniques": top_techniques,
            "indicators": indicators
        }
