import json
import os
import secrets
import sqlite3
import urllib.error
import urllib.request
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, List, Optional

from backend.app.schemas import (
    BoardResponse,
    ChatMessage,
    CardAction,
    AIModelOutput
)

OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions"
DEFAULT_MODEL = "openai/gpt-oss-120b"

def get_api_key() -> str:
    # First check environment variable
    key = os.environ.get("OPENROUTER_API_KEY")
    if key and key.strip():
        return key.strip()

    # Try loading from root .env file
    env_file = Path(__file__).resolve().parent.parent.parent.parent / ".env"
    if env_file.is_file():
        try:
            with open(env_file, "r", encoding="utf-8") as f:
                for line in f:
                    line = line.strip()
                    if line.startswith("OPENROUTER_API_KEY="):
                        val = line.split("=", 1)[1].strip().strip('"').strip("'")
                        if val:
                            return val
        except Exception:
            pass

    return ""

def send_openrouter_request(
    messages: List[Dict[str, str]],
    model: Optional[str] = None,
    api_key: Optional[str] = None,
    timeout: int = 30,
) -> str:
    key = api_key or get_api_key()
    if not key:
        raise ValueError("OPENROUTER_API_KEY is not configured in .env or environment")

    target_model = model or DEFAULT_MODEL

    payload = {
        "model": target_model,
        "messages": messages,
        "temperature": 0.2,
    }

    req_data = json.dumps(payload).encode("utf-8")
    headers = {
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json",
        "HTTP-Referer": "http://localhost:8000",
        "X-Title": "Kanban MVP",
        "User-Agent": "KanbanMVP-Assistant/1.0",
    }

    req = urllib.request.Request(
        OPENROUTER_API_URL,
        data=req_data,
        headers=headers,
        method="POST"
    )

    try:
        with urllib.request.urlopen(req, timeout=timeout) as response:
            res_body = response.read().decode("utf-8")
            data = json.loads(res_body)
            choices = data.get("choices", [])
            if not choices:
                raise RuntimeError("No choices returned from OpenRouter response")
            return choices[0].get("message", {}).get("content", "")
    except urllib.error.HTTPError as e:
        error_body = ""
        try:
            error_body = e.read().decode("utf-8")
        except Exception:
            pass
        raise RuntimeError(f"OpenRouter API error {e.code}: {error_body or e.reason}")
    except urllib.error.URLError as e:
        raise RuntimeError(f"Failed to connect to OpenRouter: {e.reason}")
    except TimeoutError:
        raise TimeoutError(f"OpenRouter request timed out after {timeout} seconds")

def smoke_test_openrouter(api_key: Optional[str] = None) -> str:
    messages = [
        {"role": "user", "content": "Calculate 2+2. Respond with ONLY the single number."}
    ]
    return send_openrouter_request(messages, api_key=api_key, timeout=20)

def build_system_prompt(board: BoardResponse) -> str:
    columns_summary = []
    for col in board.columns:
        cards_summary = []
        for card in col.cards:
            details_part = f' | Details: "{card.details}"' if card.details else ""
            cards_summary.append(f'  - Card ID: "{card.id}", Title: "{card.title}"{details_part}')
        cards_str = "\n".join(cards_summary) if cards_summary else "  (Empty column)"
        columns_summary.append(f'Column ID: "{col.id}", Title: "{col.title}":\n{cards_str}')

    board_text = "\n\n".join(columns_summary)

    return f"""You are the intelligent AI Kanban Assistant for this project management board.
Your job is to assist the user by answering questions, providing recommendations, and managing cards on their board.

CURRENT BOARD STATE:
{board_text}

CAPABILITIES & ACTION PROTOCOL:
You can perform the following card operations on the board:
1. create_card: Create a new card in a specified column.
2. edit_card: Edit an existing card's title and/or details.
3. move_card: Move an existing card to a specified target column.

CRITICAL RULES:
- Never use emojis under any circumstances. Emojis are strictly forbidden.
- Reply to the user in the language they used (if Persian / Farsi, reply in Persian; if English, reply in English).
- Be concise, direct, and helpful.
- You MUST respond in a strict JSON format matching this schema:
{{
  "response": "<Your conversational response to the user in their language>",
  "actions": [
    {{
      "action": "create_card",
      "column_id": "<target column ID>",
      "title": "<card title>",
      "details": "<card details or empty string>"
    }},
    {{
      "action": "edit_card",
      "card_id": "<card ID>",
      "title": "<new title>",
      "details": "<new details>"
    }},
    {{
      "action": "move_card",
      "card_id": "<card ID>",
      "target_column_id": "<target column ID>"
    }}
  ]
}}
- If no board modification is required (e.g. conversational questions, greetings, status review), "actions" must be [].
- When performing actions, use the exact Column IDs and Card IDs from the CURRENT BOARD STATE above.
"""

