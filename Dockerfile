FROM python:3.12-slim

# Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install Python backend dependencies using uv
COPY backend/pyproject.toml ./backend/
RUN uv pip install --system fastapi uvicorn[standard] pydantic requests python-dotenv

# Copy backend application and static files
COPY backend/ ./backend/

EXPOSE 8000

ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000"]
