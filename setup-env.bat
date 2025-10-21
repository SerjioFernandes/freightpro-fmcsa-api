@echo off
echo Creating .env file for CargoLume...
echo.

echo # CargoLume Environment Variables > .env
echo MONGODB_URI=mongodb+srv://cargolume-user:cargolume123@cargolume-cluster.tcvxlo5.mongodb.net/cargolume?retryWrites=true^&w=majority^&appName=cargolume-cluster >> .env
echo JWT_SECRET=cargolume-super-secret-jwt-key-2024 >> .env
echo EMAIL_USER= >> .env
echo EMAIL_PASS= >> .env
echo ADMIN_EMAIL=admin@cargolume.com >> .env
echo ADMIN_PASSWORD=admin123 >> .env
echo FRONTEND_URL=https://cargolume.netlify.app >> .env
echo PORT=4000 >> .env
echo EMAIL_VERIFICATION_TTL_MS=86400000 >> .env

echo.
echo ✅ .env file created successfully!
echo.
echo ⚠️  IMPORTANT: Update the MongoDB password in .env file
echo    Replace 'cargolume123' with your actual MongoDB Atlas password
echo.
echo 🚀 Ready to start backend server with: npm start
echo.
pause
