@echo off
echo Starting Kanban Project Management App...

docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    echo Docker daemon detected. Building and starting container...
    docker compose up -d --build
    echo App is running in Docker at: http://localhost:8000
) else (
    echo Docker is not running. Starting backend natively with uvicorn...
    start "" uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
    echo App is running natively at: http://localhost:8000
)
