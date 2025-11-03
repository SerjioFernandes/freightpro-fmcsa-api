# 🚀 FREIGHTPRO / CARGOLUME - PRODUCTION LAUNCH PLAN

## 📋 EXECUTIVE SUMMARY

**Project:** FreightPro/CargoLume Load Board Platform  
**Type:** Full-Stack Web Application  
**Frontend:** React 19 + TypeScript + Vite + TailwindCSS  
**Backend:** Node.js 18+ + Express + TypeScript + MongoDB (Mongoose)  
**Database:** MongoDB Atlas (Free Tier)  
**Deployment Target:** Railway (Backend) + Vercel (Frontend)  
**Domain:** Hostinger DNS  
**Estimated Setup Time:** 15-30 minutes  
**Cost:** FREE (MongoDB Atlas free tier + Railway free tier + Vercel free tier)

---

## ✅ PRE-DEPLOYMENT CHECKLIST

### 1. Repository Analysis
- [x] Frontend builds successfully (`npm run build` in `frontend/`)
- [x] Backend compiles successfully (`npm run build` in `backend/`)
- [x] Models verified: User, Load, Message, Shipment, Document, Notification, SavedSearch, PushSubscription
- [x] No TypeScript errors
- [x] `.gitignore` configured correctly (excludes `.env`, `node_modules/`, `dist/`, `uploads/`)
- [x] All dependencies installed (`package.json` verified)

### 2. Infrastructure Prerequisites
- [ ] **MongoDB Atlas Cluster Created**
  - Go to: https://cloud.mongodb.com
  - Create free M0 cluster (shared, 512MB)
  - Create database user with password
  - Whitelist IP: `0.0.0.0/0` (allow all IPs)
  - Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/cargolume`
  
- [ ] **GitHub Repository Access**
  - Repository: `freightpro-fmcsa-api`
  - Access to GitHub account
  
- [ ] **Railway.app Account**
  - Sign up: https://railway.app
  - Connect GitHub account
  
- [ ] **Vercel Account**
  - Sign up: https://vercel.com
  - Connect GitHub account
  
- [ ] **Hostinger DNS Access**
  - Domain already configured
  - Access to DNS zone editor

### 3. Credentials to Generate
Generate these secrets **NOW** before proceeding:

```bash
# Generate secure JWT secret (run locally)
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# Save output (will be ~96 characters)
# Example: "a1b2c3d4e5f6...xyz" (paste into JWT_SECRET below)
```

---

## 🔐 ENVIRONMENT VARIABLES TEMPLATE

### **Backend (Railway)**

```env
# Database
MONGODB_URI=mongodb+srv://USERNAME:PASSWORD@CLUSTER.mongodb.net/cargolume?retryWrites=true&w=majority

# Authentication
JWT_SECRET=paste_your_generated_jwt_secret_here_96_characters

# Server
NODE_ENV=production
PORT=4000

# Frontend URL (will be your Vercel URL)
FRONTEND_URL=https://your-app.vercel.app

# Email (Gmail with App Password)
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_gmail_app_password_16_chars

# Push Notifications (Optional - can leave empty)
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

**Replace these placeholders:**
- `USERNAME` / `PASSWORD`: MongoDB Atlas credentials
- `CLUSTER`: Your MongoDB cluster name
- `JWT_SECRET`: Generated secret from above
- `your-email@gmail.com`: Your Gmail address
- `your_gmail_app_password_16_chars`: Gmail App Password (generate in Google Account → Security → 2-Step Verification → App passwords)
- `your-app.vercel.app`: Your Vercel deployment URL

### **Frontend (Vercel)**

```env
VITE_API_URL=https://your-backend.railway.app/api
```

**Replace:**
- `your-backend.railway.app`: Your Railway deployment URL

---

## 📦 CHECK-OR-PASTE-HERE SECTION

**Fill in your real values below, then copy-paste into Railway/Vercel:**

