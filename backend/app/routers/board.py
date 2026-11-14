import secrets
from datetime import datetime, timezone
from typing import List
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.auth import require_authenticated_user
from backend.app.database import get_connection
from backend.app.schemas import (
    BoardResponse, ColumnResponse, CardResponse,
    CreateColumnRequest, RenameColumnRequest,
    CreateCardRequest, UpdateCardRequest, MoveCardRequest
)

router = APIRouter(prefix="/api/board", tags=["board"])

def get_user_board(cursor, username: str):
    cursor.execute("SELECT id FROM users WHERE username = ?", (username,))
    user = cursor.fetchone()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    cursor.execute("SELECT * FROM boards WHERE user_id = ?", (user["id"],))
    board = cursor.fetchone()
    if not board:
        raise HTTPException(status_code=404, detail="Board not found")
    return board

def fetch_full_board(conn, username: str) -> BoardResponse:
    cursor = conn.cursor()
    board = get_user_board(cursor, username)
    
    # Fetch columns
    cursor.execute("SELECT * FROM columns WHERE board_id = ? ORDER BY position ASC", (board["id"],))
    column_rows = cursor.fetchall()
    
    columns = []
    for col_row in column_rows:
        cursor.execute("SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC", (col_row["id"],))
        card_rows = cursor.fetchall()
        cards = [CardResponse(**dict(c)) for c in card_rows]
        
        col_dict = dict(col_row)
        col_dict["cards"] = cards
        columns.append(ColumnResponse(**col_dict))
        
    board_dict = dict(board)
    board_dict["columns"] = columns
    return BoardResponse(**board_dict)

