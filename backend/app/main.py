import os
from pathlib import Path
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

app = FastAPI(title="Kanban Project Management MVP API", version="0.1.0")

# Enable CORS for local testing if running frontend and backend independently
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Test/Health API Route
@app.get("/api/health")
async def health_check():
    return {
        "status": "ok",
        "message": "Backend API is functional",
        "version": "0.1.0"
    }

# Static file serving
BASE_DIR = Path(__file__).resolve().parent.parent
STATIC_DIR = BASE_DIR / "static"

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

    # Fallback to index.html for root or SPA paths
    index_file = STATIC_DIR / "index.html"
    if index_file.is_file():
        return FileResponse(index_file)

    return {"message": "Static frontend not yet built. Visit /api/health for backend API status."}
