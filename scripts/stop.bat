@echo off
echo Stopping Kanban Project Management App...

docker info >nul 2>&1
if %ERRORLEVEL% EQU 0 (
    docker compose down
    echo Docker container stopped.
)

taskkill /F /IM uvicorn.exe >nul 2>&1
echo Stop complete.
