import { Response, NextFunction } from 'express';
import jsonwebtoken from 'jsonwebtoken';
import { config } from '../config/environment.js';
import { AuthRequest, JWTPayload } from '../types/index.js';

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required' });
    return;
  }

  try {
    const decoded = jsonwebtoken.verify(token, config.JWT_SECRET) as JWTPayload;
    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      accountType: decoded.accountType,
      role: decoded.role
    };
    req.userContext = {
      userId: decoded.userId,
      email: decoded.email,
      role: decoded.role
    };
    next();
  } catch (err) {
    res.status(403).json({ error: 'Invalid or expired token' });
    return;
  }
}

export function authenticateAdmin(req: AuthRequest, res: Response, next: NextFunction): void {
  if (req.user?.email !== config.ADMIN_EMAIL) {
    res.status(403).json({ error: 'Admin access required' });
    return;
  }
  next();
}




