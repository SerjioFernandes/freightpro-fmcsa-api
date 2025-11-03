# 🔧 MARKETPLACE TECHNICAL SPECIFICATIONS

## 📐 Code Patterns & Examples

### Frontend Component Structure

#### Product Card Component

```tsx
// src/components/product/ProductCard.tsx
import { Link } from 'react-router-dom';
import { Heart, Star } from 'lucide-react';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    price: number;
    compareAtPrice?: number;
    image: string;
    rating: { average: number; count: number };
    discount?: number;
  };
  onAddToCart?: () => void;
    onAddToWishlist?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToCart,
  onAddToWishlist
}) => {
  const discountPercent = product.compareAtPrice
    ? Math.round(((product.compareAtPrice - product.price) / product.compareAtPrice) * 100)
    : null;

  return (
    <div className="group relative flex flex-col bg-white rounded-lg shadow-sm hover:shadow-lg transition-shadow duration-200 overflow-hidden">
      {/* Image Container */}
      <Link to={`/products/${product.id}`} className="relative aspect-square overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
        {discountPercent && (
          <span className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-sm font-semibold">
            -{discountPercent}%
          </span>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            onAddToWishlist?.();
          }}
          className="absolute top-2 right-2 p-2 bg-white rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Add to wishlist"
        >
          <Heart className="w-5 h-5" />
        </button>
      </Link>

      {/* Product Info */}
      <div className="p-4 flex-1 flex flex-col">
        <Link to={`/products/${product.id}`}>
          <h3 className="font-medium text-gray-900 mb-2 line-clamp-2 hover:text-blue-600">
            {product.title}
          </h3>
        </Link>

        {/* Rating */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-4 h-4 ${
                  i < Math.floor(product.rating.average)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }`}
              />
            ))}
          </div>
          <span className="text-sm text-gray-600">
            ({product.rating.count})
          </span>
        </div>

        {/* Price */}
        <div className="mt-auto flex items-center gap-2">
          <span className="text-xl font-bold text-gray-900">
            ₹{product.price.toLocaleString()}
          </span>
          {product.compareAtPrice && (
            <span className="text-sm text-gray-500 line-through">
              ₹{product.compareAtPrice.toLocaleString()}
            </span>
          )}
        </div>

        {/* Add to Cart Button */}
        <button
          onClick={onAddToCart}
          className="mt-3 w-full bg-blue-600 text-white py-2 rounded-lg font-medium hover:bg-blue-700 active:scale-95 transition-all duration-200"
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
};
```

#### Responsive Product Grid

```tsx
// src/pages/Products.tsx
import { useState } from 'react';
import { ProductCard } from '../components/product/ProductCard';

export const Products = () => {
  const [products, setProducts] = useState([]);
  
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Grid: 2 cols mobile, 3 tablet, 4 desktop, 5 large */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
};
```

#### Mobile Bottom Navigation

```tsx
// src/components/layout/MobileBottomNav.tsx
import { Link, useLocation } from 'react-router-dom';
import { Home, Search, ShoppingCart, User, Heart } from 'lucide-react';

