# 🧪 Smoke Tests - FreightPro/CargoLume

Quick smoke tests to verify your deployment is working.

---

## Prerequisites

- ✅ Backend deployed to Railway
- ✅ Frontend deployed to Hostinger
- ✅ DNS configured (if using custom API subdomain)
- ✅ SSL certificates active

---

## Quick Test Script

Run the automated test:

```bash
# Set your domains
export API_URL="https://api.yourdomain.com"
export DOMAIN="https://www.yourdomain.com"

# Make script executable
chmod +x scripts/smoke-test.sh

# Run tests
./scripts/smoke-test.sh
```

---

## Manual Tests

### Test 1: Backend Health Check

```bash
curl https://api.yourdomain.com/api/health
```

**Expected:**
```json
{
  "status": "ok",
  "message": "CargoLume Load Board API is running",
  "service": "CargoLume Load Board API",
  "version": "2.0.0",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.45
}
```

**Status Code:** `200 OK`

---

### Test 2: Frontend Loads

```bash
curl -I https://www.yourdomain.com
```

**Expected:**
```
HTTP/2 200
content-type: text/html
```

**Check:** HTML loads, no 404 or 500 errors

---

### Test 3: User Registration

```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#",
    "company": "Test Company",
    "phone": "555-1234",
    "accountType": "carrier"
  }'
```

**Expected:** `201 Created` or `400 Bad Request` (if user exists)

---

### Test 4: User Login

```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Test123!@#"
  }'
```

**Expected:**
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "...",
    "email": "test@example.com",
    ...
  }
}
```

**Save the token** for next tests.

---

### Test 5: Protected Endpoint (Without Token)

```bash
curl https://api.yourdomain.com/api/dashboard/stats
```

**Expected:** `401 Unauthorized`

---

### Test 6: Protected Endpoint (With Token)

```bash
curl https://api.yourdomain.com/api/dashboard/stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE"
```

**Expected:** `200 OK` with dashboard data

---

### Test 7: Load Board

```bash
curl https://api.yourdomain.com/api/loads
```

**Expected:** `200 OK` with loads array

```json
{
  "loads": [...],
  "total": 500,
  "page": 1,
  "pages": 50
}
```

---

### Test 8: CORS

```bash
curl -I https://api.yourdomain.com/api/health \
  -H "Origin: https://www.yourdomain.com" \
  -H "Access-Control-Request-Method: GET"
```

**Expected headers:**
```
Access-Control-Allow-Origin: https://www.yourdomain.com
Access-Control-Allow-Methods: GET, POST, PUT, DELETE
Access-Control-Allow-Credentials: true
```

---

### Test 9: WebSocket Connection

```bash
# Install wscat first
npm install -g wscat

# Connect
wscat -c wss://api.yourdomain.com/socket.io/?EIO=4&transport=websocket
```

**Expected:**
- Connected message
- No connection errors

**Type:** `42["ping"]` and press Enter

---

### Test 10: File Upload

```bash
# Create test file
echo "test content" > test.txt

# Upload (requires authentication)
curl -X POST https://api.yourdomain.com/api/documents \
  -H "Authorization: Bearer YOUR_JWT_TOKEN_HERE" \
  -F "file=@test.txt" \
  -F "type=invoice"

# Cleanup
rm test.txt
```

**Expected:** `201 Created` with document info

---

### Test 11: React Router (SPA Fallback)

```bash
curl https://www.yourdomain.com/login
```

**Expected:** Same HTML as homepage (React Router fallback)

---

### Test 12: Static Assets

```bash
curl -I https://www.yourdomain.com/favicon.ico
```

**Expected:** `200 OK` with image content-type

---

### Test 13: Rate Limiting

```bash
# Make rapid requests
for i in {1..20}; do
  curl https://api.yourdomain.com/api/health
done
```

**Expected:** Some requests may return `429 Too Many Requests`

---

### Test 14: Invalid Endpoint (404)

```bash
curl https://api.yourdomain.com/api/invalid-endpoint
```

**Expected:** `404 Not Found`

---

### Test 15: SSL/TLS

```bash
# Check SSL certificate
openssl s_client -connect api.yourdomain.com:443 -servername api.yourdomain.com < /dev/null
```

**Expected:**
- Valid certificate
- No SSL errors
- Secure cipher suite

---

## Browser Tests

### Test 16: Load Board Display

1. Visit: https://www.yourdomain.com/loads
2. Loads should display
3. Map should render
4. No console errors

---

### Test 17: Search & Filter

1. Enter search term
2. Click "Search"
3. Results filter correctly
4. Filters work

---

### Test 18: Messaging

1. Go to Messages
2. Open conversation
3. Send message
4. Message appears
5. WebSocket connected (check Network tab)

---

### Test 19: Dashboard

1. Go to Dashboard
2. Stats load
3. Charts render
4. No loading spinners stuck

---

### Test 20: Mobile Responsive

1. Open DevTools (F12)
2. Toggle device toolbar
3. Select mobile device
4. Layout adjusts correctly
5. Touch interactions work

---

### Test 21: PWA Install

1. Visit site on mobile
2. Install prompt appears
3. Click "Install"
4. App installs
5. App icon appears on home screen
6. Can open app offline

---

## Performance Tests

### Test 22: First Load Time

```bash
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://www.yourdomain.com
```

**Target:** < 3 seconds

---

### Test 23: API Response Time

```bash
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://api.yourdomain.com/api/loads
```

**Target:** < 500ms

---

### Test 24: Database Response

```bash
curl -o /dev/null -s -w "Time: %{time_total}s\n" https://api.yourdomain.com/api/stats/platform
```

**Target:** < 1 second

---

## Security Tests

### Test 25: SQL Injection Attempt

```bash
curl "https://api.yourdomain.com/api/loads?search=' OR '1'='1"
```

**Expected:** No database errors, sanitized response

---

### Test 26: XSS Attempt

```bash
curl -X POST https://api.yourdomain.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "<script>alert(1)</script>@test.com","password":"Test123"}'
```

**Expected:** Input sanitized or rejected

---

### Test 27: CSRF Protection

```bash
curl -X POST https://api.yourdomain.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"test"}'
```

**Expected:** Works (CORS configured properly)

---

## All Tests Checklist

- [ ] Backend health check ✓
- [ ] Frontend loads ✓
- [ ] User registration ✓
- [ ] User login ✓
- [ ] Protected endpoints ✓
- [ ] Load board data ✓
- [ ] CORS configured ✓
- [ ] WebSocket works ✓
- [ ] File upload ✓
- [ ] SPA routing ✓
- [ ] Static assets ✓
- [ ] Rate limiting ✓
- [ ] 404 handling ✓
- [ ] SSL valid ✓
- [ ] Load Board display ✓
- [ ] Search/filter ✓
- [ ] Messaging ✓
- [ ] Dashboard ✓
- [ ] Mobile responsive ✓
- [ ] PWA install ✓
- [ ] Performance acceptable ✓
- [ ] Security hardened ✓

**All tests passing? Your deployment is production-ready! 🎉**

---

## Troubleshooting

See `LAUNCH_PLAN.md` section "Troubleshooting" for common issues and fixes.

