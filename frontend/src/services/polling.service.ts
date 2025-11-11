// Lightweight polling service for real-time updates
interface PollingOptions<T> {
  interval: number; // milliseconds
  maxAttempts?: number; // max poll attempts before stopping
  onSuccess?: (data: T) => void;
  onError?: (error: Error) => void;
}

class PollingService {
  private intervals: Map<string, ReturnType<typeof setInterval>> = new Map();

  /**
   * Start polling
   */
  start<T>(key: string, fn: () => Promise<T>, options: PollingOptions<T>): void {
    // Clear any existing interval for this key
    this.stop(key);

    let attempts = 0;
    const { interval, maxAttempts, onSuccess, onError } = options;

    const poll = async () => {
      try {
        attempts++;
        const data = await fn();
        
        if (onSuccess) {
          onSuccess(data);
        }

        // Stop if max attempts reached
        if (maxAttempts && attempts >= maxAttempts) {
          this.stop(key);
        }
      } catch (error) {
        if (onError) {
          onError(error as Error);
        }
        // Continue polling even on error (with next interval)
      }
    };

    // Initial poll
    poll();

    // Set up interval
    const intervalId = setInterval(poll, interval);
    this.intervals.set(key, intervalId);
  }

  /**
   * Stop polling
   */
  stop(key: string): void {
    const intervalId = this.intervals.get(key);
    if (intervalId) {
      clearInterval(intervalId);
      this.intervals.delete(key);
    }
  }

  /**
   * Stop all polling
   */
  stopAll(): void {
    this.intervals.forEach((intervalId) => {
      clearInterval(intervalId);
    });
    this.intervals.clear();
  }

  /**
   * Check if polling is active
   */
  isActive(key: string): boolean {
    return this.intervals.has(key);
  }
}

export const pollingService = new PollingService();