### Step 1: Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Copy the output → `JWT_SECRET=`

### Step 2: Get MongoDB URI
From MongoDB Atlas dashboard → Connect → Connect your application

Copy full string → `MONGODB_URI=`

### Step 3: Create Gmail App Password
1. Google Account → Security → 2-Step Verification (enable if not already)
2. App passwords → Generate → "Mail" → "Other"
3. Copy 16-character password → `EMAIL_PASS=`

### Step 4: Get Domain
Your domain: `________________.com`

Railway API subdomain: `api.________________.com`

Vercel main domain: `________________.com` or `www.________________.com`

---

## 🚀 DEPLOYMENT STEPS (Railway + Vercel)

### PHASE 1: Backend Deployment (Railway)

#### Step 1.1: Create Railway Project
1. Go to https://railway.app
2. Log in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose repository: `freightpro-fmcsa-api`
6. Railway auto-detects Node.js

#### Step 1.2: Configure Railway Settings
1. Click on your service
2. Go to **Settings** tab
3. Under **General**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: Leave default

#### Step 1.3: Add Environment Variables
1. Go to **Variables** tab
2. Click "New Variable"
3. Add each variable below (copy from CHECK-OR-PASTE section):

```
MONGODB_URI=<your-mongodb-uri>
JWT_SECRET=<your-generated-jwt-secret>
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://your-app.vercel.app
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

**⚠️ Replace placeholders with real values!**

#### Step 1.4: Deploy
1. Click "Deploy" or "Redeploy"
2. Wait 2-5 minutes for build
3. Railway generates URL like: `https://freightpro-production.up.railway.app`
4. Copy this URL for `FRONTEND_URL` and `VITE_API_URL`

#### Step 1.5: Custom Domain (Optional but Recommended)
1. Railway Dashboard → **Settings** → **Domains**
2. Click "Generate Domain" if not already done
3. Click "Custom Domain"
4. Enter: `api.yourdomain.com`
5. Add DNS CNAME record in Hostinger (see HOSTINGER-DNS-GUIDE.md)
6. Wait for SSL certificate (automatic, 2-5 minutes)

#### Step 1.6: Verify Backend
```bash
# Test health endpoint
curl https://your-backend.railway.app/api/health

# Should return:
# {"status":"ok","message":"CargoLume Load Board API is running",...}
```

---

### PHASE 2: Frontend Deployment (Vercel)

#### Step 2.1: Import Project
1. Go to https://vercel.com
2. Log in with GitHub
3. Click "Add New..." → "Project"
4. Import repository: `freightpro-fmcsa-api`
5. Configure project:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

#### Step 2.2: Add Environment Variables
1. Go to **Settings** → **Environment Variables**
2. Add:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   ```
   **Replace `your-backend.railway.app` with your Railway URL from Step 1.4**

#### Step 2.3: Deploy
1. Click "Deploy"
2. Wait 2-3 minutes
3. Vercel generates URL like: `https://freightpro-git-main.vercel.app`
4. Copy this URL

#### Step 2.4: Update Backend CORS
1. Go back to Railway → Variables
2. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://your-app.vercel.app
   ```
3. Redeploy backend

#### Step 2.5: Custom Domain (Optional but Recommended)
1. Vercel Dashboard → Project → **Settings** → **Domains**
2. Add domain: `yourdomain.com` and `www.yourdomain.com`
3. Vercel shows DNS records to add
4. Add DNS records in Hostinger (see HOSTINGER-DNS-GUIDE.md)
5. Wait for SSL certificate (automatic, 2-10 minutes)

---

### PHASE 3: DNS Configuration (Hostinger)

#### Step 3.1: Add DNS Records

**For Root Domain (www.yourdomain.com):**
```
Type: CNAME
Name: www
Value: cname.vercel-dns.com
TTL: 3600
```

**For Root Domain (yourdomain.com):**
```
Type: A
Name: @
Value: 76.76.21.21 (Vercel IP - verify in Vercel dashboard)
TTL: 3600
```

**For API Subdomain (api.yourdomain.com):**
```
Type: CNAME
Name: api
Value: <railway-generated-domain>.up.railway.app
TTL: 3600
```

#### Step 3.2: Verify DNS Propagation
```bash
# Check DNS (wait 5-60 minutes for propagation)
nslookup www.yourdomain.com
nslookup api.yourdomain.com
```

#### Step 3.3: Test SSL
Visit:
- https://www.yourdomain.com → Should load frontend
- https://api.yourdomain.com/api/health → Should return JSON

---

### PHASE 4: Data Seeding

#### Step 4.1: Seed Demo Loads
```bash
# Connect to Railway deployment via SSH or use Railway CLI
# OR run locally with production MongoDB URI

