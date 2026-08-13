import unittest
from datetime import datetime
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.database.base import Base
from app.threats.models import ThreatRecord
from app.threats.repository import SQLAlchemyThreatRepository

class TestModule13Intelligence(unittest.TestCase):
    def setUp(self):
        # Create an in-memory SQLite database for test isolation
        self.engine = create_engine("sqlite:///:memory:")
        Base.metadata.create_all(self.engine)
        Session = sessionmaker(bind=self.engine)
        self.session = Session()
        self.repo = SQLAlchemyThreatRepository(self.session)

    def tearDown(self):
        self.session.close()
        Base.metadata.drop_all(self.engine)

    def test_empty_database_response(self):
        # Test Phase 9: Empty database response
        mitre = self.repo.get_mitre_stats()
        self.assertEqual(len(mitre["tactics"]), 0)
        self.assertEqual(len(mitre["techniques"]), 0)
        
        indicators = self.repo.get_indicators_stats()
        self.assertEqual(len(indicators), 0)
        
        intel = self.repo.get_intelligence_stats()
        self.assertEqual(len(intel["recent_categories"]), 0)
        self.assertEqual(intel["severity_distribution"]["critical"], 0)
        self.assertEqual(len(intel["indicators"]), 0)

    def test_multiple_tactics_and_techniques(self):
        # Test Phase 9: Multiple tactics & Multiple detections with same technique
        t1 = ThreatRecord(
            id="threat-1",
            category="Injection",
            rule_name="SQL Injection",
            severity="critical",
            risk_score=95,
            confidence=95,
            priority="P1",
            mitre={
                "tactic": "Initial Access",
                "technique_id": "T1190",
                "technique": "SQL Injection"
            },
            indicators=[{"type": "pattern", "value": "1=1"}],
            recommendation="Validate database input",
            processing_time=0.05
        )
        t2 = ThreatRecord(
            id="threat-2",
            category="Injection",
            rule_name="SQL Injection",
            severity="critical",
            risk_score=95,
            confidence=95,
            priority="P1",
            mitre={
                "tactic": "Initial Access",
                "technique_id": "T1190",
                "technique": "SQL Injection"
            },
            indicators=[{"type": "pattern", "value": "1=1"}],
            recommendation="Validate database input",
            processing_time=0.03
        )
        t3 = ThreatRecord(
            id="threat-3",
            category="Execution",
            rule_name="Command Injection",
            severity="high",
            risk_score=85,
            confidence=90,
            priority="P2",
            mitre={
                "tactic": "Execution",
                "technique_id": "T1059",
                "technique": "Command and Scripting Interpreter"
            },
            indicators=[{"type": "pattern", "value": "; rm -rf"}],
            recommendation="Sanitize commands",
            processing_time=0.04
        )
        self.session.add_all([t1, t2, t3])
        self.session.commit()

        # Run MITRE aggregation
        mitre = self.repo.get_mitre_stats()
        
        # Verify tactics count
        tactics = {t["tactic"]: t["count"] for t in mitre["tactics"]}
        self.assertEqual(tactics["Initial Access"], 2)
        self.assertEqual(tactics["Execution"], 1)

        # Verify techniques aggregation
        techniques = {t["technique_id"]: t for t in mitre["techniques"]}
        self.assertEqual(techniques["T1190"]["count"], 2)
        self.assertEqual(techniques["T1059"]["count"], 1)
        self.assertEqual(techniques["T1190"]["severity"], "critical")
        self.assertEqual(techniques["T1059"]["severity"], "high")

        # Run Indicators aggregation
        indicators = self.repo.get_indicators_stats()
        self.assertEqual(len(indicators), 2)
        ind_map = {ind["indicator"]: ind for ind in indicators}
        self.assertEqual(ind_map["1=1"]["count"], 2)
        self.assertEqual(ind_map["; rm -rf"]["count"], 1)
        self.assertIn("Injection", ind_map["1=1"]["categories"])

        # Verify stats distribution
        stats = self.repo.get_stats()
        self.assertEqual(stats["total_scans"], 3)
        self.assertEqual(stats["critical"], 2)
        self.assertEqual(stats["high"], 1)

if __name__ == "__main__":
    unittest.main()
