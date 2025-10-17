# FreightPro Local Development Setup

## Quick Start (No Python Required)

### Option 1: Direct File Opening
1. Navigate to your FreightPro folder: `C:\Users\HAYK\Desktop\FreightPro`
2. Double-click on `index.html` to open it directly in your browser
3. The website will open at: `file:///C:/Users/HAYK/Desktop/FreightPro/index.html`

**Note:** Some features might not work perfectly with file:// protocol, but the main functionality will work.

## Full Local Server Setup (Recommended)

### ✅ Node.js Server (Already Available!)

Your system has Node.js installed, so you can use the custom FreightPro server!

### Start Local Server

#### Method 1: Using Batch File (Easiest)
1. Double-click `start-server.bat` (static frontend)
2. Or double-click `start-server-direct.bat` (static frontend direct)
3. Open browser and go to: http://localhost:8000

#### Method 2: Using npm (Recommended)
1. Open Command Prompt or PowerShell
2. Navigate to FreightPro folder:
   ```
   cd C:\Users\HAYK\Desktop\FreightPro
   ```
3. Start static server:
   ```
   npm run static
   ```
4. Open browser and go to: http://localhost:8000

#### Method 3: Direct Node.js
1. Open Command Prompt or PowerShell
2. Navigate to FreightPro folder:
   ```
   cd C:\Users\HAYK\Desktop\FreightPro
   ```
3. Start server:
   ```
   node server.js
   ```
4. Open browser and go to: http://localhost:8000

### Alternative: Python Server (if you prefer)

#### Install Python (if not already installed)

##### Option A: Microsoft Store (Easiest)
1. Open Microsoft Store
2. Search for "Python 3.11" or "Python 3.12"
3. Click "Install"

##### Option B: Official Python Website
1. Go to https://www.python.org/downloads/
2. Download Python 3.11 or 3.12
3. **IMPORTANT:** During installation, check "Add Python to PATH"
4. Complete the installation

#### Start Python Server
1. Double-click `start-local-server.bat`
2. Or use: `python -m http.server 8000`

## Features Available Locally

✅ **1000+ Dynamic Loads** - Generated realistic freight loads
✅ **Smart Filtering** - Intelligent load matching and sorting
✅ **Live Activity Feed** - Real-time freight activities
✅ **Dynamic Statistics** - Live platform statistics
✅ **User Behavior Simulation** - Realistic booking patterns
✅ **Performance Optimized** - Handles large datasets efficiently

## Troubleshooting

### "require is not defined in ES module scope" Error
**This error occurs because your package.json has `"type": "module"` which makes Node.js treat all .js files as ES modules.**

**✅ FIXED:** The server.js file has been updated to use ES module syntax (`import` instead of `require`).

If you still see this error:
- Make sure you're using the updated server.js file
- Or rename server.js to server.cjs to use CommonJS syntax

### "Python was not found" Error
- Install Python using one of the methods above
- Make sure to check "Add Python to PATH" during installation
- Restart your command prompt after installation

### Port 8000 Already in Use (EADDRINUSE Error)
**This error means another process is already using port 8000.**

**Quick Fix:**
1. Double-click `kill-server.bat` to stop any existing servers
2. Or manually kill the process:
   ```
   netstat -ano | findstr :8000
   taskkill /PID [PROCESS_ID] /F
   ```
3. Then start the server again with `npm start`

**Alternative Solutions:**
- Try a different port: Change PORT in server.js to 8001
- Or use: `python -m http.server 8001`

### Browser Security Issues
- Some browsers block local file access
- Use the local server method instead of direct file opening
- Chrome: Use `--allow-file-access-from-files` flag if needed

### npm start not working
- Make sure you're in the correct directory
- Try `node server.js` directly instead
- Check that package.json exists and has the correct scripts

## Next Steps

1. **Test Locally** - Verify all features work on localhost
2. **Commit to Git** - When satisfied, commit your changes
3. **Deploy to Netlify** - Push to GitHub and deploy

## Support

If you encounter any issues:
1. Make sure Python is installed and in PATH
2. Try different browsers (Chrome, Firefox, Edge)
3. Check that all files are in the correct directory
4. Verify no firewall is blocking port 8000
