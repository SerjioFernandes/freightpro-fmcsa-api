# Simple Hostinger Deployment Steps

## Answer to Your Question

**"Which option to choose in Hostinger?"**

Choose: **"Upload backup files"**

**Why?** Because you're uploading files from your computer manually.

---

## Quick Steps

### 1️⃣ Build Frontend First

**Open PowerShell in FreightPro folder:**

```powershell
cd C:\Users\HAYK\Desktop\FreightPro\frontend
npm install
# IMPORTANT: Replace yourdomain.com with YOUR domain!
npm run build
```

This creates `frontend/dist/` with ready files.

---

### 2️⃣ Upload to Hostinger

**Use File Manager or FTP:**

#### Backend → Upload to `api/` folder:

Upload these from `backend/`:
- `dist/` (entire folder)
- `package.json`
- `package-lock.json`
- `ecosystem.config.js`

#### Frontend → Upload to `public_html/` root:

Upload **ALL files** from `frontend/dist/`:
- `index.html`
- `assets/` folder
- `manifest.json`
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`

Also create `.htaccess` in `public_html/`:
```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

### 3️⃣ Configure Node.js App

In Hostinger → Advanced → Node.js:

Create app:
- Domain: `api.yourdomain.com`
- Root: `public_html/api`
- Start: `dist/server.js`
- Port: 10000

Add environment variables:
```
NODE_ENV=production
MONGODB_URI=your-mongodb-atlas-uri
JWT_SECRET=random-32-chars
FRONTEND_URL=https://www.yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

---

### 4️⃣ Enable SSL

Advanced → SSL:
- Enable for `www.yourdomain.com`
- Enable for `api.yourdomain.com`

---

### 5️⃣ Test!

- Visit: https://www.yourdomain.com
- Should load your app!
- Test login/register

---

## Files Ready on Your Computer:

✅ **Backend:** `backend/dist/` (already built)
✅ **PM2 Config:** `ecosystem.config.js` (already created)
✅ **Frontend:** `frontend/` (build with command above)

**Just upload and configure!**

---

## TL;DR

1. Build frontend: `cd frontend && npm run build` (API URL is hardcoded)
2. Upload backend files to `api/` folder
3. Upload frontend files to `public_html/` root
4. Create Node.js app in Hostinger
5. Enable SSL
6. Done! 🎉

**Total time: 20-30 minutes**

See `HOSTINGER-UPLOAD-FILES.md` for detailed instructions!

