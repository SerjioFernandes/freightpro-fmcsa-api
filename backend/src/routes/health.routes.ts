import { Router } from 'express';
import mongoose from 'mongoose';
import { emailService } from '../services/email.service.js';
import os from 'os';

const router = Router();

router.get('/email-status', async (_req, res) => {
  try {
    const isConfigured = emailService.isConfigured();
    const canConnect = isConfigured ? await emailService.testConnection() : false;
    
    res.json({
      configured: isConfigured,
      connected: canConnect,
      provider: 'Gmail SMTP'
    });
  } catch (error: any) {
    res.status(500).json({
      configured: emailService.isConfigured(),
      connected: false,
      provider: 'Gmail SMTP',
      error: error.message
    });
  }
});

router.get('/database', async (_req, res) => {
  try {
    const isConnected = mongoose.connection.readyState === 1;
    const state = mongoose.connection.readyState;
    const stateNames = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    
    let collections: string[] = [];
    let indexInfo: any = {};
    
    if (isConnected && mongoose.connection.db) {
      // List all collections
      collections = await mongoose.connection.db.listCollections().toArray().then(cols => 
        cols.map((col: any) => col.name)
      );
      
      // Get index information for key collections
      try {
        const usersColl = mongoose.connection.db.collection('users');
        const loadsColl = mongoose.connection.db.collection('loads');
        const shipmentsColl = mongoose.connection.db.collection('shipments');
        
        indexInfo = {
          users: await usersColl.indexes(),
          loads: await loadsColl.indexes(),
          shipments: await shipmentsColl.indexes()
        };
      } catch (err) {
        // Collections might not exist yet
      }
    }
    
    res.json({
      connected: isConnected,
      state: stateNames[state] || 'unknown',
      database: mongoose.connection.name,
      collections: collections,
      indexes: indexInfo,
      host: mongoose.connection.host || 'not connected'
    });
  } catch (error: any) {
    res.status(500).json({
      connected: false,
      error: error.message
    });
  }
});

router.get('/system', (_req, res) => {
  try {
    const process = require('process');
    const memUsage = process.memoryUsage();
    
    res.json({
      uptime: {
        process: Math.floor(process.uptime()),
        system: Math.floor(os.uptime())
      },
      memory: {
        heapUsed: Math.round(memUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memUsage.rss / 1024 / 1024),
        external: Math.round(memUsage.external / 1024 / 1024),
        unit: 'MB'
      },
      cpu: {
        model: os.cpus()[0]?.model || 'unknown',
        cores: os.cpus().length,
        architecture: os.arch()
      },
      platform: {
        type: os.type(),
        platform: os.platform(),
        release: os.release()
      },
      nodejs: {
        version: process.version,
        versions: process.versions
      }
    });
  } catch (error: any) {
    res.status(500).json({
      error: error.message
    });
  }
});

router.get('/all', async (_req, res) => {
  try {
    // Get all health data
    const isConnected = mongoose.connection.readyState === 1;
    const isEmailConfigured = emailService.isConfigured();
    const emailConnected = isEmailConfigured ? await emailService.testConnection() : false;
    
    res.json({
      timestamp: new Date().toISOString(),
      status: 'ok',
      services: {
        database: {
          connected: isConnected,
          state: ['disconnected', 'connected', 'connecting', 'disconnecting'][mongoose.connection.readyState] || 'unknown'
        },
        email: {
          configured: isEmailConfigured,
          connected: emailConnected
        }
      },
      system: {
        uptime: Math.floor(process.uptime()),
        memory: {
          heapUsed: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
          heapTotal: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
          unit: 'MB'
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'error',
      error: error.message
    });
  }
});

export default router;
