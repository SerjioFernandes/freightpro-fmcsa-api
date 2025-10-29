# CargoLume - Enterprise Load Board Platform

> **Modern, scalable freight load board platform built with React, TypeScript, Node.js, and MongoDB**

## 🚀 Features

- **Modern Tech Stack**: React 18, TypeScript, Vite, TailwindCSS
- **Enterprise Architecture**: Modular backend with TypeScript, Express, MongoDB
- **State Management**: Zustand for predictable state management
- **Authentication**: JWT-based secure authentication with email verification
- **Real-time Load Board**: Browse, post, and book loads in real-time
- **Role-based Access**: Carrier, Broker, and Shipper accounts with specific permissions
- **Authority Validation**: USDOT and MC number validation for interstate/intrastate loads
- **Responsive Design**: Mobile-first, fully responsive UI
- **Serverless Ready**: Vercel deployment configuration included

## 📐 Architecture

```
project-root/
├── frontend/          # React + Vite + TypeScript
│   ├── src/
│   │   ├── components/   # Reusable UI components
│   │   ├── pages/        # Route-level pages
│   │   ├── services/     # API calls
│   │   ├── store/        # Zustand state management
│   │   ├── types/        # TypeScript definitions
│   │   └── utils/        # Helper functions
│   └── package.json
├── backend/           # Node.js + Express + TypeScript
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── models/       # MongoDB schemas
│   │   ├── routes/       # Express routes
│   │   ├── middleware/   # Auth, validation, errors
│   │   ├── services/     # Business logic
│   │   ├── utils/        # Helpers
│   │   └── config/       # Configuration
│   └── package.json
├── docs/              # Documentation
└── legacy/            # Old monolithic files (backup)
```

## 🛠️ Tech Stack

### Frontend
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- Zustand (state management)
- React Router v6 (routing)
- Axios (HTTP client)
- Lucide React (icons)

### Backend
- Node.js 18+ with TypeScript
- Express.js (framework)
- MongoDB + Mongoose (database)
- JWT (authentication)
- bcryptjs (password hashing)
- Winston (logging)
- Helmet (security)
- Nodemailer (email)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- MongoDB Atlas account (or local MongoDB)
- Gmail account for email notifications (optional)

### Backend Setup

```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_super_secret_jwt_key
ADMIN_EMAIL=admin@cargolume.com
ADMIN_PASSWORD=YourSecurePassword123
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
FRONTEND_URL=http://localhost:5173
PORT=4000
NODE_ENV=development
EOF

# Start development server
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install

# Create .env file
echo "VITE_API_URL=http://localhost:4000/api" > .env

# Start development server
npm run dev
```

The frontend will be available at `http://localhost:5173`
The backend API will be available at `http://localhost:4000`

## 🚀 Deployment

### Backend (Vercel Serverless)

```bash
cd backend
vercel deploy --prod
```

### Frontend (Vercel)

```bash
cd frontend
vercel deploy --prod
```

## 📝 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your-secret-key
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=secure-password
EMAIL_USER=smtp-email@gmail.com
EMAIL_PASS=app-specific-password
FRONTEND_URL=https://your-frontend.vercel.app
PORT=4000
NODE_ENV=production
```

### Frontend (.env)
```
VITE_API_URL=https://your-backend.vercel.app/api
```

## 📚 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify email
- `POST /api/auth/resend-code` - Resend verification code
- `GET /api/auth/me` - Get current user

### Loads
- `GET /api/loads` - Get all loads (paginated)
- `POST /api/loads` - Post a new load (broker only)
- `POST /api/loads/:id/book` - Book a load (carrier only)

### Health
- `GET /api/health` - API health check

## 🔐 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcryptjs (12 rounds)
- Email verification for new accounts
- Rate limiting on API endpoints
- Helmet.js for security headers
- CORS configuration
- Input validation and sanitization
- Authority validation (USDOT/MC numbers)

## 📊 Key Improvements Over Legacy

| Feature | Legacy | New Architecture |
|---------|--------|------------------|
| File Structure | 15,739-line HTML | Modular components |
| Type Safety | JavaScript | TypeScript |
| State Management | Global variables | Zustand |
| Build Time | N/A | <30s |
| Bundle Size | Monolithic | Code-split chunks |
| Maintainability | Low | High |
| Scalability | Limited | Enterprise-ready |

## 🎯 Features by Account Type

### Carrier
- Browse available loads
- Book loads (with authority validation)
- View booked loads
- Track deliveries

### Broker
- Post new loads
- View posted loads
- Manage bookings
- Request access to shipments

### Shipper
- Create shipments
- View shipment requests
- Approve/reject broker requests

## 🧪 Testing

```bash
# Backend tests
cd backend
npm test

# Frontend tests
cd frontend
npm test
```

## 📖 Documentation

- See `/docs` folder for detailed documentation
- API documentation: `/docs/API.md`
- Deployment guide: `/docs/DEPLOYMENT.md`
- Migration guide: `/docs/MIGRATION.md`

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

MIT License - see LICENSE file for details

## 👥 Team

CargoLume Team - Professional Freight Solutions

## 🙏 Acknowledgments

- React team for the amazing framework
- Vercel for excellent hosting
- MongoDB for reliable database
- All open-source contributors

---

**Built with ❤️ for the freight industry**




