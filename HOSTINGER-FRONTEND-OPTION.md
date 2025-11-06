# 🏠 Host Frontend on Hostinger (Instead of Vercel)

## ✅ Good News!

Since you have Hostinger Business Web Hosting, you can host your **frontend** there instead of Vercel!

**Why this works:**
- Frontend = Static files (HTML, CSS, JavaScript) ✅
- Hostinger supports static files ✅
- No Node.js needed for frontend ✅

---

## 📋 Your Setup Options:

### Option 1: Keep Using Vercel (Current)
- ✅ Free
- ✅ Automatic deployments from GitHub
- ✅ Easy to update
- ✅ Better performance/CDN
- ❌ Extra service (but free)

### Option 2: Use Hostinger (You Already Pay For It!)
- ✅ Already paid for it
- ✅ Everything in one place
- ✅ No extra services needed
- ❌ Manual uploads (no auto-deploy from GitHub)
- ❌ Slower updates

---

## 🚀 How to Host Frontend on Hostinger

### Step 1: Build Your Frontend

1. Open terminal in your project
2. Go to frontend folder:
   ```bash
   cd frontend
   ```

3. Install dependencies (if not done):
   ```bash
   npm install
   ```

4. Build for production:
   ```bash
   VITE_API_URL=https://freightpro-fmcsa-api-production.up.railway.app/api npm run build
   ```

5. This creates a `dist` folder with all static files

### Step 2: Upload to Hostinger

1. Go to Hostinger hPanel → **File Manager**
2. Navigate to `public_html` folder
3. **Delete** all existing files (or backup first)
4. Upload **ALL files** from `frontend/dist/` folder:
   - `index.html`
   - `assets/` folder (all CSS/JS files)
   - `manifest.json`
   - `robots.txt`
   - `sitemap.xml`
   - `site.webmanifest`
   - `sw.js` (service worker)

### Step 3: Create .htaccess File

In Hostinger File Manager → `public_html/`:

1. Click **"New File"**
2. Name it: `.htaccess` (with the dot at the beginning)
3. Add this content:
   ```
   Options -MultiViews
   RewriteEngine On
   RewriteCond %{REQUEST_FILENAME} !-f
   RewriteRule ^ index.html [QSA,L]
   ```
4. Save

### Step 4: Update Backend CORS (If Needed)

1. Go to Railway → Your Service → **Variables**
2. Make sure `FRONTEND_URL` is: `https://www.cargolume.com`
3. Save (Railway will auto-redeploy)

---

## ✅ After Uploading to Hostinger:

1. Visit: `https://www.cargolume.com`
2. Should see your frontend
3. Test registration/login
4. Should connect to Railway backend

---

## 📝 Summary:

**Your Complete Setup (Option 2 - Hostinger):**
- ✅ **Frontend**: Hostinger `public_html/` folder
- ✅ **Backend**: Railway (free tier)
- ✅ **Database**: MongoDB Atlas (free tier)
- ✅ **Domain**: Hostinger
- ✅ **Total Cost**: $0 extra (just your Hostinger plan)

---

## 🔄 When You Want to Update Frontend:

1. Make changes to your code
2. Run `npm run build` in frontend folder
3. Upload new files from `frontend/dist/` to Hostinger
4. Replace old files
5. Done!

---

## 💡 Recommendation:

**Use Hostinger for frontend** since:
- You already pay for it
- Everything in one place
- No need for Vercel
- Works perfectly for static files

**Keep Railway for backend** because:
- Hostinger Business doesn't support Node.js
- Railway is free
- Better for backend hosting

---

**You don't need Vercel! You can use Hostinger for frontend!** 🎉

