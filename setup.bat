# CargoLume Setup Script

echo "🚛 Setting up CargoLume Load Board..."

# Create .env file
echo "Creating .env configuration file..."

cat > .env << 'EOF'
# CargoLume Environment Configuration

# MongoDB Connection String (replace with your actual connection string)
MONGODB_URI=mongodb+srv://cargolume-user:YOUR_PASSWORD@cargolume-cluster.xxxxx.mongodb.net/cargolume?retryWrites=true&w=majority

# Server Configuration
PORT=4000
NODE_ENV=development

# JWT Secret (change this to a random string)
JWT_SECRET=cargolume-super-secret-jwt-key-2024-change-this-in-production

# Email Configuration (replace with your Gmail settings)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Optional: Future API Keys
# STRIPE_SECRET_KEY=sk_test_...
# GOOGLE_MAPS_API_KEY=AIza...
EOF

echo "✅ .env file created!"
echo ""
echo "📝 NEXT STEPS:"
echo "1. Edit .env file with your MongoDB connection string"
echo "2. Add your Gmail credentials"
echo "3. Run: npm start"
echo ""
echo "🔗 MongoDB Atlas: https://mongodb.com/atlas"
echo "📧 Gmail App Password: https://myaccount.google.com/apppasswords"
