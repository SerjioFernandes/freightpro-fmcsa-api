# 🚛 FreightPro Backend Setup Guide

## ✅ **You Now Have TWO Server Options:**

### **Option 1: Full Backend with MongoDB (Recommended)**
- **File:** `server-backend.js`
- **Command:** `npm start`
- **Port:** 4000
- **Features:** Real database, user auth, API endpoints

### **Option 2: Static File Server (Current)**
- **File:** `server.js`
- **Command:** `npm run static`
- **Port:** 8000
- **Features:** Static files, simulated data

## 🚀 **Quick Start with Full Backend:**

### **Step 1: Set Up Environment Variables**
1. **Copy the template:**
   ```bash
   copy env-template.txt .env
   ```

2. **Edit `.env` file with your MongoDB password:**
   ```bash
   MONGODB_URI=mongodb+srv://freightpro-user:YOUR_ACTUAL_PASSWORD@freightpro-cluster.tcvxlo5.mongodb.net/freightpro?retryWrites=true&w=majority&appName=freightpro-cluster
   ```

### **Step 2: Start the Backend Server**
```bash
npm start
```

### **Step 3: Access Locally**
- **Backend API:** http://localhost:4000
- **Static Frontend:** http://localhost:8000 (use `npm run static`)
- **API Health:** http://localhost:4000/api/health

## 📊 **What You Get with Full Backend:**

### **✅ Real Database Features:**
- **MongoDB Atlas** connection
- **User registration** with email verification
- **User authentication** with JWT tokens
- **Load posting** and booking
- **Real data persistence**

### **✅ API Endpoints:**
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/loads` - Get loads
- `POST /api/loads` - Post loads
- `POST /api/loads/:id/book` - Book loads
- `GET /api/health` - Health check

### **✅ Professional Features:**
- **Email verification** (Gmail integration)
- **Rate limiting** for security
- **CORS** configuration
- **Input validation**
- **Error handling**

## 🔧 **Deployment Ready:**

### **For Netlify (Frontend):**
- Your `index.html` can be deployed as static files
- Works with the backend API

### **For Render (Backend):**
- `server-backend.js` is ready for deployment
- Set environment variables in Render dashboard
- MongoDB Atlas connection works

## 🎯 **Current Status:**

| Feature | Static Server | Backend Server |
|---------|---------------|----------------|
| **Localhost** | ✅ Port 8000 | ✅ Port 4000 |
| **Static Files** | ✅ Yes | ✅ Yes |
| **Simulated Data** | ✅ Yes | ❌ No |
| **Real Database** | ❌ No | ✅ Yes |
| **User Auth** | ❌ No | ✅ Yes |
| **API Endpoints** | ❌ No | ✅ Yes |
| **Netlify Ready** | ✅ Yes | ✅ Yes |
| **Render Ready** | ❌ No | ✅ Yes |

## 🚀 **Recommended Workflow:**

1. **Development:** Use `npm start` (backend server)
2. **Testing:** Use `npm run static` (static server)
3. **Deployment:** 
   - Frontend → Netlify
   - Backend → Render
   - Database → MongoDB Atlas

## 🛠️ **Commands:**

```bash
# Full backend with database
npm start

# Static files only
npm run static

# Development with auto-reload
npm run dev
```

## 🎉 **You're Ready!**

Your FreightPro platform now has:
- ✅ **Full backend** with MongoDB
- ✅ **User authentication** system
- ✅ **Load board** functionality
- ✅ **API endpoints** for all features
- ✅ **Deployment ready** for both frontend and backend

**Start with:** `npm start` and go to http://localhost:4000
