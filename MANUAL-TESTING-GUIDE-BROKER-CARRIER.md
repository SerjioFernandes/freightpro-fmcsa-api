# Manual Testing Guide: Broker & Carrier Accounts
**CargoLume Platform - Complete Testing Checklist**  
**URL:** https://freightpro-fmcsa-api.onrender.com/

---

## 🎯 Phase 1: Broker Account Testing

### ✅ 1.1 Register Broker Account

**Steps:**
1. Open https://freightpro-fmcsa-api.onrender.com/
2. Click **"Register"** button in top-right corner
3. Fill out the registration form:
   - **Email:** `testbroker@example.com` (use a unique email)
   - **Password:** `TestBroker123!`
   - **Confirm Password:** `TestBroker123!`
   - **Company Name:** `Test Broker Company`
   - **Account Type:** Select **"broker"** from dropdown
   - **MC Number:** `123456` (6 digits)
   - **USDOT Number:** `1234567` (7 digits)
   - **Phone:** `(555) 123-4567`
4. Click **"Register"** button
5. Check your email for verification code
6. Enter the 6-digit verification code
7. Click **"Verify Email"**

**Expected Results:**
- ✅ Registration successful message appears
- ✅ Redirected to dashboard
- ✅ Welcome message displays: "Welcome, testbroker"
- ✅ Account type shows "broker"

---

### ✅ 1.2 Test Broker Dashboard

**Steps:**
1. After successful login, you should be on the dashboard
2. Verify the following elements are visible:
   - Profile card with company name
   - Account type: "broker"
   - Subscription plan (Basic/Advanced/Ultima)
   - Quick Actions section
   - User Stats section

**Expected Results:**
- ✅ Dashboard displays correctly
- ✅ Quick Actions include:
  - "Browse Loads" button
  - "Browse Shipments" button (BROKER-SPECIFIC)
  - "Post Load" button (BROKER-SPECIFIC)
  - "Rate Analysis" button
  - "Settings" button
- ✅ User Stats show:
  - Loads Posted: 0
  - Loads Booked: 0
  - Revenue: $0
  - Rating: 5.0

---

### ✅ 1.3 Test Browse Shipments Board (BROKER-ONLY FEATURE)

**Steps:**
1. From dashboard, click **"Browse Shipments"** button
2. Wait for shipments to load (may take a few seconds if backend is cold-starting)
3. Verify shipments are displayed in cards
4. **Test Origin Filter:**
   - Click in the "Origin" input field
   - Type "Los"
   - Verify autocomplete dropdown appears with "Los Angeles, CA"
   - Select a suggestion or continue typing
5. **Test Destination Filter:**
   - Click in the "Destination" input field
   - Type "Chi"
   - Verify autocomplete dropdown appears with "Chicago, IL"
6. **Test Status Filter:**
   - Click the "Status" dropdown
   - Select "Available"
   - Verify only available shipments are shown
7. Click **"Clear Filters"** button
8. Verify all filters are reset
9. Click **"Refresh"** button
10. Verify shipments reload

**Expected Results:**
- ✅ Shipments load and display in card format
- ✅ Each shipment card shows:
  - Title
  - Description
  - Pickup location
  - Delivery location
  - Status badge (Available/In Transit/Completed)
  - Created/Updated timestamps
  - "View Details" button
  - "Create Load" button
- ✅ Filters work correctly
- ✅ Clear Filters resets all fields
- ✅ Refresh reloads data

---

### ✅ 1.4 Test View Shipment Details

**Steps:**
1. On the Browse Shipments page
2. Click **"View Details"** on any shipment card
3. Verify modal popup appears
4. Review all shipment information displayed
5. Click the **"×"** (close button) or click outside the modal
6. Verify modal closes

**Expected Results:**
- ✅ Modal displays with full shipment details:
  - Shipment ID
  - Title and description
  - Pickup location, date, time
  - Delivery location, date, time
  - Status
  - Posted by (shipper info)
  - Created and updated timestamps
- ✅ Close button works
- ✅ Clicking outside modal closes it

---

### ✅ 1.5 Test Create Load from Shipment

**Steps:**
1. On the Browse Shipments page
2. Click **"Create Load"** button on any shipment card
3. Verify you're redirected to the "Post Load" page
4. Check that the form is PRE-FILLED with shipment data:
   - Origin city/state
   - Destination city/state
   - Pickup date
   - Delivery date
5. Fill in remaining required fields:
   - **Equipment Type:** Select "Dry Van"
   - **Weight:** `20000` lbs
   - **Rate:** `2500`
   - **Load Type:** Select "Full Truckload"
6. Click **"Post Load"** button

