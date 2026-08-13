import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestThreatDetectionEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        login_res = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "admin123"})
        self.token = login_res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_sql_injection_detection(self):
        res = self.client.post(
            "/api/v1/threats/analyze",
            json={"text": "SELECT * FROM users WHERE username = 'admin' OR '1'='1'"},
            headers=self.headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["detected"])
        self.assertGreater(data["overall_risk"], 0)
        self.assertTrue(any(t["rule_name"] == "SQL Injection" for t in data["threats"]))

    def test_xss_detection(self):
        res = self.client.post(
            "/api/v1/threats/analyze",
            json={"text": "<script>alert('XSS Attack')</script>"},
            headers=self.headers
        )
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertTrue(data["detected"])
        self.assertTrue(any("XSS" in t["rule_name"] or "Cross Site" in t["rule_name"] for t in data["threats"]))

    def test_unauthorized_threat_scan(self):
        res = self.client.post(
            "/api/v1/threats/analyze",
            json={"text": "normal text"}
        )
        self.assertEqual(res.status_code, 401)

if __name__ == "__main__":
    unittest.main()
