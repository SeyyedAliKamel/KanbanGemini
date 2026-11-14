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
        self.assertIn("Cyberpunk Kanban Board", content)
        self.assertIn("language-toggle-btn", content)

    def test_serve_frontend_refresh_and_fallback(self):
        # Direct URL or deep route fallback to index.html
        response = asyncio.run(serve_frontend("board"))
        self.assertEqual(response.status_code, 200)
        with open(response.path, "r", encoding="utf-8") as f:
            content = f.read()
        self.assertIn("Cyberpunk Kanban Board", content)

if __name__ == "__main__":
    unittest.main()
