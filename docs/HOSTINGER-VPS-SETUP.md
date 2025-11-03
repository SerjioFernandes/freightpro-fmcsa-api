# 🖥️ Hostinger VPS Deployment Script

Complete VPS setup for FreightPro backend on Ubuntu 22.04.

---

## Prerequisites

- ✅ Hostinger VPS running Ubuntu 22.04
- ✅ SSH access with root privileges
- ✅ Domain pointing to VPS IP
- ✅ Backend code (`backend-deploy.zip`)

---

## Quick Setup Script

Copy-paste this entire script:

```bash
#!/bin/bash
set -e

# Update system
apt update && apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install nginx
apt install -y nginx

# Install PM2
npm install -g pm2

# Install certbot
apt install -y certbot python3-certbot-nginx

# Install other tools
apt install -y git unzip ufw

# Configure firewall
ufw allow 22/tcp
ufw allow 80/tcp
ufw allow 443/tcp
ufw --force enable

# Create directories
mkdir -p /var/www/html
mkdir -p /var/www/api
mkdir -p /var/www/api/logs

echo "✅ System setup complete!"
echo "Next: Upload backend-deploy.zip to /var/www/api/"
```

Run:
```bash
chmod +x setup.sh && ./setup.sh
```

---

## Upload Backend

### Option 1: SFTP
1. Use FileZilla or WinSCP
2. Connect to VPS
3. Upload `backend-deploy.zip` to `/root`
4. SSH in: `ssh root@yourdomain.com`

### Option 2: Git Clone
```bash
cd /var/www/api
git clone https://github.com/your-org/freightpro-fmcsa-api.git .
```

---

## Extract & Configure

```bash
# Extract backend
cd /var/www/api
unzip backend-deploy.zip
mv backend/* .
rm backend-deploy.zip

# Install dependencies
npm install --production

# Create .env file
nano .env
```

Add:
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/cargolume
JWT_SECRET=your_96_char_secret
NODE_ENV=production
PORT=4000
FRONTEND_URL=https://www.yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your_app_password
```

Save: `Ctrl+O, Enter, Ctrl+X`

---

## Start with PM2

```bash
# Start app
pm2 start ecosystem.config.js

# Save PM2 process list
pm2 save

# Enable PM2 on boot
pm2 startup
# Copy-paste the command PM2 shows you
```

---

## Configure Nginx

```bash
# Copy config
cp others/nginx/freightpro.conf /etc/nginx/sites-available/freightpro

# Edit your domain
nano /etc/nginx/sites-available/freightpro
# Replace "yourdomain.com" with your actual domain

# Enable site
ln -s /etc/nginx/sites-available/freightpro /etc/nginx/sites-enabled/
rm /etc/nginx/sites-enabled/default

# Test config
nginx -t

# Reload
systemctl reload nginx
```

---

## SSL Certificate

```bash
# Get certificate
certbot --nginx -d yourdomain.com -d www.yourdomain.com -d api.yourdomain.com

# Auto-renewal (already configured)
certbot renew --dry-run
```

---

## Upload Frontend

```bash
# Extract to /var/www/html
unzip frontend-deploy.zip -d /var/www/html

# Set permissions
chown -R www-data:www-data /var/www/html
chmod -R 755 /var/www/html
```

---

## Test

```bash
# Backend health
curl http://localhost:4000/api/health

# Frontend
curl http://localhost

# Public
curl https://www.yourdomain.com
curl https://api.yourdomain.com/api/health
```

---

## Maintenance

```bash
# View logs
pm2 logs

# Restart app
pm2 restart freightpro-backend

# Update code
cd /var/www/api
git pull
npm install --production
npm run build
pm2 restart freightpro-backend

# Nginx logs
tail -f /var/log/nginx/error.log
```

---

## Done! ✅

Your VPS is deployed and running.

