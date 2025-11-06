# FreightPro Complete Testing Guide

## Prerequisites

1. **Backend Running**: Ensure Railway backend is deployed and accessible at `https://freightpro-fmcsa-api-production.up.railway.app`
2. **Frontend Running**: Ensure frontend is deployed on Hostinger at `https://www.cargolume.com` or running locally
3. **Browser**: Use Chrome/Edge with DevTools open (F12)
4. **Test Accounts**: Create test accounts for each user type (Broker, Carrier, Shipper)

## Testing Checklist

### Phase 1: Authentication & User Management

#### 1.1 User Registration
- [ ] **Broker Registration**
  - Navigate to `/register`
  - Select "Broker" account type
  - Fill in all required fields (email, password, company, phone, USDOT, MC, EIN)
  - Submit registration
  - Verify email verification code is received
  - Enter verification code
  - Verify redirect to login page
  - Check browser console for errors

- [ ] **Carrier Registration**
  - Navigate to `/register`
  - Select "Carrier" account type
  - Fill in all required fields
  - Submit registration
  - Verify email verification
  - Check console for errors

- [ ] **Shipper Registration**
  - Navigate to `/register`
  - Select "Shipper" account type
  - Fill in required fields (EIN not required for shippers)
  - Submit registration
  - Verify email verification
  - Check console for errors

#### 1.2 Email Verification
- [ ] Check email inbox for verification code
- [ ] Enter code on verification page
- [ ] Verify success message
- [ ] Verify redirect to login
- [ ] Test resend code functionality
- [ ] Test invalid code handling

#### 1.3 Login
- [ ] Navigate to `/login`
- [ ] Enter valid credentials
- [ ] Verify successful login
- [ ] Verify redirect to dashboard
- [ ] Check localStorage for token and user data
- [ ] Test invalid credentials (should show error)
- [ ] Test empty fields validation

#### 1.4 Logout
- [ ] Click logout button
- [ ] Verify redirect to home/login
- [ ] Verify token removed from localStorage
- [ ] Verify user data cleared

#### 1.5 Session Management
- [ ] Login successfully
- [ ] Refresh page (F5)
- [ ] Verify user remains logged in
- [ ] Close browser and reopen
- [ ] Verify user still logged in (if token valid)
- [ ] Test expired token handling

### Phase 2: Load Board Features

#### 2.1 Load Listing
- [ ] Navigate to `/load-board` as Carrier
- [ ] Verify loads are displayed
- [ ] Check pagination works
- [ ] Verify load cards show all required info:
  - Origin/Destination
  - Pickup/Delivery dates
  - Equipment type
  - Rate
  - Distance
  - Posted by (broker info)
- [ ] Test filtering by status
- [ ] Test page navigation

#### 2.2 Load Search
- [ ] Use search bar to search loads
- [ ] Test origin/destination autocomplete
- [ ] Test advanced filters:
  - Equipment type
  - Price range
  - Origin state
  - Destination state
- [ ] Verify search results update correctly
- [ ] Test clearing filters

#### 2.3 Load Details
- [ ] Click on a load card
- [ ] Verify load details page displays:
  - Full load information
  - Map with origin/destination
  - Broker contact info
  - Book/Contact buttons
- [ ] Test "Book Load" button (Carrier)
- [ ] Test "Contact Broker" button

#### 2.4 Post Load (Broker)
- [ ] Login as Broker
- [ ] Navigate to `/post-load`
- [ ] Fill in PostLoad form:
  - Title
  - Description
  - Origin (city, state, zip)
  - Destination (city, state, zip)
  - Pickup date
  - Delivery date
  - Equipment type
  - Weight
  - Rate
- [ ] Submit form
- [ ] Verify success message
- [ ] Verify load appears in Load Board
- [ ] Verify load appears in Broker dashboard

#### 2.5 Book Load (Carrier)
- [ ] Login as Carrier
- [ ] Navigate to Load Board
- [ ] Click "Book Load" on an available load
- [ ] Verify confirmation dialog
- [ ] Confirm booking
- [ ] Verify success message
- [ ] Verify load status changes to "booked"
- [ ] Verify load appears in Carrier dashboard
- [ ] Verify broker receives notification

### Phase 3: Messaging System

#### 3.1 Send Message
- [ ] Login as Carrier
- [ ] Navigate to Load Board
- [ ] Click "Contact Broker" on a load
- [ ] Verify message modal opens
- [ ] Enter subject and message
- [ ] Send message
- [ ] Verify success notification
- [ ] Navigate to Messages page
- [ ] Verify message appears in conversation list

#### 3.2 Receive Message
- [ ] Login as Broker (in different browser/incognito)
- [ ] Navigate to Messages page
- [ ] Verify new message appears
- [ ] Click on conversation
- [ ] Verify message displays correctly
- [ ] Verify unread count updates

