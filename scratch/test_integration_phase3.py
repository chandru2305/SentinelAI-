import os
import sys
import unittest

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "backend")))

os.environ["JWT_SECRET"] = "supersecretkey12345678901234567890"
os.environ["ADMIN_USERNAME"] = "admin"
os.environ["ADMIN_PASSWORD"] = "admin123"

from fastapi.testclient import TestClient
from app.main import app
from app.database.base import Base
from app.database.session import engine, SessionLocal
from app.threats.models import ThreatRecord

class TestPhase3Integration(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        Base.metadata.create_all(bind=engine)

    def setUp(self):
        self.client = TestClient(app)
        login_res = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "admin123"})
        self.assertEqual(login_res.status_code, 200)
        self.token = login_res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_end_to_end_phase3_response_security_flow(self):
        # 1. Submit Safe Response -> ALLOW
        safe_res = self.client.post(
            "/api/v1/ai-security/inspect-response",
            json={"response": "The security posture report for SentinelAI has been compiled cleanly.", "model": "llama3.2"},
            headers=self.headers
        )
        self.assertEqual(safe_res.status_code, 200)
        safe_data = safe_res.json()
        self.assertTrue(safe_data["safe"])
        self.assertEqual(safe_data["policy_decision"], "ALLOW")
        self.assertEqual(safe_data["risk_score"], 0)

        # 2. Submit Leaked Synthetic Secret Response -> BLOCK + Persistence
        synthetic_secret = "sk-proj-9999999999abcdef9999999999abcdef"
        threat_res = self.client.post(
            "/api/v1/ai-security/inspect-response",
            json={"response": f"Generated API Key: {synthetic_secret}", "model": "llama3.2"},
            headers=self.headers
        )
        self.assertEqual(threat_res.status_code, 200)
        threat_data = threat_res.json()
        self.assertFalse(threat_data["safe"])
        self.assertEqual(threat_data["policy_decision"], "BLOCK")
        self.assertEqual(threat_data["severity"], "CRITICAL")
        self.assertGreaterEqual(threat_data["risk_score"], 90)

        # 3. Verify Database Persistence (Masked Indicators)
        db = SessionLocal()
        try:
            records = db.query(ThreatRecord).filter(ThreatRecord.category == "data_leakage").all()
            self.assertTrue(len(records) > 0)
            latest = records[-1]
            self.assertIn("LLM Response", latest.source)
            self.assertEqual(latest.severity, "CRITICAL")
            # Verify raw secret is NOT stored unmasked in database indicators
            indicators_json = str(latest.indicators)
            self.assertNotIn(synthetic_secret, indicators_json)
            self.assertIn("sk-****", indicators_json)
        finally:
            db.close()

if __name__ == "__main__":
    unittest.main()
