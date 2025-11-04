# 🔧 Fix Railway Build Commands - Manual Setup Required

## Problem:
Railway is trying to use Docker instead of Nixpacks. We need to manually set the build and start commands in Railway's UI.

---

## ✅ Solution: Set Commands in Railway Dashboard

Since Railway auto-deployment detected the repo but is using Docker, you need to manually configure the build settings:

### Step 1: Go to Railway Settings

1. Go to Railway dashboard: https://railway.app
2. Click on your **project**
3. Click on your **service** (the one that's deploying)
4. Click on **"Settings"** tab

### Step 2: Find "Deploy" or "Build" Section

Look for one of these sections:
- **"Build & Deploy"**
- **"Deploy Settings"**
- **"Build Configuration"**

### Step 3: Set Root Directory

1. Find **"Root Directory"** field
2. Enter: `backend`
3. This tells Railway to look in the backend folder

### Step 4: Set Build Command

1. Find **"Build Command"** field
2. Enter:
   ```
   npm install && npm run build
   ```

### Step 5: Set Start Command

1. Find **"Start Command"** field  
2. Enter:
   ```
   npm start
   ```

### Step 6: Force Nixpacks Builder (Important!)

1. Look for **"Builder"** or **"Build System"** option
2. Select **"Nixpacks"** (NOT Docker)
3. If you see "Docker" selected, change it to "Nixpacks"

### Step 7: Save and Redeploy

1. Click **"Save"** or **"Update"** button
2. Go to **"Deployments"** tab
3. Click **"Redeploy"** or wait for auto-redeploy
4. Check logs - should now use npm commands!

---

## 🎯 What These Commands Do:

**Build Command**: `npm install && npm run build`
- Installs all dependencies
- Compiles TypeScript to JavaScript

**Start Command**: `npm start`
- Starts your Node.js server

**Root Directory**: `backend`
- Tells Railway your Node.js app is in the `backend/` folder

---

## ✅ After Setting This:

Railway will:
1. Look in `backend/` folder ✅
2. Run `npm install` ✅
3. Run `npm run build` ✅
4. Run `npm start` ✅
5. Your backend should start! ✅

---

## 🆘 If You Can't Find These Settings:

1. Try clicking **"Show Advanced Settings"** or **"More Options"**
2. Or look for a **gear icon** ⚙️ next to the service name
3. Or try clicking **"Configure Service"**

The key is finding where to set:
- Root Directory = `backend`
- Build Command = `npm install && npm run build`
- Start Command = `npm start`
- Builder = Nixpacks (not Docker)

---

**Once you set these, Railway should build and deploy successfully!** 🚀
