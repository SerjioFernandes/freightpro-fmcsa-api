export type AccountType = 'carrier' | 'broker' | 'shipper';
export type UserRole = 'user' | 'admin';
export type SubscriptionPlan = 'free' | 'ultima' | 'premium';

export interface User {
  id: string;
  email: string;
  company: string;
  phone: string;
  accountType: AccountType;
  usdotNumber?: string;
  mcNumber?: string;
  hasUSDOT: boolean;
  hasMC: boolean;
  isEmailVerified: boolean;
  role: UserRole;
  subscriptionPlan: SubscriptionPlan;
  premiumExpires?: Date;
  profilePhoto?: string;
  preferences?: UserPreferences;
  notifications?: NotificationPreferences;
  createdAt: Date;
  lastLogin: Date;
}

export interface UserPreferences {
  units: 'imperial' | 'metric';
  timezone: string;
  dateFormat: 'MM/DD/YYYY' | 'DD/MM/YYYY' | 'YYYY-MM-DD';
  searchRadius: number;
  language: 'en' | 'es' | 'fr';
}

export interface NotificationPreferences {
  emailLoads: boolean;
  emailBids: boolean;
  emailRates: boolean;
  emailUpdates: boolean;
  emailMarketing: boolean;
  frequency: 'instant' | 'hourly' | 'daily' | 'weekly';
}

export interface RegisterData {
  email: string;
  password: string;
  company: string;
  phone: string;
  accountType: AccountType;
  usdotNumber?: string;
  mcNumber?: string;
  hasUSDOT?: boolean;
  companyLegalName?: string;
  dbaName?: string;
  ein?: string;
}

export interface LoginData {
  email: string;
  password: string;
}




