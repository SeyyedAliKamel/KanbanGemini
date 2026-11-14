import asyncio
import unittest
from backend.app.main import health_check, serve_frontend

class TestAPIDirect(unittest.TestCase):
    def test_health_check(self):
        data = asyncio.run(health_check())
        self.assertEqual(data["status"], "ok")
        self.assertIn("Backend API is functional", data["message"])

    def test_serve_frontend_root(self):
        response = asyncio.run(serve_frontend(""))
        self.assertEqual(response.status_code, 200)
        with open(response.path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("Kanban MVP - Base Setup", content)

if __name__ == "__main__":
    unittest.main()
