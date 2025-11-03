# ▲ Vercel Frontend Deployment Guide

Quick guide to deploy FreightPro frontend to Vercel.

---

## Step 1: Sign Up

1. Go to https://vercel.com
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel

---

## Step 2: Import Project

1. Dashboard → "Add New..." → "Project"
2. Find repository: `freightpro-fmcsa-api`
3. Click "Import"

---

## Step 3: Configure Build

1. Set:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` (click "Edit" if wrong)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

2. Click "Deploy"

---

## Step 4: Add Environment Variables

1. Project → Settings → Environment Variables
2. Click "Add"
3. Add:
   ```
   Key: VITE_API_URL
   Value: https://api.yourdomain.com/api
   ```
4. Select: Production, Preview, Development
5. Click "Save"

---

## Step 5: Redeploy

1. Go to "Deployments"
2. Click "..." on latest
3. Click "Redeploy"
4. Wait 2-3 minutes

---

## Step 6: Add Custom Domain

1. Settings → Domains
2. Click "Add"
3. Enter: `www.yourdomain.com`
4. Vercel shows DNS instructions
5. Add DNS records in Hostinger
6. Wait for SSL (auto, 2-10 min)

---

## Done! ✅

Visit: https://www.yourdomain.com

See `HOSTINGER-DNS-GUIDE.md` for DNS setup.

