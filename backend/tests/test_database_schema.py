import json
import sqlite3
import unittest
from pathlib import Path

class TestDatabaseSchema(unittest.TestCase):
    def test_json_schema_valid(self):
        schema_path = Path("docs/database_schema.json")
        self.assertTrue(schema_path.exists())
        with open(schema_path, "r", encoding="utf-8") as f:
            data = json.load(f)
        self.assertIn("tables", data)
        self.assertEqual(len(data["tables"]), 4)
        table_names = [t["name"] for t in data["tables"]]
        self.assertListEqual(table_names, ["users", "boards", "columns", "cards"])

    def test_sqlite_ddl_and_cascade(self):
        # Create an in-memory SQLite database
        conn = sqlite3.connect(":memory:")
        conn.execute("PRAGMA foreign_keys = ON;")
        cursor = conn.cursor()

        # Execute DDL
        cursor.execute("""
            CREATE TABLE users (
                id TEXT PRIMARY KEY,
                username TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                created_at TEXT NOT NULL
            );
        """)

        cursor.execute("""
            CREATE TABLE boards (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL UNIQUE,
                title TEXT NOT NULL,
                created_at TEXT NOT NULL,
                FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
            );
        """)

        cursor.execute("""
            CREATE TABLE columns (
                id TEXT PRIMARY KEY,
                board_id TEXT NOT NULL,
                title TEXT NOT NULL,
                position INTEGER NOT NULL,
                FOREIGN KEY (board_id) REFERENCES boards (id) ON DELETE CASCADE
            );
        """)

        cursor.execute("""
            CREATE TABLE cards (
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

        # Insert User
        cursor.execute("INSERT INTO users VALUES ('usr-1', 'user', 'password', '2026-11-14T08:00:00Z')")

        # Duplicate username should raise IntegrityError
        with self.assertRaises(sqlite3.IntegrityError):
            cursor.execute("INSERT INTO users VALUES ('usr-2', 'user', 'password', '2026-11-14T08:00:00Z')")

        # Insert Board
        cursor.execute("INSERT INTO boards VALUES ('brd-1', 'usr-1', 'Default Board', '2026-11-14T08:00:00Z')")

        # Insert Column
        cursor.execute("INSERT INTO columns VALUES ('col-1', 'brd-1', 'To Do', 0)")

        # Insert Cards
        cursor.execute("INSERT INTO cards VALUES ('card-1', 'col-1', 'Task 1', 'Details', 0, '2026-11-14', '2026-11-14')")
        cursor.execute("INSERT INTO cards VALUES ('card-2', 'col-1', 'Task 2', 'Details', 1, '2026-11-14', '2026-11-14')")

        # Verify card count
        cursor.execute("SELECT COUNT(*) FROM cards WHERE column_id = 'col-1'")
        self.assertEqual(cursor.fetchone()[0], 2)

        # Test Cascade Delete: Delete column should automatically delete cards
        cursor.execute("DELETE FROM columns WHERE id = 'col-1'")
        cursor.execute("SELECT COUNT(*) FROM cards WHERE column_id = 'col-1'")
        self.assertEqual(cursor.fetchone()[0], 0)

        # Re-insert column and card to test board cascade
        cursor.execute("INSERT INTO columns VALUES ('col-2', 'brd-1', 'Doing', 0)")
        cursor.execute("INSERT INTO cards VALUES ('card-3', 'col-2', 'Task 3', 'Details', 0, '2026-11-14', '2026-11-14')")

        # Delete User should cascade to board, columns, and cards
        cursor.execute("DELETE FROM users WHERE id = 'usr-1'")
        cursor.execute("SELECT COUNT(*) FROM boards WHERE id = 'brd-1'")
        self.assertEqual(cursor.fetchone()[0], 0)
        cursor.execute("SELECT COUNT(*) FROM columns WHERE id = 'col-2'")
        self.assertEqual(cursor.fetchone()[0], 0)
        cursor.execute("SELECT COUNT(*) FROM cards WHERE id = 'card-3'")
        self.assertEqual(cursor.fetchone()[0], 0)

        conn.close()

if __name__ == "__main__":
    unittest.main()
