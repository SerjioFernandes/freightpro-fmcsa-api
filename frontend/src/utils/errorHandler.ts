/**
 * Global Error Handler
 * Prevents crashes and provides graceful error recovery
 */

interface ErrorInfo {
  message: string;
  stack?: string;
  componentStack?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

class ErrorHandler {
  private errorLog: ErrorInfo[] = [];
  private maxErrors = 50;
  private crashCount = 0;
  private readonly MAX_CRASHES = 5;
  private readonly CRASH_RESET_TIME = 60000; // 1 minute

  constructor() {
    this.setupGlobalHandlers();
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    // Handle unhandled errors
    window.addEventListener('error', (event) => {
      this.handleError({
        message: event.message || 'Unknown error',
        stack: event.error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      event.preventDefault(); // Prevent default browser error handling
    });

    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      const error = event.reason;
      this.handleError({
        message: error?.message || 'Unhandled promise rejection',
        stack: error?.stack,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent,
      });
      event.preventDefault(); // Prevent default browser error handling
    });

    // Handle React errors (if using React Error Boundary)
    if (typeof window !== 'undefined') {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        // Don't log React warnings as errors
        if (args[0]?.includes?.('Warning:')) {
          originalConsoleError.apply(console, args);
          return;
        }
        originalConsoleError.apply(console, args);
      };
    }
  }

  /**
   * Handle errors gracefully
   */
  private handleError(errorInfo: ErrorInfo): void {
    // Log error
    this.logError(errorInfo);

    // Check for crash loop
    this.crashCount++;
    if (this.crashCount >= this.MAX_CRASHES) {
      this.handleCrashLoop();
      return;
    }

    // Reset crash count after timeout
    setTimeout(() => {
      this.crashCount = Math.max(0, this.crashCount - 1);
    }, this.CRASH_RESET_TIME);

    // Try to recover
    this.attemptRecovery(errorInfo);
  }

  /**
   * Log error to console and storage
   */
  private logError(errorInfo: ErrorInfo): void {
    console.error('[ErrorHandler]', errorInfo);

    // Store error (limited to prevent memory issues)
    this.errorLog.push(errorInfo);
    if (this.errorLog.length > this.maxErrors) {
      this.errorLog.shift();
    }

    // Try to send to error reporting service (if configured)
    try {
      const errorData = JSON.stringify(errorInfo);
      if (errorData.length < 10000) { // Limit size
        sessionStorage.setItem(`error_${Date.now()}`, errorData);
      }
    } catch (e) {
      // Ignore storage errors
    }
  }

  /**
   * Handle crash loop detection
   */
  private handleCrashLoop(): void {
    console.warn('[ErrorHandler] Crash loop detected, entering safe mode');
    
    // Clear problematic data
    try {
      localStorage.clear();
      sessionStorage.clear();
    } catch (e) {
      // Ignore storage errors
    }

    // Reload page after delay
    setTimeout(() => {
      window.location.href = '/';
    }, 2000);
  }

  /**
   * Attempt to recover from error
   */
  private attemptRecovery(errorInfo: ErrorInfo): void {
    // If it's a network error, don't do anything (retry logic handles it)
    if (errorInfo.message.includes('Network') || errorInfo.message.includes('fetch')) {
      return;
    }

    // If it's a memory error, try to free up memory
    if (errorInfo.message.includes('memory') || errorInfo.message.includes('allocation')) {
      if ('gc' in window && typeof (window as any).gc === 'function') {
        try {
          (window as any).gc();
        } catch (e) {
          // Ignore
        }
      }
    }
  }

  /**
   * Get error log
   */
  getErrorLog(): ErrorInfo[] {
    return [...this.errorLog];
  }

  /**
   * Clear error log
   */
  clearErrorLog(): void {
    this.errorLog = [];
  }

  /**
   * Report error to monitoring service (if configured)
   */
  reportError(error: Error, context?: Record<string, unknown>): void {
    const errorInfo: ErrorInfo = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      ...context,
    };

    this.handleError(errorInfo);

    // Here you could send to error monitoring service like Sentry
    // Example: Sentry.captureException(error, { extra: context });
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export for use in components
export default errorHandler;




