# 🏗️ Wildberries Marketplace - System Architecture

## 📐 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  Web Browser (Desktop)  │  Mobile Browser  │  PWA (Mobile)     │
│  React 19 + TypeScript  │  React 19 + TS   │  React 19 + TS    │
│  TailwindCSS            │  TailwindCSS     │  Service Worker   │
│  React Router           │  Touch Gestures  │  Offline Support  │
│  Zustand Store          │  Bottom Nav      │  Push Notifications│
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS/WebSocket
┌─────────────────────────────────────────────────────────────────┐
│                      CDN & EDGE LAYER                           │
├─────────────────────────────────────────────────────────────────┤
│  CloudFront / Cloudflare  │  Image CDN (Cloudinary)            │
│  Static Assets            │  Optimized Images                   │
│  Caching                  │  WebP, Lazy Loading                 │
└─────────────────────────────────────────────────────────────────┘
                              ↕ HTTPS
┌─────────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Express.js API          │  Rate Limiting                       │
│  REST + GraphQL          │  Request Validation                  │
│  Authentication          │  CORS Configuration                  │
│  WebSocket (Socket.io)   │  Compression                         │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER                          │
├─────────────────────────────────────────────────────────────────┤
│  Controllers             │  Services                            │
│  • AuthController        │  • ProductService                    │
│  • ProductController     │  • OrderService                      │
│  • OrderController       │  • PaymentService                    │
│  • PaymentController     │  • NotificationService               │
│  • ReviewController      │  • SearchService                     │
│  • UserController        │  • AnalyticsService                  │
│  • SellerController      │                                      │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      DATA LAYER                                 │
├─────────────────────────────────────────────────────────────────┤
│  MongoDB (Primary)       │  Redis (Cache)                       │
│  • Users                 │  • Sessions                          │
│  • Products              │  • Product Cache                     │
│  • Orders                │  • Search Results                    │
│  • Reviews               │  • Rate Limiting                     │
│  • Sellers               │                                      │
│                          │  Elasticsearch / Algolia             │
│                          │  • Product Search                    │
│                          │  • Autocomplete                      │
└─────────────────────────────────────────────────────────────────┘
                              ↕
┌─────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                          │
├─────────────────────────────────────────────────────────────────┤
│  Payment Gateway         │  Email Service                       │
│  • Stripe                │  • SendGrid / AWS SES                │
│  • PayPal                │                                      │
│                          │  Storage Service                     │
│  Shipping APIs           │  • AWS S3 / Cloudinary               │
│  • FedEx API             │  • Image Storage                     │
│  • UPS API               │  • File Storage                      │
│  • DHL API               │                                      │
│                          │  Analytics                           │
│  SMS Service             │  • Google Analytics                  │
│  • Twilio                │  • Custom Events                     │
│                          │                                      │
│  Monitoring              │  Search Service                      │
│  • Sentry                │  • Algolia / Elasticsearch           │
│  • LogRocket             │                                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema Design

### Core Collections:

#### Users Collection
```typescript
{
  _id: ObjectId,
  email: string (unique, indexed),
  password: string (hashed),
  name: string,
  phone: string,
  role: 'customer' | 'seller' | 'admin',
  verified: boolean,
  avatar: string,
  addresses: [Address],
  createdAt: Date,
  updatedAt: Date
}
```

#### Products Collection
```typescript
{
  _id: ObjectId,
  title: string (indexed),
  slug: string (unique, indexed),
  description: string,
  price: number (indexed),
  originalPrice: number,
  images: [string],
  categoryId: ObjectId (indexed),
  sellerId: ObjectId (indexed),
  stock: number,
  sku: string (unique),
  rating: number,
  reviewsCount: number,
  attributes: {
    brand: string,
    color: string,
    size: string,
    // ... other attributes
  },
  variants: [Variant],
  status: 'active' | 'inactive' | 'out_of_stock',
  createdAt: Date,
  updatedAt: Date
}
```

#### Orders Collection
```typescript
{
  _id: ObjectId,
  orderNumber: string (unique, indexed),
  userId: ObjectId (indexed),
  items: [OrderItem],
  subtotal: number,
  tax: number,
  shipping: number,
  total: number,
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  shippingAddress: Address,
  paymentMethod: string,
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded',
  trackingNumber: string,
  estimatedDelivery: Date,
  createdAt: Date,
  updatedAt: Date
}
```

#### Carts Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (indexed, unique),
  items: [{
    productId: ObjectId,
    quantity: number,
    price: number,
    variant: object
  }],
  updatedAt: Date
}
```

#### Reviews Collection
```typescript
{
  _id: ObjectId,
  productId: ObjectId (indexed),
  userId: ObjectId (indexed),
  orderId: ObjectId,
  rating: number (1-5),
  title: string,
  comment: string,
  images: [string],
  verified: boolean,
  helpful: number,
  createdAt: Date
}
```

#### Categories Collection
```typescript
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  parentId: ObjectId | null,
  image: string,
  description: string,
  order: number,
  createdAt: Date
}
```

#### Sellers Collection
```typescript
{
  _id: ObjectId,
  userId: ObjectId (unique, indexed),
  storeName: string,
  slug: string (unique),
  description: string,
  logo: string,
  banner: string,
  rating: number,
  totalSales: number,
  verified: boolean,
  status: 'active' | 'suspended',
  createdAt: Date
}
```

---

## 🔄 Data Flow Diagrams

### Product Search Flow:
```
User Types → Frontend → API Gateway → Search Service (Algolia)
                                    ↓
                    Results ← Redis Cache ← MongoDB (if cache miss)
                                    ↓
                    Frontend ← API Gateway ← Results
