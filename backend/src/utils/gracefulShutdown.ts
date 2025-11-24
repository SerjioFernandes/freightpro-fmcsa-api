/**
 * Graceful Shutdown Handler
 * Ensures the server shuts down cleanly without dropping requests
 */

import { Server as HTTPServer } from 'http';
import { logger } from './logger.js';
import { disconnectDatabase } from '../config/database.js';

interface ShutdownOptions {
  server: HTTPServer;
  signals?: string[];
  timeout?: number;
}

let isShuttingDown = false;

export function setupGracefulShutdown(options: ShutdownOptions): void {
  const { server, signals = ['SIGTERM', 'SIGINT'], timeout = 30000 } = options;

  const gracefulShutdown = async (signal: string) => {
    if (isShuttingDown) {
      logger.warn('Shutdown already in progress, forcing exit');
      process.exit(1);
      return;
    }

    isShuttingDown = true;
    logger.info(`Received ${signal}, starting graceful shutdown...`);

    // Set timeout to force shutdown if it takes too long
    const forceShutdown = setTimeout(() => {
      logger.error('Graceful shutdown timeout, forcing exit');
      process.exit(1);
    }, timeout);

    try {
      // Stop accepting new connections
      server.close(() => {
        logger.info('HTTP server closed');
      });

      // Close database connections
      try {
        await disconnectDatabase();
        logger.info('Database connections closed');
      } catch (error: any) {
        logger.error('Error closing database connections', { error: error.message });
      }

      // Clear timeout
      clearTimeout(forceShutdown);

      logger.info('Graceful shutdown complete');
      process.exit(0);
    } catch (error: any) {
      logger.error('Error during graceful shutdown', { error: error.message });
      clearTimeout(forceShutdown);
      process.exit(1);
    }
  };

  // Register signal handlers
  signals.forEach((signal) => {
    process.on(signal, () => gracefulShutdown(signal));
  });

  // Handle uncaught exceptions
  process.on('uncaughtException', (error: Error) => {
    logger.error('Uncaught exception', {
      error: error.message,
      stack: error.stack,
    });
    // Don't exit immediately, let graceful shutdown handle it
    gracefulShutdown('UNCAUGHT_EXCEPTION');
  });

  // Handle unhandled promise rejections
  process.on('unhandledRejection', (reason: unknown, promise: Promise<unknown>) => {
    logger.error('Unhandled promise rejection', {
      reason: reason instanceof Error ? reason.message : String(reason),
      stack: reason instanceof Error ? reason.stack : undefined,
    });
    // Don't exit immediately, log and continue
    // In production, you might want to restart the process
  });
}

export default setupGracefulShutdown;