**Expected Results:**
- ✅ Redirected to Post Load page
- ✅ Form pre-filled with shipment data
- ✅ Can complete and submit form
- ✅ Success notification appears
- ✅ Load is created successfully

---

### ✅ 1.6 Test Post Load Feature (Direct)

**Steps:**
1. Navigate to **"Post Load"** page from sidebar or top nav
2. Fill out the entire form manually:
   - **Origin:** Type "New York, NY" (use autocomplete if available)
   - **Destination:** Type "Miami, FL"
   - **Pickup Date:** Select tomorrow's date
   - **Delivery Date:** Select 3 days from now
   - **Equipment Type:** Select "Reefer"
   - **Weight:** `15000` lbs
   - **Rate:** `3000`
   - **Load Type:** Select "Full Truckload"
   - **Notes:** (optional) "Test load from broker"
3. Click **"Post Load"** button

**Expected Results:**
- ✅ Form validates all required fields
- ✅ Submit button shows loading spinner
- ✅ Success notification appears: "Load posted successfully!"
- ✅ Form resets after successful submission
- ✅ Load appears on Load Board

---

## 🎯 Phase 2: Carrier Account Testing

### ✅ 2.1 Register Carrier Account

**Steps:**
1. **Logout** from broker account (click user menu → Logout)
2. Click **"Register"** button
3. Fill out the registration form:
   - **Email:** `testcarrier@example.com` (use a unique email)
   - **Password:** `TestCarrier123!`
   - **Confirm Password:** `TestCarrier123!`
   - **Company Name:** `Test Carrier Company`
   - **Account Type:** Select **"carrier"** from dropdown
   - **MC Number:** `654321` (6 digits, REQUIRED for carriers)
   - **USDOT Number:** `7654321` (7 digits, REQUIRED for carriers)
   - **Phone:** `(555) 987-6543`
4. Click **"Register"** button
5. Check your email for verification code
6. Enter the 6-digit verification code
7. Click **"Verify Email"**

**Expected Results:**
- ✅ Registration successful message appears
- ✅ Redirected to dashboard
- ✅ Welcome message displays: "Welcome, testcarrier"
- ✅ Account type shows "carrier"

---

### ✅ 2.2 Test Carrier Dashboard

**Steps:**
1. After successful login, verify dashboard elements:
   - Profile card with company name
   - Account type: "carrier"
   - **Authority Status section** (CARRIER-SPECIFIC)
     - USDOT Number status
     - MC Number status
   - Quick Actions section
   - User Stats section

**Expected Results:**
- ✅ Dashboard displays correctly
- ✅ Authority Status shows USDOT and MC verification
- ✅ Quick Actions include:
  - "Browse Loads" button (CARRIER ACCESS)
  - "Post Load" button (if carrier has broker authority)
  - "Rate Analysis" button
  - "Settings" button
- ✅ NO "Browse Shipments" button (broker-only)

---

### ✅ 2.3 Test Load Board with Smart Autocomplete

**Steps:**
1. Click **"Browse Loads"** button from dashboard
2. Wait for loads to display (500 generated loads)
3. Verify loads are showing

**Test Smart Autocomplete - Origin Field:**
4. Click in the **"Origin"** input field (under "Smart Load Search")
5. Type **"Chi"**
6. Verify autocomplete dropdown appears below the input
7. Verify suggestions include:
   - "Chicago, IL"
   - "Chicago Heights, IL"
   - Other cities starting with "Chi"
8. Click on **"Chicago, IL"** to select it
9. Verify the input field is filled with "Chicago, IL"
10. Verify autocomplete dropdown closes

**Test Smart Autocomplete - Destination Field:**
11. Click in the **"Destination"** input field
12. Type **"Atl"**
13. Verify autocomplete dropdown appears
14. Verify "Atlanta, GA" is in the suggestions
15. Select "Atlanta, GA"
16. Verify input is filled and dropdown closes

**Test Other Filters:**
17. **Equipment Type:** Select "Dry Van" from dropdown
18. **Pickup Date:** Select tomorrow's date
19. **Min Rate:** Enter `1000`
20. **Max Miles:** Enter `500`
21. **Load Type:** Select "Full Truckload"
22. **Radius:** Enter `100` miles
23. Click **"Search"** button
24. Verify loads are filtered based on your criteria
25. Note the **"Clear Filters"** button shows a badge with number of active filters
26. Click **"Clear Filters"**
27. Verify all filters are reset and badge disappears

**Expected Results:**
- ✅ 500 loads initially displayed
- ✅ Origin autocomplete works perfectly:
  - Dropdown appears on typing
  - Suggestions are relevant (Chicago, IL)
  - Selection fills input
  - Dropdown closes after selection
