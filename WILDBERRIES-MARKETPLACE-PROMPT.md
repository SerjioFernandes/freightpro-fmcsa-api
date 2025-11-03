# 🛍️ Wildberries-Style Marketplace - Complete Development Prompt

## 📋 PROJECT OVERVIEW

Build a comprehensive e-commerce marketplace platform similar to Wildberries that works seamlessly on **every mobile phone** (iOS, Android, all screen sizes) and **desktop versions** (all browsers and resolutions). The platform should support multiple sellers, real-time inventory, fast delivery options, user reviews, and a complete shopping experience.

---

## 🎯 CORE REQUIREMENTS

### 1. **FULLY RESPONSIVE DESIGN**
- **Mobile-First Approach**: Design for mobile phones first, then scale up
- **Breakpoints**: 
  - Mobile: 320px - 767px
  - Tablet: 768px - 1023px
  - Desktop: 1024px+
  - Large Desktop: 1440px+
- **Touch-Friendly**: All interactive elements minimum 44x44px on mobile
- **Progressive Web App (PWA)**: Installable on mobile devices
- **Offline Support**: Basic functionality works offline
- **Cross-Browser Compatibility**: Chrome, Firefox, Safari, Edge, Opera
- **Performance**: Lighthouse score >90 on mobile and desktop

### 2. **TECHNOLOGY STACK**

#### Frontend:
- **React 19+** with TypeScript
- **Vite** for build tooling
- **TailwindCSS** for responsive styling
- **React Router** for navigation
- **Zustand/Redux** for state management
- **React Query** for data fetching and caching
- **Axios** for API calls
- **Socket.io-client** for real-time updates
- **React Hook Form** + **Zod** for form validation
- **Framer Motion** for animations
- **Image optimization**: WebP, lazy loading, responsive images

#### Backend:
- **Node.js 18+** with TypeScript
- **Express.js** framework
- **MongoDB** with Mongoose (or PostgreSQL for scalability)
- **Redis** for caching and session management
- **Socket.io** for real-time features
- **JWT** for authentication
- **Bcrypt** for password hashing
- **Multer** + **Sharp** for image processing
- **Stripe/PayPal** integration for payments
- **Nodemailer** for transactional emails
- **Winston** for logging

#### Infrastructure:
- **CDN** for static assets
- **Image CDN** (Cloudinary/ImageKit)
- **File Storage**: AWS S3 / Cloudinary
- **Search**: Elasticsearch or Algolia
- **Monitoring**: Sentry for error tracking

---

## 🏗️ FEATURE REQUIREMENTS (MVP + ALL FEATURES)

### 3. **USER MANAGEMENT & AUTHENTICATION**

#### MVP Features:
- ✅ User registration (email, password, phone)
- ✅ Email verification
- ✅ Login/Logout
- ✅ Password reset via email
- ✅ Social login (Google, Facebook)
- ✅ Session management
- ✅ Profile management

#### Advanced Features:
- 🔐 Two-factor authentication (2FA)
- 📱 SMS verification
- 🔄 OAuth 2.0 integration
- 👤 User roles (Customer, Seller, Admin, Moderator)
- 🛡️ Account security settings
- 📊 Activity log
- 🔒 Privacy settings

---

### 4. **PRODUCT CATALOG**

#### MVP Features:
- 📦 Product listing with images, title, price, description
- 🏷️ Product categories and subcategories (hierarchical)
- 🔍 Search functionality
- 🎯 Filters (price, rating, brand, availability, etc.)
- 📊 Sorting (price, rating, popularity, newest)
- 🏪 Multiple sellers per product
- 💰 Price comparison across sellers
- 📸 Multiple product images with zoom
- 📝 Product specifications/attributes
- ✅ Stock availability indicator

#### Advanced Features:
- 🎨 Product variants (size, color, material)
- 📹 Product videos
- 🖼️ 360° product view
- 📊 Product comparison tool
- 💬 Product Q&A section
- 📈 Product popularity metrics
- 🏷️ Tags and keywords
- 🌍 Multi-language product descriptions
- 💱 Multi-currency support
- 🎁 Bundle deals and promotions

---

### 5. **SHOPPING CART & CHECKOUT**

#### MVP Features:
- 🛒 Add/remove items from cart
- 📝 Cart persistence (localStorage + backend sync)
- 💰 Price calculation (subtotal, tax, shipping)
- 🚚 Shipping options selection
- 💳 Payment method selection
- 📍 Delivery address management
- ✅ Order summary
- 🔄 Cart updates (stock check, price updates)
- ⚡ Quick checkout for returning customers

