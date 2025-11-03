# 🚀 Vercel Deployment Information

## Project Details

**Repository:** `freightpro-fmcsa-api`  
**Vercel Project Name:** `frontend`  
**Project ID:** `prj_r28ilCX5LguTKAO3M1f6yybTpDAK`

## Current Deployment URLs

### Frontend (Vercel)
- **Production:** Check your Vercel dashboard for the current URL
- **Old URL:** `https://frontend-gfjil28dv-serjiofernandes-projects.vercel.app`
- **Possible URLs:**
  - `https://freightpro.vercel.app` (if you renamed it)
  - `https://freightpro-frontend.vercel.app`
  - `https://freightpro-fmcsa.vercel.app`

### Backend (Render)
- **Production:** `https://freightpro-fmcsa-api.onrender.com`

---

## How to Find Your CURRENT Vercel URL

### Method 1: Vercel Dashboard (EASIEST)
1. Go to: https://vercel.com/dashboard
2. Login with GitHub
3. Find project named **"frontend"** or **"freightpro-fmcsa-api"**
4. Click on the project
5. See the latest deployment URL at the top

### Method 2: Check Recent Deployment Emails
- Vercel sends deployment emails with the URL
- Check your inbox for the latest one

### Method 3: Check GitHub Integration
1. Go to: https://github.com/SerjioFernandes/freightpro-fmcsa-api
2. Click **"Settings"** → **"Deploy keys"** or check the repo description
3. May have Vercel badge with URL

### Method 4: Environment Variables
Your `.env` or Vercel dashboard may have:
- `VITE_API_URL` - Frontend URL
- `FRONTEND_URL` - Used by backend CORS

---

## Deployment Configuration

### Root Directory
Vercel is configured to deploy from the **root** of the repository.

### Frontend (from `/frontend` folder)
- **Framework:** Vite + React
- **Build Command:** `cd frontend && npm run build`
- **Output Directory:** `frontend/dist`
- **Node Version:** 18.x or 20.x

### Backend (from `/backend` folder)
- **Currently deployed to Render**
- Has `vercel.json` but should NOT be deployed to Vercel
- Keep on Render for WebSocket support

---

## Important Notes

### ⚠️ Two Deployment Platforms

You have TWO deployments:

1. **Frontend on Vercel** ✅
   - Static React app
   - SPA routing
   - Environment: `VITE_API_URL`

2. **Backend on Render** ✅
   - Node.js + Express API
   - WebSocket support
   - Environment: `FRONTEND_URL`

### 🔗 Connecting Frontend ↔ Backend

**Frontend (Vercel) → Backend (Render):**
- Set in Vercel dashboard: `VITE_API_URL=https://freightpro-fmcsa-api.onrender.com`

**Backend (Render) → Frontend (Vercel):**
- Set in Render dashboard: `FRONTEND_URL=<your-vercel-url>`
- This enables CORS for your frontend

---

## Current Status

✅ **Auto-Deploy Enabled** - Every push to `main` triggers Vercel deployment

**Last Push:** Just now (all latest code including seed script)

**Next Steps:**
1. Wait 2-3 minutes for Vercel to finish building
2. Get your URL from Vercel dashboard
3. Test the site
4. Run seed script to populate demo data
5. Test all 50-hour plan features

---

## Testing Your Live Site

Once you have your Vercel URL:

### 1. Test Load Board
```
https://your-vercel-url.vercel.app/loadboard
```
Should show loads (after seeding)

### 2. Test Real-Time Features
- Open in 2 browser windows
- Send a message → See it appear instantly in the other window
- Post a load → See it appear instantly in the other window

### 3. Test Maps
```
https://your-vercel-url.vercel.app/loadboard
Click "Map" toggle in top-right
```

### 4. Test Saved Searches
```
https://your-vercel-url.vercel.app/saved-searches
```

---

## Need Help?

### Can't Find Your URL?
- Go to Vercel dashboard
- Look for project with ID: `prj_r28ilCX5LguTKAO3M1f6yybTpDAK`
- Or search for repository: `freightpro-fmcsa-api`

### Deployment Not Working?
- Check Vercel build logs for errors
- Verify environment variables are set
- Make sure repository is connected to Vercel
- Check `frontend/vercel.json` is correct

### API Not Connecting?
- Verify `VITE_API_URL` is set in Vercel dashboard
- Check CORS settings in Render backend
- Test backend health: https://freightpro-fmcsa-api.onrender.com/api/health

---

## Quick Check Commands

Once you have your URL, verify it works:

```bash
# Check frontend is accessible
curl https://your-vercel-url.vercel.app

# Check API is accessible
curl https://freightpro-fmcsa-api.onrender.com/api/health

# Check if seed endpoint exists
curl -H "Authorization: Bearer YOUR_TOKEN" \
  https://freightpro-fmcsa-api.onrender.com/api/admin/seed-loads
```

---

**🎯 GO TO VERCEL DASHBOARD NOW TO GET YOUR URL!**

