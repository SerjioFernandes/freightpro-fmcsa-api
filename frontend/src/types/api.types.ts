import type { User } from './user.types';

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
  details?: unknown;
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

export interface AuthResponse extends ApiResponse<User> {
  token?: string;
  user?: User;
  emailVerificationRequired?: boolean;
  emailSent?: boolean;
  verification?: {
    code: string;
  };
}
