#!/usr/bin/env bash
set -e

echo "Starting Kanban Project Management App..."

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    echo "Docker daemon detected. Building and starting container..."
    docker compose up -d --build
    echo "App is running in Docker at: http://localhost:8000"
else
    echo "Docker is not running. Starting backend natively with uvicorn..."
    uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload &
    echo "App is running natively at: http://localhost:8000"
fi
