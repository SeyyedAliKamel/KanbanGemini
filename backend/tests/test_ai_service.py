import json
import unittest
from unittest.mock import patch, MagicMock
from urllib.error import HTTPError, URLError

from backend.app.services.ai_service import (
    send_openrouter_request, smoke_test_openrouter, DEFAULT_MODEL, OPENROUTER_API_URL
)

class TestAIService(unittest.TestCase):
    def test_missing_api_key_raises_value_error(self):
        with patch("backend.app.services.ai_service.get_api_key", return_value=""):
            with self.assertRaises(ValueError) as ctx:
                send_openrouter_request([{"role": "user", "content": "hello"}], api_key="")
            self.assertIn("OPENROUTER_API_KEY is not configured", str(ctx.exception))

    @patch("urllib.request.urlopen")
    def test_successful_request(self, mock_urlopen):
        # Mock successful OpenRouter response
        fake_response = MagicMock()
        fake_response.read.return_value = json.dumps({
            "id": "gen-123",
            "choices": [
                {
                    "message": {
                        "role": "assistant",
                        "content": "4"
                    }
                }
            ]
        }).encode("utf-8")
        mock_urlopen.return_value.__enter__.return_value = fake_response

        messages = [{"role": "user", "content": "What is 2+2?"}]
        result = send_openrouter_request(messages, api_key="sk-test-key")

        self.assertEqual(result, "4")
        self.assertTrue(mock_urlopen.called)
        req_arg = mock_urlopen.call_args[0][0]
        self.assertEqual(req_arg.full_url, OPENROUTER_API_URL)
        self.assertEqual(req_arg.headers["Authorization"], "Bearer sk-test-key")

        payload = json.loads(req_arg.data.decode("utf-8"))
        self.assertEqual(payload["model"], DEFAULT_MODEL)
        self.assertEqual(payload["messages"], messages)

    @patch("urllib.request.urlopen")
    def test_http_error_handling(self, mock_urlopen):
        err = HTTPError(OPENROUTER_API_URL, 401, "Unauthorized", {}, MagicMock(read=lambda: b'{"error":"invalid_api_key"}'))
        mock_urlopen.side_effect = err

        with self.assertRaises(RuntimeError) as ctx:
            send_openrouter_request([{"role": "user", "content": "hi"}], api_key="invalid-key")
        self.assertIn("OpenRouter API error 401", str(ctx.exception))

    @patch("urllib.request.urlopen")
    def test_timeout_handling(self, mock_urlopen):
        mock_urlopen.side_effect = TimeoutError()

        with self.assertRaises(TimeoutError) as ctx:
            send_openrouter_request([{"role": "user", "content": "hi"}], api_key="sk-key")
        self.assertIn("timed out", str(ctx.exception))

    @patch("backend.app.services.ai_service.send_openrouter_request")
    def test_smoke_test_helper(self, mock_send):
        mock_send.return_value = "4"
        res = smoke_test_openrouter(api_key="sk-test")
        self.assertEqual(res, "4")
        mock_send.assert_called_once()
        self.assertIn("2+2", mock_send.call_args[0][0][0]["content"])

if __name__ == "__main__":
    unittest.main()
