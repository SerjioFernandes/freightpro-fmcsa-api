# 🛍️ WILDBERRIES-LIKE MARKETPLACE - COMPLETE BUILD PROMPT

## 📋 PROJECT OVERVIEW

Build a comprehensive e-commerce marketplace platform similar to Wildberries that works seamlessly on **every mobile phone** (iOS, Android, tablets) and **desktop versions** (Windows, Mac, Linux). The platform must be fully responsive, performant, and include all modern MVP features and advanced capabilities.

---

## 🎯 CORE REQUIREMENTS

### Universal Compatibility
- ✅ **Must work on ALL mobile devices** (iOS 12+, Android 8+, all screen sizes)
- ✅ **Must work on ALL desktop browsers** (Chrome, Firefox, Safari, Edge - last 2 versions)
- ✅ **Progressive Web App (PWA)** with offline support
- ✅ **Responsive Design** - Mobile-first approach, adapts to any screen size
- ✅ **Touch-friendly** - All interactive elements minimum 44x44px for mobile
- ✅ **Performance** - Core Web Vitals: LCP < 2.5s, FID < 100ms, CLS < 0.1

---

## 🏗️ TECHNICAL ARCHITECTURE

### Frontend Stack
```
├── React 19+ with TypeScript
├── Vite (build tool)
├── TailwindCSS 4+ (responsive utility-first CSS)
├── React Router v7 (client-side routing)
├── Zustand (state management)
├── Axios (HTTP client)
├── Socket.io-client (real-time features)
├── React Hook Form + Zod (form validation)
├── React Query/TanStack Query (data fetching & caching)
├── Framer Motion (animations)
├── React Intersection Observer (lazy loading)
└── Service Worker (PWA offline support)
```

### Backend Stack
```
├── Node.js 18+ with TypeScript
├── Express.js (REST API)
├── MongoDB + Mongoose (database & ODM)
├── Socket.io (WebSocket for real-time)
├── JWT (authentication)
├── Multer + Sharp (image upload & optimization)
├── Nodemailer (email notifications)
├── Redis (caching & session storage)
├── Bull (job queue for heavy tasks)
├── Winston (logging)
├── Helmet (security headers)
└── Rate limiting middleware
```

### Database Schema Requirements
```typescript
// Core Models Needed:
- User (buyers, sellers, admins)
- Product (with variations, SKUs)
- Category (multi-level hierarchy)
- Order (with order items)
- Cart (shopping cart)
- Review & Rating (products & sellers)
- Payment (transactions)
- Delivery (shipping methods & tracking)
- Seller/Shop (seller profiles)
- Inventory (stock management)
- Coupon (promotions & discounts)
- Wishlist (favorites)
- Address (user addresses)
- Notification (push & email)
- SearchHistory (user searches)
```

---

## 📱 RESPONSIVE DESIGN SPECIFICATIONS

### Breakpoints (Mobile-First)
```css
/* TailwindCSS breakpoints */
sm: 640px   /* Small phones landscape */
md: 768px   /* Tablets portrait */
lg: 1024px  /* Tablets landscape / Small laptops */
xl: 1280px  /* Desktop */
2xl: 1536px /* Large desktop */

/* Additional breakpoints */
xs: 320px   /* Smallest phones */
```

### Mobile Layout Rules
- **Navigation**: Bottom navigation bar on mobile (< 768px), top header on desktop
- **Product Grid**: 2 columns mobile, 3-4 tablet, 5-6 desktop
- **Typography**: 16px base mobile (prevents auto-zoom), scale up on desktop
- **Touch Targets**: Minimum 44x44px for all buttons/links
- **Swipe Gestures**: Support swipe for product images, cart drawer
- **Pull-to-refresh**: Implement on mobile for lists

### Desktop Layout Rules
- **Sidebar Navigation**: Categories sidebar on desktop (> 1024px)
- **Sticky Elements**: Header, filters sidebar stick to top
- **Hover States**: All interactive elements have hover effects
- **Keyboard Navigation**: Full keyboard accessibility (Tab, Enter, Arrow keys)

