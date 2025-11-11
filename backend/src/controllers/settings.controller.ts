import { Response } from 'express';
import { User } from '../models/User.model.js';
import { AuthRequest } from '../types/index.js';
import { body, validationResult } from 'express-validator';
import bcryptjs from 'bcryptjs';
import { logger } from '../utils/logger.js';

export const getSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId).select('-password');
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      data: user
    });
  } catch (error: any) {
    logger.error('Get settings failed', { error: error.message });
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
};

export const updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Validate input
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { email, phone, company } = req.body;

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({ 
        email: email.toLowerCase(), 
        _id: { $ne: req.user?.userId } 
      });
      
      if (existingUser) {
        res.status(400).json({ error: 'Email is already taken' });
        return;
      }
    }

    // Update user
    const updatedUser = await User.findByIdAndUpdate(
      req.user?.userId,
      {
        ...(email && { email: email.toLowerCase() }),
        ...(phone && { phone }),
        ...(company && { company }),
      },
      { new: true, runValidators: true }
    ).select('-password');

    if (!updatedUser) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser
    });
  } catch (error: any) {
    logger.error('Update profile failed', { error: error.message });
    res.status(500).json({ error: 'Failed to update profile' });
  }
};

// Validation middleware
export const validateProfile = [
  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email address'),
  body('phone')
    .optional()
    .matches(/^\+?1?[-.\s]?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}$/)
    .withMessage('Please provide a valid phone number'),
  body('company')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Company name must be between 1 and 100 characters'),
];

export const changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({ error: 'Validation failed', details: errors.array() });
      return;
    }

    const { oldPassword, newPassword } = req.body;
    const user = await User.findById(req.user?.userId);

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Verify old password
    const isPasswordValid = await bcryptjs.compare(oldPassword, user.password);
    if (!isPasswordValid) {
      res.status(400).json({ error: 'Incorrect current password' });
      return;
    }

    // Hash new password
    const hashedPassword = await bcryptjs.hash(newPassword, 12);

    // Update password
    user.password = hashedPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error: any) {
    logger.error('Change password failed', { error: error.message });
    res.status(500).json({ error: 'Failed to change password' });
  }
};

export const updateNotificationSettings = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update notification preferences
    if (req.body.notifications) {
      user.notifications = {
        ...user.notifications,
        ...req.body.notifications
      };
    }

    if (req.body.preferences) {
      user.preferences = {
        ...user.preferences,
        ...req.body.preferences
      };
    }

    await user.save();

    res.json({
      success: true,
      message: 'Settings updated successfully',
      data: user.notifications
    });
  } catch (error: any) {
    logger.error('Update notification settings failed', { error: error.message });
    res.status(500).json({ error: 'Failed to update settings' });
  }
};

export const uploadAvatar = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const user = await User.findById(req.user?.userId);
    
    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Update user's profile photo URL
    const { getFileUrl } = await import('../middleware/upload.middleware.js');
    user.profilePhoto = getFileUrl(req.file.filename, 'avatar');
    await user.save();

    res.json({
      success: true,
      message: 'Profile photo uploaded successfully',
      data: { profilePhoto: user.profilePhoto }
    });
  } catch (error: any) {
    logger.error('Upload avatar failed', { error: error.message });
    res.status(500).json({ error: 'Failed to upload profile photo' });
  }
};

export const validatePassword = [
  body('oldPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters'),
];