#### Advanced Features:
- 🎁 Gift wrapping options
- 💝 Gift cards/vouchers
- 🎟️ Promo codes and discounts
- 📦 Split orders (multiple addresses)
- 🕐 Scheduled delivery
- 💰 Installment payment options
- 🔄 Save for later
- 📋 Order notes/comments
- 🎯 Express checkout (one-click)

---

### 6. **PAYMENT SYSTEM**

#### MVP Features:
- 💳 Credit/Debit card payments (Stripe/PayPal)
- 💰 Cash on delivery (COD)
- 📱 Digital wallet integration
- 🔒 Secure payment processing
- ✅ Payment confirmation
- 📧 Payment receipt emails
- 🔄 Refund processing

#### Advanced Features:
- 💳 Multiple payment gateways
- 🏦 Bank transfer
- 💰 Cryptocurrency payments
- 📊 Payment analytics
- 💳 Saved payment methods
- 🔐 PCI DSS compliance
- 💰 Escrow system (for seller protection)

---

### 7. **ORDER MANAGEMENT**

#### MVP Features:
- 📋 Order history
- 📊 Order status tracking (Pending, Processing, Shipped, Delivered, Cancelled)
- 📧 Order confirmation emails
- 🔔 Order status notifications (email, SMS, push)
- 📦 Order details page
- 🚚 Tracking number integration
- ❌ Order cancellation
- 🔄 Return/Refund requests

#### Advanced Features:
- 📊 Order analytics dashboard
- 📈 Sales reports
- 🔄 Auto-refund on cancellation
- 📦 Partial order fulfillment
- 🚚 Multi-carrier shipping integration
- 📍 Real-time delivery tracking map
- ⭐ Delivery rating system
- 📝 Delivery notes/instructions

---

### 8. **REVIEWS & RATINGS**

#### MVP Features:
- ⭐ Product rating (1-5 stars)
- 📝 Written reviews
- 📸 Photo/video reviews
- ✅ Verified purchase badges
- 👍 Helpful review voting
- 📊 Average rating display
- 🔍 Review filtering (most helpful, recent, highest rated)
- 📝 Review moderation

#### Advanced Features:
- 🎯 Review responses from sellers
- 🏷️ Review tags (quality, delivery, value)
- 📊 Review analytics
- 🎁 Review incentives (points, coupons)
- 🚫 Review reporting system
- ✅ Review verification
- 📈 Review trends visualization

---

### 9. **SELLER/MERCHANT FEATURES**

#### MVP Features:
- 🏪 Seller registration and verification
- 📦 Product management (add, edit, delete)
- 📊 Sales dashboard
- 💰 Revenue tracking
- 📦 Inventory management
- 🚚 Shipping management
- 💬 Customer communication
- 📋 Order management

#### Advanced Features:
- 📊 Advanced analytics (sales, traffic, conversion)
- 🎨 Store customization
- 📧 Email marketing tools
- 🎯 Promotional campaigns
- 📦 Bulk product import/export
- 🤖 AI product description generator
- 📈 Performance metrics
- 💰 Payout management
- 🏷️ Brand store pages
- 📱 Seller mobile app

---

### 10. **SEARCH & DISCOVERY**

#### MVP Features:
- 🔍 Full-text search
- 🎯 Autocomplete suggestions
- 🏷️ Search filters (price, brand, rating, etc.)
- 📊 Search sorting
- 🔍 Search history
- 💡 Popular searches
- 🎯 Category navigation

#### Advanced Features:
- 🤖 AI-powered search (semantic search)
- 🎯 Personalized search results
- 🔍 Voice search
- 📸 Image search (upload image to find similar)
- 🎯 Visual search
- 📊 Search analytics
- 💡 Search suggestions based on browsing
- 🎯 Trending products
- 🔍 Advanced filters (multi-select, ranges)

---

### 11. **PERSONALIZATION & RECOMMENDATIONS**

#### MVP Features:
- 🎯 Recently viewed products
- 💡 Recommended products
- 📊 Popular products
- 🎁 Similar products
- 🛒 "Customers also bought"
- 📈 Trending products

#### Advanced Features:
- 🤖 AI-powered recommendations
- 🎯 Personalized homepage
- 📊 Purchase history-based suggestions
- 🎯 Seasonal recommendations
- 📱 Push notifications for personalized deals
- 🎯 Wishlist-based recommendations
- 📊 Collaborative filtering
- 🎯 Real-time recommendations