cd backend
npm install
# Add MONGODB_URI to .env file temporarily
npm run seed

# This creates 500 demo loads with realistic data
```

#### Step 4.2: Verify Data
1. Visit: https://www.yourdomain.com
2. Register a test account
3. Log in
4. Check Load Board shows loads
5. Check map displays markers

---

### PHASE 5: Smoke Tests

Run all tests from `docs/SMOKE_TESTS.md`:

#### Test 1: Health Check
```bash
curl https://api.yourdomain.com/api/health
```

#### Test 2: Registration
```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "company": "Test Co",
    "phone": "555-1234",
    "accountType": "carrier"
  }'
```

#### Test 3: Login
```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```
Save the JWT token from response.

#### Test 4: Protected Endpoint
```bash
curl -X GET https://api.yourdomain.com/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

#### Test 5: WebSocket
```bash
# Install wscat
npm install -g wscat

# Connect
wscat -c wss://api.yourdomain.com/socket.io/?EIO=4&transport=websocket

# Should connect successfully
```

---

## 🔄 ROLLBACK PROCEDURE

### If Backend Fails

#### Railway Rollback:
1. Railway Dashboard → Deployments
2. Click "..." on previous deployment
3. Click "Promote to Production"

#### Manual Redeploy Previous Commit:
```bash
# Find last good commit
git log

# Redeploy that commit
git checkout <commit-hash>
git push origin main --force
```

### If Frontend Fails

#### Vercel Rollback:
1. Vercel Dashboard → Deployments
2. Click "..." on previous deployment
3. Click "Promote to Production"

---

## 🚨 EMERGENCY CONTACT PLAN

### If Production is Down

**Step 1: Check Railway Logs**
```
Railway Dashboard → Service → Logs
Look for: MongoDB connection errors, JWT errors, port conflicts
```

**Step 2: Check Vercel Logs**
```
Vercel Dashboard → Project → Deployments → View function logs
Look for: Build errors, API connection errors
```

**Step 3: Common Issues**

| Issue | Symptom | Fix |
|-------|---------|-----|
| MongoDB connection | Backend 500 errors | Check `MONGODB_URI`, whitelist IPs |
| CORS error | Frontend can't call API | Update `FRONTEND_URL` in Railway |
| 404 on routes | Frontend refresh shows 404 | Add `.htaccess` (Vercel auto-handles) |
| JWT expired | Logged out constantly | Check `JWT_SECRET` is set correctly |
| WebSocket failed | Messaging not working | Check Socket.io path, CORS, WS upgrade |

**Step 4: Quick Health Check**
```bash
# Backend
curl https://api.yourdomain.com/api/health

# Frontend
curl https://www.yourdomain.com
```

**Step 5: If All Else Fails**
- Check Railway/Vercel status pages
- Review recent code changes
- Contact Railway support (if on free tier, limited support)
- Rollback to previous deployment

---

## 📊 MONITORING & MAINTENANCE

### Set Up Monitoring

#### MongoDB Atlas Monitoring
- Dashboard → Metrics
- Set up alerts for: disk usage >80%, connection count >500
- Enable automated backups (24-hour snapshots)

