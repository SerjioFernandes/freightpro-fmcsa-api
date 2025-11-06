# 🌐 Hostinger DNS Configuration Guide

Complete DNS setup to connect your FreightPro/CargoLume domain to Hostinger (frontend) and Railway (backend).

---

## Prerequisites

- ✅ Domain registered with Hostinger
- ✅ Frontend files uploaded to Hostinger File Manager
- ✅ Railway deployment complete (get your Railway URL)
- ✅ Access to Hostinger DNS management

---

## DNS Records Overview

You need to add 1 DNS record:

1. **CNAME** for `api` → Railway (for backend API subdomain)

**Note:** The frontend is hosted directly on Hostinger, so no DNS records are needed for the main domain or www subdomain.

---

## Step 1: Get Railway DNS Information

### 1.1 Get Railway Domain
1. Go to Railway Dashboard → Your Service → **Settings** → **Domains**
2. Add custom domain: `api.yourdomain.com` (optional, for custom API subdomain)
3. Railway shows:

```
Add a CNAME record:
Name: api
Value: freightpro-production.up.railway.app (your Railway domain)
```

**Save this value!**

**Note:** If you don't need a custom API subdomain, you can skip this step and use the Railway-provided domain directly.

---

## Step 2: Add DNS Records in Hostinger

### 2.1 Access DNS Management
1. Log in to Hostinger hPanel
2. Go to **Domains** → **Manage**
3. Click **DNS** / **Advanced DNS**
4. Click **"Manage DNS Records"** or **"Add DNS Record"**

### 2.2 Add CNAME for api (Optional)

1. Click **"Add Record"**
2. Fill in:
   - **Type**: `CNAME`
   - **Name/Host**: `api`
   - **Points to/Target**: `freightpro-production.up.railway.app` (your Railway domain)
   - **TTL**: `3600`
3. Click **"Add"** or **"Save"**

---

## Step 4: Verify DNS Propagation

### 3.1 Check DNS Status

Wait 5-60 minutes for DNS to propagate, then verify:

```bash
# Check root domain (should point to Hostinger)
nslookup yourdomain.com

# Check www subdomain (should point to Hostinger)
nslookup www.yourdomain.com

# Check api subdomain (if configured, should show CNAME to Railway)
nslookup api.yourdomain.com
```

### 4.2 Online DNS Checkers

Use these tools to verify propagation globally:

- https://www.whatsmydns.net
- https://dnschecker.org

Enter:
- `yourdomain.com`
- `www.yourdomain.com`
- `api.yourdomain.com` (if configured)

All should show correct records after propagation.

---

## Step 4: Verify SSL Certificates

### 4.1 Check Hostinger SSL

1. Go to Hostinger hPanel → **SSL** section
2. Ensure SSL certificate is active for your domain
3. Hostinger usually provides free SSL certificates automatically

### 4.2 Check Railway SSL

1. Go to Railway Dashboard → Service → **Settings** → **Domains**
2. Look for `api.yourdomain.com`
3. Status should show: **"Valid"** (or provisioning)
4. Wait if provisioning (usually 2-5 minutes)

### 4.3 Test HTTPS

```bash
# Test frontend
curl https://www.yourdomain.com

# Should return 200 OK

# Test backend (using Railway domain)
curl https://freightpro-fmcsa-api-production.up.railway.app/api/health

# Should return JSON health check

# Or if you configured api subdomain:
curl https://api.yourdomain.com/api/health
```

### 4.4 Browser Test

1. Visit: `https://www.yourdomain.com`
2. Check for green padlock 🔒 in address bar
3. No "Not Secure" warnings
4. Check certificate details (click padlock)

---

## Troubleshooting

### DNS Not Propagating After 1 Hour

**Possible causes:**
- Wrong DNS provider (check you're editing Hostinger DNS, not domain registrar)
- TTL too high (but 3600 is fine)
- Cache issue

**Solutions:**
1. Clear DNS cache locally: `ipconfig /flushdns` (Windows) or `sudo dscacheutil -flushcache` (Mac)
2. Try different DNS server: `1.1.1.1` (Cloudflare) or `8.8.8.8` (Google)
3. Wait longer (up to 48 hours in rare cases)

### CNAME Record Errors

**Error:** "Cannot create CNAME because A record exists"

**Solution:**
1. Remove conflicting A records for same hostname
2. CNAME and A cannot coexist for same name

### Railway CNAME Issues

**If Railway shows different format:**
- Railway may use ALIAS or custom domain setup
- Follow Railway's exact instructions in dashboard
- May need different record type for your DNS provider

### SSL Certificate Issues

**Certificate not provisioning:**
1. Verify DNS propagated (use online checker)
2. Wait 10-15 minutes
3. Check Hostinger SSL settings in hPanel
4. For Railway, check SSL status in Railway dashboard
5. Check for DNS validation errors

**Mixed content warnings:**
- Ensure all resources loaded over HTTPS
- Check for hardcoded `http://` URLs in code
- Update API URLs to use HTTPS

---

## Testing Complete Setup

### Test 1: Frontend Loads
```bash
curl https://www.yourdomain.com
# Should return HTML with status 200
```

### Test 2: Backend Health
```bash
curl https://api.yourdomain.com/api/health
# Should return JSON: {"status":"ok",...}
```

### Test 3: CORS Works
```bash
curl -H "Origin: https://www.yourdomain.com" \
     https://api.yourdomain.com/api/health
# Should include Access-Control-Allow-Origin header
```

### Test 4: WebSocket
```bash
# Install wscat first: npm install -g wscat
wscat -c wss://api.yourdomain.com/socket.io/?EIO=4&transport=websocket
# Should connect successfully
```

### Test 5: Full User Flow
1. Visit: `https://www.yourdomain.com`
2. Register account
3. Log in
4. Load Board displays
5. Map shows markers
6. Messaging works

**All tests passing? DNS is configured correctly! ✅**

---

## Common DNS Record Types

- **A Record**: Maps hostname to IPv4 address
- **AAAA Record**: Maps hostname to IPv6 address
- **CNAME**: Maps hostname to another hostname (alias)
- **ALIAS/ANAME**: Similar to CNAME but works at root domain
- **TXT Record**: Text data (used for verification, SPF, etc.)
- **MX Record**: Mail exchange (for email)

---

## DNS Best Practices

### TTL Settings
- **Development**: 300 (5 minutes) - faster changes
- **Production**: 3600 (1 hour) - better caching
- **Stable**: 86400 (24 hours) - maximum caching

### Record Priority
1. CNAME for subdomains (www, api)
2. A record for root domain
3. Avoid mixing CNAME and A for same name

### Backup Records
- Keep old DNS records until new ones propagate
- Or use very low TTL before major changes

---

## Next Steps

After DNS is configured:

1. ✅ Verify SSL certificates
2. ✅ Test all endpoints
3. ✅ Configure monitoring
4. ✅ Set up backups
5. ✅ Run smoke tests

See **README_LAUNCH_CHECKLIST.md** for complete testing checklist.

---

## Support

- **Hostinger DNS**: https://www.hostinger.com/tutorials/how-to-manage-dns
- **Railway DNS**: https://docs.railway.app/develop/config#domains
- **General DNS**: https://www.cloudflare.com/learning/dns/what-is-dns/

