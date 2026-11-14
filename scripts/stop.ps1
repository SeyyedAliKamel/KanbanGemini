# Stop script for Windows (PowerShell)
$ErrorActionPreference = "Continue"

Write-Host "Stopping Kanban Project Management App..." -ForegroundColor Cyan

# Check if docker is running container
try {
    $null = docker info 2>&1
    if ($LASTEXITCODE -eq 0) {
        docker compose down
        Write-Host "Docker container stopped." -ForegroundColor Green
    }
} catch {
}

# Stop native uvicorn process if running
$uvicornProcs = Get-Process -Name "*uvicorn*" -ErrorAction SilentlyContinue
if ($uvicornProcs) {
    $uvicornProcs | Stop-Process -Force
    Write-Host "Native uvicorn process stopped." -ForegroundColor Green
} else {
    Write-Host "No active processes found." -ForegroundColor Yellow
}
