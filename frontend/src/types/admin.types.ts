import type { AccountType, UserRole } from './user.types';
import type { PaginationParams } from './api.types';

export interface AdminUser {
  _id: string;
  email: string;
  company: string;
  phone: string;
  accountType: AccountType;
  role: UserRole;
  isActive: boolean;
  isEmailVerified: boolean;
  subscriptionPlan?: string;
  createdAt: string;
  lastLogin?: string;
  usdotNumber?: string;
  mcNumber?: string;
  einCanon?: string;
  einDisplay?: string;
  hasUSDOT?: boolean;
  hasMC?: boolean;
  [key: string]: unknown;
}

export interface AdminUserResponse {
  success: boolean;
  data: AdminUser[];
  pagination: PaginationParams;
}

export interface AdminUserDetailsResponse {
  success: boolean;
  data: AdminUser;
}

export interface AdminAuditLog {
  _id: string;
  admin: {
    _id: string;
    email: string;
    company?: string;
  } | string;
  action: string;
  description?: string;
  targetCollection?: string;
  targetId?: string;
  metadata?: Record<string, unknown>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

export interface AdminAuditLogResponse {
  success: boolean;
  data: AdminAuditLog[];
  pagination: PaginationParams;
}

export interface AdminSystemStats {
  users: {
    total: number;
    active: number;
    admin: number;
    carriers: number;
    brokers: number;
    shippers: number;
  };
  loads: {
    total: number;
    open: number;
    booked: number;
    inTransit: number;
    delivered: number;
    readyForBilling: number;
  };
  shipments: {
    total: number;
    open: number;
  };
  messages: {
    total: number;
  };
  documents: {
    total: number;
    verified: number;
    pending: number;
    verificationRate: number;
  };
  analytics: {
    conversionRate: number;
    activeLaneCount: number;
    averageHoursToBook: number;
    readyForBilling: number;
  };
  generatedAt: string;
}

export interface AdminSystemStatsResponse {
  success: boolean;
  data: AdminSystemStats;
}


