import unittest
from fastapi.testclient import TestClient
from app.main import app

class TestWebSocketEndpoints(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(app)
        login_res = self.client.post("/api/v1/auth/login", json={"username_or_email": "admin", "password": "admin123"})
        self.token = login_res.json()["access_token"]

    def test_websocket_missing_token_rejection(self):
        # Missing token parameter should close socket
        with self.assertRaises(Exception):
            with self.client.websocket_connect("/api/v1/ws"):
                pass

    def test_websocket_invalid_token_rejection(self):
        # Invalid token parameter should close socket
        with self.assertRaises(Exception):
            with self.client.websocket_connect("/api/v1/ws?token=invalidtoken"):
                pass

    def test_websocket_connection_success(self):
        with self.client.websocket_connect(f"/api/v1/ws?token={self.token}") as websocket:
            self.assertTrue(websocket)

if __name__ == "__main__":
    unittest.main()
