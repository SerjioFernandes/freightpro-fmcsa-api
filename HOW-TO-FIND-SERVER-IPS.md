# How to Find Your Server IPs - Step by Step

## 1. Find Your Railway Backend IP/URL

**Option A: Railway Dashboard (Easiest)**
1. Go to https://railway.app
2. Login to your account
3. Click on your **FreightPro** project
4. Click on your backend service (usually named like "freightpro-fmcsa-api" or "backend")
5. Click **Settings** tab
6. Look for **"Public Domain"** or **"Networking"** section
7. Copy the URL (should be something like: `https://freightpro-fmcsa-api-production.up.railway.app`)

**Option B: Railway Deployments**
1. Go to Railway Dashboard → Your Project
2. Click **Deployments** tab
3. Click on the latest deployment
4. Look for **"Public URL"** in the deployment details

**Option C: Your Code (Already Have This)**
- Your backend URL is already in your code: `https://freightpro-fmcsa-api-production.up.railway.app/api`

---

## 2. Find Your Hostinger Frontend Server IP

**Step-by-Step:**
1. Go to https://hpanel.hostinger.com (or your Hostinger login page)
2. Login with your Hostinger account credentials
3. Click on **"Hosting"** in the left sidebar
4. Click on your domain name (the one where FreightPro is hosted)
5. Look for one of these sections:
   - **"Server Information"** or **"Server Details"**
   - **"DNS Settings"** or **"DNS Management"**
   - **"IP Address"** or **"Server IP"**
6. The IP address should be displayed (usually looks like: `123.45.67.89`)

**Alternative Method:**
1. Hostinger Dashboard → **"Advanced"** → **"DNS Zone Editor"**
2. Look for **A Record** pointing to your domain
3. The **"Points to"** value is your server IP

**If you can't find it:**
- Go to Hostinger → **Support** → **Chat/Live Support**
- Ask: "What is my server IP address for [your domain]?"

---

## 3. Find Your Public IP Address (Quick Check)

**Method 1: Online Tool**
1. Open browser: https://whatismyipaddress.com
2. Your public IP will be displayed at the top

**Method 2: Command Line**
Open PowerShell and run:
```powershell
(Invoke-WebRequest -Uri "https://api.ipify.org").Content
```

**Method 3: Alternative Sites**
- https://ipinfo.io
- https://www.whatismyip.com
- https://api.ipify.org (just the IP, no website)

---

## 4. What Each IP Means

- **Railway Backend URL**: The API endpoint your frontend calls (you already have this)
- **Hostinger Frontend IP**: The IP address of the server hosting your static React files
- **Public IP**: Your current internet connection's IP address (this changes if you're on VPN/proxy)

---

## Quick Checklist

- [ ] Railway Backend URL: Check Railway dashboard → Settings → Public Domain
- [ ] Hostinger Frontend IP: Check Hostinger hPanel → Hosting → Your Domain → Server Information
- [ ] Public IP: Visit https://whatismyipaddress.com

---

## Need Help?

If you can't find something:
1. **Railway**: Check Railway → Project → Service → Settings → Networking
2. **Hostinger**: Use Hostinger support chat - they'll tell you your server IP instantly
3. **Public IP**: Just visit whatismyipaddress.com

