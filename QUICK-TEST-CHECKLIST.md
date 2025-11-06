# Quick Test Checklist - 15 Minutes

## Essential Tests (Must Pass)

### 1. Backend Health (1 min)
- [ ] Open: `https://freightpro-fmcsa-api-production.up.railway.app/api/health`
- [ ] Should return: `{ "status": "ok" }`

### 2. Frontend Loads (1 min)
- [ ] Open: `https://www.cargolume.com`
- [ ] Page loads without errors
- [ ] No console errors (F12 → Console)

### 3. Registration (3 min)
- [ ] Click "Register"
- [ ] Fill form (Broker account)
- [ ] Submit
- [ ] Check email for verification code
- [ ] Enter code
- [ ] Should redirect to login

### 4. Login (1 min)
- [ ] Enter credentials
- [ ] Click "Login"
- [ ] Should redirect to dashboard
- [ ] Check localStorage has token

### 5. Load Board (2 min)
- [ ] Navigate to Load Board
- [ ] Loads should display
- [ ] Click on a load
- [ ] Details should show

### 6. Post Load (3 min)
- [ ] Navigate to Post Load (Broker only)
- [ ] Fill form
- [ ] Submit
- [ ] Should see success message
- [ ] Load should appear in Load Board

### 7. Messaging (2 min)
- [ ] Navigate to Messages
- [ ] Click "Contact" on a load
- [ ] Send message
- [ ] Should see success
- [ ] Message should appear in Messages page

### 8. WebSocket (2 min)
- [ ] Open Messages in two browsers
- [ ] Send message from one
- [ ] Should appear instantly in other (real-time)

## Quick Fixes if Tests Fail

### Backend Not Responding
- Check Railway deployment status
- Check Railway logs
- Verify environment variables

### Frontend Errors
- Clear browser cache (Ctrl+Shift+Delete)
- Check browser console
- Verify API URL in constants.ts

### WebSocket Not Working
- Check WebSocket connection in Network tab
- Verify backend WebSocket service is running
- Check CORS settings

### Messages Not Sending
- Check authentication token
- Verify API endpoint
- Check browser console for errors

---

**Time**: ~15 minutes
**Priority**: Critical functionality only

