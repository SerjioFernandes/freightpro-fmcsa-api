# 🚂 Railway.app Deployment Guide for FreightPro Backend

## Why Railway?

✅ **Professional platform** - Better than Render  
✅ **Free tier** - $5 credit per month  
✅ **Easy deployment** - GitHub integration  
✅ **Good for production** - Real businesses use it  
✅ **Fast** - 10-15 minutes to deploy  

---

## Step 1: Create Railway Account

1. **Go to Railway**: https://railway.app
2. **Click "Start a New Project"**
3. **Sign up** with GitHub (easiest way)

---

## Step 2: Deploy from GitHub

1. **After login**, click **"New Project"**
2. **Select "Deploy from GitHub repo"**
3. **Choose your repository**: `freightpro-fmcsa-api`
4. **Railway will detect**: Node.js automatically

---

## Step 3: Configure Settings

Railway should auto-detect:
- **Root Directory**: Should be `backend` (if not, set manually)
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

### If you need to set manually:

1. Click on your **service**
2. Go to **Settings** tab
3. Scroll to **Deploy** section
4. Click **"Generate Domain"** for your app
5. Set these settings:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

---

## Step 4: Add Environment Variables

1. Go to **Variables** tab
2. Click **"New Variable"**
3. Add these one by one:

```
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://your-vercel-frontend.vercel.app
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
VAPID_PUBLIC_KEY=(optional - leave empty if not using)
VAPID_PRIVATE_KEY=(optional - leave empty if not using)
VAPID_SUBJECT=(optional)
NODE_ENV=production
PORT=3000
```

**Important**:
- Copy values from your Render/Vercel environment
- `FRONTEND_URL` should be your Vercel frontend URL
- Railway will auto-set `PORT`, but keeping `3000` is fine
- VAPID keys are optional (for push notifications)

---

## Step 5: Deploy!

1. Click **"Deploy"** button
2. Wait for build to complete (2-3 minutes)
3. Railway will give you a URL like: `https://freightpro-production.up.railway.app`

---

## Step 6: Update Frontend

1. Go to **Vercel Dashboard**
2. Find your frontend project
3. Go to **Settings** → **Environment Variables**
4. Update `VITE_API_URL` to your Railway URL:
   ```
   VITE_API_URL=https://freightpro-production.up.railway.app/api
   ```
5. **Redeploy** frontend from Vercel

---

## Step 7: Test

1. **Open** your frontend URL
2. **Register** a new account
3. **Login**
4. **Check** load board loads data
5. **Verify** dashboard works

---

## Step 8 (Optional): Custom Domain

If you want to use a custom domain:

1. In Railway, go to **Settings** → **Domains**
2. Click **"Generate Domain"** if not done
3. Click **"Custom Domain"**
4. Enter your domain: `api.yourdomain.com`
5. Follow Railway's DNS instructions
6. Update `VITE_API_URL` in Vercel

---

## Troubleshooting

### Build Fails

**Problem**: Build command fails  
**Solution**: Check Root Directory is `backend`

### 502 Error

**Problem**: Service not responding  
**Solution**: Check Start Command is `npm start`

### CORS Errors

**Problem**: Frontend can't connect  
**Solution**: Update `FRONTEND_URL` in Railway environment variables

### MongoDB Connection Error

**Problem**: Can't connect to database  
**Solution**: Check `MONGODB_URI` is correct and includes credentials

### Port Issues

**Problem**: Wrong port  
**Solution**: Railway auto-sets port, use `PORT` env var or just rely on Railway

---

## Cost Information

**Railway Pricing**:
- **Free Tier**: $5 credit per month
- **After free tier**: ~$0.000463 per GB RAM/hour
- **Typical backend**: ~$5-10/month
- **Small traffic**: Free tier enough

**Comparison**:
- Render Free: Slows down after inactivity
- Railway Free: $5 credit, more reliable

---

## Next Steps

After deployment:

1. ✅ Test all features
2. ✅ Seed 500 loads via admin panel
3. ✅ Configure custom domain
4. ✅ Set up monitoring
5. ✅ Add backups

---

## Support

- Railway Docs: https://docs.railway.app
- Railway Discord: Active community
- Railway Status: https://status.railway.app

---

## Quick Checklist

- [ ] Create Railway account
- [ ] Deploy from GitHub
- [ ] Set Root Directory to `backend`
- [ ] Add environment variables
- [ ] Deploy and get URL
- [ ] Update Vercel `VITE_API_URL`
- [ ] Redeploy frontend
- [ ] Test registration/login
- [ ] Test load board
- [ ] Verify messaging works
- [ ] (Optional) Add custom domain

---

## Done! 🎉

Your backend is now on Railway! Professional, reliable, and easy to manage.