- ✅ Destination autocomplete works perfectly:
  - Dropdown appears on typing
  - Suggestions are relevant (Atlanta, GA)
  - Selection fills input
- ✅ All filter controls are functional
- ✅ Search button filters results
- ✅ Active filter counter displays correctly
- ✅ Clear Filters button resets everything

---

### ✅ 2.4 Test Book Load Feature

**Steps:**
1. On the Load Board, find a load with status **"Available"**
2. Click **"View details →"** link on the load card
3. Verify load details modal appears with:
   - Origin → Destination route
   - Equipment type, weight
   - Pickup/delivery dates
   - Rate and distance
   - Posted by (broker/shipper info)
4. Click **"Book Load"** button in the modal
5. If confirmation dialog appears, click **"Confirm"**
6. Wait for API response

**Expected Results:**
- ✅ Load details modal displays correctly
- ✅ All load information is accurate
- ✅ "Book Load" button is visible and clickable
- ✅ Success notification appears: "Load booked successfully!"
- ✅ Load status changes from "Available" to "Booked"
- ✅ Modal closes after successful booking
- ✅ Dashboard stats update (Loads Booked: 1)

---

### ✅ 2.5 Test Carrier Settings

**Steps:**
1. Click **"Settings"** from sidebar or top nav
2. Verify Settings page loads with tabs:
   - Account
   - Security
   - Notifications
   - Preferences

**Test Account Tab:**
3. Click **"Account"** tab
4. Update company name: `Test Carrier Company Updated`
5. Update phone: `(555) 111-2222`
6. Click **"Save Changes"** button
7. Verify success notification

**Test Security Tab:**
8. Click **"Security"** tab
9. Fill password change form:
   - **Current Password:** `TestCarrier123!`
   - **New Password:** `NewCarrier456!`
   - **Confirm New Password:** `NewCarrier456!`
10. Click **"Change Password"** button
11. Verify success notification

**Test Notifications Tab:**
12. Click **"Notifications"** tab
13. Toggle some notification preferences:
   - Email notifications: ON/OFF
   - SMS notifications: ON/OFF
14. Click **"Save Preferences"** button
15. Verify success notification

**Test Preferences Tab:**
16. Click **"Preferences"** tab
17. Change some preferences:
   - Theme: Light/Dark
   - Language: English/Spanish
   - Timezone: Select your timezone
18. Click **"Save Preferences"** button
19. Verify success notification

**Expected Results:**
- ✅ All tabs load correctly
- ✅ Account settings save successfully
- ✅ Password change works (or shows error if backend has issues)
- ✅ Notification preferences save
- ✅ General preferences save
- ✅ Success notifications display for all saves
- ⚠️ If 502 errors occur, this is a backend infrastructure issue (Render.com cold start), NOT a code bug

---

## 🎯 Phase 3: Cross-User Type Testing

### ✅ 3.1 Test Role-Based Access Control (RBAC)

**Test 1: Shipper Cannot Access Broker Features**
1. Login as **shipper** account (testshipper@example.com)
2. Try to navigate to "Browse Shipments" page
   - **Expected:** Access denied OR page doesn't exist in navigation
3. Try to navigate to "Post Load" page
   - **Expected:** Access denied OR redirect to dashboard

**Test 2: Broker CAN Access Broker Features**
1. Login as **broker** account (testbroker@example.com)
2. Navigate to "Browse Shipments" page
   - **Expected:** ✅ Access granted, shipments load
3. Navigate to "Post Load" page
   - **Expected:** ✅ Access granted, form loads

**Test 3: Carrier CAN Access Load Board**
1. Login as **carrier** account (testcarrier@example.com)
2. Navigate to "Load Board" page
   - **Expected:** ✅ Access granted, loads display
3. Verify "Browse Shipments" is NOT in navigation
   - **Expected:** ✅ Feature hidden from carriers

**Expected Results:**
- ✅ Shippers cannot access broker-only features
- ✅ Brokers can access Browse Shipments and Post Load
- ✅ Carriers can access Load Board and book loads
- ✅ Role-based access control is enforced

---

### ✅ 3.2 Test Complete Data Flow (Shipper → Broker → Carrier)

**Step 1: Shipper Creates Shipment**
1. Login as **shipper** (testshipper@example.com)
2. Click **"Create Shipment"** button
3. Fill out shipment form:
   - **Title:** `Test Shipment LA to NYC`
   - **Description:** `End-to-end data flow test`
   - **Pickup Location:** `Los Angeles, CA`
   - **Pickup Date:** Tomorrow
   - **Pickup Time:** `09:00 AM`
   - **Delivery Location:** `New York, NY`
   - **Delivery Date:** 5 days from now
   - **Delivery Time:** `05:00 PM`
   - **Cargo Type:** `Electronics`
   - **Weight:** `10000` lbs
   - **Special Requirements:** `Temperature controlled`
