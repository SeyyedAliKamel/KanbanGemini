#!/usr/bin/env bash

echo "Stopping Kanban Project Management App..."

if command -v docker >/dev/null 2>&1 && docker info >/dev/null 2>&1; then
    docker compose down
    echo "Docker container stopped."
fi

pkill -f "uvicorn backend.app.main:app" || true
echo "Stop complete."
