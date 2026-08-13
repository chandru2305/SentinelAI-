import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAIServiceEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        login_res = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "admin123"})
        self.token = login_res.json()["access_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}

    def test_ai_status(self):
        res = self.client.get("/api/v1/ai/status", headers=self.headers)
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("status", data)

    def test_ai_analyze_offline_handling(self):
        # AI server may be offline in dev/test, endpoint should gracefully handle offline or return response
        res = self.client.post(
            "/api/v1/ai/analyze",
            json={"text": "Analyze this suspicious SQL payload"},
            headers=self.headers
        )
        # Should return 200 with fallback message or active response, or 503 if explicitly configured
        self.assertIn(res.status_code, [200, 503])

if __name__ == "__main__":
    unittest.main()
