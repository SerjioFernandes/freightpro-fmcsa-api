# FreightPro - Ready for Hostinger Deployment! 🚀

## Your Folder Structure

```
FreightPro/
├── backend/          ✅ UPLOAD these files to Hostinger
├── frontend/         ✅ UPLOAD these files to Hostinger
├── Others/           ❌ DON'T upload (documentation & old files)
├── .env              ❌ DON'T upload (local secrets)
└── .gitignore        ❌ DON'T upload
```

**Perfect! Only essential files remain.**

---

## What to Upload to Hostinger

### Backend (to `api/` folder on Hostinger)

From `backend/` folder:

1. ✅ `backend/dist/` - Entire folder
2. ✅ `backend/package.json`
3. ✅ `backend/package-lock.json`
4. ✅ `Others/ecosystem.config.js` - Move to api/ folder as `ecosystem.config.js`

### Frontend (to `public_html/` root on Hostinger)

First build frontend:
```powershell
cd frontend
npm install
VITE_API_URL=https://api.yourdomain.com/api npm run build
```

Then upload from `frontend/dist/`:
- All files in the `dist/` folder

---

## Quick Guide

**See:** `Others/HOSTINGER-SIMPLE-STEPS.md` for detailed instructions

**Everything you need is in the Others/ folder!**

---

**Ready to deploy!** 🎉

