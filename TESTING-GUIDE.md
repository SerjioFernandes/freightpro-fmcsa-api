# 🧪 Testing Guide - Secure Shipment Request System

## Quick Start Testing

### Prerequisites
- Backend server running on `http://localhost:8080` or Render.com
- Frontend open in browser (local or Netlify)
- 2 test accounts: 1 Shipper, 1 Broker

---

## 🎬 Test Scenario 1: Complete Request Flow (5 minutes)

### Step 1: Shipper Creates Shipment
1. **Login** as Shipper account
2. **Navigate** to "Create Shipment" (button in top nav or sidebar)
3. **Fill form:**
   - Title: "Test Shipment - Electronics"
   - Description: "50 pallets of electronics"
   - Pickup: Los Angeles, CA, 90001
   - Delivery: New York, NY, 10001
4. **Click** "Create Shipment"
5. **Verify** success notification
6. **Logout**

### Step 2: Broker Requests Access
1. **Login** as Broker account
2. **Navigate** to "Browse Shipments"
3. **Observe** the shipment card:
   - ⚠️ Should have **yellow left border**
   - ⚠️ Should show **"Limited View"** badge
   - ⚠️ Should **hide ZIP code** (shows only "Los Angeles, CA")
   - ⚠️ Should **hide description**
   - ⚠️ Should show message: "Request access to view full details"
4. **Click** "Request Access" button
5. **Enter message** (optional): "I have authority and would like to handle this shipment"
6. **Submit request**
7. **Verify** success notification: "Access request sent successfully!"
8. **Observe** shipment list refreshes
9. **Logout**

### Step 3: Shipper Reviews and Approves
1. **Login** as Shipper account
2. **Navigate** to "Requests" page (new button in top nav/sidebar)
3. **Verify** you see:
   - Request from broker
   - Broker's company name
   - Broker's USDOT & MC numbers
   - Broker's message
   - Request timestamp
   - Shipment details
4. **Click** "Approve" button
5. **Enter response** (optional): "Approved! Please proceed with booking"
6. **Confirm**
7. **Verify:**
   - Success notification
   - Request moves to "Approved" tab
   - Count badges update
8. **Logout**

### Step 4: Broker Views Full Details
1. **Login** as Broker account
2. **Navigate** to "Browse Shipments"
3. **Observe** the same shipment:
   - ✅ **Normal appearance** (no yellow border)
   - ✅ **No "Limited View" badge**
   - ✅ **Full ZIP codes visible** (90001, 10001)
   - ✅ **Full description visible**
   - ✅ **"View Details" button** available
   - ✅ **"Create Load" button** available
4. **Click** "View Details" (should work)
5. **Click** "Create Load" (should navigate to post load page)

✅ **Test Passed!** The secure request system is working correctly.

---

## 🎬 Test Scenario 2: Rejection Flow (2 minutes)

### Step 1: Broker Requests Access (repeat from above)
- Login as Broker
- Browse Shipments
- Request Access to a shipment

### Step 2: Shipper Rejects
1. Login as Shipper
2. Go to "Requests" page
3. Click "Reject" button
4. Enter optional response: "We're working with another broker"
5. Confirm rejection
6. Verify:
   - Request moves to "Rejected" tab
   - Badge shows rejected status

### Step 3: Broker Verifies Limited Access Remains
1. Login as Broker
2. Browse Shipments
3. Verify shipment still shows "Limited View"
4. ❌ Should NOT have "View Details" or "Create Load" buttons

---

## 🎬 Test Scenario 3: Navigation Visibility (1 minute)

### Test 1: Shipper Navigation
1. Login as Shipper
2. Verify "Requests" button is visible:
   - ✅ Mobile sidebar
   - ✅ Desktop top nav
3. Verify "Browse Shipments" button is **NOT visible**

### Test 2: Broker Navigation
1. Login as Broker
2. Verify "Browse Shipments" button is visible:
   - ✅ Mobile sidebar
   - ✅ Desktop top nav
3. Verify "Requests" button is **NOT visible**

### Test 3: Carrier Navigation
1. Login as Carrier
2. Verify **neither button is visible**

### Test 4: Logout
1. Logout from any account
2. Verify **all role-specific buttons disappear**

---

## 🔍 What to Check During Testing

### Visual Checks:
- [ ] Limited view cards have yellow left border
- [ ] "Limited View" badge appears for brokers
- [ ] ZIP codes are hidden in limited view
- [ ] Full details appear after approval
- [ ] Request cards have nice design with icons
- [ ] Tab badges update correctly
- [ ] Empty states show appropriate messages

### Functional Checks:
- [ ] Request button sends request successfully
- [ ] Approve button works and moves request
- [ ] Reject button works and moves request
- [ ] Page refreshes automatically after actions
- [ ] Error messages appear for failures
- [ ] Success notifications appear

### Security Checks:
- [ ] Broker cannot see full details without approval
- [ ] Broker cannot create load without approval
- [ ] Shipper can only see their own shipment requests
- [ ] Broker can only see their own sent requests
- [ ] Cannot approve/reject without authentication

---

## 🐛 Common Issues & Solutions

### Issue: "Request button does nothing"
**Solution:** Check browser console for errors. Verify backend is running and API_BASE_URL is correct.

### Issue: "Requests page is empty"
**Solution:** Make sure you created a shipment as shipper, then requested access as broker.

### Issue: "Navigation button not visible"
**Solution:** Refresh the page after login. Check console for errors.

### Issue: "Limited view not working"
**Solution:** Clear localStorage and re-login. Check if backend GET /api/shipments is returning `hasAccess` flag.

### Issue: "Backend 502 error"
**Solution:** Render.com might be cold-starting. Wait 30 seconds and try again.

---

## 📊 API Testing (Optional - Advanced)

### Test with Postman/Thunder Client:

**1. Request Access (Broker):**
```
POST http://localhost:8080/api/shipments/{shipmentId}/request
Headers:
  Authorization: Bearer {brokerToken}
  Content-Type: application/json
Body:
{
  "message": "I'd like to handle this shipment"
}
```

**2. Get Requests (Shipper):**
```
GET http://localhost:8080/api/shipments/requests
Headers:
  Authorization: Bearer {shipperToken}
```

**3. Approve Request (Shipper):**
```
POST http://localhost:8080/api/shipments/requests/{requestId}/approve
Headers:
  Authorization: Bearer {shipperToken}
  Content-Type: application/json
Body:
{
  "response": "Approved!"
}
```

**4. Check Access (Broker):**
```
GET http://localhost:8080/api/shipments/{shipmentId}/access
Headers:
  Authorization: Bearer {brokerToken}
```

---

## ✅ Final Checklist

Before approving for deployment:

- [ ] Completed Test Scenario 1 (full flow)
- [ ] Completed Test Scenario 2 (rejection)
- [ ] Completed Test Scenario 3 (navigation)
- [ ] Verified all visual elements
- [ ] Verified all functional elements
- [ ] Verified security restrictions
- [ ] No console errors
- [ ] No backend errors
- [ ] User experience is smooth
- [ ] Ready to commit and deploy

---

## 🚀 After Testing Approval

Once you've tested and approved:

1. **Tell me:** "Looks good, commit it"
2. **I will:**
   - `git add .`
   - `git commit -m "Implement secure shipment request/approval system"`
   - `git push origin main`
3. **You will:**
   - Deploy to Netlify (if needed)
   - Backend auto-deploys on Render.com
   - Test on live site

---

**Happy Testing!** 🎉

If you find any bugs or issues, let me know immediately and I'll fix them before committing.


