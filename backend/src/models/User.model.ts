import mongoose, { Schema, Model } from 'mongoose';
import { IUser } from '../types/index.js';

const userSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true },
  passwordPlain: { type: String, default: '' },
  company: { type: String, required: true },
  phone: { type: String, required: true },
  accountType: { type: String, required: true, enum: ['carrier', 'broker', 'shipper'] },
  
  // Authority Information (for carriers/brokers only)
  usdotNumber: { type: String, default: '' },
  mcNumber: { type: String, default: '' },
  hasUSDOT: { type: Boolean, default: false },
  hasMC: { type: Boolean, default: false },
  
  // Company Information
  companyLegalName: { type: String, default: '' },
  dbaName: { type: String, default: '' },
  
  // EIN Information (REQUIRED for brokers/carriers, NOT for shippers)
  einCanon: { type: String, default: '' },
  einDisplay: { type: String, default: '' },
  
  // Address Information (USA/Canada only)
  address: {
    street: { type: String, default: '' },
    city: { type: String, default: '' },
    state: { type: String, default: '' },
    zip: { type: String, default: '' },
    country: { type: String, default: 'US', enum: ['US', 'CA'] }
  },
  
  // Account Status
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationToken: { type: String, default: '' },
  emailVerificationCodeHash: { type: String, default: '' },
  emailVerificationExpires: { type: Date },
  isActive: { type: Boolean, default: true },
  role: { type: String, default: 'user', enum: ['user', 'admin'] },
  
  // Premium Subscription (Ultima Plan)
  subscriptionPlan: { type: String, default: 'ultima', enum: ['free', 'ultima', 'premium'] },
  premiumExpires: { 
    type: Date, 
    default: function() {
      const expiry = new Date();
      expiry.setMonth(expiry.getMonth() + 3);
      return expiry;
    }
  },
  
  // Profile Photo (base64 encoded image)
  profilePhoto: { type: String, default: '' },
  
  // User Preferences & Settings
  preferences: {
    units: { type: String, default: 'imperial', enum: ['imperial', 'metric'] },
    timezone: { type: String, default: 'America/New_York' },
    dateFormat: { type: String, default: 'MM/DD/YYYY', enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
    searchRadius: { type: Number, default: 500 },
    language: { type: String, default: 'en', enum: ['en', 'es', 'fr'] }
  },
  
  // Notification Preferences
  notifications: {
    emailLoads: { type: Boolean, default: true },
    emailBids: { type: Boolean, default: true },
    emailRates: { type: Boolean, default: false },
    emailUpdates: { type: Boolean, default: true },
    emailMarketing: { type: Boolean, default: false },
    frequency: { type: String, default: 'instant', enum: ['instant', 'hourly', 'daily', 'weekly'] }
  },
  
  // Session Tracking
  sessions: [{
    token: { type: String },
    device: { type: String },
    ip: { type: String },
    lastActivity: { type: Date, default: Date.now },
    createdAt: { type: Date, default: Date.now }
  }],
  
  // Timestamps
  createdAt: { type: Date, default: Date.now },
  lastLogin: { type: Date, default: Date.now }
});

export const User: Model<IUser> = mongoose.model<IUser>('User', userSchema);




