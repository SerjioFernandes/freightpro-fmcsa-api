@echo off
echo Creating .env file for FreightPro...
echo.

echo # FreightPro Environment Variables > .env
echo MONGODB_URI=mongodb+srv://freightpro-user:freightpro123@freightpro-cluster.tcvxlo5.mongodb.net/freightpro?retryWrites=true^&w=majority^&appName=freightpro-cluster >> .env
echo JWT_SECRET=freightpro-super-secret-jwt-key-2024 >> .env
echo EMAIL_USER= >> .env
echo EMAIL_PASS= >> .env
echo ADMIN_EMAIL=admin@freightpro.com >> .env
echo ADMIN_PASSWORD=admin123 >> .env
echo FRONTEND_URL=http://localhost:8000 >> .env
echo PORT=4000 >> .env
echo EMAIL_VERIFICATION_TTL_MS=86400000 >> .env

echo.
echo ✅ .env file created successfully!
echo.
echo ⚠️  IMPORTANT: Update the MongoDB password in .env file
echo    Replace 'freightpro123' with your actual MongoDB Atlas password
echo.
echo 🚀 Ready to start backend server with: npm start
echo.
pause