---

### 12. **WISHLIST & SAVED ITEMS**

#### MVP Features:
- ❤️ Add/remove from wishlist
- 📋 Wishlist management
- 📧 Price drop alerts
- 🔔 Availability alerts
- 📤 Share wishlist

#### Advanced Features:
- 🎁 Gift registry
- 👥 Collaborative wishlists
- 📊 Wishlist analytics
- 🎯 Wishlist recommendations
- 💝 Gift suggestions

---

### 13. **NOTIFICATIONS SYSTEM**

#### MVP Features:
- 📧 Email notifications
- 📱 Push notifications (browser)
- 🔔 In-app notifications
- 📧 Order updates
- 🎁 Promotional notifications
- 📊 Notification preferences

#### Advanced Features:
- 📱 SMS notifications
- 📱 Mobile app push notifications
- 🎯 Smart notification timing
- 📊 Notification analytics
- 🔄 Notification channels management
- 🎯 Personalized notification content

---

### 14. **DELIVERY & SHIPPING**

#### MVP Features:
- 🚚 Multiple shipping options (Standard, Express, Same-day)
- 📍 Delivery address management
- 💰 Shipping cost calculation
- 📦 Estimated delivery dates
- 🚚 Tracking number integration
- 📍 Delivery area coverage

#### Advanced Features:
- 🚚 Real-time delivery tracking
- 📍 Delivery time slots
- 🚚 Multiple carriers (FedEx, UPS, DHL, etc.)
- 📍 Pickup point selection
- 🚚 Express delivery options
- 📍 Delivery instructions
- 🚚 Signature required options
- 📍 International shipping
- 🚚 Delivery analytics

---

### 15. **ADMIN DASHBOARD**

#### MVP Features:
- 📊 Sales dashboard
- 📦 Product management
- 👥 User management
- 🏪 Seller management
- 📋 Order management
- 💰 Revenue reports
- 📊 Analytics

#### Advanced Features:
- 📈 Advanced analytics and reporting
- 🎯 Promotional campaign management
- 💬 Customer support tools
- 📊 Inventory management
- 🏷️ Category management
- 🔍 Content moderation
- 📧 Email marketing
- 🎯 A/B testing tools
- 📊 Custom reports
- 🔐 Admin role management

---

### 16. **MOBILE-SPECIFIC FEATURES**

#### MVP Features:
- 📱 Responsive mobile layout
- 👆 Touch gestures (swipe, pinch, pull-to-refresh)
- 📱 Bottom navigation bar
- 📱 Mobile-optimized forms
- 📱 Image gallery slider
- 📱 Mobile search bar
- 📱 Quick add to cart
- 📱 Mobile checkout flow

#### Advanced Features:
- 📱 Progressive Web App (PWA)
- 📱 Offline mode
- 📱 App-like experience
- 📱 Biometric authentication
- 📱 Mobile camera integration (for reviews)
- 📱 Location services
- 📱 Mobile push notifications
- 📱 App shortcuts
- 📱 Share functionality

---

### 17. **REAL-TIME FEATURES**

#### MVP Features:
- 💬 Live chat support
- 🔔 Real-time notifications
- 📊 Real-time inventory updates
- 💰 Real-time price updates
- 📦 Real-time order status

#### Advanced Features:
- 👥 Live user activity
- 📊 Real-time analytics
- 💬 Real-time product Q&A
- 🎯 Real-time recommendations
- 📊 Live sales dashboard

---

### 18. **SOCIAL & COMMUNITY FEATURES**

#### MVP Features:
- 👤 User profiles
- 📝 Product sharing
- 💬 Product Q&A
- 📸 Photo reviews
- 👍 Helpful votes

#### Advanced Features:
- 👥 Follow sellers
- 📊 Social proof indicators
- 💬 Community forums
- 🎯 User-generated content campaigns
- 📱 Social media integration
- 🏆 Loyalty programs
- 🎁 Referral program

---

### 19. **PERFORMANCE & OPTIMIZATION**

#### MVP Features:
- ⚡ Code splitting
- 🖼️ Image optimization (WebP, lazy loading)
- 📦 Gzip compression
- 💾 Caching strategies
- 🚀 CDN integration
- ⚡ Database indexing
- 📊 API response optimization

