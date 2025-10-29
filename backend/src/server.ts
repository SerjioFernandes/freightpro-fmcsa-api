import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { validateEnvironment, config } from './config/environment.js';
import { connectToDatabase, disconnectDatabase } from './config/database.js';
import { authService } from './services/auth.service.js';
import { logger } from './utils/logger.js';
import { apiLimiter } from './middleware/rateLimit.middleware.js';
import { errorHandler } from './middleware/error.middleware.js';
import routes from './routes/index.js';

// Validate environment
validateEnvironment();

const app = express();
const PORT = config.PORT;

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

// CORS configuration
const allowedOrigins = [
  config.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:5173',
  'http://localhost:8000',
  'http://localhost:4000',
  'null'
];

app.options('*', cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

logger.info('CORS allowed origins', { origins: allowedOrigins });

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

// Error handler (must be last)
app.use(errorHandler);

// Server startup
async function startServer() {
  try {
    // Connect to database
    await connectToDatabase();
    
    // Ensure default admin user
    await authService.ensureDefaultAdminUser();
    
    // Start listening
    app.listen(PORT, () => {
      logger.info('🚛 CargoLume Load Board Server Started');
      logger.info(`Server running on port ${PORT}`);
      logger.info(`Environment: ${config.NODE_ENV}`);
      logger.info('API Endpoints:');
      logger.info(`  - Health: http://localhost:${PORT}/api/health`);
      logger.info(`  - Register: http://localhost:${PORT}/api/auth/register`);
      logger.info(`  - Login: http://localhost:${PORT}/api/auth/login`);
      logger.info(`  - Loads: http://localhost:${PORT}/api/loads`);
    });
  } catch (error: any) {
    logger.error('Failed to start server', { error: error.message });
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received, shutting down gracefully...');
  await disconnectDatabase();
  process.exit(0);
});

// Start the server
startServer();

export default app;