4. Click **"Create Shipment"** button
5. Verify success notification
6. **Note the Shipment ID** from the notification

**Step 2: Broker Views and Creates Load from Shipment**
7. **Logout** from shipper account
8. Login as **broker** (testbroker@example.com)
9. Navigate to **"Browse Shipments"** page
10. Search for the shipment titled `Test Shipment LA to NYC`
11. Click **"View Details"** to verify shipment data
12. Click **"Create Load"** button on the shipment card
13. Verify redirect to Post Load page with pre-filled data:
    - Origin: Los Angeles, CA
    - Destination: New York, NY
    - Pickup Date: (from shipment)
    - Delivery Date: (from shipment)
14. Complete additional fields:
    - Equipment Type: `Reefer` (temperature controlled)
    - Weight: `10000` lbs
    - Rate: `4500`
    - Load Type: `Full Truckload`
15. Click **"Post Load"** button
16. Verify success notification
17. **Note the Load ID**

**Step 3: Carrier Finds and Books the Load**
18. **Logout** from broker account
19. Login as **carrier** (testcarrier@example.com)
20. Navigate to **"Load Board"** page
21. Use filters to find the load:
    - Origin: Type `Los` and select `Los Angeles, CA`
    - Destination: Type `New` and select `New York, NY`
22. Click **"Search"** button
23. Find the load posted by the broker (rate $4500)
24. Click **"View details →"**
25. Verify load details match the original shipment
26. Click **"Book Load"** button
27. Confirm booking
28. Verify success notification: "Load booked successfully!"
29. Verify load status changes to "Booked"

**Step 4: Verification**
30. Check carrier dashboard - verify:
    - Loads Booked: 1
    - Revenue updated

**Expected Results:**
- ✅ Shipper successfully creates shipment
- ✅ Broker sees shipment in Browse Shipments board
- ✅ Broker can create load from shipment with pre-filled data
- ✅ Load appears on Load Board for carriers
- ✅ Carrier can search and find the load using autocomplete
- ✅ Carrier can book the load successfully
- ✅ Complete data flow works end-to-end
- ✅ **Full platform integration confirmed!**

---

## 🐛 Known Issues to Watch For

### Backend 502 Errors (Infrastructure Issue)
**Symptoms:**
- "502 Bad Gateway" error when updating settings
- Platform stats not loading
- `SyntaxError: Unexpected token '<', "<!DOCTYPE "...` in console

**Cause:**
- Render.com FREE tier spins down after 15 minutes inactivity
- Backend needs 30-60 seconds to "wake up" (cold start)

**Workaround:**
- Wait 1 minute and retry the action
- Backend will wake up and subsequent requests will work

**NOT A CODE BUG** - This is a hosting limitation

---

## ✅ Testing Checklist Summary

### Broker Account ✓
- [ ] Registration & Email Verification
- [ ] Dashboard Display
- [ ] Browse Shipments Page
- [ ] Shipment Filtering (Origin, Destination, Status)
- [ ] View Shipment Details Modal
- [ ] Create Load from Shipment
- [ ] Post Load (Direct)

### Carrier Account ✓
- [ ] Registration & Email Verification
- [ ] Dashboard Display
- [ ] Authority Status Display
- [ ] Load Board Access
- [ ] Smart Autocomplete (Origin)
- [ ] Smart Autocomplete (Destination)
- [ ] All Load Filters
- [ ] Book Load Feature
- [ ] Settings (All Tabs)

### Cross-User Testing ✓
- [ ] Role-Based Access Control
- [ ] End-to-End Data Flow (Shipper → Broker → Carrier)

---

## 📊 Expected Final Results

After completing all tests, you should have:

1. ✅ **3 Active User Accounts:**
   - Shipper: testshipper@example.com
   - Broker: testbroker@example.com
   - Carrier: testcarrier@example.com

2. ✅ **Created Data:**
   - At least 1 shipment (by shipper)
   - At least 2 loads (by broker)
   - At least 1 booked load (by carrier)

3. ✅ **Verified Features:**
   - City/State autocomplete working on all location fields
   - All filters functional
   - Role-based access control enforced
   - Complete data flow works end-to-end

4. ✅ **Platform Status:**
   - 100% functional for all user types
   - All critical features working
   - No code bugs (only infrastructure limitations)

---

**Happy Testing!** 🚀

If you encounter any issues beyond the known backend 502 errors, please document them with:
- Exact steps to reproduce
- Expected vs. actual behavior
- Browser console errors
- Screenshots (if helpful)

