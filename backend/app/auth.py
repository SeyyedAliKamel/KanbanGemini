import secrets
from typing import Optional
from fastapi import APIRouter, Cookie, Depends, HTTPException, Request, Response, status
from pydantic import BaseModel

router = APIRouter(prefix="/api/auth", tags=["auth"])

# Active sessions stored in memory (session-only, resets when server restarts)
ACTIVE_SESSIONS: dict[str, dict] = {}

VALID_USERNAME = "user"
VALID_PASSWORD = "password"

class LoginRequest(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    username: str

class AuthStatusResponse(BaseModel):
    authenticated: bool
    user: Optional[UserResponse] = None

@router.post("/login")
async def login(credentials: LoginRequest, response: Response):
    # Fixed MVP credentials check
    if credentials.username != VALID_USERNAME or credentials.password != VALID_PASSWORD:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    # Generate secure random session ID
    session_id = secrets.token_urlsafe(32)
    ACTIVE_SESSIONS[session_id] = {"username": credentials.username}

    # Set HttpOnly session cookie without long-lived Max-Age (survives tab reloads, dies on browser close)
    response.set_cookie(
        key="session_id",
        value=session_id,
        httponly=True,
        samesite="lax",
        secure=False,  # Allow local HTTP testing
        path="/"
    )

    return {
        "status": "ok",
        "user": {"username": credentials.username}
    }

@router.post("/logout")
async def logout(response: Response, session_id: Optional[str] = Cookie(None)):
    if session_id and session_id in ACTIVE_SESSIONS:
        del ACTIVE_SESSIONS[session_id]

    # Delete cookie
    response.delete_cookie(key="session_id", path="/")
    return {"status": "ok", "message": "Logged out successfully"}

@router.get("/me", response_model=AuthStatusResponse)
async def get_current_user_status(session_id: Optional[str] = Cookie(None)):
    if not session_id or session_id not in ACTIVE_SESSIONS:
        return AuthStatusResponse(authenticated=False, user=None)

    session_data = ACTIVE_SESSIONS[session_id]
    return AuthStatusResponse(
        authenticated=True,
        user=UserResponse(username=session_data["username"])
    )

def require_authenticated_user(session_id: Optional[str] = Cookie(None)) -> str:
    """Dependency for protecting internal API endpoints"""
    if not session_id or session_id not in ACTIVE_SESSIONS:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required"
        )
    return ACTIVE_SESSIONS[session_id]["username"]
