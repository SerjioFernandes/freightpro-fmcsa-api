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
import { AuthRequest } from './types/index.js';
import { setupGracefulShutdown } from './utils/gracefulShutdown.js';
import routes from './routes/index.js';

// Validate environment
validateEnvironment();

const app = express();
const server: HTTPServer = createServer(app);
const PORT = config.PORT;

// Trust proxy (required for Railway deployment and rate limiting)
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
      connectSrc: ["'self'", "https://freightpro-fmcsa-api-production.up.railway.app", "wss://freightpro-fmcsa-api-production.up.railway.app", "https://www.cargolume.com", "https://cargolume.com"],
      objectSrc: ["'none'"],
      mediaSrc: ["'self'"],
      frameSrc: ["'none'"],
    },
  },
}));

// Compression
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) {
      logger.debug('CORS: Allowing request with no origin');
      return callback(null, true);
    }

    // Normalize origin (remove trailing slash)
    const normalizedOrigin = origin.replace(/\/$/, '');

    // List of allowed origins (normalized)
    const allowedOrigins = [
      config.FRONTEND_URL?.replace(/\/$/, ''),
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8000',
      'http://localhost:4000',
      'https://www.cargolume.com',
      'https://cargolume.com',
      'http://www.cargolume.com',
      'http://cargolume.com'
    ].filter(Boolean); // Remove undefined values

    // Check if origin matches (case-insensitive)
    const isAllowed = allowedOrigins.some(allowed => 
      normalizedOrigin.toLowerCase() === allowed.toLowerCase()
    );

    if (isAllowed) {
      logger.info('CORS: Allowing origin', { origin: normalizedOrigin });
      return callback(null, true);
    }

    // Log denied origin for debugging (use info level so it's always visible)
    logger.info('CORS: Blocked origin - DEBUG INFO', { 
      origin: normalizedOrigin, 
      allowedOrigins: allowedOrigins.filter(Boolean),
      frontendUrl: config.FRONTEND_URL,
      normalizedOrigin,
      originLowercase: normalizedOrigin.toLowerCase()
    });
    
    // Deny by default
    callback(new Error(`Not allowed by CORS: ${normalizedOrigin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Requested-With'],
  exposedHeaders: ['X-Request-Id'],
  maxAge: 86400 // 24 hours
};

app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

logger.info('CORS configured', { 
  frontendUrl: config.FRONTEND_URL,
  allowedOrigins: [
    config.FRONTEND_URL?.replace(/\/$/, ''),
    'https://www.cargolume.com',
    'https://cargolume.com',
    'http://localhost:3000',
    'http://localhost:5173'
  ].filter(Boolean)
});

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const requestId = req.headers['x-request-id'] as string || `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
  res.setHeader('X-Request-Id', requestId);
  (req as AuthRequest).requestId = requestId;

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
      
      // Setup graceful shutdown handlers
      setupGracefulShutdown({
        server,
        signals: ['SIGTERM', 'SIGINT'],
        timeout: 30000, // 30 seconds
      });
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Start the server
startServer();

export default app;




