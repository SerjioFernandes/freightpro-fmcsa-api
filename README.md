# 🚛 CargoLume - Production Load Board Platform

**Professional freight management platform for carriers, brokers, and shippers.**

---

## 🚀 START HERE

**👉 Open `START-HERE.md` first!**

Complete deployment package ready with:
- ✅ Full production deployment plan
- ✅ Railway backend + Hostinger frontend guides
- ✅ Hostinger VPS alternative
- ✅ All configuration files
- ✅ Automated scripts
- ✅ Comprehensive documentation

---

## 📁 Project Structure

```
FreightPro/
├── START-HERE.md                    ⭐ START HERE
├── LAUNCH_PLAN.md                   🚀 Deployment guide
├── README_LAUNCH_CHECKLIST.md       ✅ Launch checklist
│
├── docs/                            📚 Documentation
│   ├── RAILWAY-DEPLOY-GUIDE.md     🚂 Backend deployment
│   ├── HOSTINGER-DNS-GUIDE.md      🌐 DNS setup
│   ├── HOSTINGER-VPS-SETUP.md      🖥️  VPS alternative
│   ├── SMOKE_TESTS.md               🧪 Testing
│   ├── SECURITY-HARDENING.md        🔒 Security
│   └── DB-MIGRATION-GUIDE.md        🔄 Migration guide
│
├── scripts/                         🤖 Scripts
│   ├── build-and-zip.sh            📦 Build script
│   └── smoke-test.sh                 ✅ Test script
│
├── backend/                         🟢 Backend API
│   ├── src/
│   │   ├── controllers/            API controllers
│   │   ├── models/                 Mongoose models
│   │   ├── routes/                 Express routes
│   │   ├── services/               Business logic
│   │   └── server.ts               Entry point
│   └── dist/                       Compiled JS
│
├── frontend/                        ⚛️  React Frontend
│   ├── src/
│   │   ├── components/             React components
│   │   ├── pages/                  Page components
│   │   ├── services/               API client
│   │   └── store/                  Zustand state
│   └── dist/                       Built assets
│
└── Others/                          📦 Config & legacy
    ├── ecosystem.config.js         PM2 config
    └── nginx/
        └── freightpro.conf         Nginx config
```

---

## 🎯 Quick Deploy

**Recommended:** Railway backend + Hostinger frontend

```bash
# 1. Read START-HERE.md
cat START-HERE.md

# 2. Follow LAUNCH_PLAN.md
# - Deploy backend to Railway (10-15 min)
# - Deploy frontend to Hostinger (5-10 min)
# - Configure DNS (5 min)
# - Run tests (10 min)

# Total: 35-50 minutes
```

---

## 📚 Documentation

### Essential Reading Order:

1. **`START-HERE.md`** - Overview & quick start
2. **`LAUNCH_PLAN.md`** - Complete deployment steps
3. **`README_LAUNCH_CHECKLIST.md`** - Launch checklist
4. **`COMPLETE-PROJECT-ANALYSIS.md`** - Full project analysis

### Deployment Guides:

- **Railway Backend:** `docs/RAILWAY-DEPLOY-GUIDE.md`
- **Hostinger Frontend:** Upload built files to Hostinger File Manager
- **DNS Setup:** `docs/HOSTINGER-DNS-GUIDE.md`
- **VPS Alternative:** `docs/HOSTINGER-VPS-SETUP.md`

### Reference:

- **Testing:** `docs/SMOKE_TESTS.md`
- **Security:** `docs/SECURITY-HARDENING.md`
- **Migration:** `docs/DB-MIGRATION-GUIDE.md`
- **Env Vars:** `docs/ENV-VARIABLES-TEMPLATE.txt`

---

## 🛠️ Tech Stack

### Frontend
- **React 19** + **TypeScript**
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Navigation
- **Zustand** - State management
- **Leaflet** - Maps
- **Chart.js** - Analytics
- **Socket.io-client** - Real-time

### Backend
- **Node.js 18+** + **TypeScript**
- **Express.js** - Web framework
- **MongoDB Atlas** - Database
- **Mongoose** - ODM
- **Socket.io** - WebSocket
- **JWT** - Authentication
- **Winston** - Logging

### Infrastructure
- **Railway.app** - Backend hosting
- **Hostinger** - Frontend hosting
- **MongoDB Atlas** - Database (FREE tier)
- **VPS** - Alternative hosting option

---

## 🔐 Environment Variables

Generate secrets and configure environment:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"

# See docs/ENV-VARIABLES-TEMPLATE.txt for all variables
```

Required variables:
- `MONGODB_URI` - MongoDB Atlas connection
- `JWT_SECRET` - Authentication secret
- `FRONTEND_URL` - Frontend domain
- `EMAIL_USER` - Gmail address
- `EMAIL_PASS` - Gmail app password

---

## 🚀 Deployment Options

### Option 1: Railway + Hostinger (Recommended)
- **Railway.app** - Backend hosting
- **Hostinger** - Frontend hosting
- **MongoDB Atlas** - Database
- **Cost:** Low cost (Railway free tier + Hostinger hosting)

### Option 2: VPS
- **Hostinger VPS** - $10-20/month
- **MongoDB Atlas** - Database
- **Full control** - Your server

See `docs/HOSTINGER-VPS-SETUP.md` for VPS deployment.

---

## 🧪 Testing

```bash
# Run automated smoke tests
chmod +x scripts/smoke-test.sh
./scripts/smoke-test.sh

# Manual tests
curl https://api.yourdomain.com/api/health
curl https://www.yourdomain.com

# See docs/SMOKE_TESTS.md for complete test suite
```

---

## 📊 Features

- ✅ **Load Board** - Search and filter loads
- ✅ **Interactive Maps** - Leaflet with markers
- ✅ **Messaging** - Real-time WebSocket chat
- ✅ **Dashboard** - Analytics and stats
- ✅ **Saved Searches** - Email alerts
- ✅ **Document Management** - Upload/download
- ✅ **User Management** - Auth, profiles, sessions
- ✅ **Notifications** - Push & email
- ✅ **PWA Support** - Offline capability

---

## 🔒 Security

- ✅ JWT authentication
- ✅ Password hashing (bcrypt)
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Helmet.js security headers
- ✅ Input validation
- ✅ File upload validation
- ✅ Secure cookies

See `docs/SECURITY-HARDENING.md` for complete checklist.

---

## 📈 Performance

- ✅ Code splitting
- ✅ Gzip compression
- ✅ Static asset caching
- ✅ Database indexing
- ✅ Connection pooling
- ✅ Optimized queries

Target metrics:
- First load: < 3 seconds
- API response: < 500ms
- Uptime: > 99%

---

## 🐛 Troubleshooting

See `LAUNCH_PLAN.md` → "Troubleshooting" section.

Common issues:
- MongoDB connection errors
- CORS configuration
- WebSocket connection
- SSL certificate issues
- DNS propagation

---

## 📞 Support

- **Railway:** https://docs.railway.app
- **Hostinger:** https://www.hostinger.com/tutorials
- **MongoDB:** https://docs.atlas.mongodb.com
- **GitHub Issues:** Report bugs here

---

## 📄 License

MIT License - see LICENSE file

---

## 🎉 Ready to Deploy?

**Start here: `START-HERE.md`**

Everything you need is ready:
- ✅ Complete deployment guides
- ✅ All configuration files
- ✅ Automated scripts
- ✅ Testing procedures
- ✅ Security checklists

**Deploy in 35-50 minutes!**

---

**Questions?** All answers in `LAUNCH_PLAN.md` 📚