#### 3.3 Real-time Messaging
- [ ] Open Messages page in two browsers (Carrier and Broker)
- [ ] Send message from Carrier
- [ ] Verify message appears instantly in Broker's view (WebSocket)
- [ ] Send reply from Broker
- [ ] Verify message appears instantly in Carrier's view
- [ ] Check browser console for WebSocket connection logs

#### 3.4 Message Features
- [ ] Test edit message functionality
- [ ] Test delete message functionality
- [ ] Test conversation list updates
- [ ] Test unread count badge
- [ ] Test message search/filter

### Phase 4: Dashboard & Analytics

#### 4.1 Broker Dashboard
- [ ] Login as Broker
- [ ] Navigate to Dashboard
- [ ] Verify stats display:
  - Total posted loads
  - Active loads
  - Booked loads
  - Potential revenue
- [ ] Verify recent loads list
- [ ] Verify charts/analytics (if implemented)
- [ ] Test navigation to Load Board
- [ ] Test navigation to Post Load

#### 4.2 Carrier Dashboard
- [ ] Login as Carrier
- [ ] Navigate to Dashboard
- [ ] Verify stats display:
  - Total booked loads
  - Active loads
  - Total earnings
  - Total miles
- [ ] Verify recent loads list
- [ ] Verify charts/analytics
- [ ] Test navigation to Load Board

#### 4.3 Shipper Dashboard
- [ ] Login as Shipper
- [ ] Navigate to Dashboard
- [ ] Verify stats display:
  - Shipment requests
  - Active shipments
  - Broker proposals
  - Total costs
- [ ] Verify recent shipments list

### Phase 5: Real-time Features (WebSocket)

#### 5.1 WebSocket Connection
- [ ] Open browser DevTools → Network → WS tab
- [ ] Login to application
- [ ] Verify WebSocket connection established
- [ ] Check console for connection logs
- [ ] Verify connection persists on page navigation

#### 5.2 Real-time Load Updates
- [ ] Open Load Board in two browsers
- [ ] Post new load from Broker (browser 1)
- [ ] Verify load appears instantly in Carrier view (browser 2)
- [ ] Update load status
- [ ] Verify status updates in real-time

#### 5.3 Real-time Notifications
- [ ] Enable browser notifications (if implemented)
- [ ] Trigger notification event (new message, load update)
- [ ] Verify notification appears
- [ ] Test notification center
- [ ] Test mark as read functionality

### Phase 6: UI/UX Testing

#### 6.1 Design Consistency
- [ ] Verify button styles are consistent across pages
- [ ] Verify color scheme is consistent
- [ ] Verify typography hierarchy
- [ ] Verify spacing and padding
- [ ] Verify form styling consistency

#### 6.2 Navigation
- [ ] Test header navigation
- [ ] Test mobile bottom navigation
- [ ] Test breadcrumbs (if implemented)
- [ ] Test back button functionality
- [ ] Test protected routes redirect

#### 6.3 Forms
- [ ] Test form validation messages
- [ ] Test required field indicators
- [ ] Test error states
- [ ] Test success states
- [ ] Test loading states during submission

#### 6.4 Loading States
- [ ] Verify loading skeletons/spinners
- [ ] Verify loading states on data fetch
- [ ] Verify no flickering on page load
- [ ] Test slow network simulation (DevTools → Network → Throttling)

#### 6.5 Error States
- [ ] Test 404 page
- [ ] Test error boundaries
- [ ] Test API error handling
- [ ] Test network error handling
- [ ] Verify error messages are user-friendly

### Phase 7: Mobile Responsiveness

#### 7.1 Mobile Navigation
- [ ] Test on mobile device or DevTools mobile view
- [ ] Verify mobile bottom navigation
- [ ] Test hamburger menu (if applicable)
- [ ] Verify touch interactions work

#### 7.2 Mobile Forms
- [ ] Test registration form on mobile
- [ ] Test login form on mobile
- [ ] Test PostLoad form on mobile
- [ ] Verify form inputs are accessible
- [ ] Verify keyboard doesn't cover inputs

#### 7.3 Mobile Layouts
- [ ] Test Load Board on mobile
- [ ] Test Dashboard on mobile
- [ ] Test Messages on mobile
- [ ] Verify cards/lists are readable
- [ ] Verify buttons are tappable (min 44x44px)

#### 7.4 Responsive Breakpoints
- [ ] Test at 320px width (small mobile)
- [ ] Test at 768px width (tablet)
- [ ] Test at 1024px width (desktop)
- [ ] Test at 1920px width (large desktop)
- [ ] Verify no horizontal scrolling

### Phase 8: Performance Testing

#### 8.1 Page Load Performance
- [ ] Open DevTools → Lighthouse
- [ ] Run Performance audit
- [ ] Verify page load time < 3 seconds
- [ ] Verify First Contentful Paint < 1.5 seconds
- [ ] Verify Time to Interactive < 3.5 seconds