---

## 🛍️ MVP FEATURES (Minimum Viable Product)

### Phase 1: Core Shopping Experience

#### 1. Product Catalog
- [x] **Product Listing Page**
  - Grid/list view toggle
  - Infinite scroll or pagination
  - Product cards with image, title, price, rating, badges
  - Quick view modal
  - Filter sidebar (price range, category, brand, rating, availability)
  - Sort options (price low-high, high-low, rating, newest, popularity)
  - Breadcrumb navigation
  - Mobile: Filters in bottom sheet
  
- [x] **Product Detail Page**
  - Image gallery with zoom (desktop + pinch zoom mobile)
  - Product title, price, discount badges
  - Size/variant selector (if applicable)
  - Quantity selector (- + buttons)
  - "Add to Cart" button (prominent, sticky on scroll)
  - "Buy Now" button (instant checkout)
  - Product description (expandable sections)
  - Specifications table
  - Customer reviews section (ratings breakdown, review cards)
  - Related products carousel
  - Recently viewed products
  - Share buttons (social media)

#### 2. Shopping Cart
- [x] **Cart Features**
  - Add/remove products
  - Update quantities
  - Apply promo codes
  - Save for later (move to wishlist)
  - Continue shopping link
  - Cart summary (subtotal, shipping, tax, total)
  - Progress indicator (for free shipping threshold)
  - Empty cart state with recommendations

- [x] **Cart UI**
  - Mobile: Bottom sheet drawer
  - Desktop: Sidebar or full page
  - Product cards with images
  - Quantity controls (numeric input + increment/decrement)
  - Remove item button
  - Stock availability warnings

#### 3. Checkout Process
- [x] **Multi-Step Checkout**
  1. **Shipping Address**
     - Form with validation (name, phone, address, city, postal code)
     - Save address option
     - Address book (select saved addresses)
     - Delivery method selection (standard, express, pickup points)
   
  2. **Payment**
     - Payment method selection (card, digital wallet, COD)
     - Credit card form (with validation & masking)
     - Billing address (same as shipping checkbox)
     - Order summary (final review)
   
  3. **Order Review**
     - Complete order summary
     - Terms & conditions checkbox
     - Place order button
   
  4. **Order Confirmation**
     - Order number display
     - Estimated delivery date
     - Track order button
     - Continue shopping button

- [x] **Checkout UX**
  - Progress indicator (step 1/3)
  - Auto-save form data (localStorage)
  - Loading states during payment processing
  - Success/error messages
  - Mobile-optimized forms (full-screen on mobile)

#### 4. User Authentication
- [x] **Registration**
  - Email/password signup
  - Phone number verification (OTP)
  - Social login (Google, Apple, Facebook)
  - Terms acceptance checkbox
  
- [x] **Login**
  - Email/phone login
  - Password reset flow
  - "Remember me" option
  - Social login options
  
- [x] **User Profile**
  - Personal information
  - Address book management
  - Payment methods (saved cards)
  - Order history
  - Wishlist
  - Reviews & ratings given

#### 5. Search & Discovery
- [x] **Search**
  - Search bar (prominent in header)
  - Autocomplete/suggestions dropdown
  - Recent searches history
  - Popular searches
  - Search results page with filters
  - Voice search (mobile)
  - Barcode/QR scanner (camera)
  
- [x] **Categories**
  - Mega-menu navigation (desktop)
  - Vertical menu (mobile)
  - Category pages with filters
  - Breadcrumb navigation
  
- [x] **Homepage**
  - Hero banner carousel
  - Featured categories
  - Daily deals/Flash sales
  - Trending products
  - New arrivals
  - Personalized recommendations
  - Brands showcase

---

## 🚀 ADVANCED FEATURES (Full Feature Set)

### Phase 2: Enhanced User Experience

#### 1. Reviews & Ratings System
- [x] **Product Reviews**
  - 5-star rating system
  - Written reviews with photos
  - "Helpful" votes on reviews
  - Review filters (5-star, 4-star, with photos, verified purchase)
  - Review submission form (after order)
  - Seller response to reviews
  