const navItems = [
  { path: '/', icon: Home, label: 'Home' },
  { path: '/products', icon: Search, label: 'Search' },
  { path: '/cart', icon: ShoppingCart, label: 'Cart' },
  { path: '/wishlist', icon: Heart, label: 'Wishlist' },
  { path: '/profile', icon: User, label: 'Profile' },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:hidden z-50">
      <div className="flex justify-around items-center h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;

          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center justify-center flex-1 h-full ${
                isActive ? 'text-blue-600' : 'text-gray-600'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-xs mt-1">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
```

#### Cart Store (Zustand)

```tsx
// src/store/cartStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CartItem {
  productId: string;
  variant?: { [key: string]: string };
  quantity: number;
  price: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (item: CartItem) => void;
  removeItem: (productId: string, variant?: { [key: string]: string }) => void;
  updateQuantity: (productId: string, quantity: number, variant?: { [key: string]: string }) => void;
  clearCart: () => void;
  toggleCart: () => void;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const existingItems = get().items;
        const existingIndex = existingItems.findIndex(
          (i) => i.productId === item.productId &&
            JSON.stringify(i.variant) === JSON.stringify(item.variant)
        );

        if (existingIndex >= 0) {
          // Update quantity if item exists
          const updatedItems = [...existingItems];
          updatedItems[existingIndex].quantity += item.quantity;
          set({ items: updatedItems });
        } else {
          // Add new item
          set({ items: [...existingItems, item] });
        }
      },

      removeItem: (productId, variant) => {
        set({
          items: get().items.filter(
            (item) =>
              !(item.productId === productId &&
                JSON.stringify(item.variant) === JSON.stringify(variant))
          ),
        });
      },

      updateQuantity: (productId, quantity, variant) => {
        if (quantity <= 0) {
          get().removeItem(productId, variant);
          return;
        }

        const updatedItems = get().items.map((item) =>
          item.productId === productId &&
          JSON.stringify(item.variant) === JSON.stringify(variant)
            ? { ...item, quantity }
            : item
        );
        set({ items: updatedItems });
      },

      clearCart: () => set({ items: [] }),

      toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

      getTotal: () =>
        get().items.reduce((sum, item) => sum + item.price * item.quantity, 0),

      getItemCount: () =>
        get().items.reduce((sum, item) => sum + item.quantity, 0),
    }),
    {
      name: 'cart-storage',
    }
  )
);
```

#### API Service Layer

```tsx
// src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - Handle errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired, refresh or logout
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

```tsx
// src/services/productService.ts
import api from './api';

export interface Product {
  _id: string;
  title: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  images: string[];
  categoryId: string;
  rating: {
    average: number;
    count: number;
  };
  stock: number;
}

export interface ProductFilters {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
  rating?: number;
  search?: string;
  sort?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
  page?: number;
  limit?: number;
}

export const productService = {
  getProducts: async (filters: ProductFilters = {}) => {
    const { data } = await api.get('/products', { params: filters });
    return data;
  },

  getProduct: async (id: string) => {
    const { data } = await api.get(`/products/${id}`);
    return data;
  },

  searchProducts: async (query: string) => {
    const { data } = await api.get('/products/search', {
      params: { q: query },
    });
    return data;
  },
};
```

---

### Backend Code Patterns

#### Product Model (Mongoose)

```typescript
// src/models/Product.model.ts
import mongoose, { Schema, Document } from 'mongoose';

export interface IProduct extends Document {
  sellerId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  images: string[];
  categoryId: mongoose.Types.ObjectId;
  brand?: string;
  sku: string;
  variants: Array<{
    name: string;
    options: string[];
  }>;
  price: number;
  compareAtPrice?: number;
  stock: number;
  lowStockThreshold: number;
  weight?: number;
  dimensions?: {
    length: number;
    width: number;
    height: number;
  };
  rating: {
    average: number;
    count: number;
  };
  reviewIds: mongoose.Types.ObjectId[];
  tags: string[];
  isActive: boolean;
  isFeatured: boolean;
  views: number;
  salesCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const ProductSchema = new Schema<IProduct>(
  {
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      index: 'text',
    },
    description: {
      type: String,
      required: true,
      index: 'text',
    },
    images: [String],
    categoryId: {
      type: Schema.Types.ObjectId,
      ref: 'Category',
      required: true,
      index: true,
    },
    brand: String,
    sku: {
      type: String,
      unique: true,
      required: true,
    },
    variants: [
      {
        name: String,
        options: [String],
      },
    ],
    price: {
      type: Number,
      required: true,
      min: 0,
      index: true,
    },
    compareAtPrice: {
      type: Number,
      min: 0,
    },
    stock: {
      type: Number,
      required: true,
      min: 0,
    },
    lowStockThreshold: {
      type: Number,
      default: 10,
    },
    weight: Number,
    dimensions: {
      length: Number,
      width: Number,
      height: Number,
    },
    rating: {
      average: {
        type: Number,
        default: 0,
        min: 0,
        max: 5,
        index: true,
      },
      count: {
        type: Number,
        default: 0,
      },
    },
    reviewIds: [{ type: Schema.Types.ObjectId, ref: 'Review' }],
    tags: [String],
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },
    views: {
      type: Number,
      default: 0,
    },
    salesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for common queries
ProductSchema.index({ categoryId: 1, price: 1 });
ProductSchema.index({ sellerId: 1, isActive: 1 });
ProductSchema.index({ createdAt: -1 });
ProductSchema.index({ rating: -1 });

export const Product = mongoose.model<IProduct>('Product', ProductSchema);
```

