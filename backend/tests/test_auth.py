import asyncio
import unittest
from fastapi import Response, HTTPException
from backend.app.auth import login, logout, get_current_user_status, require_authenticated_user, LoginRequest, ACTIVE_SESSIONS

class TestAuth(unittest.TestCase):
    def setUp(self):
        ACTIVE_SESSIONS.clear()

    def test_login_success(self):
        response = Response()
        req = LoginRequest(username="user", password="password")
        res = asyncio.run(login(req, response))
        self.assertEqual(res["status"], "ok")
        self.assertEqual(res["user"]["username"], "user")
        self.assertEqual(len(ACTIVE_SESSIONS), 1)

    def test_login_failure(self):
        response = Response()
        req = LoginRequest(username="user", password="wrong_password")
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(login(req, response))
        self.assertEqual(ctx.exception.status_code, 401)
        self.assertEqual(len(ACTIVE_SESSIONS), 0)

    def test_auth_me_unauthenticated(self):
        status = asyncio.run(get_current_user_status(None))
        self.assertFalse(status.authenticated)
        self.assertIsNone(status.user)

    def test_auth_me_authenticated(self):
        response = Response()
        req = LoginRequest(username="user", password="password")
        asyncio.run(login(req, response))
        session_id = list(ACTIVE_SESSIONS.keys())[0]

        status = asyncio.run(get_current_user_status(session_id))
        self.assertTrue(status.authenticated)
        self.assertEqual(status.user.username, "user")

    def test_logout(self):
        response = Response()
        req = LoginRequest(username="user", password="password")
        asyncio.run(login(req, response))
        session_id = list(ACTIVE_SESSIONS.keys())[0]

        logout_res = asyncio.run(logout(response, session_id))
        self.assertEqual(logout_res["status"], "ok")
        self.assertEqual(len(ACTIVE_SESSIONS), 0)

        # Checking status after logout
        status = asyncio.run(get_current_user_status(session_id))
        self.assertFalse(status.authenticated)

    def test_require_authenticated_user(self):
        with self.assertRaises(HTTPException) as ctx:
            require_authenticated_user(None)
        self.assertEqual(ctx.exception.status_code, 401)

        # Valid session
        ACTIVE_SESSIONS["test-session"] = {"username": "user"}
        user = require_authenticated_user("test-session")
        self.assertEqual(user, "user")

if __name__ == "__main__":
    unittest.main()