#### Railway Monitoring
- Use Railway logs
- Consider upgrading to Hobby plan ($5/month) for better logging

#### Vercel Monitoring
- Dashboard → Analytics
- Enable Web Analytics

#### Uptime Monitoring (Recommended)
- UptimeRobot.com (free, 50 monitors)
- Ping every 5 minutes:
  - https://www.yourdomain.com
  - https://api.yourdomain.com/api/health

### Backups

#### MongoDB Atlas Backups
1. Dashboard → Backup → Configure backup
2. Schedule: Continuous (or 24-hour snapshots)
3. Retention: 2-7 days
4. Test restore periodically

#### Code Backups
- GitHub is your backup
- Tag releases: `git tag -a v1.0.0 -m "Production launch"`
- Keep latest 5-10 releases tagged

---

## ✅ POST-DEPLOYMENT CHECKLIST

### Immediate (Day 1)
- [ ] Domain loads correctly
- [ ] SSL certificates active (green padlock)
- [ ] Registration works
- [ ] Login works
- [ ] Load Board displays loads
- [ ] Map shows markers
- [ ] Search/filter works
- [ ] Messaging works (WebSocket)
- [ ] Document upload works
- [ ] Dashboard stats load

### Week 1
- [ ] Monitor error logs daily
- [ ] Check uptime >99%
- [ ] Review user feedback
- [ ] Load testing (50+ concurrent users)
- [ ] Performance audit (PageSpeed Insights)

### Month 1
- [ ] Database optimization (indexes)
- [ ] CDN setup (if needed)
- [ ] Advanced monitoring
- [ ] Security audit
- [ ] User analytics review

---

## 📚 REFERENCE DOCUMENTS

All detailed guides are in `docs/`:

- `docs/RAILWAY-DEPLOY-GUIDE.md` - Railway detailed steps
- `docs/VERCEL-DEPLOY-GUIDE.md` - Vercel detailed steps
- `docs/HOSTINGER-DNS-GUIDE.md` - DNS configuration
- `docs/HOSTINGER-VPS-SETUP.md` - VPS alternative
- `docs/SMOKE_TESTS.md` - Testing commands
- `docs/SECURITY-HARDENING.md` - Security checklist
- `docs/DB-MIGRATION-GUIDE.md` - MongoDB → MySQL migration (future)
- `scripts/smoke-test.sh` - Automated tests
- `scripts/seed-demo-loads.js` - Data seeding
- `scripts/build-and-zip.sh` - Build automation

---

## 🎯 SUCCESS CRITERIA

**Launch is successful when:**
1. ✅ All smoke tests pass
2. ✅ Frontend loads in <2 seconds
3. ✅ Backend responds in <200ms
4. ✅ SSL certificates active
5. ✅ WebSocket connects successfully
6. ✅ File uploads work
7. ✅ No console errors
8. ✅ Mobile responsive
9. ✅ PWA installable
10. ✅ Uptime >99% for 24 hours

---

## 🚀 QUICK START SUMMARY

**Copy-paste these commands:**

```bash
# 1. Generate JWT secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# 2. Deploy backend to Railway
# - Go to railway.app
# - Import GitHub repo
# - Set root: backend
# - Add env vars (see template above)
# - Deploy

# 3. Deploy frontend to Vercel
# - Go to vercel.com
# - Import GitHub repo
# - Set root: frontend
# - Add VITE_API_URL=https://your-railway-url/api
# - Deploy

# 4. Configure DNS
# - Add CNAME for www → Vercel
# - Add A record for @ → Vercel IP
# - Add CNAME for api → Railway

# 5. Seed data
cd backend && npm run seed

# 6. Test
curl https://api.yourdomain.com/api/health
curl https://www.yourdomain.com

# DONE! 🎉
```

---

**Questions? Check `docs/` folder for detailed guides.**

**Ready to launch? Start with Phase 1!**