#### 8.2 API Performance
- [ ] Monitor Network tab during page load
- [ ] Verify API calls complete quickly
- [ ] Test with slow 3G throttling
- [ ] Verify loading states during slow requests

#### 8.3 Bundle Size
- [ ] Check bundle size in build output
- [ ] Verify code splitting works
- [ ] Verify lazy loading for routes

### Phase 9: Security Testing

#### 9.1 Authentication Security
- [ ] Test accessing protected routes without login
- [ ] Verify redirect to login
- [ ] Test accessing with invalid token
- [ ] Test token expiration handling

#### 9.2 Authorization
- [ ] Test Broker accessing Carrier-only features
- [ ] Test Carrier accessing Broker-only features
- [ ] Verify proper access control

#### 9.3 Input Validation
- [ ] Test SQL injection attempts (should be sanitized)
- [ ] Test XSS attempts (should be escaped)
- [ ] Test file upload validation
- [ ] Test email format validation

### Phase 10: Browser Compatibility

#### 10.1 Desktop Browsers
- [ ] Test on Chrome (latest)
- [ ] Test on Firefox (latest)
- [ ] Test on Edge (latest)
- [ ] Test on Safari (if on Mac)

#### 10.2 Mobile Browsers
- [ ] Test on Chrome Mobile
- [ ] Test on Safari Mobile (iOS)
- [ ] Test on Samsung Internet

## Automated Testing Commands

### Backend API Testing (using curl)

```bash
# Health Check
curl https://freightpro-fmcsa-api-production.up.railway.app/api/health

# Register User
curl -X POST https://freightpro-fmcsa-api-production.up.railway.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "company": "Test Company",
    "phone": "+1234567890",
    "accountType": "broker"
  }'

# Login
curl -X POST https://freightpro-fmcsa-api-production.up.railway.app/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'

# Get Loads (requires token)
curl https://freightpro-fmcsa-api-production.up.railway.app/api/loads \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Frontend Testing

```bash
# Build frontend
cd frontend
npm run build

# Check for TypeScript errors
npm run type-check

# Check for linting errors
npm run lint

# Run tests (if available)
npm test
```

## Common Issues to Check

### Console Errors
- [ ] Open DevTools Console
- [ ] Check for red errors
- [ ] Check for yellow warnings
- [ ] Verify no CORS errors
- [ ] Verify no 404 errors for assets

### Network Errors
- [ ] Open DevTools → Network
- [ ] Check for failed requests (red)
- [ ] Verify API calls return 200/201
- [ ] Check for slow requests (>2s)

### WebSocket Issues
- [ ] Verify WebSocket connection in Network tab
- [ ] Check for connection errors
- [ ] Verify reconnection on disconnect
- [ ] Check message delivery

## Test Data Setup

### Create Test Users

1. **Broker Test User**
   - Email: `broker@test.com`
   - Password: `Test123!@#`
   - Company: `Test Broker Inc`
   - USDOT: `123456`
   - MC: `789012`
   - EIN: `12-3456789`

2. **Carrier Test User**
   - Email: `carrier@test.com`
   - Password: `Test123!@#`
   - Company: `Test Carrier LLC`
   - USDOT: `234567`
   - MC: `890123`
   - EIN: `23-4567890`

3. **Shipper Test User**
   - Email: `shipper@test.com`
   - Password: `Test123!@#`
   - Company: `Test Shipper Corp`
   - EIN: `34-5678901` (optional)

### Create Test Loads

1. Post at least 5-10 test loads with different:
   - Equipment types
   - Origin/destination states
   - Rates
   - Pickup dates

## Reporting Issues

When reporting issues, include:
1. **Steps to Reproduce**: Detailed steps
2. **Expected Behavior**: What should happen
3. **Actual Behavior**: What actually happens
4. **Browser/Device**: Browser version, OS, device type
5. **Console Logs**: Any errors in console
6. **Network Logs**: Failed API calls
7. **Screenshots**: Visual evidence

## Quick Test Script

Run this quick test to verify basic functionality:

```bash
# 1. Check backend health
curl https://freightpro-fmcsa-api-production.up.railway.app/api/health

# 2. Open frontend in browser
# Navigate to: https://www.cargolume.com

# 3. Check console for errors (F12 → Console)

# 4. Test login with test account

# 5. Navigate to Load Board

# 6. Check WebSocket connection (F12 → Network → WS)

# 7. Test sending a message

# 8. Verify real-time updates
```

## Success Criteria

All tests should pass with:
- ✅ No console errors
- ✅ No failed API calls
- ✅ WebSocket connection stable
- ✅ Real-time updates working
- ✅ Mobile responsive
- ✅ Fast page loads (<3s)
- ✅ All user flows functional
- ✅ Error handling working
- ✅ Security measures in place

---

**Last Updated**: After Phase 1-3, 5.2, 5.3 completion
**Next Review**: After Phase 4, 5.1, 5.4 completion

