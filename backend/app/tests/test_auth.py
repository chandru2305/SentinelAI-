import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestAuthEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)

    def test_login_success(self):
        response = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "admin123"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertIn("access_token", data)
        self.assertEqual(data["token_type"], "bearer")

    def test_login_failure_bad_credentials(self):
        response = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "wrongpassword"})
        self.assertEqual(response.status_code, 401)

    def test_unauthorized_access(self):
        response = self.client.get("/api/v1/auth/me")
        self.assertEqual(response.status_code, 401)

    def test_authorized_access(self):
        login_res = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "admin123"})
        token = login_res.json()["access_token"]
        
        response = self.client.get("/api/v1/auth/me", headers={"Authorization": f"Bearer {token}"})
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["username"], "admin")

if __name__ == "__main__":
    unittest.main()
