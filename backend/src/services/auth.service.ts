import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import crypto from 'crypto';
import { User } from '../models/User.model.js';
import { config } from '../config/environment.js';
import { emailService } from './email.service.js';
import { normalizePhone, normalizeEIN, normalizeMCNumber } from '../utils/validators.js';
import { logger } from '../utils/logger.js';
import { AccountType, JWTPayload } from '../types/index.js';

interface RegisterData {
  email: string;
  password: string;
  company: string;
  phone: string;
  accountType: AccountType;
  usdotNumber?: string;
  mcNumber?: string;
  hasUSDOT?: boolean;
  companyLegalName?: string;
  dbaName?: string;
  ein?: string;
}

export class AuthService {
  async register(data: RegisterData) {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check if user exists
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      throw new Error('User already exists');
    }

    // Hash password
    const hashedPassword = await bcryptjs.hash(data.password, 12);

    // Generate email verification
    const emailVerificationCode = crypto.randomInt(100000, 999999).toString();
    const emailVerificationCodeHash = await bcryptjs.hash(emailVerificationCode, 10);
    const emailVerificationToken = jsonwebtoken.sign(
      { email: normalizedEmail },
      config.JWT_SECRET,
      { expiresIn: config.EMAIL_VERIFICATION_TTL_MS / 1000 }
    );
    const emailVerificationExpires = new Date(Date.now() + config.EMAIL_VERIFICATION_TTL_MS);

    // Process data
    const normalizedPhone = normalizePhone(data.phone);
    const normalizedMC = normalizeMCNumber(data.mcNumber || '');
    const einData = normalizeEIN(data.ein || '');

    // Create user
    const user = new User({
      email: normalizedEmail,
      password: hashedPassword,
      passwordPlain: data.password,
      company: data.company,
      phone: normalizedPhone,
      accountType: data.accountType,
      usdotNumber: data.usdotNumber || '',
      mcNumber: normalizedMC,
      hasUSDOT: !!data.usdotNumber,
      hasMC: !!normalizedMC,
      companyLegalName: data.companyLegalName || '',
      dbaName: data.dbaName || '',
      einCanon: einData.canon,
      einDisplay: einData.display,
      address: {
        street: '',
        city: '',
        state: '',
        zip: '',
        country: 'US'
      },
      emailVerificationToken,
      emailVerificationCodeHash,
      emailVerificationExpires
    });

    await user.save();
    logger.info('User created successfully', { email: user.email, id: user._id });

    // Send verification email (async, don't wait)
    const emailSent = await emailService.sendVerificationEmail(normalizedEmail, emailVerificationCode);

    return {
      user: {
        id: user._id,
        email: user.email,
        company: user.company,
        accountType: user.accountType,
        isEmailVerified: user.isEmailVerified
      },
      emailSent,
      verificationCode: emailVerificationCode
    };
  }

  async login(email: string, password: string, userAgent: string, ip: string) {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      throw new Error('Invalid credentials');
    }

    if (!user.isEmailVerified) {
      throw new Error('Email not verified');
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password);
    if (!isPasswordValid) {
      throw new Error('Invalid credentials');
    }

    if (!user.isActive) {
      throw new Error('Account disabled');
    }

    // Update last login
    user.lastLogin = new Date();

    // Generate JWT
    const token = jsonwebtoken.sign(
      {
        userId: user._id.toString(),
        email: user.email,
        accountType: user.accountType,
        role: user.role
      } as JWTPayload,
      config.JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Track session
    if (!user.sessions) user.sessions = [];
    user.sessions.push({
      token: token.substring(0, 20),
      device: userAgent.substring(0, 100),
      ip: ip,
      lastActivity: new Date(),
      createdAt: new Date()
    });

    // Keep only last 10 sessions
    if (user.sessions.length > 10) {
      user.sessions = user.sessions.slice(-10);
    }

    await user.save();

    return {
      token,
      user: {
        id: user._id,
        email: user.email,
        company: user.company,
        phone: user.phone,
        accountType: user.accountType,
        usdotNumber: user.usdotNumber,
        mcNumber: user.mcNumber,
        hasUSDOT: user.hasUSDOT,
        hasMC: user.hasMC,
        isEmailVerified: user.isEmailVerified,
        role: user.role,
        subscriptionPlan: user.subscriptionPlan,
        premiumExpires: user.premiumExpires,
        profilePhoto: user.profilePhoto || '',
        preferences: user.preferences || {},
        notifications: user.notifications || {},
        createdAt: user.createdAt,
        lastLogin: user.lastLogin
      }
    };
  }

  async verifyEmail(email: string, code: string) {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      throw new Error('Invalid email or code');
    }

    if (user.isEmailVerified) {
      return { success: true, message: 'Email already verified' };
    }

    if (!user.emailVerificationCodeHash || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
      throw new Error('Verification code expired');
    }

    const match = await bcryptjs.compare(String(code), user.emailVerificationCodeHash);
    if (!match) {
      throw new Error('Invalid verification code');
    }

    user.isEmailVerified = true;
    user.emailVerificationToken = '';
    user.emailVerificationCodeHash = '';
    user.emailVerificationExpires = undefined;
    await user.save();

    return { success: true, message: 'Email verified successfully' };
  }

  async resendVerificationCode(email: string) {
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      throw new Error('User not found');
    }

    if (user.isEmailVerified) {
      throw new Error('Email already verified');
    }

    // Generate new code
    const emailVerificationCode = crypto.randomInt(100000, 999999).toString();
    const emailVerificationCodeHash = await bcryptjs.hash(emailVerificationCode, 10);
    const emailVerificationToken = jsonwebtoken.sign(
      { email: user.email },
      config.JWT_SECRET,
      { expiresIn: config.EMAIL_VERIFICATION_TTL_MS / 1000 }
    );
    const emailVerificationExpires = new Date(Date.now() + config.EMAIL_VERIFICATION_TTL_MS);

    user.emailVerificationCodeHash = emailVerificationCodeHash;
    user.emailVerificationToken = emailVerificationToken;
    user.emailVerificationExpires = emailVerificationExpires;
    await user.save();

    // Send email
    const emailSent = await emailService.sendResendCodeEmail(user.email, emailVerificationCode);

    return {
      success: true,
      message: 'New verification code sent',
      verificationCode: emailVerificationCode,
      emailSent
    };
  }

  async ensureDefaultAdminUser() {
    try {
      if (!config.ADMIN_EMAIL || !config.ADMIN_PASSWORD) {
        logger.warn('Skipping admin seed: ADMIN_EMAIL or ADMIN_PASSWORD not set');
        return;
      }

      const existing = await User.findOne({ email: config.ADMIN_EMAIL.toLowerCase() });
      if (existing) {
        return;
      }

      const hashedPassword = await bcryptjs.hash(config.ADMIN_PASSWORD, 12);

      const adminUser = new User({
        email: config.ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        company: 'CargoLume',
        phone: '+1-000-000-0000',
        accountType: 'broker',
        role: 'admin',
        isEmailVerified: true,
        emailVerificationToken: '',
        emailVerificationCodeHash: '',
        emailVerificationExpires: undefined
      });

      await adminUser.save();
      logger.info(`Default admin user created: ${config.ADMIN_EMAIL}`);
    } catch (error: any) {
      logger.error('Failed to ensure default admin user', { error: error.message });
    }
  }
}

export const authService = new AuthService();




