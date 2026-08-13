import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestDashboardAndTelemetryEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        login_res = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "admin123"})
        self.token = login_res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_dashboard_summary(self):
        res = self.client.get("/api/v1/dashboard/summary", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("threats_detected", data)
        self.assertIn("system_health", data)

    def test_dashboard_activity(self):
        res = self.client.get("/api/v1/dashboard/activity", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

    def test_mitre_aggregation(self):
        res = self.client.get("/api/v1/threats/mitre", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("tactics", data)
        self.assertIn("techniques", data)

    def test_threat_intelligence(self):
        res = self.client.get("/api/v1/threats/intelligence", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("recent_categories", data)
        self.assertIn("indicators", data)

    def test_indicators_extraction(self):
        res = self.client.get("/api/v1/threats/indicators", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        self.assertIsInstance(res.json(), list)

if __name__ == "__main__":
    unittest.main()
