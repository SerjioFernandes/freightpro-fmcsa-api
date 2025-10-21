@echo off
echo 🚛 Starting CargoLume Backend (with MongoDB)...
echo.

echo 📦 Installing dependencies...
npm install

echo.
echo 🚀 Starting backend on http://localhost:%PORT% (default 4000)...
npm start

pause