def build_chat_messages(
    board: BoardResponse,
    history: List[ChatMessage],
    new_message: str
) -> List[Dict[str, str]]:
    system_prompt = build_system_prompt(board)
    messages = [{"role": "system", "content": system_prompt}]
    for msg in history:
        if msg.role in ("user", "assistant"):
            messages.append({"role": msg.role, "content": msg.content})
    messages.append({"role": "user", "content": new_message})
    return messages

def parse_ai_response(raw_text: str) -> AIModelOutput:
    clean = raw_text.strip()

    # Strip markdown code blocks if present
    if "```json" in clean:
        parts = clean.split("```json", 1)[1].split("```", 1)
        clean = parts[0].strip()
    elif "```" in clean:
        parts = clean.split("```", 1)[1].split("```", 1)
        clean = parts[0].strip()

    start_idx = clean.find("{")
    end_idx = clean.rfind("}")
    if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
        json_str = clean[start_idx : end_idx + 1]
        try:
            data = json.loads(json_str)
            if isinstance(data, dict):
                response_text = data.get("response") or data.get("response_text") or data.get("message") or ""
                raw_actions = data.get("actions", [])
                actions = []
                if isinstance(raw_actions, list):
                    for a in raw_actions:
                        if isinstance(a, dict) and "action" in a:
                            actions.append(CardAction(**a))
                return AIModelOutput(response=str(response_text), actions=actions)
        except Exception:
            pass

    return AIModelOutput(response=raw_text.strip(), actions=[])

