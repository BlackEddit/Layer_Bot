# Script para iniciar el Bot del Despacho Juridico
Write-Host "Limpiando procesos anteriores..." -ForegroundColor Yellow

# Matar procesos antiguos
Stop-Process -Name node -Force -ErrorAction SilentlyContinue
Stop-Process -Name chrome -Force -ErrorAction SilentlyContinue
Start-Sleep -Seconds 2

Write-Host "Listo! Iniciando bot..." -ForegroundColor Green
Write-Host ""

# Iniciar bot
npm run bot
