/**
 * Retry Handler for API Requests
 * Automatically retries failed requests with exponential backoff
 */

interface RetryOptions {
  maxRetries?: number;
  initialDelay?: number;
  maxDelay?: number;
  retryableStatuses?: number[];
  retryableErrors?: string[];
}

const DEFAULT_OPTIONS: Required<RetryOptions> = {
  maxRetries: 3,
  initialDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
  retryableStatuses: [408, 429, 500, 502, 503, 504],
  retryableErrors: ['Network Error', 'timeout', 'ECONNRESET', 'ETIMEDOUT'],
};

/**
 * Check if error is retryable
 */
function isRetryable(error: unknown, options: Required<RetryOptions>): boolean {
  // Network errors
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();
    if (options.retryableErrors.some((retryable) => errorMessage.includes(retryable.toLowerCase()))) {
      return true;
    }
  }

  // HTTP status codes
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { status?: number } };
    if (axiosError.response?.status && options.retryableStatuses.includes(axiosError.response.status)) {
      return true;
    }
  }

  return false;
}

/**
 * Calculate delay with exponential backoff
 */
function calculateDelay(attempt: number, initialDelay: number, maxDelay: number): number {
  const delay = Math.min(initialDelay * Math.pow(2, attempt), maxDelay);
  // Add jitter to prevent thundering herd
  const jitter = Math.random() * 0.3 * delay;
  return delay + jitter;
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry a function with exponential backoff
 */
export async function retry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  let lastError: unknown;

  for (let attempt = 0; attempt <= opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;

      // Don't retry on last attempt
      if (attempt === opts.maxRetries) {
        break;
      }

      // Check if error is retryable
      if (!isRetryable(error, opts)) {
        throw error;
      }

      // Calculate delay
      const delay = calculateDelay(attempt, opts.initialDelay, opts.maxDelay);

      // Log retry attempt
      console.warn(`[RetryHandler] Attempt ${attempt + 1}/${opts.maxRetries + 1} failed, retrying in ${Math.round(delay)}ms`, error);

      // Wait before retrying
      await sleep(delay);
    }
  }

  // All retries exhausted
  throw lastError;
}

/**
 * Create a retry wrapper for axios requests
 */
export function withRetry<T>(
  requestFn: () => Promise<T>,
  options?: RetryOptions
): Promise<T> {
  return retry(requestFn, options);
}

export default { retry, withRetry };




