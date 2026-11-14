# Stage 1: Build Next.js static output
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY frontend/package*.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# Stage 2: Python FastAPI backend using uv
FROM python:3.12-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install backend dependencies using uv
COPY backend/pyproject.toml ./backend/
RUN uv pip install --system fastapi uvicorn[standard] pydantic requests python-dotenv

# Copy backend code
COPY backend/ ./backend/

# Copy static frontend build into backend static directory
COPY --from=frontend-builder /app/frontend/out ./backend/static

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "uvicorn backend.app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]
