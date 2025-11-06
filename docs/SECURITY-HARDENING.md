# 🔒 Security Hardening Checklist

Production security checklist for FreightPro deployment.

---

## Authentication & Authorization

- [ ] **JWT Secret**
  - Generate strong secret: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`
  - Store in environment variable, not code
  - Rotate every 6 months

- [ ] **Password Policy**
  - Minimum 8 characters
  - Require uppercase, lowercase, number, special char
  - Enforce in registration/login
  - Hash with bcrypt (cost factor 10+)

- [ ] **Password Reset**
  - Secure token generation
  - Token expiration (1 hour)
  - Rate limit reset attempts
  - Email verification required

- [ ] **Session Management**
  - Secure cookie settings
  - HttpOnly flag
  - SameSite attribute
  - Secure flag (HTTPS only)
  - Session timeout (24 hours)

- [ ] **Multi-Factor Authentication** (Optional)
  - SMS/Email codes
  - TOTP authenticator apps
  - Backup codes stored

---

## API Security

- [ ] **Rate Limiting**
  ```typescript
  // Current setup has rate limiting
  // Verify limits:
  - Register: 5 requests/hour
  - Login: 10 requests/15min
  - API: 100 requests/15min
  ```

- [ ] **CORS Configuration**
  - Whitelist allowed origins only
  - No wildcard `*`
  - Include credentials correctly

- [ ] **Input Validation**
  - Validate all user inputs
  - Sanitize strings
  - Type checking
  - SQL injection prevention (parameterized queries)

- [ ] **XSS Prevention**
  - Sanitize HTML output
  - Content Security Policy headers
  - Escape user inputs
  - No `eval()`, `innerHTML`

- [ ] **CSRF Protection**
  - CSRF tokens
  - SameSite cookies
  - Origin/Referer checks

- [ ] **API Versioning**
  - Version endpoints: `/api/v1/`
  - Deprecation notices
  - Breaking changes documented

---

## Database Security

- [ ] **MongoDB Atlas**
  - Network access: Whitelist IPs only
  - Database users: Least privilege
  - Encryption at rest: Enabled
  - Encryption in transit: TLS 1.2+
  - Multi-factor authentication: Enabled

- [ ] **Connection String**
  - Never commit to git
  - Use environment variables
  - Rotate credentials regularly

- [ ] **Query Injection**
  - Use parameterized queries
  - Validate ObjectIds
  - No string concatenation in queries

- [ ] **Data Encryption**
  - Sensitive fields encrypted (phone, address)
  - Credit card data (PCI DSS if handling)
  - PII protection

- [ ] **Backups**
  - Automated daily backups
  - Encrypted backups
  - Test restore procedures
  - Offsite backup storage

---

## Server Security

- [ ] **Environment Variables**
  ```bash
  # Never commit these:
  - MONGODB_URI
  - JWT_SECRET
  - EMAIL_PASS
  - VAPID_PRIVATE_KEY
  - Any API keys or tokens
  ```

- [ ] **Node.js Version**
  - Use LTS version (18.x or 20.x)
  - Keep updated
  - Security patches applied

- [ ] **Dependencies**
  ```bash
  # Regular security audits
  npm audit
  npm audit fix
  
  # Keep updated
  npm outdated
  npm update
  ```

- [ ] **File Upload**
  - Validate file types
  - Limit file size (10MB max)
  - Scan for malware
  - Store outside webroot
  - Random filenames

- [ ] **Logging**
  - Don't log passwords/tokens
  - Log security events
  - Log failed login attempts
  - Monitor suspicious activity

---

## Network Security

- [ ] **HTTPS Only**
  - SSL/TLS certificates
  - HSTS headers
  - HTTP redirect to HTTPS
  - Valid certificate chain

- [ ] **Firewall**
  ```bash
  # VPS firewall rules
  ufw allow 22/tcp    # SSH
  ufw allow 80/tcp    # HTTP
  ufw allow 443/tcp   # HTTPS
  ufw enable
  ```

- [ ] **DDoS Protection**
  - Cloudflare (recommended)
  - Rate limiting
  - CAPTCHA for suspicious traffic

- [ ] **WebSocket Security**
  - WSS only (not WS)
  - Origin validation
  - Authentication required
  - Rate limit connections

---

## Application Security

- [ ] **Error Handling**
  - Don't expose stack traces in production
  - Generic error messages
  - Log detailed errors server-side

- [ ] **Headers**
  ```typescript
  // Current setup has helmet.js
  // Verify these headers:
  - X-Frame-Options: SAMEORIGIN
  - X-Content-Type-Options: nosniff
  - X-XSS-Protection: 1; mode=block
  - Strict-Transport-Security
  - Content-Security-Policy
  - Referrer-Policy
  ```

- [ ] **PWA Security**
  - HTTPS required
  - Secure service worker
  - No sensitive data in manifest

- [ ] **Email Security**
  - SPF records configured
  - DKIM signed
  - DMARC policy
  - No spoofing

---

## Monitoring & Alerts

- [ ] **Security Monitoring**
  - Failed login attempts
  - Unusual API usage
  - Database access patterns
  - Error rates

- [ ] **Alerts**
  - Multiple failed logins (10+ in 5min)
  - Server down
  - High CPU/memory
  - Unusual traffic spike
  - SSL certificate expiring

- [ ] **Logs**
  - Centralized logging
  - Retention policy (90 days)
  - Searchable logs
  - Alert on critical errors

- [ ] **Backups**
  - Automated backups
  - Test restores monthly
  - Offsite storage
  - Encrypted backups

---

## Compliance

- [ ] **GDPR** (if serving EU users)
  - Data processing consent
  - Right to deletion
  - Data export
  - Privacy policy

- [ ] **PCI DSS** (if handling payments)
  - Secure payment processing
  - Tokenization
  - Network isolation
  - Regular audits

- [ ] **Privacy Policy**
  - Clear and accessible
  - Data collection disclosure
  - Third-party sharing
  - User rights explained

---

## Incident Response

- [ ] **Plan**
  - Designated incident responder
  - Communication plan
  - Rollback procedure
  - Escalation path

- [ ] **Contacts**
  - Security team
  - Hosting support
  - Law enforcement (if needed)
  - Legal team

- [ ] **Procedures**
  - Document incidents
  - Post-mortem reviews
  - Security patches
  - Notify affected users

---

## Regular Maintenance

- [ ] **Weekly**
  - Review error logs
  - Check failed logins
  - Monitor resource usage

- [ ] **Monthly**
  - Update dependencies
  - Security patches
  - Review access logs
  - Backup verification

- [ ] **Quarterly**
  - Security audit
  - Penetration testing
  - Review security policies
  - Training updates

- [ ] **Annually**
  - Full security audit
  - Compliance review
  - Disaster recovery drill
  - Security training

---

## Security Audit Checklist

```bash
# Run these regularly:
npm audit                    # Dependency vulnerabilities
npm outdated                 # Update packages
node -v                      # Node version
npm -v                       # NPM version

# Check logs
pm2 logs                     # Application logs
nginx -t                     # Nginx config test

# SSL check
curl -I https://yourdomain.com
openssl s_client -connect api.yourdomain.com:443
```

---

## Quick Security Checklist

**Before launch:**
- [ ] Strong JWT secret
- [ ] HTTPS enabled
- [ ] Environment variables secure
- [ ] Rate limiting active
- [ ] Input validation
- [ ] CORS configured
- [ ] Security headers
- [ ] Dependencies updated
- [ ] No secrets in code
- [ ] Backups configured

**After launch:**
- [ ] Monitor logs
- [ ] Review alerts
- [ ] Test backups
- [ ] Update packages
- [ ] Security patches
- [ ] Access reviews

---

## References

- OWASP Top 10: https://owasp.org/www-project-top-ten/
- Node.js Security: https://nodejs.org/en/docs/guides/security/
- MongoDB Security: https://docs.mongodb.com/manual/security/
- Railway Security: https://docs.railway.app/develop/security
- Hostinger Security: https://www.hostinger.com/tutorials/website-security

---

**Security is an ongoing process, not a one-time setup!**

