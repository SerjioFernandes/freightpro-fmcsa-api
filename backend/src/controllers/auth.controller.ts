import { Response } from 'express';
import { authService } from '../services/auth.service.js';
import { AuthRequest } from '../types/index.js';
import { User } from '../models/User.model.js';
import { logger } from '../utils/logger.js';

export class AuthController {
  async register(req: AuthRequest, res: Response): Promise<void> {
    try {
      const result = await authService.register(req.body);
      
      res.status(201).json({
        success: true,
        message: result.emailSent
          ? 'We sent a verification code to your email. Enter it to finish registration.'
          : 'Verification code generated. (Email disabled in this environment.)',
        emailVerificationRequired: true,
        emailSent: result.emailSent,
        verification: { code: result.verificationCode },
        user: result.user
      });
    } catch (error: any) {
      logger.error('Registration failed', { error: error.message });
      res.status(400).json({
        error: error.message || 'Registration failed',
        message: error.message
      });
    }
  }

  async login(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        res.status(400).json({
          error: 'Missing credentials',
          message: 'Email and password are required'
        });
        return;
      }

      const userAgent = req.headers['user-agent'] || 'Unknown';
      const ip = req.ip || req.socket?.remoteAddress || 'Unknown';

      const result = await authService.login(email, password, userAgent, ip);

      res.json({
        success: true,
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      logger.error('Login failed', { email: req.body.email, error: error.message });
      res.status(401).json({
        error: error.message === 'Email not verified' ? 'Email not verified' : 'Invalid credentials',
        message: error.message
      });
    }
  }

  async verifyEmail(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email, code } = req.body;

      if (!email || !code) {
        res.status(400).json({ error: 'Email and code are required' });
        return;
      }

      const result = await authService.verifyEmail(email, code);
      res.json(result);
    } catch (error: any) {
      logger.error('Email verification failed', { error: error.message });
      res.status(400).json({ error: error.message });
    }
  }

  async resendCode(req: AuthRequest, res: Response): Promise<void> {
    try {
      const { email } = req.body;

      if (!email) {
        res.status(400).json({ error: 'Email is required' });
        return;
      }

      const result = await authService.resendVerificationCode(email);
      res.json(result);
    } catch (error: any) {
      logger.error('Resend code failed', { error: error.message });
      res.status(400).json({ error: error.message });
    }
  }

  async getCurrentUser(req: AuthRequest, res: Response): Promise<void> {
    try {
      const user = await User.findById(req.user?.userId).select('email company accountType role isEmailVerified');
      
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      res.json({ success: true, user });
    } catch (error: any) {
      logger.error('Get current user failed', { error: error.message });
      res.status(500).json({ error: 'Failed to fetch user data' });
    }
  }
}

export const authController = new AuthController();




