import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';
import { AuthRequest } from '../types/index.js';

export function errorHandler(err: any, req: AuthRequest, res: Response, next: NextFunction): void {
  // Prevent error handler from crashing
  try {
    logger.error('Unhandled error', {
      message: err?.message || 'Unknown error',
      stack: err?.stack,
      route: req.originalUrl,
      method: req.method,
      requestId: req.requestId,
      user: req.userContext || null
    });

    // If headers already sent, delegate to default Express error handler
    if (res.headersSent) {
      return next(err);
    }

    // Determine status code
    const status = err.status || err.statusCode || 500;

    // Don't expose internal errors in production
    const message = config.NODE_ENV === 'development' 
      ? (err.message || 'Unknown error')
      : status >= 500 
        ? 'An unexpected error occurred. Please try again later.'
        : err.message || 'An error occurred';

    // Send error response
    res.status(status).json({
      error: status >= 500 ? 'Internal Server Error' : 'Error',
      message,
      ...(config.NODE_ENV === 'development' && { stack: err.stack }),
      requestId: req.requestId,
    });
  } catch (handlerError: any) {
    // If error handler itself fails, use minimal response
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Internal Server Error',
        message: 'An unexpected error occurred',
      });
    }
    // Log the handler error separately
    console.error('[ErrorHandler] Error handler failed:', handlerError);
  }
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

