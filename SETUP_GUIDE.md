# 🚀 FreightPro Complete Setup Guide

## 📋 **What You Need to Do**

### **Step 1: Run Setup Script**
```bash
# Double-click this file to create your .env file
setup.bat
```

### **Step 2: Get MongoDB Connection String**

#### **2.1 Go to MongoDB Atlas**
1. Visit: [mongodb.com/atlas](https://mongodb.com/atlas)
2. Sign up for free account
3. Create new cluster (M0 Sandbox - FREE)

#### **2.2 Create Database User**
1. Go to **"Database Access"**
2. Click **"Add New Database User"**
3. Username: `freightpro-user`
4. Password: Generate strong password
5. Privileges: Read and write to any database

#### **2.3 Allow Network Access**
1. Go to **"Network Access"**
2. Click **"Add IP Address"**
3. Click **"Allow Access from Anywhere"**

#### **2.4 Get Connection String**
1. Go to **"Clusters"**
2. Click **"Connect"** → **"Connect your application"**
3. Copy the connection string
4. Replace `<password>` with your actual password

**Example:**
```
mongodb+srv://freightpro-user:MyPassword123@freightpro-cluster.abc123.mongodb.net/freightpro?retryWrites=true&w=majority
```

### **Step 3: Get Gmail App Password**

#### **3.1 Enable 2-Factor Authentication**
1. Go to [myaccount.google.com](https://myaccount.google.com)
2. Security → Enable **"2-Step Verification"**

#### **3.2 Generate App Password**
1. Security → **"App passwords"**
2. Select **"Mail"** → **"Other (custom name)"**
3. Name: `FreightPro`
4. Copy the 16-character password

### **Step 4: Update .env File**

Edit your `.env` file with these values:

```bash
# Replace with your MongoDB connection string
MONGODB_URI=mongodb+srv://freightpro-user:YOUR_PASSWORD@freightpro-cluster.xxxxx.mongodb.net/freightpro?retryWrites=true&w=majority

# Replace with your Gmail
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password

# Change this to a random string
JWT_SECRET=your-random-secret-key-here

PORT=4000
NODE_ENV=development
```

### **Step 5: Install and Start**

```bash
# Install dependencies
npm install

# Start the server
npm start

# OR double-click
start.bat
```

### **Step 6: Test Your Website**

1. Open: [http://localhost:4000](http://localhost:4000)
2. Click **"Register"**
3. Choose account type
4. Fill registration form
5. Check your email for verification
6. Login and test!

---

## 🎯 **Quick Test Checklist**

- [ ] MongoDB Atlas cluster created
- [ ] Database user created
- [ ] Network access allowed
- [ ] Connection string copied
- [ ] Gmail 2FA enabled
- [ ] App password generated
- [ ] .env file updated
- [ ] Server starts without errors
- [ ] Website loads at localhost:4000
- [ ] Registration form works
- [ ] Email verification received
- [ ] Login works

---

## 🆘 **Common Issues & Solutions**

### **MongoDB Connection Error**
```
Error: MongoDB connection failed
```
**Solution:** Check your connection string in .env file

### **Email Not Sending**
```
Email sending failed
```
**Solution:** Verify Gmail app password is correct

### **Server Won't Start**
```
Error: Cannot find module
```
**Solution:** Run `npm install` first

### **Website Won't Load**
```
Cannot connect to localhost:4000
```
**Solution:** Make sure server is running (`npm start`)

---

## 🚀 **Ready for Production?**

Once everything works locally:

1. **Deploy Backend to Render:**
   - Push code to GitHub
   - Connect to Render
   - Set environment variables

2. **Deploy Frontend to Netlify:**
   - Update API URL in index.html
   - Deploy to Netlify

3. **Update MongoDB Network Access:**
   - Add Render's IP addresses
   - Or use 0.0.0.0/0 for development

---

## 📞 **Need Help?**

If you get stuck on any step:
1. Check the error message in terminal
2. Verify your .env file settings
3. Make sure MongoDB Atlas is accessible
4. Test Gmail app password separately

**Your FreightPro load board will be live and working!** 🚛✨