```

### Order Creation Flow:
```
Checkout Form → Validate → Create Order → Reserve Stock
                                       ↓
                            Process Payment → Payment Gateway
                                       ↓
                            Order Created → Send Email
                                       ↓
                            Update Inventory → Notify Seller
```

### Real-time Updates:
```
Event Trigger → Socket.io Server → WebSocket Connection
                                  ↓
                            Connected Clients
                                  ↓
                            UI Updates (React)
```

---

## 🔐 Security Architecture

### Authentication Flow:
```
1. User Login → Validate Credentials
2. Generate JWT Token (access + refresh)
3. Store Refresh Token in HttpOnly Cookie
4. Return Access Token
5. Client stores Access Token in memory
6. API validates JWT on each request
7. Refresh token when expired
```

### Security Layers:
- ✅ **HTTPS**: All communications encrypted
- ✅ **JWT**: Secure token-based auth
- ✅ **Rate Limiting**: Prevent brute force
- ✅ **Input Validation**: Sanitize all inputs
- ✅ **CORS**: Configured origins only
- ✅ **Helmet**: Security headers
- ✅ **SQL Injection**: Parameterized queries (MongoDB)
- ✅ **XSS Protection**: Input sanitization
- ✅ **CSRF Protection**: Token validation

---

## 📊 Caching Strategy

### Cache Layers:
1. **Browser Cache**: Static assets (images, CSS, JS)
2. **CDN Cache**: Static files, images
3. **Redis Cache**: 
   - Product data (5 min TTL)
   - Search results (1 min TTL)
   - User sessions
   - Popular products (15 min TTL)
4. **Application Cache**: In-memory cache for frequently accessed data

### Cache Invalidation:
- Product updated → Invalidate product cache
- Order created → Invalidate cart cache
- Review added → Invalidate product cache
- Price changed → Invalidate product & cart cache

---

## 🚀 Performance Optimization

### Frontend:
- Code splitting (route-based, component-based)
- Lazy loading (images, components)
- Virtual scrolling (long lists)
- Memoization (React.memo, useMemo)
- Image optimization (WebP, responsive sizes)
- Bundle optimization (tree shaking, minification)

### Backend:
- Database indexing (frequently queried fields)
- Query optimization (select only needed fields)
- Connection pooling (MongoDB)
- API response compression (Gzip)
- Pagination (limit results)
- Caching (Redis)

### Infrastructure:
- CDN (static assets)
- Load balancing (multiple server instances)
- Database replication (read replicas)
- Auto-scaling (based on traffic)

---

## 📱 Mobile Architecture

### Mobile-Specific Features:
- **PWA**: Service Worker for offline support
- **Touch Gestures**: Swipe, pinch, pull-to-refresh
- **Bottom Navigation**: Fixed at bottom for thumb reach
- **Mobile Menu**: Slide-out drawer
- **Responsive Images**: Different sizes for different screens
- **Optimized Forms**: Mobile-friendly inputs
- **Fast Loading**: Critical CSS inline, lazy load rest

### Progressive Enhancement:
1. Basic HTML/CSS (works everywhere)
2. Enhanced JavaScript (modern browsers)
3. PWA features (supported browsers)
4. Offline mode (service worker support)

---

## 🔄 Deployment Architecture

### Frontend Deployment:
```
Git Push → GitHub → CI/CD (GitHub Actions)
                         ↓
                    Build (Vite)
                         ↓
                    Deploy → Vercel/Netlify
                         ↓
                    CDN Distribution
```

### Backend Deployment:
```
Git Push → GitHub → CI/CD
                         ↓
                    Build (TypeScript)
                         ↓
                    Run Tests
                         ↓
                    Deploy → Railway/Render/AWS
                         ↓
                    Health Check
                         ↓
                    Traffic Routing
```

---

## 📈 Monitoring & Analytics

### Application Monitoring:
- **Sentry**: Error tracking
- **LogRocket**: Session replay
- **New Relic**: Performance monitoring
- **Winston**: Server logs

### Business Analytics:
- **Google Analytics**: User behavior
- **Custom Events**: Conversion tracking
- **Database Analytics**: Query performance
- **API Analytics**: Request patterns

### Key Metrics:
- Response time (API)
- Error rate
- Request rate
- User sessions
- Conversion rate
- Cart abandonment
- Page load time

---

## 🔄 CI/CD Pipeline

### Continuous Integration:
1. Code pushed to repository
2. Run linter (ESLint)
3. Run type checker (TypeScript)
4. Run unit tests
5. Run integration tests
6. Build application
7. Run E2E tests

### Continuous Deployment:
1. Tests pass
2. Build artifacts
3. Deploy to staging
4. Run smoke tests
5. Deploy to production
6. Health check
7. Monitor for errors

---

*System architecture for Wildberries-style marketplace*
