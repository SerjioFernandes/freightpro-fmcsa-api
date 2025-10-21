Write-Host "Starting CargoLume Local Server..." -ForegroundColor Green
Write-Host ""
Write-Host "Server will be available at: http://localhost:8000" -ForegroundColor Yellow
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Yellow
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

# Start the HTTP server
try {
    python -m http.server 8000
}
catch {
    Write-Host "Error starting server. Make sure Python is installed and in your PATH." -ForegroundColor Red
    Write-Host "You can also try: py -m http.server 8000" -ForegroundColor Yellow
    Read-Host "Press Enter to exit"
}
