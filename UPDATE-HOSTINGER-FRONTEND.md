# 🔧 Update Hostinger Frontend to Use Railway Backend

## ✅ Good News!

You already have frontend files on Hostinger! But they're pointing to the wrong backend URL.

**Current Situation:**
- ✅ Frontend files are on Hostinger (`public_html/`)
- ❌ Backend files in `public_html/api/` won't work (Hostinger doesn't support Node.js)
- ✅ Backend is running on Railway
- ❌ Frontend needs to point to Railway backend

---

## 🚀 Solution: Rebuild Frontend with Railway Backend URL

### Step 1: Rebuild Frontend Locally

1. Open terminal in your project:
   ```bash
   cd frontend
   ```

2. Install dependencies (if not done):
   ```bash
   npm install
   ```

3. **Build with Railway backend URL:**
   ```bash
   VITE_API_URL=https://freightpro-fmcsa-api-production.up.railway.app/api npm run build
   ```
   
   **Important:** This tells the frontend to use Railway backend instead of local `/api`

4. This creates a new `dist` folder with updated files

### Step 2: Upload New Files to Hostinger

1. Go to Hostinger File Manager → `public_html/`

2. **Delete old files** (backup first if you want):
   - `index.html`
   - `assets/` folder
   - `manifest.json`
   - `robots.txt`
   - `sitemap.xml`
   - `site.webmanifest`
   - `sw.js`
   - `vite.svg`

3. **Upload NEW files** from `frontend/dist/`:
   - Upload `index.html`
   - Upload `assets/` folder (ALL files inside)
   - Upload `manifest.json`
   - Upload `robots.txt`
   - Upload `sitemap.xml`
   - Upload `site.webmanifest`
   - Upload `sw.js`

4. **Keep `.htaccess` file** (it's correct!)

### Step 3: Remove/Keep Backend Folder

You can **delete** the `public_html/api/` folder since:
- It won't work on Hostinger (no Node.js)
- Backend is now on Railway
- It's just taking up space

**OR** keep it if you want (it won't hurt anything, just won't work)

---

## ✅ After Uploading:

1. Visit: `https://www.cargolume.com`
2. Clear browser cache (Ctrl+Shift+Delete)
3. Test registration/login
4. Should connect to Railway backend! ✅

---

## 📋 Quick Checklist:

- [ ] Rebuilt frontend with Railway backend URL
- [ ] Uploaded new files to Hostinger `public_html/`
- [ ] Kept `.htaccess` file
- [ ] Cleared browser cache
- [ ] Tested frontend → Railway backend connection
- [ ] Everything works!

---

## 🎯 Summary:

**Your Setup:**
- ✅ **Frontend**: Hostinger `public_html/` (static files)
- ✅ **Backend**: Railway (Node.js)
- ✅ **Database**: MongoDB Atlas
- ✅ **Domain**: Hostinger

**No Vercel needed!** Everything works with Hostinger + Railway! 🎉

---

**The key fix: Rebuild frontend with Railway backend URL and re-upload to Hostinger!**