#### Advanced Features:
- 🔄 Server-side rendering (SSR) or Static Site Generation (SSG)
- 🚀 Edge caching
- 📊 Advanced caching strategies
- ⚡ Database query optimization
- 📦 Asset bundling optimization
- 🚀 HTTP/2 and HTTP/3 support
- ⚡ Service worker optimization

---

### 20. **SECURITY FEATURES**

#### MVP Features:
- 🔐 HTTPS/SSL encryption
- 🔒 Secure authentication
- 🛡️ SQL injection prevention
- 🚫 XSS protection
- 🔐 CSRF protection
- 🔒 Rate limiting
- 🛡️ Input validation

#### Advanced Features:
- 🔐 Two-factor authentication
- 🔒 API security (OAuth, API keys)
- 🛡️ DDoS protection
- 🔐 Security headers (Helmet.js)
- 🔒 Data encryption at rest
- 🛡️ Security monitoring
- 🔐 Penetration testing
- 🔒 GDPR compliance
- 🛡️ PCI DSS compliance

---

## 📱 MOBILE RESPONSIVENESS REQUIREMENTS

### Screen Size Support:
- ✅ **Small Mobile**: 320px - 374px (iPhone SE, older Android)
- ✅ **Standard Mobile**: 375px - 767px (iPhone 12/13/14, Samsung Galaxy)
- ✅ **Large Mobile**: 768px - 1023px (iPad Mini, large phones)
- ✅ **Tablet**: 768px - 1023px (iPad, Android tablets)
- ✅ **Desktop**: 1024px - 1439px (Laptop, desktop)
- ✅ **Large Desktop**: 1440px+ (Large monitors)

### Mobile-Specific Features:
- 📱 **Touch Targets**: Minimum 44x44px for all interactive elements
- 📱 **Swipe Gestures**: Swipe to navigate product images, swipe to delete cart items
- 📱 **Pull-to-Refresh**: Refresh product lists, orders, etc.
- 📱 **Bottom Navigation**: Fixed bottom bar for mobile (Home, Search, Cart, Wishlist, Profile)
- 📱 **Mobile Menu**: Hamburger menu for desktop navigation on mobile
- 📱 **Sticky Elements**: Sticky header, sticky add-to-cart button on product pages
- 📱 **Optimized Forms**: Large input fields, mobile keyboards (email, tel, number)
- 📱 **Fast Loading**: Optimize images for mobile (smaller sizes, WebP format)
- 📱 **Thumb-Friendly**: Important actions within thumb reach zone

---

## 🎨 DESIGN REQUIREMENTS

### UI/UX Principles:
- 🎨 **Modern & Clean**: Minimalist design, lots of white space
- 🎨 **Consistent**: Design system with reusable components
- 🎨 **Accessible**: WCAG 2.1 AA compliance
- 🎨 **Fast**: Smooth animations (60fps), no janky scrolling
- 🎨 **Intuitive**: Clear navigation, obvious CTAs
- 🎨 **Brand Identity**: Consistent colors, typography, logo

### Color Scheme:
- Primary colors for brand identity
- Success/Error/Warning colors
- Neutral grays for text and backgrounds
- High contrast for accessibility

### Typography:
- Readable font sizes (minimum 16px on mobile)
- Line height for readability
- Font weight hierarchy
- Responsive font sizes (rem/em units)

---

## 📊 DATABASE SCHEMA (Key Models)

### Essential Models:
1. **User** (customers, sellers, admins)
2. **Product** (items for sale)
3. **Category** (product categories)
4. **Order** (purchase orders)
5. **OrderItem** (items in orders)
6. **Cart** (shopping cart)
7. **Review** (product reviews)
8. **Seller/Store** (seller information)
9. **Payment** (payment transactions)
10. **Shipping** (delivery information)
11. **Address** (user addresses)
12. **Notification** (user notifications)
13. **Wishlist** (saved items)
14. **Coupon** (promo codes)

---

## 🚀 MVP PRIORITY FEATURES (Phase 1)

### Must-Have for Launch:
1. ✅ User authentication (signup, login, email verification)
2. ✅ Product catalog with categories
3. ✅ Product search and filters
4. ✅ Product detail pages
5. ✅ Shopping cart
6. ✅ Checkout process
7. ✅ Payment integration (at least one method)
8. ✅ Order management
9. ✅ Basic admin dashboard
10. ✅ Responsive mobile design
11. ✅ Seller registration and product upload
12. ✅ Basic reviews and ratings

---

