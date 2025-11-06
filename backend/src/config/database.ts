import mongoose from 'mongoose';
import { config } from './environment.js';
import { logger } from '../utils/logger.js';

export async function connectToDatabase(): Promise<void> {
  try {
    if (!config.MONGODB_URI) {
      throw new Error('MONGODB_URI environment variable is required');
    }
    
    const uri = config.MONGODB_URI.trim();
    if (!uri) {
      throw new Error('MONGODB_URI is empty after trimming');
    }

    await mongoose.connect(uri);
    
    logger.info('Connected to MongoDB successfully');
  } catch (error: any) {
    logger.error('MongoDB connection failed', { error: error?.message || error });
    
    if (error?.message?.toLowerCase().includes('bad auth') || error?.codeName === 'AuthenticationFailed') {
      logger.error('Check your MongoDB username/password in .env (MONGODB_URI)');
      logger.error('Also ensure your current IP is allowed in MongoDB Atlas Network Access');
    }
    
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    logger.info('MongoDB connection closed');
  } catch (error: any) {
    logger.error('Error closing MongoDB connection', { error: error?.message || error });
  }
}




