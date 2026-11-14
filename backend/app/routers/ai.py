import sqlite3
from fastapi import APIRouter, Depends, HTTPException, status

from backend.app.auth import require_authenticated_user
from backend.app.database import get_connection
from backend.app.schemas import AIChatRequest, AIChatResponse, BoardResponse
from backend.app.routers.board import fetch_full_board
from backend.app.services.ai_service import (
    build_chat_messages,
    send_openrouter_request,
    parse_ai_response,
    validate_and_execute_actions,
)

router = APIRouter(prefix="/api/ai", tags=["ai"])

@router.post("/chat", response_model=AIChatResponse)
async def chat_with_ai(
    req: AIChatRequest,
    username: str = Depends(require_authenticated_user)
):
    conn = get_connection()
    try:
        # 1. Fetch current board state
        board = fetch_full_board(conn, username)

        # 2. Build OpenRouter messages payload
        messages = build_chat_messages(board, req.history, req.message)

        # 3. Call OpenRouter API
        try:
            raw_response = send_openrouter_request(messages)
        except ValueError as e:
            raise HTTPException(status_code=status.HTTP_503_SERVICE_UNAVAILABLE, detail=str(e))
        except TimeoutError:
            raise HTTPException(status_code=status.HTTP_504_GATEWAY_TIMEOUT, detail="OpenRouter request timed out")
        except Exception as e:
            raise HTTPException(status_code=status.HTTP_502_BAD_GATEWAY, detail=f"AI service error: {str(e)}")

        # 4. Parse AI output
        parsed_output = parse_ai_response(raw_response)

        # 5. Validate & execute board actions atomically
        applied_count = 0
        if parsed_output.actions:
            try:
                applied_count = validate_and_execute_actions(conn, board.id, parsed_output.actions)
            except ValueError as val_err:
                # Invalid action schema or invalid entity IDs - reject and do NOT modify board
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(val_err))

        # 6. Fetch updated board
        updated_board = fetch_full_board(conn, username)

        return AIChatResponse(
            response=parsed_output.response,
            actions_applied=applied_count,
            board=updated_board
        )
    finally:
        conn.close()
