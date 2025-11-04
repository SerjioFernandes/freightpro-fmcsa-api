import express from 'express';
import { createServer, Server as HTTPServer } from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { validateEnvironment, config } from './config/environment.js';
import { connectToDatabase, disconnectDatabase } from './config/database.js';
import { authService } from './services/auth.service.js';
import { websocketService } from './services/websocket.service.js';
import { alertCronService } from './services/alertCron.service.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

// Validate environment
validateEnvironment();

const app = express();
const server: HTTPServer = createServer(app);
const PORT = config.PORT;

// Trust proxy (required for Render deployment and rate limiting)
app.set('trust proxy', 1);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
      scriptSrcAttr: ["'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      connectSrc: ["'self'"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Compression
app.use(compression());

// CORS configuration with dynamic origin checking for Vercel
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      config.FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8000',
      'http://localhost:4000',
      'https://www.cargolume.com',
      'https://cargolume.com'
    ];

    // Allow all Vercel preview and production URLs
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }

    // Allow if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Deny by default
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

logger.info('CORS configured to allow all Vercel deployments and configured origins');

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  res.setHeader('X-Request-Id', requestId);
  (req as any).requestId = requestId;

  const { method, originalUrl } = req;
  const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
  logger.info('http_request_started', { requestId, method, url: originalUrl, ip });

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    logger.info('http_request_completed', {
      requestId,
      method,
      url: originalUrl,
      status: res.statusCode,
      durationMs,
      ip
    });
  });
  next();
});

// Body parsers
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use('/api/', apiLimiter);

// Mount API routes
app.use('/api', routes);

// Serve uploaded files
app.use('/uploads', express.static('uploads'));

// Error handler (must be last)
app.use(errorHandler);

// Server startup
async function startServer() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Initialize WebSocket server
    websocketService.initialize(server);
    
    // Start alert cron job
    alertCronService.start();
    
    // Ensure default admin user
    await authService.ensureDefaultAdminUser();
    
    // Start listening on all interfaces (0.0.0.0) for Railway deployment
    server.listen(PORT, '0.0.0.0', () => {
      logger.info('🚛 CargoLume Load Board Server Started');
      logger.info(`Server running on port ${PORT} (0.0.0.0)`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info('API Endpoints:');
      logger.info(`  - Health: http://localhost:${PORT}/api/health`);
      logger.info(`  - Register: http://localhost:${PORT}/api/auth/register`);
      logger.info(`  - Login: http://localhost:${PORT}/api/auth/login`);
      logger.info(`  - Loads: http://localhost:${PORT}/api/loads`);
      logger.info('WebSocket: Real-time updates enabled');
      logger.info('Alert Cron: Running every hour');
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  alertCronService.stop();
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  alertCronService.stop();
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;




