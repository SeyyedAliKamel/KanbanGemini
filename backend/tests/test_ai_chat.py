import json
import os
import sqlite3
import tempfile
import unittest
from unittest.mock import patch

from backend.app.database import init_db
from backend.app.schemas import (
    BoardResponse,
    ChatMessage,
    CardAction,
    AIChatRequest,
)
from backend.app.services.ai_service import (
    build_system_prompt,
    build_chat_messages,
    parse_ai_response,
    validate_and_execute_actions,
)
from backend.app.routers.board import fetch_full_board
from backend.app.routers.ai import chat_with_ai

class TestAIChat(unittest.IsolatedAsyncioTestCase):
    def setUp(self):
        self.temp_db = tempfile.NamedTemporaryFile(suffix=".db", delete=False)
        self.temp_db_path = self.temp_db.name
        self.temp_db.close()

        os.environ["DATABASE_PATH"] = self.temp_db_path
        init_db(self.temp_db_path)

        self.conn = sqlite3.connect(self.temp_db_path)
        self.conn.row_factory = sqlite3.Row
        self.conn.execute("PRAGMA foreign_keys = ON;")

    def tearDown(self):
        self.conn.close()
        if os.path.exists(self.temp_db_path):
            os.remove(self.temp_db_path)

    def test_build_system_prompt_and_messages(self):
        board = fetch_full_board(self.conn, "user")
        history = [
            ChatMessage(role="user", content="Hello assistant"),
            ChatMessage(role="assistant", content="Hello user, how can I help?"),
        ]
        new_msg = "Please add a card to System Backlog"

        messages = build_chat_messages(board, history, new_msg)

        self.assertEqual(len(messages), 4)
        self.assertEqual(messages[0]["role"], "system")
        self.assertIn("CURRENT BOARD STATE:", messages[0]["content"])
        self.assertIn("System Backlog", messages[0]["content"])
        self.assertIn("Neural Interface Driver", messages[0]["content"])
        self.assertEqual(messages[1], {"role": "user", "content": "Hello assistant"})
        self.assertEqual(messages[2], {"role": "assistant", "content": "Hello user, how can I help?"})
        self.assertEqual(messages[3], {"role": "user", "content": new_msg})

    def test_parse_ai_response_markdown_json(self):
        raw = """Here is your response:
```json
{
  "response": "Card created successfully.",
  "actions": [
    {
      "action": "create_card",
      "column_id": "col-1",
      "title": "Matrix Analyzer",
      "details": "Inspect quantum nodes."
    }
  ]
}
```
Have a good day!"""

        parsed = parse_ai_response(raw)
        self.assertEqual(parsed.response, "Card created successfully.")
        self.assertEqual(len(parsed.actions), 1)
        self.assertEqual(parsed.actions[0].action, "create_card")
        self.assertEqual(parsed.actions[0].title, "Matrix Analyzer")
        self.assertEqual(parsed.actions[0].column_id, "col-1")

    def test_parse_ai_response_plain_text(self):
        raw = "You currently have 10 tasks in your backlog across 5 columns."
        parsed = parse_ai_response(raw)
        self.assertEqual(parsed.response, raw)
        self.assertEqual(len(parsed.actions), 0)

    @patch("backend.app.routers.ai.send_openrouter_request")
    async def test_chat_text_only_no_board_changes(self, mock_ai):
        mock_ai.return_value = json.dumps({
            "response": "Your board has 5 columns and 10 cards.",
            "actions": []
        })

        req = AIChatRequest(
            message="How many cards do I have?",
            history=[]
        )

        resp = await chat_with_ai(req, username="user")
        self.assertEqual(resp.response, "Your board has 5 columns and 10 cards.")
        self.assertEqual(resp.actions_applied, 0)

        # Verify board cards count is still 10
        total_cards = sum(len(c.cards) for c in resp.board.columns)
        self.assertEqual(total_cards, 10)

    @patch("backend.app.routers.ai.send_openrouter_request")
    async def test_chat_create_card_action(self, mock_ai):
        mock_ai.return_value = json.dumps({
            "response": "I created the card for you.",
            "actions": [
                {
                    "action": "create_card",
                    "column_id": "col-1",
                    "title": "AI Created Task",
                    "details": "Details provided by AI assistant"
                }
            ]
        })

        req = AIChatRequest(
            message="Add a card called AI Created Task to System Backlog",
            history=[]
        )

        resp = await chat_with_ai(req, username="user")
        self.assertEqual(resp.actions_applied, 1)

        # Verify card is present in returned board
        col1 = next(c for c in resp.board.columns if c.id == "col-1")
        self.assertTrue(any(c.title == "AI Created Task" for c in col1.cards))

        # Verify card is persisted in SQLite
        cur = self.conn.cursor()
        cur.execute("SELECT * FROM cards WHERE title = 'AI Created Task'")
        row = cur.fetchone()
        self.assertIsNotNone(row)
        self.assertEqual(row["details"], "Details provided by AI assistant")
        self.assertEqual(row["column_id"], "col-1")

    @patch("backend.app.routers.ai.send_openrouter_request")
    async def test_chat_edit_card_action(self, mock_ai):
        mock_ai.return_value = json.dumps({
            "response": "I updated the card title and details.",
            "actions": [
                {
                    "action": "edit_card",
                    "card_id": "card-1",
                    "title": "Updated Neural Driver",
                    "details": "Upgraded latency calibrations."
                }
            ]
        })

        req = AIChatRequest(
            message="Update card-1 title to Updated Neural Driver",
            history=[]
        )

        resp = await chat_with_ai(req, username="user")
        self.assertEqual(resp.actions_applied, 1)

        # Verify in returned board
        col1 = next(c for c in resp.board.columns if c.id == "col-1")
        updated_card = next(c for c in col1.cards if c.id == "card-1")
        self.assertEqual(updated_card.title, "Updated Neural Driver")
        self.assertEqual(updated_card.details, "Upgraded latency calibrations.")

        # Verify persisted in SQLite
        cur = self.conn.cursor()
        cur.execute("SELECT title, details FROM cards WHERE id = 'card-1'")
        row = cur.fetchone()
        self.assertEqual(row["title"], "Updated Neural Driver")
        self.assertEqual(row["details"], "Upgraded latency calibrations.")

    @patch("backend.app.routers.ai.send_openrouter_request")
    async def test_chat_move_card_action(self, mock_ai):
        mock_ai.return_value = json.dumps({
            "response": "Moved card-1 to Production Deployment.",
            "actions": [
                {
                    "action": "move_card",
                    "card_id": "card-1",
                    "target_column_id": "col-5"
                }
            ]
        })

        req = AIChatRequest(
            message="Move card-1 to Production Deployment",
            history=[]
        )

        resp = await chat_with_ai(req, username="user")
        self.assertEqual(resp.actions_applied, 1)

        col5 = next(c for c in resp.board.columns if c.id == "col-5")
        self.assertTrue(any(c.id == "card-1" for c in col5.cards))

        col1 = next(c for c in resp.board.columns if c.id == "col-1")
        self.assertFalse(any(c.id == "card-1" for c in col1.cards))

        # Check SQLite persistence
        cur = self.conn.cursor()
        cur.execute("SELECT column_id FROM cards WHERE id = 'card-1'")
        self.assertEqual(cur.fetchone()["column_id"], "col-5")

    @patch("backend.app.routers.ai.send_openrouter_request")
    async def test_invalid_column_rejects_and_rolls_back(self, mock_ai):
        mock_ai.return_value = json.dumps({
            "response": "I tried to add it to a nonexistent column.",
            "actions": [
                {
                    "action": "create_card",
                    "column_id": "nonexistent-column-999",
                    "title": "Ghost Task"
                }
            ]
        })

        req = AIChatRequest(
            message="Add Ghost Task",
            history=[]
        )

        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            await chat_with_ai(req, username="user")

        self.assertEqual(ctx.exception.status_code, 400)
        self.assertIn("does not exist", ctx.exception.detail)

        # Verify board was NOT modified
        cur = self.conn.cursor()
        cur.execute("SELECT COUNT(*) FROM cards WHERE title = 'Ghost Task'")
        self.assertEqual(cur.fetchone()[0], 0)

    @patch("backend.app.routers.ai.send_openrouter_request")
    async def test_atomic_rollback_on_partial_failure(self, mock_ai):
        # AI returns one valid action followed by an invalid action
        mock_ai.return_value = json.dumps({
            "response": "Adding one card then editing a ghost card.",
            "actions": [
                {
                    "action": "create_card",
                    "column_id": "col-1",
                    "title": "Valid First Card"
                },
                {
                    "action": "edit_card",
                    "card_id": "nonexistent-card-999",
                    "title": "Should Fail"
                }
            ]
        })

        req = AIChatRequest(
            message="Do both operations",
            history=[]
        )

        from fastapi import HTTPException
        with self.assertRaises(HTTPException) as ctx:
            await chat_with_ai(req, username="user")

        self.assertEqual(ctx.exception.status_code, 400)

        # Verify the first card was rolled back and NOT created
        cur = self.conn.cursor()
        cur.execute("SELECT COUNT(*) FROM cards WHERE title = 'Valid First Card'")
        self.assertEqual(cur.fetchone()[0], 0)

    @patch("backend.app.routers.ai.send_openrouter_request")
    async def test_chat_history_not_stored_in_database(self, mock_ai):
        mock_ai.return_value = json.dumps({
            "response": "Here is response 1",
            "actions": []
        })

        # Send multiple requests with history
        history = [
            ChatMessage(role="user", content="Turn 1"),
            ChatMessage(role="assistant", content="Response 1"),
            ChatMessage(role="user", content="Turn 2"),
        ]

        req = AIChatRequest(
            message="Turn 3",
            history=history
        )

        await chat_with_ai(req, username="user")

        # Verify database tables
        cur = self.conn.cursor()
        cur.execute("SELECT name FROM sqlite_master WHERE type='table'")
        tables = [row["name"] for row in cur.fetchall()]

        # Only the 4 defined tables should exist
        expected_tables = {"users", "boards", "columns", "cards"}
        self.assertEqual(set(tables), expected_tables)

        # Ensure no table has any chat history column
        for tbl in expected_tables:
            cur.execute(f"PRAGMA table_info({tbl})")
            cols = [c["name"] for c in cur.fetchall()]
            self.assertNotIn("history", cols)
            self.assertNotIn("chat", cols)
            self.assertNotIn("message", cols)

if __name__ == "__main__":
    unittest.main()
