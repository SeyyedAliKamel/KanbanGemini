# Start script for Windows (PowerShell)
$ErrorActionPreference = "Continue"

Write-Host "Starting Kanban Project Management App..." -ForegroundColor Cyan

# Check if Docker is available
$dockerRunning = $false
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        $dockerRunning = $true
    }
} catch {
    $dockerRunning = $false
}

if ($dockerRunning) {
    Write-Host "Docker daemon detected. Building and starting container..." -ForegroundColor Green
    docker compose up -d --build
    Write-Host "App is running in Docker at: http://localhost:8000" -ForegroundColor Green
} else {
    Write-Host "Docker is not running. Starting backend natively with uvicorn..." -ForegroundColor Yellow
    Start-Process -FilePath "uvicorn" -ArgumentList "backend.app.main:app", "--host", "0.0.0.0", "--port", "8000", "--reload"
    Write-Host "App is running natively at: http://localhost:8000" -ForegroundColor Green
}
