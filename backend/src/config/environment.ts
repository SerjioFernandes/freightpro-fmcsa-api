import dotenv from 'dotenv';
import { EnvironmentConfig } from '../types/index.js';

// Load environment variables
dotenv.config();

// Validate and export environment configuration
export const config: EnvironmentConfig = {
  MONGODB_URI: process.env.MONGODB_URI || '',
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  PORT: parseInt(process.env.PORT || '4000', 10),
  NODE_ENV: (process.env.NODE_ENV as 'development' | 'production' | 'test') || 'development',
  FRONTEND_URL: (process.env.FRONTEND_URL || 'http://localhost:5173').trim(),
  ADMIN_EMAIL: process.env.ADMIN_EMAIL,
  ADMIN_PASSWORD: process.env.ADMIN_PASSWORD,
  EMAIL_USER: process.env.EMAIL_USER,
  EMAIL_PASS: process.env.EMAIL_PASS,
  EMAIL_VERIFICATION_TTL_MS: Number(process.env.EMAIL_VERIFICATION_TTL_MS) || 24 * 60 * 60 * 1000,
};

// Validate required environment variables
export function validateEnvironment(): void {
  const required = ['MONGODB_URI'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}




