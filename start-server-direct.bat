@echo off
title FreightPro Local Server (Direct)
color 0A
echo.
echo ========================================
echo    FreightPro Local Development Server
echo ========================================
echo.
echo Starting server directly with Node.js...
echo.
echo Static frontend will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0"
node server.js

echo.
echo Server stopped.
pause