def validate_and_execute_actions(
    conn: sqlite3.Connection,
    board_id: str,
    actions: List[CardAction]
) -> int:
    if not actions:
        return 0

    cursor = conn.cursor()

    # Fetch columns for this board
    cursor.execute("SELECT id, title, position FROM columns WHERE board_id = ?", (board_id,))
    col_rows = cursor.fetchall()
    columns_by_id = {row["id"]: row for row in col_rows}
    columns_by_title = {row["title"].strip().lower(): row["id"] for row in col_rows}

    # Fetch cards belonging to this board's columns
    cursor.execute("""
        SELECT c.id, c.column_id, c.title, c.details, c.position
        FROM cards c
        JOIN columns col ON c.column_id = col.id
        WHERE col.board_id = ?
    """, (board_id,))
    card_rows = cursor.fetchall()
    cards_by_id = {row["id"]: row for row in card_rows}
    cards_by_title = {row["title"].strip().lower(): row["id"] for row in card_rows}

    # Step 1: Pre-validation of all actions before ANY DB modification
    validated_ops = []
    for act in actions:
        if act.action == "create_card":
            if not act.title or not act.title.strip():
                raise ValueError("Card creation requires a non-empty title")

            col_id = None
            if act.column_id and act.column_id in columns_by_id:
                col_id = act.column_id
            elif act.column_title and act.column_title.strip().lower() in columns_by_title:
                col_id = columns_by_title[act.column_title.strip().lower()]
            elif act.column_id and act.column_id.strip().lower() in columns_by_title:
                col_id = columns_by_title[act.column_id.strip().lower()]

            if not col_id:
                target_name = act.column_id or act.column_title or "unknown"
                raise ValueError(f"Target column '{target_name}' does not exist on this board")

            validated_ops.append({
                "action": "create_card",
                "column_id": col_id,
                "title": act.title.strip(),
                "details": act.details or ""
            })

        elif act.action == "edit_card":
            card_id = None
            if act.card_id and act.card_id in cards_by_id:
                card_id = act.card_id
            elif act.card_id and act.card_id.strip().lower() in cards_by_title:
                card_id = cards_by_title[act.card_id.strip().lower()]
            elif act.title and act.title.strip().lower() in cards_by_title:
                card_id = cards_by_title[act.title.strip().lower()]

            if not card_id:
                target_card = act.card_id or act.title or "unknown"
                raise ValueError(f"Target card '{target_card}' does not exist on this board")

            if act.title is None and act.details is None:
                raise ValueError(f"Card update for '{card_id}' requires at least title or details")

            validated_ops.append({
                "action": "edit_card",
                "card_id": card_id,
                "title": act.title,
                "details": act.details
            })

        elif act.action == "move_card":
            card_id = None
            if act.card_id and act.card_id in cards_by_id:
                card_id = act.card_id
            elif act.card_id and act.card_id.strip().lower() in cards_by_title:
                card_id = cards_by_title[act.card_id.strip().lower()]

            if not card_id:
                target_card = act.card_id or "unknown"
                raise ValueError(f"Target card '{target_card}' does not exist on this board")

            target_col_id = None
            raw_target = act.target_column_id or act.target_column_title
            if raw_target and raw_target in columns_by_id:
                target_col_id = raw_target
            elif raw_target and raw_target.strip().lower() in columns_by_title:
                target_col_id = columns_by_title[raw_target.strip().lower()]

            if not target_col_id:
                raise ValueError(f"Target column '{raw_target}' does not exist on this board")

            validated_ops.append({
                "action": "move_card",
                "card_id": card_id,
                "target_column_id": target_col_id,
                "position": act.position
            })

        else:
            raise ValueError(f"Unsupported board action '{act.action}'")

    # Step 2: Atomic execution
    try:
        now = datetime.now(timezone.utc).isoformat()
        for op in validated_ops:
            if op["action"] == "create_card":
                new_card_id = f"card-{secrets.token_hex(4)}"
                cursor.execute(
                    "SELECT COALESCE(MAX(position), -1) + 1 FROM cards WHERE column_id = ?",
                    (op["column_id"],)
                )
                next_pos = cursor.fetchone()[0]
                cursor.execute(
                    """
                    INSERT INTO cards (id, column_id, title, details, position, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (new_card_id, op["column_id"], op["title"], op["details"], next_pos, now, now)
                )

            elif op["action"] == "edit_card":
                cursor.execute("SELECT title, details FROM cards WHERE id = ?", (op["card_id"],))
                existing = cursor.fetchone()
                new_title = op["title"] if op["title"] is not None else existing["title"]
                new_details = op["details"] if op["details"] is not None else existing["details"]
                cursor.execute(
                    "UPDATE cards SET title = ?, details = ?, updated_at = ? WHERE id = ?",
                    (new_title, new_details, now, op["card_id"])
                )

            elif op["action"] == "move_card":
                cursor.execute("SELECT column_id, position FROM cards WHERE id = ?", (op["card_id"],))
                card_data = cursor.fetchone()
                source_col_id = card_data["column_id"]
                source_pos = card_data["position"]
                target_col_id = op["target_column_id"]

                cursor.execute(
                    "SELECT COALESCE(MAX(position), -1) + 1 FROM cards WHERE column_id = ?",
                    (target_col_id,)
                )
                max_pos = cursor.fetchone()[0]
                target_pos = op["position"] if op["position"] is not None else max_pos

                if source_col_id == target_col_id:
                    if source_pos < target_pos:
                        cursor.execute("""
                            UPDATE cards SET position = position - 1
                            WHERE column_id = ? AND position > ? AND position <= ?
                        """, (source_col_id, source_pos, target_pos))
                    elif source_pos > target_pos:
                        cursor.execute("""
                            UPDATE cards SET position = position + 1
                            WHERE column_id = ? AND position >= ? AND position < ?
                        """, (source_col_id, target_pos, source_pos))
                    cursor.execute("""
                        UPDATE cards SET position = ?, updated_at = ? WHERE id = ?
                    """, (target_pos, now, op["card_id"]))
                else:
                    cursor.execute("""
                        UPDATE cards SET position = position - 1
                        WHERE column_id = ? AND position > ?
                    """, (source_col_id, source_pos))
                    cursor.execute("""
                        UPDATE cards SET position = position + 1
                        WHERE column_id = ? AND position >= ?
                    """, (target_col_id, target_pos))
                    cursor.execute("""
                        UPDATE cards SET column_id = ?, position = ?, updated_at = ?
                        WHERE id = ?
                    """, (target_col_id, target_pos, now, op["card_id"]))

        conn.commit()
        return len(validated_ops)
    except Exception as e:
        conn.rollback()
        raise e