- [x] **Seller Ratings**
  - Overall seller score
  - Rating breakdown (product, shipping, service)
  - Badge system (Top Seller, Fast Shipping)

#### 2. Wishlist & Favorites
- [x] **Wishlist Features**
  - Add/remove from wishlist (heart icon)
  - Wishlist page with grid view
  - Share wishlist (generate link)
  - Price drop notifications
  - Move to cart from wishlist

#### 3. Notifications
- [x] **Real-time Notifications**
  - Push notifications (browser + PWA)
  - Email notifications (order updates, promotions)
  - In-app notification center
  - Notification preferences
  - Badge counter in header

#### 4. Order Management
- [x] **Order Tracking**
  - Order status timeline
  - Real-time tracking (map integration)
  - Delivery notifications
  - Estimated delivery date
  - Cancel order option (if not shipped)
  - Return/refund request

- [x] **Order History**
  - List of all orders (paginated)
  - Filter by status (pending, shipped, delivered, cancelled)
  - Reorder button
  - Download invoice

#### 5. Promotions & Discounts
- [x] **Coupon System**
  - Promo code input
  - Percentage & fixed amount discounts
  - Automatic coupons (seasonal sales)
  - Free shipping thresholds
  - Buy X get Y deals
  
- [x] **Flash Sales**
  - Countdown timer
  - Limited-time offers
  - Limited quantity deals
  - Auto-refresh stock

#### 6. Personalization
- [x] **Recommendations Engine**
  - "You may also like" (collaborative filtering)
  - "Recently viewed"
  - "Trending in your region"
  - Personalized homepage
  
- [x] **Search History**
  - Save search queries
  - Quick access to recent searches
  - Search suggestions based on history

---

### Phase 3: Seller/Marketplace Features

#### 1. Seller Dashboard
- [x] **Seller Features**
  - Shop creation & setup
  - Product management (CRUD)
  - Inventory management
  - Order management
  - Analytics dashboard (sales, views, conversion)
  - Earnings & payouts
  - Performance metrics

#### 2. Multi-Seller Support
- [x] **Marketplace Features**
  - Same product from multiple sellers (price comparison)
  - Seller badges & ratings display
  - "Sold by [Seller Name]" on product page
  - Seller profile page
  - Follow seller functionality

---

### Phase 4: Advanced Features

#### 1. Live Chat Support
- [x] **Customer Support**
  - In-app chat widget
  - Real-time messaging (Socket.io)
  - FAQ section
  - Contact form
  - Support ticket system

#### 2. Product Comparison
 Comparison tool
  - Select products to compare
  - Side-by-side feature comparison
  - Highlight differences

#### 3. Image Recognition
- [x] **Visual Search**
  - Upload image to search
  - Camera capture search
  - Similar products by image

#### 4. Multi-Language & Currency
- [x] **Internationalization**
  - Language switcher (EN, RU, ES, FR, etc.)
  - Currency conversion
  - Regional pricing
  - RTL support (Arabic, Hebrew)

#### 5. Returns & Refunds
- [x] **Return Flow**
  - Return request form
  - Return reason selection
  - Return label generation
  - Refund processing
  - Return status tracking

---

## 🎨 UI/UX DESIGN REQUIREMENTS

### Design Principles
1. **Clean & Modern**: Minimal design, plenty of white space
2. **Fast Loading**: Optimize images, lazy loading, code splitting
3. **Intuitive Navigation**: Clear hierarchy, consistent patterns
4. **Accessible**: WCAG 2.1 AA compliance, keyboard navigation
5. **Visual Feedback**: Loading states, animations, micro-interactions
6. **Error Handling**: User-friendly error messages, retry mechanisms

### Color Scheme
```css
Primary: #FF6B35 (Wildberries-style orange/red)
Secondary: #004E89 (Blue for trust)
Success: #4CAF50 (Green)
Error: #F44336 (Red)
Warning: #FF9800 (Orange)
Text: #212121 (Dark gray)
Background: #FFFFFF (White)
Gray Scale: #F5F5F5, #E0E0E0, #9E9E9E, #616161
```

