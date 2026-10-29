$ErrorActionPreference = "Stop"

$repoPath = $PSScriptRoot
Set-Location $repoPath

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   KosMate Microservice Deployment        " -ForegroundColor Cyan
Write-Host "   (3 Containers: DB + Backend + Frontend)" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Check if .env exists
if (-not (Test-Path ".env")) {
    Write-Host "File .env tidak ditemukan. Menyalin dari .env.example..." -ForegroundColor Yellow
    Copy-Item ".env.example" ".env"
}

Write-Host "Membangun dan menjalankan container dengan Docker Compose..." -ForegroundColor Cyan
docker compose up -d --build

if ($LASTEXITCODE -ne 0) {
    Write-Host "Gagal menjalankan container Docker!" -ForegroundColor Red
    exit 1
}

Write-Host "`nMenunggu inisialisasi database dan healthcheck backend..." -ForegroundColor Yellow
Start-Sleep -Seconds 3

Write-Host "`nStatus Container KosMate:" -ForegroundColor Green
docker compose ps

Write-Host "`n==========================================" -ForegroundColor Green
Write-Host "Aplikasi berhasil berjalan!" -ForegroundColor Green
Write-Host "Frontend Web   : http://localhost:8080" -ForegroundColor Green
Write-Host "Backend API    : http://localhost:5000" -ForegroundColor Green
Write-Host "API Healthcheck: http://localhost:5000/health" -ForegroundColor Green
Write-Host "PostgreSQL DB  : localhost:5432" -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
