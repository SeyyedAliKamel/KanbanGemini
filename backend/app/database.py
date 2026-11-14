import os
import sqlite3
from datetime import datetime, timezone
from pathlib import Path
from typing import Optional

DEFAULT_DB_PATH = Path(__file__).resolve().parent.parent.parent / "kanban.db"

def get_db_path() -> str:
    return os.environ.get("DATABASE_PATH", str(DEFAULT_DB_PATH))

def get_connection(db_path: Optional[str] = None) -> sqlite3.Connection:
    path = db_path or get_db_path()
    conn = sqlite3.connect(path)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON;")
    return conn

def init_db(db_path: Optional[str] = None):
    conn = get_connection(db_path)
    cursor = conn.cursor()

    # Create tables
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT UNIQUE NOT NULL,
            password_hash TEXT NOT NULL,
            created_at TEXT NOT NULL
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS boards (
            id TEXT PRIMARY KEY,
            user_id TEXT NOT NULL UNIQUE,
            title TEXT NOT NULL,
            created_at TEXT NOT NULL,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS columns (
            id TEXT PRIMARY KEY,
            board_id TEXT NOT NULL,
            title TEXT NOT NULL,
            position INTEGER NOT NULL,
            FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
        );
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS cards (
            id TEXT PRIMARY KEY,
            column_id TEXT NOT NULL,
            title TEXT NOT NULL,
            details TEXT NOT NULL DEFAULT '',
            position INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            FOREIGN KEY (column_id) REFERENCES columns (id) ON DELETE CASCADE
        );
    """)

    conn.commit()

    # Check if default user exists
    cursor.execute("SELECT id FROM users WHERE username = 'user'")
    user_row = cursor.fetchone()

    now = datetime.now(timezone.utc).isoformat()

    if not user_row:
        user_id = "usr_default"
        cursor.execute(
            "INSERT INTO users (id, username, password_hash, created_at) VALUES (?, ?, ?, ?)",
            (user_id, "user", "password", now)
        )
    else:
        user_id = user_row["id"]

    # Check if board exists for user
    cursor.execute("SELECT id FROM boards WHERE user_id = ?", (user_id,))
    board_row = cursor.fetchone()

    if not board_row:
        board_id = "brd_user"
        cursor.execute(
            "INSERT INTO boards (id, user_id, title, created_at) VALUES (?, ?, ?, ?)",
            (board_id, user_id, "Cyber Matrix Board", now)
        )

        # Seed standard initial columns and dummy cards
        initial_columns = [
            ("col-1", "System Backlog", 0, [
                ("card-1", "Neural Interface Driver", "Calibrate latency thresholds for real-time synap-link communication protocols."),
                ("card-2", "Subnet Traffic Analyzer", "Implement deep packet inspection for perimeter proxy routing anomalies."),
                ("card-3", "Quantum Key Exchange", "Audit cryptographic handshakes across distributed consensus nodes.")
            ]),
            ("col-2", "Architecture & UI", 1, [
                ("card-4", "HUD Glow Shaders", "Optimize WebGL rendering pipelines for ambient neon edge illumination."),
                ("card-5", "Data Matrix Grid", "Design high-density responsive matrix views for telemetry dashboards.")
            ]),
            ("col-3", "Active Development", 2, [
                ("card-6", "Cyberdeck Auth Flow", "Refactor multi-vector biometric validation tokens for gateway endpoints."),
                ("card-7", "Memory Buffer Sync", "Patch memory leaks during rapid state dehydration across background workers.")
            ]),
            ("col-4", "Security & Review", 3, [
                ("card-8", "Firewall Breach Simulation", "Run red-team penetration scripts against edge micro-service clusters.")
            ]),
            ("col-5", "Production Deployed", 4, [
                ("card-9", "Core Kernel Patch v4.2", "Deployed zero-downtime micro-kernel update to main edge nodes."),
                ("card-10", "Mainframe Gateway API", "Exposed unified gRPC endpoints for client telemetry consumption.")
            ]),
        ]

        for col_id, title, pos, cards in initial_columns:
            cursor.execute(
                "INSERT INTO columns (id, board_id, title, position) VALUES (?, ?, ?, ?)",
                (col_id, board_id, title, pos)
            )
            for card_pos, (card_id, card_title, card_details) in enumerate(cards):
                cursor.execute(
                    """
                    INSERT INTO cards (id, column_id, title, details, position, created_at, updated_at)
                    VALUES (?, ?, ?, ?, ?, ?, ?)
                    """,
                    (card_id, col_id, card_title, card_details, card_pos, now, now)
                )

        conn.commit()

    conn.close()
