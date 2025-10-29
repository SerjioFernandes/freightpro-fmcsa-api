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

export interface PaginatedResponse<T> extends ApiResponse {
  data: T[];
  pagination: PaginationParams;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: any;
  emailVerificationRequired?: boolean;
  emailSent?: boolean;
  verification?: {
    code: string;
  };
}




