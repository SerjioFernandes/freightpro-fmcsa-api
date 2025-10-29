import mongoose from 'mongoose';
import { config } from './environment.js';

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
    
    console.log('✅ Connected to MongoDB successfully');
  } catch (error: any) {
    console.error('❌ MongoDB connection failed:', error?.message || error);
    
    if (error?.message?.toLowerCase().includes('bad auth') || error?.codeName === 'AuthenticationFailed') {
      console.error('👉 Check your MongoDB username/password in .env (MONGODB_URI).');
      console.error('👉 Also ensure your current IP is allowed in MongoDB Atlas Network Access.');
    }
    
    process.exit(1);
  }
}

// Graceful shutdown
export async function disconnectDatabase(): Promise<void> {
  try {
    await mongoose.connection.close();
    console.log('✅ MongoDB connection closed');
  } catch (error) {
    console.error('❌ Error closing MongoDB connection:', error);
  }
}




