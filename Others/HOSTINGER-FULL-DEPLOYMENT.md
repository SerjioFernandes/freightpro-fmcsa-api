# Full Hostinger Deployment Guide

## Overview

This guide deploys both frontend AND backend to Hostinger. You'll need:
- Node.js hosting plan (for backend)
- Shared hosting or WordPress plan (for frontend static files)
- Domain configured

**DO NOT use the migration wizard** - deploy manually!

---

## Prerequisites

1. ✅ Hostinger account with Node.js hosting
2. ✅ Domain configured in Hostinger
3. ✅ MongoDB Atlas account (database stays on Atlas)
4. ✅ Access to Hostinger File Manager or FTP
5. ✅ SSH access (for backend)

---

## Step 1: Prepare Backend for Hostinger

### 1.1 Create Production Build

```bash
cd backend
npm install
npm run build
```

This creates `backend/dist/` directory with compiled JavaScript.

### 1.2 Create Hostinger Start Script

Create a file `backend/start-hostinger.sh`:

```bash
#!/bin/bash
cd /home/u123456789/domains/yourdomain.com/subdomain/backend
npm install --production
node dist/server.js
```

Replace:
- `u123456789` with your Hostinger username
- `yourdomain.com` with your domain
- `subdomain` with `api` or `backend`

### 1.3 Create PM2 Configuration

Create `backend/ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'freightpro-backend',
    script: './dist/server.js',
    instances: 1,
    exec_mode: 'fork',
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 10000
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss Z'
  }]
};
```

---

## Step 2: Deploy Backend to Hostinger

### 2.1 Upload Backend Files

Via File Manager or FTP:

1. Navigate to your domain's root
2. Create directory: `api/` or `backend/`
3. Upload these files/folders:
   ```
   api/
   ├── dist/                    (compiled JavaScript)
   ├── node_modules/            (will install on server)
   ├── package.json
   ├── package-lock.json
   ├── ecosystem.config.js
   └── start-hostinger.sh
   ```

**Do NOT upload:**
- `src/` (source code not needed)
- `backend.log`
- `.env` files
- `uploads/` (create empty directory on server)

### 2.2 SSH into Hostinger Server

```bash
ssh u123456789@yourdomain.com
# Enter your SSH password
```

### 2.3 Install Dependencies

```bash
cd domains/yourdomain.com/public_html/api
npm install --production
```

### 2.4 Set Environment Variables

Create `.env` file:

```bash
nano .env
```

Add these variables:

```env
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/freightpro?retryWrites=true&w=majority
JWT_SECRET=your-secret-key-change-this-to-random-string
FRONTEND_URL=https://www.yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
```

**Important:**
- Replace `username:password` with your MongoDB Atlas credentials
- Generate random `JWT_SECRET` (minimum 32 characters)
- Use Gmail App Password for `EMAIL_PASS`
- Leave VAPID keys empty if not using push notifications

Save and exit: `Ctrl+X`, then `Y`, then `Enter`

### 2.5 Install PM2 (Process Manager)

```bash
npm install -g pm2
```

### 2.6 Start Backend with PM2

```bash
cd domains/yourdomain.com/public_html/api
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

Follow the instructions to make PM2 start on server reboot.

### 2.7 Configure Nginx/Apache

You'll need to configure reverse proxy to forward requests to Node.js.

**Via Hostinger Control Panel:**
1. Go to Domains → Your Domain
2. Node.js Apps
3. Create new app:
   - Domain: `api.yourdomain.com`
   - Document Root: `public_html/api`
   - Start File: `dist/server.js`
   - App Port: `10000`

Or manually edit `.htaccess` (for Apache):

```apache
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:10000/$1 [P,L]
```

### 2.8 Test Backend

```bash
curl https://api.yourdomain.com/api/health
```

Should return 200 OK.

---

## Step 3: Deploy Frontend to Hostinger

### 3.1 Build React App

```bash
cd frontend
npm install
npm run build
```

This creates `frontend/dist/` directory.

### 3.2 Update API URL

Before building, ensure `frontend/src/utils/constants.ts` has:

```typescript
export const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  'https://api.yourdomain.com/api';
```

Or set environment variable:

```bash
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

### 3.3 Upload Frontend Files

Via File Manager:

1. Navigate to `public_html/` or `www.yourdomain.com/`
2. **Delete all default files** (index.html, etc.)
3. Upload **contents** of `frontend/dist/`:
   ```
   public_html/
   ├── index.html
   ├── assets/
   │   ├── index-[hash].js
   │   ├── index-[hash].css
   │   └── ...
   ├── manifest.json
   ├── robots.txt
   ├── sitemap.xml
   └── site.webmanifest
   ```

**Important:** Upload CONTENTS of dist/, not the dist folder itself!

### 3.4 Configure .htaccess for React Router

Create `public_html/.htaccess`:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]

# Enable compression
<IfModule mod_deflate.c>
  AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css text/javascript application/javascript application/json
</IfModule>

