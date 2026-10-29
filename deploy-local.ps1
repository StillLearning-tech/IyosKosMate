$ErrorActionPreference = "Stop"

$repoPath = "C:\Users\USER\KosMate"
Set-Location $repoPath

Write-Host "Memulai deployment KosMate..." -ForegroundColor Cyan

docker compose pull web
if ($LASTEXITCODE -ne 0) {
    Write-Host "Gagal mengambil image terbaru dari GHCR." -ForegroundColor Red
    exit 1
}

docker compose up -d web
if ($LASTEXITCODE -ne 0) {
    Write-Host "Deployment gagal." -ForegroundColor Red
    exit 1
}

Write-Host "Status container:" -ForegroundColor Cyan
docker compose ps

Write-Host "Periksa aplikasi di http://localhost:8080" -ForegroundColor Green
