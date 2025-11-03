# Hostinger Deployment Checklist

Use this checklist when deploying to Hostinger.

---

## Pre-Deployment (Local)

- [ ] Backend is built: `cd backend && npm run build`
- [ ] `backend/dist/` folder exists with compiled files
- [ ] Frontend will be built with correct API URL
- [ ] Domain name decided for deployment
- [ ] MongoDB Atlas connection string ready
- [ ] Environment variables prepared

---

## Build Frontend

- [ ] Navigate to `frontend/` folder
- [ ] Run `npm install`
- [ ] Build with: `VITE_API_URL=https://api.yourdomain.com/api npm run build`
- [ ] Verify `frontend/dist/` folder exists
- [ ] Check `frontend/dist/index.html` exists

---

## Upload Backend to Hostinger

### Via Hostinger File Manager:

- [ ] Navigate to `domains/yourdomain.com/public_html/`
- [ ] Create folder: `api/`
- [ ] Upload `backend/dist/` folder to `api/dist/`
- [ ] Upload `backend/package.json` to `api/`
- [ ] Upload `backend/package-lock.json` to `api/`
- [ ] Upload `Others/ecosystem.config.js` to `api/ecosystem.config.js`

---

## Configure Backend Node.js App

### In Hostinger Control Panel:

- [ ] Go to Advanced → Node.js Apps
- [ ] Click "Create Node.js App"
- [ ] Set App Name: `freightpro-backend`
- [ ] Set App Domain: `api.yourdomain.com`
- [ ] Set Node Version: 18 or 20
- [ ] Set Document Root: `public_html/api`
- [ ] Set Start File: `dist/server.js`
- [ ] Set Port: 10000 (or auto)
- [ ] Add environment variable: `NODE_ENV=production`
- [ ] Add environment variable: `MONGODB_URI=your-connection-string`
- [ ] Add environment variable: `JWT_SECRET=random-32-chars`
- [ ] Add environment variable: `FRONTEND_URL=https://www.yourdomain.com`
- [ ] Add environment variable: `EMAIL_USER=your-email`
- [ ] Add environment variable: `EMAIL_PASS=your-password`
- [ ] Click "Create" and wait for deployment
- [ ] Check logs for successful startup

---

## Upload Frontend to Hostinger

### Via Hostinger File Manager:

- [ ] Navigate to `domains/yourdomain.com/public_html/`
- [ ] Delete all default files (index.html, etc.)
- [ ] Upload `frontend/dist/index.html` to root
- [ ] Upload `frontend/dist/assets/` folder to root
- [ ] Upload `frontend/dist/manifest.json` to root
- [ ] Upload `frontend/dist/robots.txt` to root (if exists)
- [ ] Upload `frontend/dist/sitemap.xml` to root (if exists)
- [ ] Upload `frontend/dist/site.webmanifest` to root
- [ ] Upload `frontend/dist/sw.js` to root (if exists)
- [ ] Create `.htaccess` file in root with correct content
- [ ] Verify `.htaccess` permissions

---

## Configure SSL

### In Hostinger Control Panel:

- [ ] Go to Advanced → SSL
- [ ] Enable Let's Encrypt for `www.yourdomain.com`
- [ ] Enable Let's Encrypt for `api.yourdomain.com`
- [ ] Wait for SSL certificates to install
- [ ] Verify SSL is active

---

## Testing

### Basic Connectivity:

- [ ] Backend health check: `https://api.yourdomain.com/api/health`
  - Expected: 200 OK
  - Status: [ ] Pass / [ ] Fail

- [ ] Frontend loads: `https://www.yourdomain.com`
  - Expected: App loads, no white screen
  - Status: [ ] Pass / [ ] Fail

### Authentication:

- [ ] Visit login page
- [ ] Register new user
- [ ] Verify email (if enabled)
- [ ] Login with new account
- [ ] Dashboard loads
  - Status: [ ] Pass / [ ] Fail

### Load Board:

- [ ] Navigate to Load Board
- [ ] See loads displayed
- [ ] Filters work
- [ ] Search works
- [ ] Map view displays markers
  - Status: [ ] Pass / [ ] Fail

### Other Features:

- [ ] Dashboard shows stats
- [ ] Messaging works
- [ ] Documents upload/download works
- [ ] Saved searches work
- [ ] Profile updates work
  - Status: [ ] Pass / [ ] Fail

### Browser Console:

- [ ] No 404 errors
- [ ] No CORS errors
- [ ] WebSocket connects successfully
- [ ] No JavaScript errors
  - Status: [ ] Pass / [ ] Fail

---

## Seed Demo Data

- [ ] Login to app
- [ ] Open browser console (F12)
- [ ] Run seed script:
```javascript
const token = localStorage.getItem('authToken');
fetch('https://api.yourdomain.com/api/admin/seed-loads', {
  headers: { 'Authorization': `Bearer ${token}` }
}).then(r => r.json()).then(console.log);
```
- [ ] See success message
- [ ] Refresh Load Board
- [ ] See 500 demo loads
  - Status: [ ] Pass / [ ] Fail

---

## Post-Deployment

### Performance Check:

- [ ] API response time < 500ms
- [ ] Frontend loads in < 3 seconds
- [ ] Images load quickly
- [ ] No major lags or delays
  - Status: [ ] Pass / [ ] Fail

### Security Check:

- [ ] HTTPS enforced
- [ ] No mixed content warnings
- [ ] JWT tokens work correctly
- [ ] Protected routes require auth
  - Status: [ ] Pass / [ ] Fail

### Monitoring:

- [ ] Check backend logs for errors
- [ ] Set up log monitoring (optional)
- [ ] Monitor MongoDB connections
- [ ] Check disk space usage
  - Status: [ ] Pass / [ ] Fail

---

## Rollback Plan (If Needed)

- [ ] Backup current files before changes
- [ ] Know how to restore files
- [ ] Test rollback procedure
- [ ] Document any issues found

---

## Troubleshooting

If something fails, check:

- [ ] Backend Node.js logs in Hostinger
- [ ] Browser console errors
- [ ] Network tab in DevTools
- [ ] Environment variables are correct
- [ ] MongoDB Atlas allows Hostinger IPs
- [ ] SSL certificates installed correctly
- [ ] File permissions are correct
- [ ] `.htaccess` syntax is correct

---

## Final Verification

- [ ] All tests passed
- [ ] Demo data seeded successfully
- [ ] No errors in logs
- [ ] App works for all user types
- [ ] Performance is acceptable
- [ ] SSL working correctly

---

## Deployment Complete! 🎉

**Your FreightPro app is now live on Hostinger!**

**URLs:**
- Frontend: https://www.yourdomain.com
- Backend API: https://api.yourdomain.com/api

**Next Steps:**
- Set up regular backups
- Monitor logs for issues
- Consider CDN for static assets
- Set up domain email
- Configure monitoring tools

---

**Deployment Date:** ___________

**Deployed By:** ___________

**Notes:** 
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________

