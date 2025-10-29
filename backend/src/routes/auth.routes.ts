import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from '../controllers/auth.controller.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import { validateEINRequired, validateAuthority } from '../middleware/validation.middleware.js';
import { asyncHandler } from '../middleware/error.middleware.js';

const router = Router();

// Validation rules
const registerValidation = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('company').trim().notEmpty().withMessage('Company name required'),
  body('phone').trim().isLength({ min: 7, max: 50 }).withMessage('Phone number must be 7-50 characters'),
  body('accountType').isIn(['carrier', 'broker', 'shipper']).withMessage('Valid account type required')
];

// Public routes
router.post('/register', registerValidation, validateEINRequired, validateAuthority, asyncHandler(authController.register.bind(authController)));
router.post('/login', asyncHandler(authController.login.bind(authController)));
router.post('/verify', asyncHandler(authController.verifyEmail.bind(authController)));
router.post('/resend-code', asyncHandler(authController.resendCode.bind(authController)));

// Protected routes
router.get('/me', authenticateToken, asyncHandler(authController.getCurrentUser.bind(authController)));

export default router;




