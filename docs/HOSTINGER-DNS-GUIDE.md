# 🌐 Hostinger DNS Configuration Guide

Complete DNS setup to connect your FreightPro/CargoLume domain to Vercel (frontend) and Railway (backend).

---

## Prerequisites

- ✅ Domain registered with Hostinger
- ✅ Vercel deployment complete (get your Vercel URL)
- ✅ Railway deployment complete (get your Railway URL)
- ✅ Access to Hostinger DNS management

---

## DNS Records Overview

You need to add 3 DNS records:

1. **CNAME** for `www` → Vercel
2. **A** record for root `@` → Vercel IP
3. **CNAME** for `api` → Railway

---

## Step 1: Get Vercel DNS Information

### 1.1 Get Vercel Domain
1. Go to Vercel Dashboard → Your Project → **Settings** → **Domains**
2. Add your domain: `www.yourdomain.com`
3. Vercel shows DNS instructions like:

```
Add these records to your DNS:
CNAME www → cname.vercel-dns.com
A @ → 76.76.21.21 (or another IP provided by Vercel)
```

**Save these values!**

### 1.2 Verify Vercel IP
The A record IP may vary. Common Vercel IPs:
- `76.76.21.21`
- `76.223.126.88`
- Or check Vercel dashboard for your specific IP

---

## Step 2: Get Railway DNS Information

### 2.1 Get Railway Domain
1. Go to Railway Dashboard → Your Service → **Settings** → **Domains**
2. Add custom domain: `api.yourdomain.com`
3. Railway shows:

```
Add a CNAME record:
Name: api
Value: freightpro-production.up.railway.app (your Railway domain)
```

**Save this value!**

---

## Step 3: Add DNS Records in Hostinger

### 3.1 Access DNS Management
1. Log in to Hostinger hPanel
2. Go to **Domains** → **Manage**
3. Click **DNS** / **Advanced DNS**
4. Click **"Manage DNS Records"** or **"Add DNS Record"**

### 3.2 Add CNAME for www

1. Click **"Add Record"**
2. Fill in:
   - **Type**: `CNAME`
   - **Name/Host**: `www`
   - **Points to/Target**: `cname.vercel-dns.com` (or what Vercel shows)
   - **TTL**: `3600` (1 hour)
3. Click **"Add"** or **"Save"**

### 3.3 Add A Record for Root

1. Click **"Add Record"**
2. Fill in:
   - **Type**: `A`
   - **Name/Host**: `@` (or blank, or your domain name)
   - **Points to/Target**: `76.76.21.21` (or Vercel IP from Step 1)
   - **TTL**: `3600`
3. Click **"Add"** or **"Save"**

### 3.4 Add CNAME for api

1. Click **"Add Record"**
2. Fill in:
   - **Type**: `CNAME`
   - **Name/Host**: `api`
   - **Points to/Target**: `freightpro-production.up.railway.app` (your Railway domain)
   - **TTL**: `3600`
3. Click **"Add"** or **"Save"**

---

## Step 4: Verify DNS Propagation

### 4.1 Check DNS Status

Wait 5-60 minutes for DNS to propagate, then verify:

```bash
# Check www subdomain
nslookup www.yourdomain.com

# Should show CNAME to Vercel

# Check root domain
nslookup yourdomain.com

# Should show A record to Vercel IP

# Check api subdomain
nslookup api.yourdomain.com

# Should show CNAME to Railway
```

### 4.2 Online DNS Checkers

Use these tools to verify propagation globally:

- https://www.whatsmydns.net
- https://dnschecker.org

Enter:
- `www.yourdomain.com`
- `yourdomain.com`
- `api.yourdomain.com`

All should show correct records after propagation.

---

## Step 5: Verify SSL Certificates

### 5.1 Check Vercel SSL

1. Go to Vercel Dashboard → Project → **Settings** → **Domains**
2. Look for `www.yourdomain.com`
3. Status should show: **"Valid"** with green checkmark
4. If not valid, wait 5-10 minutes or trigger manual SSL

### 5.2 Check Railway SSL

1. Go to Railway Dashboard → Service → **Settings** → **Domains**
2. Look for `api.yourdomain.com`
3. Status should show: **"Valid"** (or provisioning)
4. Wait if provisioning (usually 2-5 minutes)

### 5.3 Test HTTPS

```bash
# Test frontend
curl https://www.yourdomain.com

# Should return 200 OK

# Test backend
curl https://api.yourdomain.com/api/health

# Should return JSON health check
```

### 5.4 Browser Test

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

### Wrong IP Address

**If Vercel A record shows wrong IP:**
1. Check Vercel dashboard for correct IP
2. Delete old A record
3. Add new A record with correct IP

### Railway CNAME Issues

**If Railway shows different format:**
- Railway may use ALIAS or custom domain setup
- Follow Railway's exact instructions in dashboard
- May need different record type for your DNS provider

### SSL Certificate Issues

**Certificate not provisioning:**
1. Verify DNS propagated (use online checker)
2. Wait 10-15 minutes
3. Trigger manual SSL in Vercel/Railway
4. Check for DNS validation errors

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
- **Vercel DNS**: https://vercel.com/docs/concepts/projects/domains
- **Railway DNS**: https://docs.railway.app/develop/config#domains
- **General DNS**: https://www.cloudflare.com/learning/dns/what-is-dns/

