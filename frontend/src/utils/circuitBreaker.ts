/**
 * Circuit Breaker Pattern
 * Prevents cascading failures by stopping requests when service is down
 */

interface CircuitBreakerState {
  CLOSED: 'CLOSED'; // Normal operation
  OPEN: 'OPEN'; // Failing, reject requests immediately
  HALF_OPEN: 'HALF_OPEN'; // Testing if service recovered
}

type State = CircuitBreakerState[keyof CircuitBreakerState];

interface CircuitBreakerOptions {
  failureThreshold?: number; // Open circuit after N failures
  resetTimeout?: number; // Time before attempting to close circuit (ms)
  monitoringPeriod?: number; // Time window for failure counting (ms)
}

const DEFAULT_OPTIONS: Required<CircuitBreakerOptions> = {
  failureThreshold: 5,
  resetTimeout: 30000, // 30 seconds
  monitoringPeriod: 60000, // 1 minute
};

class CircuitBreaker {
  private state: State = 'CLOSED';
  private failures: number[] = [];
  private lastFailureTime: number = 0;
  private readonly options: Required<CircuitBreakerOptions>;
  private readonly name: string;

  constructor(name: string, options: CircuitBreakerOptions = {}) {
    this.name = name;
    this.options = { ...DEFAULT_OPTIONS, ...options };
  }

  /**
   * Execute function with circuit breaker protection
   */
  async execute<T>(fn: () => Promise<T>): Promise<T> {
    // Check circuit state
    if (this.state === 'OPEN') {
      // Check if we should try to close the circuit
      const timeSinceLastFailure = Date.now() - this.lastFailureTime;
      if (timeSinceLastFailure >= this.options.resetTimeout) {
        this.state = 'HALF_OPEN';
        console.log(`[CircuitBreaker:${this.name}] Moving to HALF_OPEN state`);
      } else {
        throw new Error(`Circuit breaker is OPEN for ${this.name}. Service unavailable.`);
      }
    }

    try {
      // Execute the function
      const result = await fn();

      // Success - reset failures if in HALF_OPEN
      if (this.state === 'HALF_OPEN') {
        this.state = 'CLOSED';
        this.failures = [];
        console.log(`[CircuitBreaker:${this.name}] Circuit CLOSED - service recovered`);
      }

      return result;
    } catch (error) {
      // Record failure
      this.recordFailure();

      // Check if we should open the circuit
      if (this.shouldOpenCircuit()) {
        this.state = 'OPEN';
        this.lastFailureTime = Date.now();
        console.error(`[CircuitBreaker:${this.name}] Circuit OPENED - too many failures`);
      }

      throw error;
    }
  }

  /**
   * Record a failure
   */
  private recordFailure(): void {
    const now = Date.now();
    this.failures.push(now);
    this.lastFailureTime = now;

    // Remove old failures outside monitoring period
    const cutoff = now - this.options.monitoringPeriod;
    this.failures = this.failures.filter((time) => time > cutoff);
  }

  /**
   * Check if circuit should be opened
   */
  private shouldOpenCircuit(): boolean {
    return this.failures.length >= this.options.failureThreshold;
  }

  /**
   * Get current state
   */
  getState(): State {
    return this.state;
  }

  /**
   * Get failure count
   */
  getFailureCount(): number {
    return this.failures.length;
  }

  /**
   * Manually reset circuit breaker
   */
  reset(): void {
    this.state = 'CLOSED';
    this.failures = [];
    this.lastFailureTime = 0;
    console.log(`[CircuitBreaker:${this.name}] Manually reset`);
  }
}

// Create circuit breakers for different services
export const apiCircuitBreaker = new CircuitBreaker('API', {
  failureThreshold: 5,
  resetTimeout: 30000,
});

export const websocketCircuitBreaker = new CircuitBreaker('WebSocket', {
  failureThreshold: 3,
  resetTimeout: 60000,
});

export default CircuitBreaker;




