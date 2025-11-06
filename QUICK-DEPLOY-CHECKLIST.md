# ⚡ Quick Deploy Checklist - 30 Minutes

## Backend Deployment (Railway) - 5 minutes

- [ ] **Step 1**: Commit and push changes
  ```bash
  cd C:\Users\HAYK\Desktop\FreightPro
  git add .
  git commit -m "Deploy latest fixes"
  git push origin main
  ```

- [ ] **Step 2**: Wait for Railway auto-deploy (2-5 minutes)
  - Go to Railway dashboard
  - Check deployment status shows "Active"
  - Check logs show "Server Started"

- [ ] **Step 3**: Test backend health
  - Open: `https://freightpro-fmcsa-api-production.up.railway.app/api/health`
  - Should return: `{"status":"ok"}`

## Frontend Deployment (Hostinger) - 20 minutes

- [ ] **Step 1**: Build frontend
  ```bash
  cd C:\Users\HAYK\Desktop\FreightPro\frontend
  npm run build
  ```

- [ ] **Step 2**: Go to Hostinger File Manager
  - Login to hPanel
  - Open File Manager
  - Navigate to `public_html/`

- [ ] **Step 3**: Delete old files (optional, backup first)
  - Delete old `index.html`
  - Delete old `assets/` folder

- [ ] **Step 4**: Upload new files
  - Upload ALL files from `frontend/dist/` folder
  - Upload `index.html`
  - Upload `assets/` folder (entire folder)
  - Upload any other files in `dist/`

- [ ] **Step 5**: Clear browser cache
  - Press `Ctrl + Shift + Delete`
  - Clear cached files
  - Or use Incognito window

## Testing - 5 minutes

- [ ] **Test 1**: Open website
  - Go to: `https://www.cargolume.com`
  - Should load without errors

- [ ] **Test 2**: Check browser console (F12)
  - No red errors
  - API calls go to Railway backend

- [ ] **Test 3**: Test login
  - Go to `/login`
  - Enter credentials
  - Should work

- [ ] **Test 4**: Test Load Board
  - Go to `/loads`
  - Should display loads

- [ ] **Test 5**: Test WebSocket
  - Open DevTools → Network → WS tab
  - Should see WebSocket connection
  - Should be connected to Railway

## Done! ✅

If all tests pass, your website is live with all latest changes!

---

**Time**: ~30 minutes
**Difficulty**: Easy

