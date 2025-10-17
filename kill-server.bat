@echo off
title Kill FreightPro Server
color 0C
echo.
echo ========================================
echo    Killing FreightPro Server on Port 8000
echo ========================================
echo.

echo Finding processes using port 8000...
for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
    echo Killing process ID: %%a
    taskkill /PID %%a /F
)

echo.
echo Port 8000 should now be free.
echo You can now start the server again.
echo.
pause