## 🔄 PHASED DEVELOPMENT APPROACH

### Phase 1: MVP (Weeks 1-4)
- Core features for basic marketplace functionality
- Mobile-responsive design
- Basic payment integration
- Essential admin features

### Phase 2: Enhanced Features (Weeks 5-8)
- Advanced search and filters
- Reviews and ratings
- Wishlist
- Notifications
- Seller dashboard enhancements

### Phase 3: Advanced Features (Weeks 9-12)
- AI recommendations
- Advanced analytics
- Social features
- PWA features
- Performance optimization

### Phase 4: Scale & Polish (Weeks 13-16)
- Advanced security
- Multi-language support
- International shipping
- Advanced admin tools
- Final optimizations

---

## 📋 TESTING REQUIREMENTS

### Testing Types:
- ✅ **Unit Tests**: Component and function testing
- ✅ **Integration Tests**: API and database testing
- ✅ **E2E Tests**: Full user flow testing
- ✅ **Performance Tests**: Load testing, stress testing
- ✅ **Security Tests**: Penetration testing, vulnerability scanning
- ✅ **Mobile Testing**: Real device testing, cross-browser testing
- ✅ **Accessibility Tests**: WCAG compliance testing

---

## 📱 DEPLOYMENT & HOSTING

### Requirements:
- 🌐 **Frontend**: Vercel, Netlify, or AWS S3 + CloudFront
- 🖥️ **Backend**: AWS EC2, Railway, Render, or DigitalOcean
- 🗄️ **Database**: MongoDB Atlas or AWS RDS (PostgreSQL)
- 📦 **Storage**: AWS S3 or Cloudinary
- 🔍 **Search**: Algolia or Elasticsearch
- 📊 **Monitoring**: Sentry, LogRocket, or New Relic
- 📧 **Email**: SendGrid, AWS SES, or Mailgun

---

## 🎯 SUCCESS METRICS

### Key Performance Indicators (KPIs):
- 📊 **Conversion Rate**: Target >3%
- ⏱️ **Page Load Time**: <2 seconds on mobile
- 📱 **Mobile Traffic**: Support 60%+ mobile users
- ⭐ **User Rating**: Average 4+ stars
- 💰 **Revenue**: Track daily/monthly revenue
- 📦 **Orders**: Track order volume
- 🛒 **Cart Abandonment**: Target <70%
- ⚡ **Performance Score**: Lighthouse >90

---

## 📝 ADDITIONAL REQUIREMENTS

### SEO:
- ✅ Meta tags optimization
- ✅ Sitemap generation
- ✅ Structured data (Schema.org)
- ✅ URL optimization
- ✅ Image alt tags
- ✅ Mobile-friendly test

### Analytics:
- 📊 Google Analytics integration
- 📊 Custom event tracking
- 📊 Conversion tracking
- 📊 User behavior analytics

### Legal:
- 📄 Terms of Service
- 🔒 Privacy Policy
- 🍪 Cookie Policy
- 📋 Return/Refund Policy

---

## 🛠️ DEVELOPMENT BEST PRACTICES

1. **Code Quality**: ESLint, Prettier, TypeScript strict mode
2. **Version Control**: Git with meaningful commit messages
3. **Documentation**: Inline comments, README files, API documentation
4. **Code Review**: Peer review process
5. **CI/CD**: Automated testing and deployment
6. **Error Handling**: Comprehensive error handling and logging
7. **Security**: Regular security audits and updates
8. **Performance**: Regular performance monitoring and optimization

---

## ✅ FINAL CHECKLIST

Before launching, ensure:
- [ ] All MVP features implemented and tested
- [ ] Mobile responsive on all screen sizes
- [ ] Cross-browser compatibility verified
- [ ] Payment integration working
- [ ] Security measures in place
- [ ] Performance optimized
- [ ] SEO optimized
- [ ] Analytics integrated
- [ ] Legal pages added
- [ ] Error handling comprehensive
- [ ] Monitoring and logging set up
- [ ] Backup and recovery plan
- [ ] Documentation complete

---

## 🎉 READY TO BUILD!

This comprehensive prompt covers all features needed to build a Wildberries-style marketplace that works perfectly on every mobile phone and desktop. Start with the MVP features, then gradually add advanced features based on user feedback and business needs.

**Remember**: Focus on mobile-first design, performance, and user experience. A fast, intuitive mobile experience is critical for e-commerce success!

---

*Generated for building a complete marketplace platform similar to Wildberries*
