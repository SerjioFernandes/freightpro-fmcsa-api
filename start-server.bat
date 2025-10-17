@echo off
title FreightPro Local Server
color 0A
echo.
echo ========================================
echo    FreightPro Local Development Server
echo ========================================
echo.
echo Starting server...
echo.
echo Static frontend will be available at: http://localhost:8000
echo Press Ctrl+C to stop the server
echo.
echo ========================================
echo.

cd /d "%~dp0"
npm run static

echo.
echo Server stopped.
pause