### Typography
```css
Font Family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif
Headings: Bold, 24px-48px (scaled for mobile)
Body: Regular, 16px base (mobile), 18px (desktop)
Small Text: 14px (mobile), 16px (desktop)
Line Height: 1.5-1.6 (readability)
```

### Component Library
- ✅ **Buttons**: Primary, secondary, outline, text, icon buttons
- ✅ **Cards**: Product cards, cart items, order cards
- ✅ **Forms**: Text inputs, selects, checkboxes, radio buttons
- ✅ **Modals**: Dialog, bottom sheet (mobile), full-screen modal
- ✅ **Navigation**: Header, footer, sidebar, bottom nav
- ✅ **Feedback**: Toast notifications, loading spinners, empty states
- ✅ **Badges**: Discount tags, stock status, seller badges

---

## ⚡ PERFORMANCE REQUIREMENTS

### Core Web Vitals Targets
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Optimization Strategies
1. **Images**
   - WebP format with fallbacks
   - Lazy loading (Intersection Observer)
   - Responsive images (srcset)
   - Image CDN integration
   - Blur placeholder (blur-up technique)

2. **Code Splitting**
   - Route-based code splitting
   - Component lazy loading
   - Dynamic imports

3. **Caching**
   - Service Worker for offline caching
   - API response caching (Redis)
   - Static asset caching (CDN)

4. **Data Fetching**
   - React Query for smart caching
   - Infinite scroll with virtualization
   - Debounced search inputs

5. **Bundle Size**
   - Tree-shaking
   - Minification & compression
   - Analyze bundle size (webpack-bundle-analyzer)

---

## 🔒 SECURITY REQUIREMENTS

### Authentication & Authorization
- [x] JWT tokens with refresh tokens
- [x] Secure password hashing (bcrypt)
- [x] Rate limiting on auth endpoints
- [x] CSRF protection
- [x] XSS prevention (input sanitization)
- [x] SQL injection prevention (MongoDB parameterized queries)

