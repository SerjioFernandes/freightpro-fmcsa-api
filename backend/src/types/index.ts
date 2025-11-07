import { Request } from 'express';
import { Types } from 'mongoose';

// ========================================
// User Types
// ========================================

export type AccountType = 'carrier' | 'broker' | 'shipper';
export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'free' | 'ultima' | 'premium';
export type Country = 'US' | 'CA';
export type LoadStatus = 'available' | 'booked' | 'in_transit' | 'delivered' | 'cancelled';
export type ShipmentStatus = 'open' | 'closed';
export type RequestStatus = 'pending' | 'approved' | 'rejected';

export interface IAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: Country;
}

export interface IUserPreferences {
  units: 'imperial' | 'metric';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  searchRadius: number;
  language: 'en' | 'es' | 'fr';
}

export interface INotificationPreferences {
  emailLoads: boolean;
  emailBids: boolean;
  emailRates: boolean;
  emailUpdates: boolean;
  emailMarketing: boolean;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
}

export interface ISession {
  token: string;
  device: string;
  ip: string;
  lastActivity: Date;
  createdAt: Date;
}

export interface IUser {
  _id: Types.ObjectId;
  email: string;
  password: string;
  passwordPlain?: string;
  company: string;
  phone: string;
  accountType: AccountType;
  
  // Authority Information
  usdotNumber?: string;
  mcNumber?: string;
  hasUSDOT: boolean;
  hasMC: boolean;
  
  // Company Information
  companyLegalName?: string;
  dbaName?: string;
  
  // EIN Information
  einCanon?: string;
  einDisplay?: string;
  
  // Address
  address: IAddress;
  
  // Account Status
  isEmailVerified: boolean;
  emailVerificationToken?: string;
  emailVerificationCodeHash?: string;
  emailVerificationExpires?: Date;
  isActive: boolean;
  role: UserRole;
  
  // Subscription
  subscriptionPlan: SubscriptionPlan;
  premiumExpires?: Date;
  
  // Profile
  profilePhoto?: string;
  
  // Preferences
  preferences: IUserPreferences;
  notifications: INotificationPreferences;
  
  // Sessions
  sessions: ISession[];
  
  // Timestamps
  createdAt: Date;
  lastLogin: Date;
}

// ========================================
// Load Types
// ========================================

export interface ILocation {
  city: string;
  state: string;
  zip: string;
  country: Country;
  coordinates?: {
    lat?: number;
    lng?: number;
  };
}

export interface ILoad {
  _id: Types.ObjectId;
  title: string;
  description: string;
  origin: ILocation;
  destination: ILocation;
  pickupDate: Date;
  deliveryDate: Date;
  equipmentType: string;
  weight: number;
  rate: number;
  rateType: 'per_mile' | 'flat_rate';
  distance?: number;
  status: LoadStatus;
  shipmentId?: string;
  unlinked: boolean;
  postedBy: Types.ObjectId;
  bookedBy?: Types.ObjectId;
  shipment?: Types.ObjectId;
  isInterstate: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ========================================
// Shipment Types
// ========================================

export interface IPickupDelivery {
  city: string;
  state: string;
  zip: string;
}

export interface IShipment {
  _id: Types.ObjectId;
  shipmentId: string;
  title: string;
  description?: string;
  pickup: IPickupDelivery;
  delivery: IPickupDelivery;
  status: ShipmentStatus;
  postedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

export interface IShipmentRequest {
  _id: Types.ObjectId;
  shipmentId: Types.ObjectId;
  brokerId: Types.ObjectId;
  shipperId: Types.ObjectId;
  brokerMessage?: string;
  status: RequestStatus;
  requestedAt: Date;
  respondedAt?: Date;
  shipperResponse?: string;
}

// ========================================
// Message Types
// ========================================

export interface IMessage {
  _id: Types.ObjectId;
  sender: Types.ObjectId;
  receiver: Types.ObjectId;
  load?: Types.ObjectId;
  subject: string;
  message: string;
  isRead: boolean;
  isEdited?: boolean;
  editedAt?: Date;
  attachments?: Array<{
    filename: string;
    url: string;
    type: string;
    size: number;
  }>;
  createdAt: Date;
}

// ========================================
// Document Types
// ========================================

export interface IDocument {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  loadId?: Types.ObjectId;
  shipmentId?: Types.ObjectId;
  type: 'BOL' | 'POD' | 'INSURANCE' | 'LICENSE' | 'CARRIER_AUTHORITY' | 'W9' | 'OTHER';
  filename: string;
  originalName: string;
  mimeType: string;
  size: number;
  url: string;
  uploadedAt: Date;
  expiresAt?: Date;
  isVerified: boolean;
  verifiedBy?: Types.ObjectId;
  verifiedAt?: Date;
}

// ========================================
// API Request/Response Types
// ========================================

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
    accountType: AccountType;
    role: UserRole;
  };
  userContext?: {
    userId: string;
    email: string;
    role: UserRole;
  };
  requestId?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: any;
}

export interface PaginationParams {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: PaginationParams;
}

// ========================================
// JWT Payload Types
// ========================================

export interface JWTPayload {
  userId: string;
  email: string;
  accountType: AccountType;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ========================================
// Validation Types
// ========================================

export interface ValidationError {
  field: string;
  message: string;
}

// ========================================
// Environment Types
// ========================================

export interface EnvironmentConfig {
  MONGODB_URI: string;
  JWT_SECRET: string;
  PORT: number;
  NODE_ENV: 'development' | 'production' | 'test';
  FRONTEND_URL: string;
  ADMIN_EMAIL?: string;
  ADMIN_PASSWORD?: string;
  ADMIN_ALLOWED_IPS?: string;
  ADMIN_2FA_SECRET?: string;
  EMAIL_USER?: string;
  EMAIL_PASS?: string;
  EMAIL_VERIFICATION_TTL_MS: number;
  VAPID_PUBLIC_KEY?: string;
  VAPID_PRIVATE_KEY?: string;
  VAPID_SUBJECT?: string;
}