#### Product Controller

```typescript
// src/controllers/product.controller.ts
import { Request, Response } from 'express';
import { Product } from '../models/Product.model';

export const getProducts = async (req: Request, res: Response) => {
  try {
    const {
      category,
      minPrice,
      maxPrice,
      rating,
      search,
      sort = 'newest',
      page = 1,
      limit = 20,
    } = req.query;

    // Build query
    const query: any = { isActive: true };

    if (category) {
      query.categoryId = category;
    }

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (rating) {
      query['rating.average'] = { $gte: Number(rating) };
    }

    if (search) {
      query.$text = { $search: search as string };
    }

    // Build sort
    let sortOption: any = { createdAt: -1 };
    switch (sort) {
      case 'price-asc':
        sortOption = { price: 1 };
        break;
      case 'price-desc':
        sortOption = { price: -1 };
        break;
      case 'rating':
        sortOption = { 'rating.average': -1 };
        break;
      case 'newest':
        sortOption = { createdAt: -1 };
        break;
    }

    // Execute query
    const skip = (Number(page) - 1) * Number(limit);
    
    const [products, total] = await Promise.all([
      Product.find(query)
        .populate('categoryId', 'name')
        .populate('sellerId', 'company profile')
        .sort(sortOption)
        .skip(skip)
        .limit(Number(limit))
        .lean(),
      Product.countDocuments(query),
    ]);

    res.json({
      products,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        pages: Math.ceil(total / Number(limit)),
      },
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
};

export const getProduct = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const product = await Product.findById(id)
      .populate('categoryId')
      .populate('sellerId', 'company profile')
      .populate({
        path: 'reviewIds',
        populate: {
          path: 'userId',
          select: 'profile',
        },
        options: { sort: { createdAt: -1 }, limit: 10 },
      });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Increment views
    product.views += 1;
    await product.save();

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
};
```

#### Authentication Middleware

```typescript
// src/middleware/auth.middleware.ts
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: string;
  userRole?: string;
}

export const authenticate = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as { userId: string; role: string };

    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

export const authorize = (...roles: string[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !roles.includes(req.userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

---

## 📱 Responsive Design Patterns

### TailwindCSS Configuration

```javascript
// tailwind.config.js
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      screens: {
        'xs': '320px',
      },
      colors: {
        primary: '#FF6B35',
        secondary: '#004E89',
      },
      spacing: {
        '18': '4.5rem',
        '88': '22rem',
      },
    },
  },
  plugins: [],
}
```

### Mobile-First Utility Classes

```css
/* Common responsive patterns */

/* Container */
.container {
  @apply w-full mx-auto px-4 sm:px-6 lg:px-8;
}

/* Text sizing */
.text-responsive {
  @apply text-sm md:text-base lg:text-lg;
}

/* Grid - 2 cols mobile, 4 desktop */
.product-grid {
  @apply grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4;
}

/* Button sizes */
.btn-mobile {
  @apply px-4 py-2 text-sm min-h-[44px];
}

.btn-desktop {
  @apply md:px-6 md:py-3 md:text-base;
}
```

---

## 🔄 State Management Patterns

### Auth Store

```typescript
// src/store/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  email: string;
  role: string;
  profile: {
    firstName: string;
    lastName: string;
  };
}

