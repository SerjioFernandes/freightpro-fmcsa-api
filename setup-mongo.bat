@echo off
echo 🚛 FreightPro Load Board Setup
echo.

echo 📝 Creating .env file...
echo # FreightPro Environment Configuration > .env
echo. >> .env
echo # MongoDB Connection String (replace ^<db_password^> with your actual password) >> .env
echo MONGODB_URI=mongodb+srv://freightpro-user:^<db_password^>@freightpro-cluster.tcvxlo5.mongodb.net/freightpro?retryWrites=true^&w=majority^&appName=freightpro-cluster >> .env
echo. >> .env
echo # Server Configuration >> .env
echo PORT=4000 >> .env
echo NODE_ENV=development >> .env
echo. >> .env
echo # JWT Secret (change this to a random string) >> .env
echo JWT_SECRET=freightpro-super-secret-jwt-key-2024-change-this-in-production >> .env
echo. >> .env
echo # Email Configuration (replace with your Gmail settings) >> .env
echo EMAIL_USER=your-email@gmail.com >> .env
echo EMAIL_PASS=your-16-character-app-password >> .env
echo. >> .env
echo # Optional: Future API Keys >> .env
echo # STRIPE_SECRET_KEY=sk_test_... >> .env
echo # GOOGLE_MAPS_API_KEY=AIza... >> .env

echo ✅ .env file created!
echo.
echo 📋 NEXT STEPS:
echo 1. Edit .env file and replace ^<db_password^> with your MongoDB password
echo 2. Add your Gmail credentials for email verification
echo 3. Run: npm install
echo 4. Run: npm start
echo.
echo 🔗 Your MongoDB connection string is ready!
echo 📧 Set up Gmail app password: https://myaccount.google.com/apppasswords
echo.
pause
