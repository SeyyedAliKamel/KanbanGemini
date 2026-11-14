import os
from pathlib import Path
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from backend.app.auth import router as auth_router, require_authenticated_user
from backend.app.routers.board import router as board_router
from backend.app.routers.ai import router as ai_router
from backend.app.database import init_db

# Initialize database on startup
init_db()

app = FastAPI(title="Kanban Project Management MVP API", version="0.1.0")

# Enable CORS for local testing if running frontend and backend independently
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Authentication, Board & AI Routers
app.include_router(auth_router)
app.include_router(board_router)
app.include_router(ai_router)

# Test/Health API Route
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Backend API is functional",
        "version": "0.1.0"
    }

# Protected sample route to verify auth middleware
@app.get("/api/protected-check")
async def protected_check(username: str = Depends(require_authenticated_user)):
    return {
        "status": "ok",
        "message": f"Hello {username}, you have authorized access."
    }

# Static file serving
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

if (STATIC_DIR / "_next").exists():
    app.mount("/_next", StaticFiles(directory=str(STATIC_DIR / "_next")), name="next_assets")

if STATIC_DIR.exists():
    app.mount("/static", StaticFiles(directory=str(STATIC_DIR)), name="static")

@app.get("/{full_path:path}")
async def serve_frontend(full_path: str):
    # Avoid intercepting API routes
    if full_path.startswith("api"):
        return {"error": "Not Found"}

    target_file = STATIC_DIR / full_path
    if full_path and target_file.is_file():
        return FileResponse(target_file)

    # Support clean URLs like /something -> /something.html
    html_file = STATIC_DIR / f"{full_path}.html"
    if full_path and html_file.is_file():
        return FileResponse(html_file)

    # Fallback to index.html for root or client routes
    index_file = STATIC_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    return {"message": "Static frontend not yet built."}
