import os
import tempfile
import unittest
from datetime import datetime, timezone
from fastapi import HTTPException

from backend.app.database import init_db, get_connection
from backend.app.routers.board import (
    get_board, create_column, rename_column, delete_column,
    create_card, update_card, move_card, delete_card
)
from backend.app.schemas import (
    CreateColumnRequest, RenameColumnRequest,
    CreateCardRequest, UpdateCardRequest, MoveCardRequest
)

class TestBoardAPI(unittest.TestCase):
    def setUp(self):
        # Create a unique temporary database file for each test
        self.temp_db = tempfile.NamedTemporaryFile(delete=False, suffix=".db")
        self.temp_db.close()
        self.db_path = self.temp_db.name
        os.environ["DATABASE_PATH"] = self.db_path
        init_db(self.db_path)

    def tearDown(self):
        if os.path.exists(self.db_path):
            os.remove(self.db_path)

    def test_get_board_initial_seed(self):
        import asyncio
        board = asyncio.run(get_board("user"))
        self.assertEqual(board.title, "Cyber Matrix Board")
        self.assertEqual(len(board.columns), 5)
        # Check initial cards count
        total_cards = sum(len(c.cards) for c in board.columns)
        self.assertEqual(total_cards, 10)
        self.assertEqual(board.columns[0].title, "System Backlog")

    def test_column_crud(self):
        import asyncio
        # Create Column
        create_req = CreateColumnRequest(title="Staging Environment")
        new_col = asyncio.run(create_column(create_req, "user"))
        self.assertEqual(new_col.title, "Staging Environment")
        self.assertEqual(new_col.position, 5)

        # Rename Column
        rename_req = RenameColumnRequest(title="Pre-Production")
        renamed_col = asyncio.run(rename_column(new_col.id, rename_req, "user"))
        self.assertEqual(renamed_col.title, "Pre-Production")

        # Delete Column
        del_res = asyncio.run(delete_column(new_col.id, "user"))
        self.assertEqual(del_res["status"], "ok")

        # Verify it is deleted
        board = asyncio.run(get_board("user"))
        self.assertEqual(len(board.columns), 5)

    def test_card_crud_and_move(self):
        import asyncio
        # Create Card in col-1
        create_req = CreateCardRequest(column_id="col-1", title="New Subroutine", details="Optimized worker threads")
        new_card = asyncio.run(create_card(create_req, "user"))
        self.assertEqual(new_card.title, "New Subroutine")
        self.assertEqual(new_card.column_id, "col-1")

        # Update Card
        update_req = UpdateCardRequest(title="Updated Subroutine", details="Refactored worker threads")
        updated_card = asyncio.run(update_card(new_card.id, update_req, "user"))
        self.assertEqual(updated_card.title, "Updated Subroutine")
        self.assertEqual(updated_card.details, "Refactored worker threads")

        # Move Card to col-2 position 0
        move_req = MoveCardRequest(target_column_id="col-2", position=0)
        move_res = asyncio.run(move_card(new_card.id, move_req, "user"))
        self.assertEqual(move_res["status"], "ok")

        # Verify board reflects move
        board = asyncio.run(get_board("user"))
        col2 = next(c for c in board.columns if c.id == "col-2")
        self.assertEqual(col2.cards[0].id, new_card.id)

        # Delete Card
        del_res = asyncio.run(delete_card(new_card.id, "user"))
        self.assertEqual(del_res["status"], "ok")

        # Verify card is gone
        board = asyncio.run(get_board("user"))
        col2_after = next(c for c in board.columns if c.id == "col-2")
        self.assertNotIn(new_card.id, [c.id for c in col2_after.cards])

    def test_multi_user_isolation(self):
        import asyncio
        conn = get_connection(self.db_path)
        now = datetime.now(timezone.utc).isoformat()
        # Seed another user
        conn.execute("INSERT INTO users VALUES ('usr-other', 'other_user', 'pass', ?)", (now,))
        conn.execute("INSERT INTO boards VALUES ('brd-other', 'usr-other', 'Other Board', ?)", (now,))
        conn.execute("INSERT INTO columns VALUES ('col-other', 'brd-other', 'Secret Column', 0)", ())
        conn.commit()
        conn.close()

        # user cannot rename or delete other_user's column
        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(rename_column("col-other", RenameColumnRequest(title="Hacked"), "user"))
        self.assertEqual(ctx.exception.status_code, 404)

        with self.assertRaises(HTTPException) as ctx:
            asyncio.run(delete_column("col-other", "user"))
        self.assertEqual(ctx.exception.status_code, 404)

        # other_user sees own board
        other_board = asyncio.run(get_board("other_user"))
        self.assertEqual(other_board.title, "Other Board")
        self.assertEqual(len(other_board.columns), 1)
        self.assertEqual(other_board.columns[0].title, "Secret Column")

if __name__ == "__main__":
    unittest.main()