interface AuthStore {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email, password) => {
        const response = await api.post('/auth/login', { email, password });
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
        });
        localStorage.setItem('token', response.data.token);
      },

      register: async (data) => {
        const response = await api.post('/auth/register', data);
        set({
          user: response.data.user,
          token: response.data.token,
          isAuthenticated: true,
        });
      },

      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
        localStorage.removeItem('token');
      },

      checkAuth: async () => {
        const token = localStorage.getItem('token');
        if (token) {
          try {
            const response = await api.get('/auth/me');
            set({
              user: response.data.user,
              token,
              isAuthenticated: true,
            });
          } catch {
            set({ user: null, token: null, isAuthenticated: false });
          }
        }
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);
```

---

## 🎨 Component Library Standards

### Button Component

```tsx
// src/components/common/Button.tsx
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', isLoading, className = '', children, ...props }, ref) => {
    const baseClasses = 'font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed';
    
    const variantClasses = {
      primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500',
      secondary: 'bg-gray-200 text-gray-900 hover:bg-gray-300 focus:ring-gray-500',
      outline: 'border-2 border-blue-600 text-blue-600 hover:bg-blue-50 focus:ring-blue-500',
      ghost: 'text-gray-700 hover:bg-gray-100 focus:ring-gray-500',
    };
    
    const sizeClasses = {
      sm: 'px-3 py-1.5 text-sm min-h-[36px]',
      md: 'px-4 py-2 text-base min-h-[44px]',
      lg: 'px-6 py-3 text-lg min-h-[52px]',
    };

    return (
      <button
        ref={ref}
        className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
        disabled={isLoading || props.disabled}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Loading...
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);
```

---

## 📊 Performance Optimization Patterns

### Image Optimization

```tsx
// src/components/common/OptimizedImage.tsx
import { useState } from 'react';

interface OptimizedImageProps {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
}

export const OptimizedImage = ({
  src,
  alt,
  className = '',
  width,
  height,
}: OptimizedImageProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(false);

  // Generate responsive srcset
  const srcSet = width
    ? `${src}?w=${width}&q=75 1x, ${src}?w=${width * 2}&q=75 2x`
    : undefined;

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" />
      )}
      {error ? (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center">
          <span className="text-gray-400">Image not available</span>
        </div>
      ) : (
        <img
          src={src}
          srcSet={srcSet}
          alt={alt}
          className={`w-full h-full object-cover transition-opacity duration-300 ${
            isLoading ? 'opacity-0' : 'opacity-100'
          }`}
          loading="lazy"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setError(true);
            setIsLoading(false);
          }}
        />
      )}
    </div>
  );
};
```

### Infinite Scroll Hook

```tsx
// src/hooks/useInfiniteScroll.ts
import { useEffect, useRef, useCallback } from 'react';

export const useInfiniteScroll = (
  callback: () => void,
  hasMore: boolean,
  isLoading: boolean
) => {
  const observerRef = useRef<IntersectionObserver | null>(null);
  const elementRef = useRef<HTMLDivElement | null>(null);

  const lastElementRef = useCallback(
    (node: HTMLDivElement | null) => {
      if (isLoading) return;
      if (observerRef.current) observerRef.current.disconnect();

      observerRef.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          callback();
        }
      });

      if (node) observerRef.current.observe(node);
    },
    [isLoading, hasMore, callback]
  );

  useEffect(() => {
    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, []);

  return lastElementRef;
};
```

---

## 🔒 Security Best Practices

### Input Sanitization

```typescript
// src/utils/sanitize.ts
import DOMPurify from 'dompurify';

export const sanitizeInput = (input: string): string => {
  return DOMPurify.sanitize(input);
};

export const validateEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const regex = /^\+?[\d\s-()]{10,}$/;
  return regex.test(phone);
};
```

---

**This technical specification provides concrete code examples and patterns for building the marketplace. Use these as templates for your implementation! 🔨**