@router.get("", response_model=BoardResponse)
async def get_board(username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    try:
        return fetch_full_board(conn, username)
    finally:
        conn.close()

@router.post("/columns", response_model=ColumnResponse)
async def create_column(req: CreateColumnRequest, username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        board = get_user_board(cursor, username)
        
        # Find next position
        cursor.execute("SELECT COALESCE(MAX(position), -1) + 1 FROM columns WHERE board_id = ?", (board["id"],))
        next_pos = cursor.fetchone()[0]
        
        col_id = f"col-{secrets.token_hex(4)}"
        cursor.execute(
            "INSERT INTO columns (id, board_id, title, position) VALUES (?, ?, ?, ?)",
            (col_id, board["id"], req.title, next_pos)
        )
        conn.commit()
        
        cursor.execute("SELECT * FROM columns WHERE id = ?", (col_id,))
        new_col = dict(cursor.fetchone())
        new_col["cards"] = []
        return ColumnResponse(**new_col)
    finally:
        conn.close()

@router.patch("/columns/{column_id}", response_model=ColumnResponse)
async def rename_column(column_id: str, req: RenameColumnRequest, username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        board = get_user_board(cursor, username)
        
        # Verify column belongs to user's board
        cursor.execute("SELECT * FROM columns WHERE id = ? AND board_id = ?", (column_id, board["id"]))
        col = cursor.fetchone()
        if not col:
            raise HTTPException(status_code=404, detail="Column not found")
            
        cursor.execute("UPDATE columns SET title = ? WHERE id = ?", (req.title, column_id))
        conn.commit()
        
        cursor.execute("SELECT * FROM columns WHERE id = ?", (column_id,))
        updated_col = dict(cursor.fetchone())
        
        cursor.execute("SELECT * FROM cards WHERE column_id = ? ORDER BY position ASC", (column_id,))
        updated_col["cards"] = [CardResponse(**dict(c)) for c in cursor.fetchall()]
        return ColumnResponse(**updated_col)
    finally:
        conn.close()

@router.delete("/columns/{column_id}")
async def delete_column(column_id: str, username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        board = get_user_board(cursor, username)
        cursor.execute("SELECT * FROM columns WHERE id = ? AND board_id = ?", (column_id, board["id"]))
        col = cursor.fetchone()
        if not col:
            raise HTTPException(status_code=404, detail="Column not found")
            
        cursor.execute("DELETE FROM columns WHERE id = ?", (column_id,))
        conn.commit()
        return {"status": "ok", "message": "Column deleted successfully"}
    finally:
        conn.close()

@router.post("/cards", response_model=CardResponse)
async def create_card(req: CreateCardRequest, username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        board = get_user_board(cursor, username)
        
        cursor.execute("SELECT * FROM columns WHERE id = ? AND board_id = ?", (req.column_id, board["id"]))
        col = cursor.fetchone()
        if not col:
            raise HTTPException(status_code=404, detail="Target column not found")
            
        cursor.execute("SELECT COALESCE(MAX(position), -1) + 1 FROM cards WHERE column_id = ?", (req.column_id,))
        next_pos = cursor.fetchone()[0]
        
        card_id = f"card-{secrets.token_hex(4)}"
        now = datetime.now(timezone.utc).isoformat()
        
        cursor.execute(
            """
            INSERT INTO cards (id, column_id, title, details, position, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            """,
            (card_id, req.column_id, req.title, req.details, next_pos, now, now)
        )
        conn.commit()
        
        cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,))
        return CardResponse(**dict(cursor.fetchone()))
    finally:
        conn.close()

@router.patch("/cards/{card_id}", response_model=CardResponse)
async def update_card(card_id: str, req: UpdateCardRequest, username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        board = get_user_board(cursor, username)
        
        # Verify card belongs to user
        cursor.execute("""
            SELECT c.* FROM cards c
            JOIN columns col ON c.column_id = col.id
            WHERE c.id = ? AND col.board_id = ?
        """, (card_id, board["id"]))
        card = cursor.fetchone()
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
            
        now = datetime.now(timezone.utc).isoformat()
        new_title = req.title if req.title is not None else card["title"]
        new_details = req.details if req.details is not None else card["details"]
        
        cursor.execute("""
            UPDATE cards SET title = ?, details = ?, updated_at = ?
            WHERE id = ?
        """, (new_title, new_details, now, card_id))
        conn.commit()
        
        cursor.execute("SELECT * FROM cards WHERE id = ?", (card_id,))
        return CardResponse(**dict(cursor.fetchone()))
    finally:
        conn.close()

@router.post("/cards/{card_id}/move")
async def move_card(card_id: str, req: MoveCardRequest, username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        board = get_user_board(cursor, username)
        
        # Verify card and its column belong to user
        cursor.execute("""
            SELECT c.* FROM cards c
            JOIN columns col ON c.column_id = col.id
            WHERE c.id = ? AND col.board_id = ?
        """, (card_id, board["id"]))
        card = cursor.fetchone()
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
            
        # Verify target column belongs to user
        cursor.execute("SELECT * FROM columns WHERE id = ? AND board_id = ?", (req.target_column_id, board["id"]))
        target_col = cursor.fetchone()
        if not target_col:
            raise HTTPException(status_code=404, detail="Target column not found")
            
        source_col_id = card["column_id"]
        source_pos = card["position"]
        target_col_id = req.target_column_id
        target_pos = req.position
        
        now = datetime.now(timezone.utc).isoformat()
        
        if source_col_id == target_col_id:
            # Reordering within same column
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
            """, (target_pos, now, card_id))
        else:
            # Moving to a different column
            # Shift remaining cards in source column
            cursor.execute("""
                UPDATE cards SET position = position - 1
                WHERE column_id = ? AND position > ?
            """, (source_col_id, source_pos))
            
            # Shift cards in target column to make room
            cursor.execute("""
                UPDATE cards SET position = position + 1
                WHERE column_id = ? AND position >= ?
            """, (target_col_id, target_pos))
            
            # Place card in target column
            cursor.execute("""
                UPDATE cards SET column_id = ?, position = ?, updated_at = ?
                WHERE id = ?
            """, (target_col_id, target_pos, now, card_id))
            
        conn.commit()
        return {"status": "ok", "message": "Card moved successfully"}
    finally:
        conn.close()

@router.delete("/cards/{card_id}")
async def delete_card(card_id: str, username: str = Depends(require_authenticated_user)):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        board = get_user_board(cursor, username)
        
        cursor.execute("""
            SELECT c.* FROM cards c
            JOIN columns col ON c.column_id = col.id
            WHERE c.id = ? AND col.board_id = ?
        """, (card_id, board["id"]))
        card = cursor.fetchone()
        if not card:
            raise HTTPException(status_code=404, detail="Card not found")
            
        col_id = card["column_id"]
        pos = card["position"]
        
        cursor.execute("DELETE FROM cards WHERE id = ?", (card_id,))
        # Re-compact positions
        cursor.execute("""
            UPDATE cards SET position = position - 1
            WHERE column_id = ? AND position > ?
        """, (col_id, pos))
        conn.commit()
        return {"status": "ok", "message": "Card deleted successfully"}
    finally:
        conn.close()
