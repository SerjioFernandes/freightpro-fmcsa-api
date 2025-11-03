# Script to create ZIP files for Hostinger deployment

Write-Host "Creating ZIP files for Hostinger..." -ForegroundColor Green

# Create backend zip
Write-Host "`n1. Creating backend.zip..." -ForegroundColor Yellow
$backendZip = "backend-deploy.zip"
if (Test-Path $backendZip) { Remove-Item $backendZip }

$backendFiles = @()
Get-ChildItem -Path "backend\dist" -Recurse | ForEach-Object { $backendFiles += $_.FullName }
$backendFiles += "backend\package.json"
$backendFiles += "backend\package-lock.json"
$backendFiles += "Others\ecosystem.config.js"

Compress-Archive -Path $backendFiles -DestinationPath $backendZip -Force
Write-Host "   Created: $backendZip" -ForegroundColor Green

# Create frontend zip
Write-Host "`n2. Creating frontend.zip..." -ForegroundColor Yellow
Write-Host "   Note: First build frontend!" -ForegroundColor Cyan

if (Test-Path "frontend\dist\index.html") {
    $frontendZip = "frontend-deploy.zip"
    if (Test-Path $frontendZip) { Remove-Item $frontendZip }
    Get-ChildItem -Path "frontend\dist" | Compress-Archive -DestinationPath $frontendZip -Force
    Write-Host "   Created: $frontendZip" -ForegroundColor Green
} else {
    Write-Host "   WARNING: frontend/dist/ not found. Build frontend first!" -ForegroundColor Red
}

Write-Host "`nZIP files created!" -ForegroundColor Green
Write-Host "`nUpload these to Hostinger:" -ForegroundColor Yellow