# Cache static assets
<IfModule mod_expires.c>
  ExpiresActive On
  ExpiresByType image/jpg "access plus 1 year"
  ExpiresByType image/jpeg "access plus 1 year"
  ExpiresByType image/png "access plus 1 year"
  ExpiresByType image/gif "access plus 1 year"
  ExpiresByType image/ico "access plus 1 year"
  ExpiresByType image/icon "access plus 1 year"
  ExpiresByType image/x-icon "access plus 1 year"
  ExpiresByType text/css "access plus 1 month"
  ExpiresByType application/javascript "access plus 1 month"
  ExpiresByType application/x-javascript "access plus 1 month"
</IfModule>
```

### 3.5 Test Frontend

Visit `https://www.yourdomain.com` - should load React app.

Open browser console, check for errors.

---

## Step 4: Configure Domain

### 4.1 Set Up Subdomain for Backend

In Hostinger Control Panel:

1. Domains → Your Domain → DNS
2. Add DNS Record:
   - Type: A
   - Name: api
   - Value: Your server IP
   - TTL: 3600

Or use CNAME:
   - Type: CNAME
   - Name: api
   - Value: yourdomain.com
   - TTL: 3600

### 4.2 SSL Certificates

Enable free Let's Encrypt SSL for:
- www.yourdomain.com
- api.yourdomain.com

Via Hostinger Control Panel → SSL

---

## Step 5: Environment Variables Checklist

### Backend (.env on server)

```env
✅ NODE_ENV=production
✅ PORT=10000
✅ MONGODB_URI=mongodb+srv://...
✅ JWT_SECRET=random-32-char-string
✅ FRONTEND_URL=https://www.yourdomain.com
✅ EMAIL_USER=your-email@gmail.com
✅ EMAIL_PASS=app-password
✅ VAPID_PUBLIC_KEY= (empty OK)
✅ VAPID_PRIVATE_KEY= (empty OK)
```

### Frontend (VITE_API_URL)

Set during build:

```bash
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

---

## Step 6: Post-Deployment

### 6.1 Seed Demo Data

Login to your app, open browser console:

```javascript
const token = localStorage.getItem('authToken');
fetch('https://api.yourdomain.com/api/admin/seed-loads', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

### 6.2 Test All Features

✅ Registration
✅ Login
✅ Load board (with 500 loads)
✅ Map view
✅ Dashboard
✅ Messaging
✅ Documents
✅ Saved searches

### 6.3 Monitor Backend

SSH into server:

```bash
pm2 logs freightpro-backend
pm2 status
pm2 monit
```

---

## Troubleshooting

### Backend Issues

**PM2 not starting:**
```bash
pm2 delete freightpro-backend
pm2 start ecosystem.config.js
pm2 logs
```

**Port already in use:**
```bash
lsof -i :10000
kill -9 [PID]
pm2 restart freightpro-backend
```

**MongoDB connection fails:**
- Check MongoDB Atlas Network Access (allow all IPs)
- Verify MONGODB_URI in .env
- Test with: `node -e "console.log(process.env.MONGODB_URI)"`

### Frontend Issues

**White screen:**
- Check browser console for errors
- Verify index.html loads
- Check API URL is correct

**404 on routes:**
- Verify .htaccess is uploaded
- Check mod_rewrite enabled

**API errors:**
- Verify VITE_API_URL points to correct backend
- Check CORS allows your domain
- Test backend health: https://api.yourdomain.com/api/health

---

## Maintenance

### Update Backend

```bash
cd domains/yourdomain.com/public_html/api
git pull  # or upload new dist/ folder
npm install --production
pm2 restart freightpro-backend
```

### Update Frontend

```bash
cd frontend
npm run build
# Upload new dist/ contents to public_html/
```

### View Logs

```bash
pm2 logs freightpro-backend
tail -f logs/backend.log
```

---

## Alternative: Using GitHub Actions

Automate deployment with GitHub Actions:

```yaml
name: Deploy to Hostinger

on:
  push:
    branches: [main]

jobs:
  deploy-backend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Setup Node.js
        uses: actions/setup-node@v2
      - name: Build backend
        run: |
          cd backend
          npm install
          npm run build
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.0.0
        with:
          server: ftp.yourdomain.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./backend/dist
  
  deploy-frontend:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Build frontend
        run: |
          cd frontend
          npm install
          npm run build
      - name: Deploy via FTP
        uses: SamKirkland/FTP-Deploy-Action@4.0.0
        with:
          server: ftp.yourdomain.com
          username: ${{ secrets.FTP_USERNAME }}
          password: ${{ secrets.FTP_PASSWORD }}
          local-dir: ./frontend/dist
```

---

## Cost Comparison

**Render + Vercel (Current):**
- Free tier available
- Auto-deploy from GitHub
- Cold starts (30-60s)
- Good for development/testing

**Full Hostinger:**
- ~$5-10/month
- No cold starts
- Full control
- Better for production

---

## Next Steps

After deployment:

1. ✅ Seed demo data (500 loads)
2. ✅ Test all features
3. ✅ Set up domain SSL
4. ✅ Configure email sending
5. ✅ Monitor logs
6. ✅ Set up backups
7. ✅ Configure CDN (optional)
8. ✅ Set up monitoring (optional)

**Need help?** Ask specific questions about any step!
