# Hostinger Quick Start (Simplified)

## TL;DR

Want to deploy to Hostinger quickly? Here's the simplest approach:

---

## What You Need

1. ✅ Hostinger account with **Node.js hosting** enabled
2. ✅ Domain configured
3. ✅ MongoDB Atlas account (database stays there)
4. ✅ 30 minutes

---

## Fast Track Deployment

### Step 1: Build Both Apps (Local)

```bash
# Build backend
cd backend
npm install
npm run build

# Build frontend  
cd ../frontend
npm install
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

**Replace `yourdomain.com` with your actual domain!**

---

### Step 2: Deploy Backend

#### Via Hostinger File Manager:

1. Go to File Manager
2. Navigate to `domains/yourdomain.com/public_html/`
3. Create folder: `api/`
4. Upload:
   - `backend/dist/` (entire folder)
   - `backend/package.json`
   - `backend/package-lock.json`
   - `backend/ecosystem.config.js` (create it using HOSTINGER-FULL-DEPLOYMENT.md)

#### Via Hostinger Node.js App Manager:

1. Go to Advanced → Node.js
2. Create new app:
   - App domain: `api.yourdomain.com`
   - Node version: 18 or 20
   - Document root: `public_html/api`
   - Start file: `dist/server.js`
   - Port: 10000 (or auto-assigned)
3. Add environment variables:
   ```
   NODE_ENV=production
   MONGODB_URI=your-mongodb-uri
   JWT_SECRET=random-secret
   FRONTEND_URL=https://www.yourdomain.com
   EMAIL_USER=your-email
   EMAIL_PASS=your-password
   ```
4. Click "Create" and wait for deployment

---

### Step 3: Deploy Frontend

#### Via File Manager:

1. Go to `domains/yourdomain.com/public_html/`
2. **Delete all default files**
3. Upload **contents** of `frontend/dist/`:
   - Select all files inside dist/
   - Upload to public_html/ root
4. Create `.htaccess` file (see below)

#### Create .htaccess:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

Save as `public_html/.htaccess`

---

### Step 4: Configure SSL

1. Go to Advanced → SSL
2. Enable Let's Encrypt for:
   - www.yourdomain.com (main domain)
   - api.yourdomain.com (backend subdomain)
3. Wait for SSL to install

---

### Step 5: Test

1. Visit: `https://www.yourdomain.com`
2. Should load your app
3. Test login/register
4. Open browser console, check for errors

---

### Step 6: Seed Data

Login, open browser console:

```javascript
const token = localStorage.getItem('authToken');
fetch('https://api.yourdomain.com/api/admin/seed-loads', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```

---

## Environment Variables Quick Reference

### Backend (in Hostinger Node.js App)

```env
NODE_ENV=production
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
JWT_SECRET=generate-random-32-character-string
FRONTEND_URL=https://www.yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-gmail-app-password
```

**Leave VAPID keys empty** if not using push notifications.

### Frontend (at build time)

```bash
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

---

## Common Issues

### Backend won't start

**Check Hostinger logs:**
1. Go to Node.js App Manager
2. Click your app
3. View "Logs" tab

**Common errors:**
- `MONGODB_URI` missing → Add to environment variables
- Port conflict → Use auto-assigned port
- `dist/` not found → Upload dist/ folder correctly

### Frontend white screen

**Check:**
1. Browser console for errors
2. API URL is correct in build
3. .htaccess uploaded correctly
4. SSL enabled for www subdomain

### CORS errors

**Backend .env needs:**
```
FRONTEND_URL=https://www.yourdomain.com
```

**Backend CORS config** (already set) allows this domain.

---

## Architecture

```
yourdomain.com
├── www.yourdomain.com → Frontend (React static files)
└── api.yourdomain.com → Backend (Node.js + Express)
```

**Frontend** talks to **Backend** at `https://api.yourdomain.com/api`

**Backend** talks to **MongoDB Atlas** (cloud database)

---

## Files to Upload

### Backend Upload:

```
api/
├── dist/              ← Upload entire folder
├── package.json       ← Upload
└── ecosystem.config.js ← Create (see full guide)
```

### Frontend Upload:

```
public_html/
├── index.html         ← Upload
├── assets/            ← Upload entire folder
├── manifest.json      ← Upload
├── robots.txt         ← Upload
├── sitemap.xml        ← Upload
├── site.webmanifest   ← Upload
└── .htaccess          ← Create
```

**Important:** Upload CONTENTS of dist/, not dist folder itself!

---

## Quick Reference Commands

**Local build:**
```bash
cd backend && npm run build
cd ../frontend && VITE_API_URL=https://api.yourdomain.com npm run build
```

**Check backend logs (SSH):**
```bash
cd domains/yourdomain.com/public_html/api
pm2 logs
```

**Restart backend:**
```bash
pm2 restart all
```

**Update frontend:**
```bash
# Rebuild locally, then upload new dist/ contents
```

---

## Need More Details?

See `HOSTINGER-FULL-DEPLOYMENT.md` for:
- PM2 configuration
- Advanced troubleshooting
- GitHub Actions automation
- Performance optimization

---

## Support

If stuck:
1. Check Hostinger logs (Node.js App Manager → Logs)
2. Check browser console for errors
3. Verify environment variables are set
4. Test backend health: `https://api.yourdomain.com/api/health`

**Good luck!** 🚀
