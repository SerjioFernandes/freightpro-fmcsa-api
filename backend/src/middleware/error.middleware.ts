import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger.js';
import { config } from '../config/environment.js';
import { AuthRequest } from '../types/index.js';

export function errorHandler(err: any, req: AuthRequest, res: Response, next: NextFunction): void {
  logger.error('Unhandled error', {
    message: err?.message || 'Unknown error',
    stack: err?.stack,
    route: req.originalUrl,
    method: req.method,
    requestId: req.requestId,
    user: req.userContext || null
  });

  if (res.headersSent) {
    return next(err);
  }

  res.status(err.status || 500).json({
    error: 'Internal Server Error',
    message: config.NODE_ENV === 'development' ? (err.message || 'Unknown error') : 'An unexpected error occurred',
  });
}

export function asyncHandler(fn: Function) {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
}

