import axios, { type AxiosInstance, type AxiosError, type AxiosRequestConfig } from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { retry } from '../utils/retryHandler';
import { apiCircuitBreaker } from '../utils/circuitBreaker';
import { errorHandler } from '../utils/errorHandler';

// Create axios instance with timeout
const api: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  timeout: 30000, // 30 second timeout
});

// Request interceptor - Add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add request ID for tracking
    config.headers['X-Request-ID'] = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    
    return config;
  },
  (error) => {
    errorHandler.reportError(error as Error, { context: 'request_interceptor' });
    return Promise.reject(error);
  }
);

// Response interceptor - Handle errors with retry and circuit breaker
api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // Handle 401 - Unauthorized
    if (error.response?.status === 401) {
      // Clear auth data
      localStorage.removeItem('token');
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');
      
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
      return Promise.reject(error);
    }

    // Handle network errors and retryable status codes
    if (
      !error.response || // Network error
      [408, 429, 500, 502, 503, 504].includes(error.response.status)
    ) {
      // Don't retry if already retried
      if (originalRequest._retry) {
        errorHandler.reportError(error as Error, {
          context: 'api_request',
          url: originalRequest.url,
          method: originalRequest.method,
        });
        return Promise.reject(error);
      }

      // Mark as retried
      originalRequest._retry = true;

      // Use circuit breaker and retry
      try {
        return await apiCircuitBreaker.execute(async () => {
          return await retry(
            () => api(originalRequest),
            {
              maxRetries: 3,
              initialDelay: 1000,
              retryableStatuses: [408, 429, 500, 502, 503, 504],
            }
          );
        });
      } catch (retryError) {
        errorHandler.reportError(retryError as Error, {
          context: 'api_retry_failed',
          url: originalRequest.url,
          method: originalRequest.method,
        });
        return Promise.reject(retryError);
      }
    }

    // For other errors, just report and reject
    errorHandler.reportError(error as Error, {
      context: 'api_response_error',
      status: error.response?.status,
      url: originalRequest?.url,
    });

    return Promise.reject(error);
  }
);

export default api;

