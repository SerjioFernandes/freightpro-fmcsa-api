# 🚂 Railway.app Deployment Guide

Complete step-by-step guide to deploy FreightPro backend to Railway.

## Prerequisites

- ✅ GitHub account with code pushed to `freightpro-fmcsa-api` repository
- ✅ Railway.app account (sign up at https://railway.app)
- ✅ MongoDB Atlas cluster (see MongoDB setup below)
- ✅ Environment variables prepared (see LAUNCH_PLAN.md)

---

## Step 1: Create Railway Project

### 1.1 Sign Up/Login
1. Go to https://railway.app
2. Click "Start a New Project"
3. Sign up with GitHub (recommended)

### 1.2 Create New Project
1. In Railway dashboard, click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Authorize Railway to access your GitHub if prompted
4. Find and select: `freightpro-fmcsa-api`
5. Click **"Deploy Now"**

Railway will auto-detect Node.js and start deployment.

---

## Step 2: Configure Build Settings

### 2.1 Open Service Settings
1. Click on your newly created service
2. Go to **Settings** tab
3. Scroll to **Build & Deploy** section

### 2.2 Set Root Directory
1. Find **"Root Directory"** field
2. Set to: `backend`
3. Click **"Save Changes"**

### 2.3 Verify Build Commands
Railway should auto-detect:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

If not, set manually:
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Save Changes**

---

## Step 3: Add Environment Variables

### 3.1 Open Variables Tab
1. Click **"Variables"** tab
2. Click **"New Variable"**

### 3.2 Add Required Variables

Add each variable one by one:

```
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/cargolume?retryWrites=true&w=majority
```

```
JWT_SECRET=paste_your_generated_96_character_secret_here
```

```
NODE_ENV=production
```

```
PORT=4000
```

```
FRONTEND_URL=https://your-app.vercel.app
```

```
EMAIL_USER=your-email@gmail.com
```

```
EMAIL_PASS=your_gmail_app_password_16_chars
```

### 3.3 Add Optional Variables

If using push notifications, add:

```
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_SUBJECT=mailto:admin@yourdomain.com
```

**⚠️ Replace all placeholders with real values from LAUNCH_PLAN.md**

---

## Step 4: Configure Health Check

### 4.1 Enable Health Check
1. Go to **Settings** → **Health Check**
2. Set **Health Check Path**: `/api/health`
3. Set **Timeout**: `30 seconds`

This helps Railway detect if your app crashes.

---

## Step 5: Generate Domain

### 5.1 Create Domain
1. Go to **Settings** → **Domains**
2. Click **"Generate Domain"**
3. Railway creates URL like: `freightpro-production.up.railway.app`
4. **Copy this URL** - you'll need it for frontend config

### 5.2 Test Deployment
Open: `https://freightpro-production.up.railway.app/api/health`

Should return JSON:
```json
{
  "status": "ok",
  "message": "CargoLume Load Board API is running",
  "service": "CargoLume Load Board API",
  "version": "2.0.0"
}
```

---

## Step 6: Custom Domain (Optional)

### 6.1 Add Custom Domain
1. Still in **Settings** → **Domains**
2. Click **"Custom Domain"**
3. Enter: `api.yourdomain.com`
4. Click **"Add Domain"**

### 6.2 Railway Shows DNS Instructions
Railway displays something like:
```
Add a CNAME record:
Name: api
Value: freightpro-production.up.railway.app
```

### 6.3 Add DNS Record in Hostinger
1. Go to Hostinger DNS management
2. Add CNAME record:
   - **Name**: `api`
   - **Type**: `CNAME`
   - **Value**: `freightpro-production.up.railway.app`
   - **TTL**: `3600`
3. Save

### 6.4 Wait for SSL
Railway automatically provisions SSL certificate.
- Usually takes 2-5 minutes
- Check status in Railway dashboard
- Once "Valid" appears, domain is ready

### 6.5 Test Custom Domain
```bash
curl https://api.yourdomain.com/api/health
```

---

## Step 7: Monitor Deployment

### 7.1 View Logs
1. Railway Dashboard → Service → **"Deployments"**
2. Click latest deployment
3. View **Logs** tab

### 7.2 Check for Errors

Look for these messages:

✅ **Success indicators:**
- "Connected to MongoDB successfully"
- "Server running on port X"
- "WebSocket server started"

❌ **Error indicators:**
- "Error: connect ECONNREFUSED" → MongoDB connection issue
- "Missing required environment variables" → Add missing env vars
- "VAPID key error" → Remove/update VAPID keys if not using

### 7.3 Common Issues

| Error | Cause | Fix |
|-------|-------|-----|
| Build failed | Wrong root directory | Set to `backend` |
| 502 Bad Gateway | App crash on startup | Check logs, verify env vars |
| MongoDB connection failed | Wrong URI or IP whitelist | Check MONGODB_URI, whitelist IPs |
| CORS errors | Wrong FRONTEND_URL | Update FRONTEND_URL in env vars |

---

## Step 8: Update Frontend

### 8.1 Get Backend URL
Your backend URL is either:
- `https://freightpro-production.up.railway.app` (default)
- `https://api.yourdomain.com` (custom domain)

### 8.2 Update Vercel Environment
1. Go to Vercel dashboard
2. Project → **Settings** → **Environment Variables**
3. Update `VITE_API_URL`:
   ```
   VITE_API_URL=https://api.yourdomain.com/api
   ```
4. Redeploy frontend

---

## Step 9: Verify Everything Works

### 9.1 Test Endpoints
```bash
# Health check
curl https://api.yourdomain.com/api/health

# Should return 200 OK
```

### 9.2 Test from Frontend
1. Visit: https://www.yourdomain.com
2. Register an account
3. Log in
4. Check Load Board loads data
5. Verify WebSocket messaging works

### 9.3 Check Railway Metrics
1. Railway Dashboard → **Metrics**
2. Monitor:
   - CPU usage (should be <50% idle)
   - Memory usage (should be <500MB idle)
   - Requests per minute

---

## Step 10: Enable Auto-Deploy

### 10.1 Configure Auto-Deploy
1. Railway Dashboard → **Settings** → **Source**
2. Ensure **Auto-Deploy** is **ON**
3. Select branch: `main`

Now every push to main auto-deploys.

---

## Railway Pricing

### Free Tier
- $5 credit per month
- 512MB RAM
- 100GB bandwidth
- Unlimited builds
- Your app uses ~$2-3/month

### Paid Tiers
- **Hobby**: $5/month (more resources)
- **Team**: $20/month (better monitoring)
- **Business**: Custom pricing

**Recommendation**: Start with free tier. Upgrade if you exceed limits.

---

## Troubleshooting

### Deployment Stuck?
1. Check build logs
2. Cancel and redeploy
3. Verify all env vars are set

### App Crashes After Deploy?
1. Check logs for error messages
2. Verify MongoDB connection
3. Test health endpoint manually
4. Rollback to previous deployment

### WebSocket Not Working?
1. Verify Socket.io path in frontend
2. Check CORS configuration
3. Test WebSocket manually: `wscat -c wss://api.yourdomain.com/socket.io/`

### High Memory Usage?
1. Check for memory leaks in logs
2. Restart service
3. Consider upgrading plan

---

## Next Steps

After Railway deployment:

1. ✅ Deploy frontend to Vercel (see docs/VERCEL-DEPLOY-GUIDE.md)
2. ✅ Configure DNS (see docs/HOSTINGER-DNS-GUIDE.md)
3. ✅ Seed demo data (see scripts/seedLoads.ts)
4. ✅ Run smoke tests (see scripts/smoke-test.sh)
5. ✅ Set up monitoring (see LAUNCH_PLAN.md)

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Status: https://status.railway.app
- Railway Discord: https://discord.gg/railway
- Troubleshooting: https://docs.railway.app/troubleshooting

