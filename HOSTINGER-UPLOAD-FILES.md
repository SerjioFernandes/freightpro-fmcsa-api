# Files to Upload to Hostinger

## Summary

**You have ALL files ready in your local computer!**

Use **"Upload backup files"** option in Hostinger because you're uploading manually built files from your computer.

---

## What You Need to Upload

### 1. Backend Files (Upload to `api/` folder)

**Location:** `backend/` directory

**Upload these:**
```
api/
├── dist/                    ← Entire folder (compiled JavaScript)
├── package.json             ← File
├── package-lock.json        ← File
└── ecosystem.config.js      ← File (PM2 config)
```

**From your computer, upload:**
- `C:\Users\HAYK\Desktop\FreightPro\backend\dist\` folder
- `C:\Users\HAYK\Desktop\FreightPro\backend\package.json`
- `C:\Users\HAYK\Desktop\FreightPro\backend\package-lock.json`
- `C:\Users\HAYK\Desktop\FreightPro\backend\ecosystem.config.js` (or `C:\Users\HAYK\Desktop\FreightPro\ecosystem.config.js`)

---

### 2. Frontend Files (Upload to `public_html/` root)

**Location:** `frontend/dist/` directory (after building)

**Upload these:**
```
public_html/
├── index.html              ← File
├── assets/                 ← Entire folder
│   ├── index-[hash].js
│   ├── index-[hash].css
│   └── (other assets)
├── manifest.json           ← File
├── robots.txt              ← File
├── sitemap.xml             ← File
├── site.webmanifest        ← File
└── .htaccess               ← File (create this)
```

**From your computer, upload:**
- All files from `C:\Users\HAYK\Desktop\FreightPro\frontend\dist\`

**Note:** Upload the CONTENTS of dist/ folder, not the folder itself!

---

## Step-by-Step Upload Process

### Part 1: Build Frontend

First, build the frontend:

**Open PowerShell in FreightPro folder:**
```powershell
cd C:\Users\HAYK\Desktop\FreightPro
cd frontend
npm install
# Replace yourdomain.com with your actual domain!
$env:VITE_API_URL="https://api.yourdomain.com/api"; npm run build
```

This creates `frontend/dist/` with all files ready.

---

### Part 2: Upload Backend

1. **Go to Hostinger File Manager**
2. **Navigate to:** `domains/yourdomain.com/public_html/`
3. **Create folder:** `api/`
4. **Upload to `api/` folder:**
   - Right-click `api/` folder → Upload
   - Select these files from your computer:
     - `backend/dist/` folder (entire folder)
     - `backend/package.json`
     - `backend/package-lock.json`
     - `backend/ecosystem.config.js` (or `ecosystem.config.js` from root)

---

### Part 3: Upload Frontend

1. **Stay in:** `domains/yourdomain.com/public_html/`
2. **Delete all default files** (index.html, etc.)
3. **Select ALL files** from `frontend/dist/` on your computer
4. **Upload** to `public_html/` root
5. **Create `.htaccess` file** in `public_html/` with this content:

```apache
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

---

## Alternative: Use FileZilla or FTP

If File Manager is slow, use FTP:

1. **Get FTP credentials** from Hostinger:
   - Host: ftp.yourdomain.com
   - Username: (your username)
   - Password: (your password)
   - Port: 21

2. **Connect with FileZilla**
3. **Navigate to:** `/domains/yourdomain.com/public_html/`
4. **Upload files** as described above

---

## After Upload, Configure Hostinger

### 1. Create Node.js App (for Backend)

1. Go to **Advanced → Node.js Apps**
2. Click **"Create Node.js App"**
3. Fill in:
   - **App Name:** freightpro-backend
   - **App Domain:** api.yourdomain.com
   - **Node Version:** 18 or 20
   - **Document Root:** public_html/api
   - **Start File:** dist/server.js
   - **Port:** 10000 (or auto)
4. **Add Environment Variables:**
   ```
   NODE_ENV=production
   MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dreightpro?retryWrites=true&w=majority
   JWT_SECRET=changeme-to-random-32-characters
   FRONTEND_URL=https://www.yourdomain.com
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASS=your-app-password
   ```
5. Click **"Create"**

---

### 2. Enable SSL

1. Go to **Advanced → SSL**
2. Enable **Let's Encrypt** for:
   - www.yourdomain.com
   - api.yourdomain.com
3. Wait for installation

---

### 3. Test

1. **Backend:** https://api.yourdomain.com/api/health (should return 200)
2. **Frontend:** https://www.yourdomain.com (should load app)

---

## File Upload Checklist

### Backend (api/ folder):

- [ ] `api/dist/` folder uploaded
- [ ] `api/package.json` uploaded
- [ ] `api/package-lock.json` uploaded
- [ ] `api/ecosystem.config.js` uploaded
- [ ] Node.js app created
- [ ] Environment variables added

### Frontend (public_html/ folder):

- [ ] Old files deleted
- [ ] `frontend/dist/index.html` uploaded
- [ ] `frontend/dist/assets/` folder uploaded
- [ ] `frontend/dist/manifest.json` uploaded
- [ ] `frontend/dist/robots.txt` uploaded
- [ ] `frontend/dist/sitemap.xml` uploaded
- [ ] `frontend/dist/site.webmanifest` uploaded
- [ ] `.htaccess` created
- [ ] SSL enabled

---

## Important Notes

1. **NO migration wizard needed** - You're uploading files manually
2. **Backend needs Node.js hosting** - Create Node.js app in Hostinger
3. **Frontend is static files** - Just upload to public_html
4. **Database stays on MongoDB Atlas** - Already configured
5. **Replace yourdomain.com** - With your actual domain everywhere!

---

## Need Help?

If upload fails:
- Check file permissions in File Manager
- Verify you're uploading to correct folders
- Make sure ecosystem.config.js is in backend/ folder
- Check Hostinger logs for Node.js app errors

---

## Your Files Are Ready!

All files are compiled and ready in:
- `backend/dist/` - Backend
- `frontend/dist/` - Frontend (build it first!)

Just upload and configure!
