#!/bin/bash

# FreightPro Build and Zip Script
# Builds frontend and backend, then creates deployment zips

set -e  # Exit on error

echo "🚀 FreightPro Build and Zip Script"
echo "===================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if we're in the right directory
if [ ! -d "backend" ] || [ ! -d "frontend" ]; then
    echo -e "${RED}❌ Error: Must run from project root directory${NC}"
    exit 1
fi

# Clean previous builds
echo -e "\n${YELLOW}🧹 Cleaning previous builds...${NC}"
rm -rf frontend/dist
rm -rf backend/dist
rm -f frontend-deploy.zip backend-deploy.zip

# Build Backend
echo -e "\n${YELLOW}🔨 Building backend...${NC}"
cd backend
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install
fi
npm run build
echo -e "${GREEN}✅ Backend built successfully${NC}"
cd ..

# Build Frontend
echo -e "\n${YELLOW}🔨 Building frontend...${NC}"
cd frontend

# Note: Frontend API URL is hardcoded in constants.ts
# No .env.production file needed - Railway backend URL is built-in

if [ ! -d "node_modules" ]; then
    echo "Installing frontend dependencies..."
    npm install
fi
npm run build
echo -e "${GREEN}✅ Frontend built successfully${NC}"
cd ..

# Create backend deployment zip
echo -e "\n${YELLOW}📦 Creating backend-deploy.zip...${NC}"
cd backend
zip -r ../backend-deploy.zip \
    dist/ \
    package.json \
    package-lock.json \
    -x "*.log" \
    -x "node_modules/*" \
    -x ".git/*" \
    -x ".env*" \
    -x "uploads/*"
cd ..

# Copy ecosystem.config.js to zip
if [ -f "Others/ecosystem.config.js" ]; then
    cp Others/ecosystem.config.js /tmp/ecosystem.config.js
    cd /tmp
    zip -u "$OLDPWD/backend-deploy.zip" ecosystem.config.js
    rm ecosystem.config.js
    cd "$OLDPWD"
fi

echo -e "${GREEN}✅ backend-deploy.zip created${NC}"

# Create frontend deployment zip
echo -e "\n${YELLOW}📦 Creating frontend-deploy.zip...${NC}"
cd frontend/dist
zip -r ../../frontend-deploy.zip . -x "*.map"
cd ../..

# Add .htaccess if exists
if [ -f "frontend/dist/.htaccess" ]; then
    cd frontend/dist
    zip -u ../../frontend-deploy.zip .htaccess
    cd ../..
fi

echo -e "${GREEN}✅ frontend-deploy.zip created${NC}"

# Display zip sizes
echo -e "\n${GREEN}📊 Deployment packages:${NC}"
ls -lh frontend-deploy.zip backend-deploy.zip

echo -e "\n${GREEN}✅ Build and zip complete!${NC}"
echo ""
echo "Next steps:"
echo "1. Upload backend-deploy.zip to your hosting (Railway/VPS)"
echo "2. Upload frontend-deploy.zip to your hosting (Hostinger File Manager)"
echo ""
echo "See docs/RAILWAY-DEPLOY-GUIDE.md or docs/HOSTINGER-VPS-SETUP.md for deployment instructions"

