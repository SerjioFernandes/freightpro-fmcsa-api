# 🚛 CargoLume - Freight Network Platform

## Overview

**CargoLume** is a modern, full-stack freight network platform connecting carriers, brokers, and shippers in real-time. Built with cutting-edge technologies and best practices.

**Status:** ✅ **PRODUCTION READY**

## 🌐 Live URLs

- **Frontend:** https://www.cargolume.com
- **Backend API:** https://freightpro-fmcsa-api-production.up.railway.app
- **GitHub:** https://github.com/SerjioFernandes/freightpro-fmcsa-api

## ✨ Key Features

### 🔐 Authentication & Security
- JWT-based authentication
- Email verification
- Role-based access control (RBAC)
- Secure password hashing
- Session management

### 🚛 Load Board
- Real-time load listings
- Advanced filtering
- Equipment type selection
- Authority-based visibility
- Interstate/intrastate routing

### 📦 Shipments
- Create and manage shipments
- Request-based access control
- Approval workflow
- Status tracking

### 📊 Dashboards
- **Carrier:** Earnings, booked loads, miles
- **Broker:** Posted loads, revenue, requests
- **Shipper:** Shipments, proposals, spend

### 🎨 Modern UI
- Responsive design
- Smooth animations
- Mobile-first approach
- Loading states
- Error handling

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite 7
- TailwindCSS 3
- Zustand (State Management)
- React Router 6
- Axios
- Lucide React Icons

### Backend
- Node.js 20 + Express
- TypeScript 5
- MongoDB + Mongoose
- JWT Authentication
- bcrypt Hashing
- Nodemailer

### DevOps
- Hostinger (Frontend Hosting)
- Railway (Backend Hosting)
- MongoDB Atlas (Database)
- GitHub (Version Control)

## 🚀 Quick Start

### Prerequisites
- Node.js 20.x or higher
- MongoDB connection string
- Hostinger hosting account
- Railway account

### Installation

```bash
# Clone the repository
git clone https://github.com/SerjioFernandes/freightpro-fmcsa-api.git
cd FreightPro

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### Environment Variables

**Backend (.env)**
```env
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=https://www.yourdomain.com
NODE_ENV=production
PORT=4000
```

**Frontend (.env)**
```env
# No need to set VITE_API_URL - it's hardcoded in constants.ts
# API URL is automatically set to Railway backend in production
```

### Running Locally

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

## 📁 Project Structure

```
FreightPro/
├── backend/               # Express + TypeScript backend
│   ├── src/
│   │   ├── controllers/   # Business logic
│   │   ├── models/        # Database models
│   │   ├── routes/        # API routes
│   │   ├── middleware/    # Auth, validation, etc.
│   │   ├── services/      # Email, auth services
│   │   └── utils/         # Helpers, validators
│   └── package.json
│
├── frontend/              # React + TypeScript frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── store/         # Zustand stores
│   │   ├── services/      # API services
│   │   ├── utils/         # Helpers
│   │   └── styles/        # CSS and Tailwind
│   └── package.json
│
└── README.md
```

## 🔑 Account Types & Permissions

| Feature | Carrier | Broker | Shipper |
|---------|---------|--------|---------|
| View Load Board | ✅ | ✅ | ❌ |
| Post Load | ❌ | ✅ | ❌ |
| Book Load | ✅ | ❌ | ❌ |
| Create Shipment | ❌ | ❌ | ✅ |
| View Own Shipments | ❌ | ❌ | ✅ |
| View All Shipments | ❌ | ✅ | ❌ |
| Request Access | ❌ | ✅ | ❌ |
| Approve Requests | ❌ | ❌ | ✅ |

## 📚 Documentation

- [Complete Implementation Summary](IMPLEMENTATION-COMPLETE-SUMMARY.md)
- [Project Status](PROJECT-STATUS-FINAL.md)
- [Final Session Summary](FINAL-SESSION-SUMMARY.md)

## 🤝 Contributing

This is a production application. Please contact the project owner before making changes.

## 📄 License

All rights reserved. Copyright © 2025 CargoLume.

## 🆘 Support

For issues or questions, please open an issue on GitHub.

---

**Built with ❤️ for the freight industry**