### Payment Security
- [x] PCI DSS compliance (use payment gateway, don't store card data)
- [x] SSL/TLS encryption (HTTPS only)
- [x] Payment tokenization
- [x] Fraud detection basics

### Data Protection
- [x] GDPR compliance (data export, deletion)
- [x] Privacy policy & terms
- [x] Cookie consent banner
- [x] User data encryption at rest

---

## 📊 ANALYTICS & MONITORING

### Required Integrations
- [x] **Google Analytics 4** (user behavior tracking)
- [x] **Google Tag Manager** (event tracking)
- [x] **Error Tracking** (Sentry, Rollbar)
- [x] **Performance Monitoring** (Google PageSpeed Insights, Lighthouse CI)

### Key Metrics to Track
- User registrations & retention
- Product views & add-to-cart rate
- Cart abandonment rate
- Conversion rate
- Average order value
- Search queries & results clicks
- Page load times
- Error rates

---

## 🧪 TESTING REQUIREMENTS

### Test Coverage Goals
- **Unit Tests**: 80%+ coverage (Jest + React Testing Library)
- **Integration Tests**: Critical user flows
- **E2E Tests**: Checkout, payment, order flow (Playwright/Cypress)
- **Visual Regression**: Storybook + Chromatic

### Browser Testing Matrix
```
Mobile:
- iOS Safari (12+)
- Chrome Android (latest)
- Samsung Internet
- Firefox Mobile

Desktop:
- Chrome (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)
- Edge (last 2 versions)
```

---

## 📱 PWA REQUIREMENTS

### Progressive Web App Features
- [x] **Service Worker**
  - Offline support
  - Cache API responses
  - Background sync
  
- [x] **Web App Manifest**
  - App name, icons, theme color
  - Start URL, display mode
  - Splash screens

- [x] **Install Prompt**
  - "Add to Home Screen" banner
  - App-like experience

- [x] **Push Notifications**
  - Browser push API
  - Notification center

---

## 🗄️ DATABASE SCHEMA DESIGN

### Core Collections

```typescript
// User Model
{
  _id: ObjectId,
  email: string (unique),
  password: string (hashed),
  role: 'buyer' | 'seller' | 'admin',
  profile: {
    firstName: string,
    lastName: string,
    phone: string,
    avatar: string,
    dateOfBirth: Date
  },
  addresses: [Address],
  paymentMethods: [PaymentMethod],
  preferences: UserPreferences,
  createdAt: Date,
  updatedAt: Date
}

// Product Model
{
  _id: ObjectId,
  sellerId: ObjectId (ref: User),
  title: string,
  description: string,
  images: [string],
  categoryId: ObjectId (ref: Category),
  brand: string,
  sku: string (unique),
  variants: [{
    name: string, // "Size", "Color"
    options: [string] // ["S", "M", "L"]
  }],
  price: number,
  compareAtPrice: number, // for discounts
  stock: number,
  lowStockThreshold: number,
  weight: number,
  dimensions: {length, width, height},
  rating: {average: number, count: number},
  reviewIds: [ObjectId] (ref: Review),
  tags: [string],
  isActive: boolean,
  isFeatured: boolean,
  views: number,
  salesCount: number,
  createdAt: Date,
  updatedAt: Date,
  indexes: [
    {title: 'text', description: 'text', tags: 'text'}, // Full-text search
    {categoryId: 1},
    {sellerId: 1},
    {price: 1},
    {rating.average: -1},
    {createdAt: -1}
  ]
}

// Category Model
{
  _id: ObjectId,
  name: string,
  slug: string (unique),
  parentId: ObjectId | null (ref: Category), // for hierarchy
  image: string,
  description: string,
  level: number, // 0=root, 1=subcategory, etc.
  isActive: boolean,
  order: number // for sorting
}

// Order Model
{
  _id: ObjectId,
  orderNumber: string (unique),
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    variant: {[key: string]: string}, // {size: "M", color: "Red"}
    quantity: number,
    price: number,
    total: number
  }],
  shipping: {
    method: string,
    cost: number,
    address: Address,
    trackingNumber: string
  },
  payment: {
    method: string,
    transactionId: string,
    amount: number,
    status: 'pending' | 'completed' | 'failed' | 'refunded'
  },
  subtotal: number,
  tax: number,
  discount: number,
  total: number,
  status: 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled',
  statusHistory: [{status: string, timestamp: Date, note: string}],
  estimatedDelivery: Date,
  createdAt: Date,
  updatedAt: Date
}

// Cart Model
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  items: [{
    productId: ObjectId (ref: Product),
    variant: {[key: string]: string},
    quantity: number,
    addedAt: Date
  }],
  expiresAt: Date, // auto-cleanup old carts
  updatedAt: Date
}

// Review Model
{
  _id: ObjectId,
  productId: ObjectId (ref: Product),
  userId: ObjectId (ref: User),
  orderId: ObjectId (ref: Order), // verify purchase
  rating: number (1-5),
  title: string,
  comment: string,
  images: [string],
  helpfulCount: number,
  verifiedPurchase: boolean,
  createdAt: Date,
  updatedAt: Date
}

// Wishlist Model
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  products: [{
    productId: ObjectId (ref: Product),
    addedAt: Date
  }],
  isPublic: boolean,
  shareToken: string,
  updatedAt: Date
}
```

---

## 🔌 API ENDPOINTS STRUCTURE

### REST API Routes

```
Authentication:
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/logout
POST   /api/auth/refresh-token
POST   /api/auth/reset-password
POST   /api/auth/verify-phone

Products:
GET    /api/products                    // List products (with filters, pagination)
GET    /api/products/:id                // Get single product
GET    /api/products/search             // Search products
GET    /api/products/:id/related        // Related products
GET    /api/products/:id/reviews        // Product reviews
POST   /api/products                    // Create (seller/admin)
PUT    /api/products/:id                // Update (seller/admin)
DELETE /api/products/:id                // Delete (seller/admin)

Categories:
GET    /api/categories                  // List categories (tree)
GET    /api/categories/:id/products     // Products in category

Cart:
GET    /api/cart                        // Get cart
POST   /api/cart                        // Add to cart
PUT    /api/cart/item/:itemId           // Update cart item
DELETE /api/cart/item/:itemId           // Remove from cart
DELETE /api/cart                        // Clear cart

Orders:
GET    /api/orders                      // List user orders
GET    /api/orders/:id                  // Get order details
POST   /api/orders                      // Create order (checkout)
PUT    /api/orders/:id/cancel           // Cancel order
GET    /api/orders/:id/tracking         // Track order

Wishlist:
GET    /api/wishlist                    // Get wishlist
POST   /api/wishlist                    // Add to wishlist
DELETE /api/wishlist/:productId         // Remove from wishlist

Reviews:
GET    /api/reviews/product/:productId   // Get product reviews
POST   /api/reviews                      // Create review
PUT    /api/reviews/:id                 // Update review
DELETE /api/reviews/:id                 // Delete review
POST   /api/reviews/:id/helpful         // Mark helpful

Search:
GET    /api/search                       // Full-text search
GET    /api/search/autocomplete          // Search suggestions
GET    /api/search/history              // Search history

User:
GET    /api/user/profile                // Get profile
PUT    /api/user/profile                // Update profile
GET    /api/user/addresses              // Get addresses
POST   /api/user/addresses              // Add address
PUT    /api/user/addresses/:id          // Update address
DELETE /api/user/addresses/:id          // Delete address

Payments:
POST   /api/payments/create-intent       // Create payment intent
POST   /api/payments/confirm            // Confirm payment

Notifications:
GET    /api/notifications               // List notifications
PUT    /api/notifications/:id/read       // Mark as read
PUT    /api/notifications/read-all      // Mark all as read
```

### WebSocket Events (Socket.io)

```typescript
// Client → Server
'send-message'       // Chat message
'typing'             // Typing indicator
'join-room'          // Join chat room

// Server → Client
'new-message'        // Receive message
'user-typing'        // User typing
'order-updated'      // Order status change
'notification'       // Push notification
'system-message'     // System alerts
```

---

## 🚀 DEPLOYMENT ARCHITECTURE

### Production Stack
```
Frontend:
- Hosting: Vercel / Cloudflare Pages / Netlify
- CDN: Cloudflare CDN
- Domain: Custom domain with SSL

Backend:
- Hosting: Railway / Render / AWS / DigitalOcean
- Database: MongoDB Atlas (cloud)
- Cache: Redis Cloud / Upstash
- File Storage: AWS S3 / Cloudinary / Cloudflare R2
- Email: SendGrid / Resend / AWS SES

Monitoring:
- Error Tracking: Sentry
- Analytics: Google Analytics 4
- Performance: Lighthouse CI
- Uptime: UptimeRobot / Pingdom
```

### Environment Variables

```env
# Backend
NODE_ENV=production
PORT=4000
MONGODB_URI=mongodb+srv://...
REDIS_URL=redis://...
JWT_SECRET=...
JWT_REFRESH_SECRET=...
FRONTEND_URL=https://...

# File Upload
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...
CLOUDINARY_URL=...

# Email
EMAIL_SERVICE=smtp
EMAIL_HOST=smtp.gmail.com
EMAIL_USER=...
EMAIL_PASSWORD=...

# Payments (Stripe/PayPal)
STRIPE_SECRET_KEY=...
STRIPE_WEBHOOK_SECRET=...
PAYPAL_CLIENT_ID=...
PAYPAL_CLIENT_SECRET=...

# Analytics
GOOGLE_ANALYTICS_ID=GA-...
SENTRY_DSN=...

# Frontend (Vite)
VITE_API_URL=https://api.yourdomain.com/api
VITE_STRIPE_PUBLIC_KEY=...
```

---

## 📝 IMPLEMENTATION CHECKLIST

### Phase 1: MVP (Weeks 1-4)
- [ ] Project setup (React, TypeScript, TailwindCSS)
- [ ] Authentication system (register, login, JWT)
- [ ] Product catalog (list, detail pages)
- [ ] Shopping cart
- [ ] Checkout flow
- [ ] Basic search
- [ ] Order management
- [ ] User profile
- [ ] Mobile-responsive layout

### Phase 2: Enhanced UX (Weeks 5-8)
- [ ] Reviews & ratings
- [ ] Wishlist
- [ ] Advanced filters
- [ ] Product recommendations
- [ ] Notifications (push & email)
- [ ] Order tracking
- [ ] Promo codes
- [ ] Image optimization
- [ ] PWA features

### Phase 3: Seller Features (Weeks 9-12)
- [ ] Seller registration
- [ ] Seller dashboard
- [ ] Product management (CRUD)
- [ ] Inventory management
- [ ] Order fulfillment
- [ ] Analytics dashboard

### Phase 4: Advanced Features (Weeks 13-16)
- [ ] Multi-language support
- [ ] Payment integration (Stripe/PayPal)
- [ ] Live chat
- [ ] Product comparison
- [ ] Returns & refunds
- [ ] Advanced analytics
- [ ] Performance optimization
- [ ] Security hardening

### Phase 5: Testing & Launch (Weeks 17-20)
- [ ] Unit tests (80%+ coverage)
- [ ] Integration tests
- [ ] E2E tests
- [ ] Browser testing
- [ ] Performance testing
- [ ] Security audit
- [ ] Load testing
- [ ] Deployment & monitoring setup

---

## 🎯 SUCCESS CRITERIA

### Functional Requirements
- ✅ Users can browse products on any device
- ✅ Users can search and filter products
- ✅ Users can add products to cart and checkout
- ✅ Users can track orders
- ✅ Users can leave reviews
- ✅ Sellers can manage products and orders
- ✅ Payment processing works securely

### Non-Functional Requirements
- ✅ Page load time < 3 seconds on 3G
- ✅ Works on all modern browsers (95%+ compatibility)
- ✅ Mobile-friendly (touch targets, responsive)
- ✅ Accessible (WCAG 2.1 AA)
- ✅ SEO optimized (meta tags, structured data)
- ✅ Secure (HTTPS, data encryption)
- ✅ Scalable (handle 10k+ concurrent users)

---

## 📚 ADDITIONAL RESOURCES & REFERENCES

### Design Inspiration
- Wildberries.ru (reference marketplace)
- Amazon (UX patterns)
- AliExpress (marketplace features)
- Flipkart (Indian marketplace)

### Libraries & Tools
- **Icons**: Lucide React, Heroicons
- **Date formatting**: date-fns
- **Form validation**: Zod + React Hook Form
- **State management**: Zustand
- **Data fetching**: TanStack Query
- **Charts**: Chart.js, Recharts
- **Animations**: Framer Motion
- **Image handling**: Sharp, react-image-gallery
- **Payment**: Stripe, PayPal SDK
- **Maps**: Google Maps API / Mapbox

### Documentation Links
- React: https://react.dev
- TailwindCSS: https://tailwindcss.com
- MongoDB: https://docs.mongodb.com
- Express: https://expressjs.com
- Socket.io: https://socket.io/docs

---

## 🔄 ITERATION & MAINTENANCE

### Continuous Improvement
- User feedback collection
- A/B testing for key features
- Performance monitoring
- Error tracking
- Analytics review
- Security updates
- Feature additions based on market needs

### Post-Launch Priorities
1. Bug fixes & stability
2. Performance optimization
3. User experience improvements
4. Feature enhancements
5. Marketing integration
6. Analytics & reporting

---

## ✅ FINAL DELIVERABLES

1. ✅ Fully functional marketplace website
2. ✅ Responsive on all devices
3. ✅ PWA with offline support
4. ✅ Complete admin dashboard
5. ✅ Seller dashboard
6. ✅ API documentation
7. ✅ User documentation
8. ✅ Deployment guide
9. ✅ Test coverage report
10. ✅ Performance audit report

---

**This prompt covers all aspects needed to build a production-ready, Wildberries-like marketplace that works flawlessly on every mobile phone and desktop. Follow this guide step-by-step to create a modern, scalable e-commerce platform! 🚀**
