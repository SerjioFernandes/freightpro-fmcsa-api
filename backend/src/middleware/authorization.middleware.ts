import { Response, NextFunction } from 'express';
import { AuthRequest } from '../types/index.js';
import { AccountType } from '../types/index.js';

/**
 * Middleware to require specific account types
 * Returns 403 Forbidden if user doesn't have one of the allowed account types
 */
export const requireAccountType = (allowedTypes: AccountType[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    // Check if user is authenticated (this should already be checked by authenticateToken)
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Check if user's account type is in the allowed list
    if (!allowedTypes.includes(req.user.accountType)) {
      res.status(403).json({ 
        error: 'Insufficient permissions',
        message: `This action requires one of the following account types: ${allowedTypes.join(', ')}`
      });
      return;
    }

    // User has required account type, proceed
    next();
  };
};

/**
 * Convenience middleware functions for specific account types
 */
export const requireBroker = requireAccountType(['broker']);
export const requireCarrier = requireAccountType(['carrier']);
export const requireShipper = requireAccountType(['shipper']);
export const requireBrokerOrCarrier = requireAccountType(['broker', 'carrier']);
export const requireShipperOrBroker = requireAccountType(['shipper', 'broker']);
