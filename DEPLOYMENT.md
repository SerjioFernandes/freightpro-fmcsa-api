# 🚀 DEPLOYMENT GUIDE: CargoLume FMCSA API

**How to deploy your backend while keeping frontend on Netlify**

---

## 🎯 DEPLOYMENT STRATEGY

### **Frontend (Netlify):** ✅
- Your `index.html` website
- Static files and user interface
- **Already working on Netlify**

### **Backend (Render):** ✅
- Your `server.js` Express server
- FMCSA API integration
- **Deploy here for free**

---

## 🚀 OPTION 1: RENDER (RECOMMENDED - FREE)

### **Step 1: Prepare Your Code**
1. **Create a GitHub repository** for your backend
2. **Upload these files:**
   - `server.js`
   - `package.json`
   - `README.md`

### **Step 2: Deploy to Render**
1. **Go to:** https://render.com
2. **Sign up** with GitHub
3. **Click:** "New +" → "Web Service"
4. **Connect your GitHub repo**
5. **Configure:**
   - **Name:** `cargolume-fmcsa-api`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Plan:** Free

### **Step 3: Get Your Backend URL**
After deployment, you'll get:
```
https://your-app-name.onrender.com
```

### **Step 4: Update Frontend**
Change your frontend code from:
```javascript
const backendUrl = `http://localhost:4000/api/fmcsa/${searchType.toUpperCase()}/${searchValue}`;
```

To:
```javascript
const backendUrl = `https://your-app-name.onrender.com/api/fmcsa/${searchType.toUpperCase()}/${searchValue}`;
```

---

## 🌊 OPTION 2: RAILWAY (ALTERNATIVE - FREE)

### **Step 1: Deploy to Railway**
1. **Go to:** https://railway.app
2. **Sign up** with GitHub
3. **Click:** "New Project" → "Deploy from GitHub repo"
4. **Select your backend repo**
5. **Railway auto-detects** Node.js and deploys

### **Step 2: Get Your Backend URL**
Railway gives you a URL like:
```
https://your-app-name.railway.app
```

---

## 🔧 OPTION 3: DIGITALOCEAN APP PLATFORM

### **Step 1: Deploy to DigitalOcean**
1. **Go to:** https://cloud.digitalocean.com/apps
2. **Click:** "Create App" → "GitHub"
3. **Select your backend repo**
4. **Choose plan:** Basic ($5/month)
5. **Deploy**

### **Step 2: Get Your Backend URL**
```
https://your-app-name.ondigitalocean.app
```

---

## 📱 UPDATE YOUR FRONTEND CODE

### **Find this line in your `index.html`:**
```javascript
const backendUrl = `http://localhost:4000/api/fmcsa/${searchType.toUpperCase()}/${searchValue}`;
```

### **Replace with your deployed backend URL:**
```javascript
// For Render
const backendUrl = `https://your-app-name.onrender.com/api/fmcsa/${searchType.toUpperCase()}/${searchValue}`;

// For Railway
const backendUrl = `https://your-app-name.railway.app/api/fmcsa/${searchType.toUpperCase()}/${searchValue}`;

// For DigitalOcean
const backendUrl = `https://your-app-name.ondigitalocean.app/api/fmcsa/${searchType.toUpperCase()}/${searchValue}`;
```

---

## 🌐 CORS CONFIGURATION

### **Update your `server.js` CORS origins:**
```javascript
app.use(cors({
    origin: [
        'https://cargolume.netlify.app',  // Your Netlify frontend
        'https://your-custom-domain.com',  // If you have a custom domain
        'http://localhost:3000',           // Local development
        'http://localhost:8000'            // Local development
    ],
    credentials: true
}));
```

---

## 🧪 TEST YOUR DEPLOYMENT

### **Test Backend Health:**
```bash
# Test health check
curl https://your-app-name.onrender.com/api/health

# Test FMCSA endpoint
curl https://your-app-name.onrender.com/api/fmcsa/MC/515740
```

### **Test Frontend Integration:**
1. **Open your Netlify website**
2. **Go to registration page**
3. **Enter MC number 515740**
4. **Should work perfectly!**

---

## 💰 COST COMPARISON

### **Render (Recommended):**
- **Free tier:** 750 hours/month
- **Paid:** $7/month for unlimited

### **Railway:**
- **Free tier:** $5 credit/month
- **Paid:** Pay-as-you-use

### **DigitalOcean:**
- **Basic:** $5/month
- **Professional:** $12/month

---

## 🎯 RECOMMENDED APPROACH

### **For You (CargoLume):**
1. **Use Render (FREE)** for backend
2. **Keep Netlify (FREE)** for frontend
3. **Total cost: $0/month**

### **Why This Works:**
✅ **Backend runs continuously** on Render  
✅ **Frontend stays on Netlify** (static hosting)  
✅ **Both communicate** via HTTPS  
✅ **Professional setup** like DAT/Truckstop  
✅ **Zero cost** to get started  

---

## 🚀 READY TO DEPLOY?

### **Quick Start:**
1. **Create GitHub repo** for backend
2. **Upload:** `server.js`, `package.json`
3. **Deploy to Render** (free)
4. **Update frontend** with new backend URL
5. **Test everything works!**

**Your CargoLume platform will be fully professional and deployed!** 🚛💼✨

---

*Need help with any step? Just ask!*
