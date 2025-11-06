# 📤 Upload Files to Hostinger - Simple Instructions

## ✅ What I Did For You:

1. ✅ Built frontend with Railway backend URL
2. ✅ Created production-ready files in `frontend/dist/` folder
3. ✅ All files are ready to upload!

---

## 📋 What YOU Need to Do:

### Step 1: Go to Hostinger File Manager

1. Go to Hostinger hPanel
2. Click **"File Manager"**
3. Navigate to `public_html/` folder

### Step 2: Delete Old Files

**Delete these files/folders from `public_html/`:**
- `index.html`
- `assets/` folder (delete the entire folder)
- `manifest.json`
- `robots.txt`
- `sitemap.xml`
- `site.webmanifest`
- `sw.js`
- `vite.svg` (optional)

**DO NOT DELETE:**
- `.htaccess` (keep it!)
- `api/` folder (optional - you can delete it later, it won't work anyway)

### Step 3: Upload New Files

**Upload ALL files from `frontend/dist/` folder:**

**Location on your computer:**
```
C:\Users\HAYK\Desktop\FreightPro\frontend\dist\
```

**Files to upload:**
1. `index.html`
2. `assets/` folder (upload the ENTIRE folder with all files inside)
3. `manifest.json`
4. `robots.txt`
5. `sitemap.xml`
6. `site.webmanifest`
7. `sw.js`

**How to upload:**
1. In Hostinger File Manager, click **"Upload"** button
2. Select all files from `frontend/dist/` folder
3. Wait for upload to complete

### Step 4: Verify .htaccess File

Make sure `.htaccess` file exists in `public_html/` with this content:

```
Options -MultiViews
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^ index.html [QSA,L]
```

If it doesn't exist or is wrong, create/edit it with the content above.

---

## ✅ After Uploading:

1. **Clear browser cache:**
   - Press `Ctrl + Shift + Delete`
   - Clear cached images and files
   - Click "Clear data"

2. **Visit your website:**
   - Go to: `https://www.cargolume.com`
   - Should load your frontend

3. **Test the connection:**
   - Try to register or login
   - Should connect to Railway backend
   - No CORS errors!

---

## 📁 Files Ready in `frontend/dist/`:

✅ `index.html` - Main page
✅ `assets/` - All CSS and JavaScript files (bundled)
✅ `manifest.json` - PWA configuration
✅ `robots.txt` - SEO configuration
✅ `sitemap.xml` - SEO sitemap
✅ `site.webmanifest` - PWA manifest
✅ `sw.js` - Service worker for offline support

**All files are configured to use Railway backend!**

---

## 🎯 Quick Checklist:

- [ ] Deleted old files from Hostinger `public_html/`
- [ ] Uploaded `index.html` from `frontend/dist/`
- [ ] Uploaded `assets/` folder (entire folder)
- [ ] Uploaded `manifest.json`
- [ ] Uploaded `robots.txt`
- [ ] Uploaded `sitemap.xml`
- [ ] Uploaded `site.webmanifest`
- [ ] Uploaded `sw.js`
- [ ] Verified `.htaccess` file exists
- [ ] Cleared browser cache
- [ ] Tested website
- [ ] Everything works! ✅

---

## 🆘 If Something Doesn't Work:

1. **Check browser console (F12):**
   - Look for errors
   - Make sure API calls go to Railway URL

2. **Verify files uploaded correctly:**
   - Check file sizes match
   - Make sure `assets/` folder has all files

3. **Clear cache again:**
   - Hard refresh: `Ctrl + F5`
   - Or clear all browser data

---

**All files are ready in `frontend/dist/` folder! Just upload them to Hostinger!** 🚀

