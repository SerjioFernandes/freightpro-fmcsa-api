// CargoLume Load Board Backend Server
import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import crypto from 'crypto';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import compression from 'compression';

// Load environment variables
dotenv.config();

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://cargolume.netlify.app').trim();
const EMAIL_VERIFICATION_TTL_MS = Number(process.env.EMAIL_VERIFICATION_TTL_MS) || 24 * 60 * 60 * 1000;

// Lightweight structured logger and helpers
function log(level, message, meta = {}) {
    try {
        const entry = { timestamp: new Date().toISOString(), level, message, ...meta };
        const text = JSON.stringify(entry, (_key, value) => {
            if (value instanceof Error) {
                return { message: value.message, stack: value.stack };
            }
            return value;
        });
        if (level === 'error') console.error(text);
        else if (level === 'warn') console.warn(text);
        else console.log(text);
    } catch (e) {
        // Fallback to plain console on logger failure
        console.error('Logger failure:', e);
    }
}

const logger = {
    info: (message, meta) => log('info', message, meta),
    warn: (message, meta) => log('warn', message, meta),
    error: (message, meta) => log('error', message, meta)
};

// Async handler wrapper for routes
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

async function ensureDefaultAdminUser() {
    try {
    if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
        console.warn('⚠️ Skipping admin seed: ADMIN_EMAIL or ADMIN_PASSWORD not set');
        return;
    }

    const existing = await User.findOne({ email: ADMIN_EMAIL.toLowerCase() });
    if (existing) {
        return;
    }

    const hashedPassword = await bcryptjs.hash(ADMIN_PASSWORD, 12);

    const adminUser = new User({
        email: ADMIN_EMAIL.toLowerCase(),
        password: hashedPassword,
        // SECURITY: Never store plain password - removed passwordPlain field
        company: 'CargoLume',
        phone: '+1-000-000-0000',
        accountType: 'broker',
        role: 'admin',
        isEmailVerified: true,
        emailVerificationToken: '',
        emailVerificationCodeHash: '',
        emailVerificationExpires: null
    });

    await adminUser.save();
    console.log(`👑 Default admin user created: ${ADMIN_EMAIL}`);
    } catch (error) {
        console.error('Failed to ensure default admin user:', error);
    }
}

// MongoDB Connection
async function connectToMongoDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is required');
        }
        
        // Clean URI and connect (driver v6 doesn't need deprecated options)
        const uri = (process.env.MONGODB_URI || '').trim();
        if (!uri) {
            throw new Error('MONGODB_URI is empty after trimming');
        }

        await mongoose.connect(uri);
        
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error?.message || error);
        if (error?.message?.toLowerCase().includes('bad auth') || error?.codeName === 'AuthenticationFailed') {
            console.error('👉 Check your MongoDB username/password in .env (MONGODB_URI).');
            console.error('👉 Also ensure your current IP is allowed in MongoDB Atlas Network Access.');
        }
        process.exit(1);
    }
}

// MongoDB Schemas
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    passwordPlain: { type: String, default: '' },
    company: { type: String, required: true },
    phone: { type: String, required: true },
    accountType: { type: String, required: true, enum: ['carrier', 'broker', 'shipper'] },
    
    // Authority Information (for carriers/brokers only)
    usdotNumber: { type: String, default: '' },
    mcNumber: { type: String, default: '' },
    hasUSDOT: { type: Boolean, default: false },
    hasMC: { type: Boolean, default: false },
    
    // Company Information
    companyLegalName: { type: String, default: '' },
    dbaName: { type: String, default: '' },
    
    // EIN Information (REQUIRED for brokers/carriers, NOT for shippers)
    einCanon: { type: String, default: '' }, // EIN without dashes (e.g., 894521364)
    einDisplay: { type: String, default: '' }, // EIN with dashes (e.g., 89-4521364)
    
    // Address Information (USA/Canada only)
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' }, // US state or Canadian province
        zip: { type: String, default: '' }, // US ZIP or Canadian postal code
        country: { type: String, default: 'US', enum: ['US', 'CA'] }
    },
    
    // Account Status
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: '' },
    emailVerificationCodeHash: { type: String, default: '' },
    emailVerificationExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    
    // Premium Subscription (Ultima Plan)
    subscriptionPlan: { type: String, default: 'ultima', enum: ['free', 'ultima', 'premium'] },
    premiumExpires: { type: Date, default: function() {
        // Default to 3 months from registration
        const expiry = new Date();
        expiry.setMonth(expiry.getMonth() + 3);
        return expiry;
    }},
    
    // Profile Photo (base64 encoded image)
    profilePhoto: { type: String, default: '' },
    
    // User Preferences & Settings
    preferences: {
        units: { type: String, default: 'imperial', enum: ['imperial', 'metric'] },
        timezone: { type: String, default: 'America/New_York' },
        dateFormat: { type: String, default: 'MM/DD/YYYY', enum: ['MM/DD/YYYY', 'DD/MM/YYYY', 'YYYY-MM-DD'] },
        searchRadius: { type: Number, default: 500 }, // in miles
        language: { type: String, default: 'en', enum: ['en', 'es', 'fr'] }
    },
    
    // Notification Preferences
    notifications: {
        emailLoads: { type: Boolean, default: true },
        emailBids: { type: Boolean, default: true },
        emailRates: { type: Boolean, default: false },
        emailUpdates: { type: Boolean, default: true },
        emailMarketing: { type: Boolean, default: false },
        frequency: { type: String, default: 'instant', enum: ['instant', 'hourly', 'daily', 'weekly'] }
    },
    
    // Session Tracking
    sessions: [{
        token: { type: String },
        device: { type: String },
        ip: { type: String },
        lastActivity: { type: Date, default: Date.now },
        createdAt: { type: Date, default: Date.now }
    }],
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    lastLogin: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);

// Load Board Schemas
// Shipment Schema (created by shippers; browsed by brokers; referenced by loads optionally)
const shipmentSchema = new mongoose.Schema({
    shipmentId: { type: String, required: true, unique: true }, // e.g., SHP-YYYYMMDD-XXXXXX
    title: { type: String, required: true },
    description: { type: String, default: '' },
    pickup: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true }
    },
    delivery: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true }
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // shipper id
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

// Shipment Request Schema (for broker-shipper authorization)
const shipmentRequestSchema = new mongoose.Schema({
    shipmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment', required: true },
    brokerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    shipperId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    brokerMessage: { type: String, maxlength: 500, default: '' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    requestedAt: { type: Date, default: Date.now },
    respondedAt: { type: Date },
    shipperResponse: { type: String, maxlength: 500, default: '' }
});

const ShipmentRequest = mongoose.model('ShipmentRequest', shipmentRequestSchema);

const loadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    origin: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: 'US', enum: ['US', 'CA'] }
    },
    destination: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: 'US', enum: ['US', 'CA'] }
    },
    pickupDate: { type: Date, required: true },
    deliveryDate: { type: Date, required: true },
    equipmentType: { type: String, required: true },
    weight: { type: Number, required: true },
    rate: { type: Number, required: true },
    rateType: { type: String, enum: ['per_mile', 'flat_rate'], default: 'per_mile' },
    distance: { type: Number },
    
    // Load Status
    status: { type: String, enum: ['available', 'booked', 'in_transit', 'delivered', 'cancelled'], default: 'available' },
    
    // Shipment Linkage
    shipmentId: { type: String, default: '' }, // Reference to shipment.shipmentId
    unlinked: { type: Boolean, default: false }, // true if not linked to any shipment
    
    // Relationships
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    
    // Authority validation
    isInterstate: { type: Boolean, default: true }, // true if pickup and delivery states differ
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Load = mongoose.model('Load', loadSchema);

// Message Schema
const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    load: { type: mongoose.Schema.Types.ObjectId, ref: 'Load' },
    subject: { type: String, required: true },
    message: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now }
});

const Message = mongoose.model('Message', messageSchema);

// Validation Constants and Helpers
const VALIDATION_PATTERNS = {
    EIN: /^\d{2}-\d{7}$/,
    MC_NUMBER: /^(MC-)?\d{6,7}$/i,
    USDOT_NUMBER: /^\d{6,8}$/,
    PHONE: /^\+?1?\s*\(?\d{3}\)?[\s\.\-]?\d{3}[\s\.\-]?\d{4}$/,
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    US_ZIP: /^\d{5}(-\d{4})?$/,
    CA_POSTAL: /^[A-Za-z]\d[A-Za-z][ -]?\d[A-Za-z]\d$/,
    US_STATES: ['AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'],
    CA_PROVINCES: ['AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT']
};

// Validation Helper Functions
function validateEIN(ein) {
    if (!ein || typeof ein !== 'string') return false;
    return VALIDATION_PATTERNS.EIN.test(ein.trim());
}

function validateMCNumber(mc) {
    if (!mc || typeof mc !== 'string') return false;
    return VALIDATION_PATTERNS.MC_NUMBER.test(mc.trim());
}

function validateUSDOTNumber(usdot) {
    if (!usdot || typeof usdot !== 'string') return false;
    return VALIDATION_PATTERNS.USDOT_NUMBER.test(usdot.trim());
}

function validatePhone(phone) {
    if (!phone || typeof phone !== 'string') return false;
    return VALIDATION_PATTERNS.PHONE.test(phone.trim());
}

function validateEmail(email) {
    if (!email || typeof email !== 'string') return false;
    return VALIDATION_PATTERNS.EMAIL.test(email.trim());
}

function validatePostalCode(zip, country = 'US') {
    if (!zip || typeof zip !== 'string') return false;
    const trimmed = zip.trim();
    if (country === 'CA') {
        return VALIDATION_PATTERNS.CA_POSTAL.test(trimmed);
    }
    return VALIDATION_PATTERNS.US_ZIP.test(trimmed);
}

function validateState(state, country = 'US') {
    if (!state || typeof state !== 'string') return false;
    const trimmed = state.trim().toUpperCase();
    if (country === 'CA') {
        return VALIDATION_PATTERNS.CA_PROVINCES.includes(trimmed);
    }
    return VALIDATION_PATTERNS.US_STATES.includes(trimmed);
}

function normalizeMCNumber(mc) {
    if (!mc) return '';
    const cleaned = mc.replace(/[^0-9]/g, '');
    return cleaned ? `MC-${cleaned}` : '';
}

function normalizePhone(phone) {
    if (!phone) return '';
    const digits = phone.replace(/\D/g, '');
    if (digits.length === 10) {
        return `+1${digits}`;
    } else if (digits.length === 11 && digits.startsWith('1')) {
        return `+${digits}`;
    }
    return phone; // Return original if can't normalize
}

function normalizeEIN(ein) {
    if (!ein) return { canon: '', display: '' };
    const cleaned = ein.replace(/[^0-9]/g, '');
    if (cleaned.length === 9) {
        return {
            canon: cleaned,
            display: `${cleaned.slice(0, 2)}-${cleaned.slice(2)}`
        };
    }
    return { canon: '', display: '' };
}

// Authority Validation Middleware
function validateAuthority(req, res, next) {
    const { accountType, mcNumber, usdotNumber } = req.body;
    
    if (accountType === 'broker' || accountType === 'carrier') {
        if (!mcNumber && !usdotNumber) {
            return res.status(400).json({
                error: 'MC number or USDOT number is required for brokers and carriers'
            });
        }
        
        if (mcNumber && !validateMCNumber(mcNumber)) {
            return res.status(400).json({
                error: 'Invalid MC number format. Use MC-123456 or 123456'
            });
        }
        
        if (usdotNumber && !validateUSDOTNumber(usdotNumber)) {
            return res.status(400).json({
                error: 'Invalid USDOT number format. Use 6-8 digits'
            });
        }
    }
    
    next();
}

// EIN Validation Middleware
function validateEINRequired(req, res, next) {
    const { accountType, ein } = req.body;
    
    if (accountType === 'broker' || accountType === 'carrier') {
        if (!ein) {
            return res.status(400).json({
                error: 'EIN is required for brokers and carriers'
            });
        }
        
        if (!validateEIN(ein)) {
            return res.status(400).json({
                error: 'Invalid EIN format. Use format: 12-3456789'
            });
        }
    }
    
    // Remove EIN from shippers
    if (accountType === 'shipper') {
        delete req.body.ein;
        delete req.body.einCanon;
        delete req.body.einDisplay;
    }
    
    next();
}

// Middleware & Security
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdn.tailwindcss.com"],
            scriptSrcAttr: ["'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:", "http:"],
            fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
            connectSrc: ["'self'", "https://api.github.com"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"],
        },
    },
}));
app.use(compression());

// CORS configuration with dynamic origin checking for Vercel
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, postman, etc.)
    if (!origin) return callback(null, true);

    // List of allowed origins
    const allowedOrigins = [
      FRONTEND_URL,
      'http://localhost:3000',
      'http://localhost:5173',
      'http://localhost:8000',
      'http://localhost:4000'
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

// Handle preflight requests first
app.options('*', cors(corsOptions));
app.use(cors(corsOptions));

logger.info('CORS configured to allow all Vercel deployments and configured origins');

// Request ID + logging middleware (after security, before routes)
app.use((req, res, next) => {
    const start = Date.now();
    // Prefer incoming header, else generate simple unique ID
    const incomingId = req.headers['x-request-id'];
    const requestId = typeof incomingId === 'string' && incomingId.trim() ? incomingId.trim() : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
    res.setHeader('X-Request-Id', requestId);
    req.requestId = requestId;

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

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100,
    message: {
        error: 'Too many requests from this IP, please try again later.',
        retryAfter: '15 minutes'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use('/api/', limiter);

// Email Configuration
function createEmailTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    console.log('📧 Email configuration check:');
    console.log('EMAIL_USER set:', !!user);
    console.log('EMAIL_PASS set:', !!pass);

    if (!user || !pass) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS environment variables are missing. Email notifications are disabled.');
        console.warn('To enable email sending, set these in Render environment variables:');
        console.warn('EMAIL_USER=your-gmail@gmail.com');
        console.warn('EMAIL_PASS=your-app-password');
        return null;
    }

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        host: 'smtp.gmail.com',
        port: 587,
        secure: false, // use STARTTLS
        auth: {
            user,
            pass
        },
        tls: {
            rejectUnauthorized: true, // Changed from false for security
            minVersion: 'TLSv1.2'
        },
        connectionTimeout: 10000, // 10s timeout
        greetingTimeout: 10000,
        socketTimeout: 15000,
        logger: true, // Enable nodemailer logging
        debug: process.env.NODE_ENV === 'development' // Debug in dev only
    });

    console.log('✅ Email transporter created successfully');
    return transporter;
}

const transporter = createEmailTransporter();

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
        return res.status(401).json({ error: 'Access token required' });
    }

    jsonwebtoken.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ error: 'Invalid or expired token' });
        }
        req.user = user;
        req.userContext = { userId: user?.userId, email: user?.email, role: user?.role };
        next();
    });
};

// Validation Middleware
const validateRegistration = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('company').trim().notEmpty().withMessage('Company name required'),
    body('phone').trim().isLength({ min: 7, max: 50 }).withMessage('Phone number must be 7-50 characters'),
    body('accountType').isIn(['carrier', 'broker', 'shipper']).withMessage('Valid account type required')
];

// API Routes

// Health Check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'CargoLume Load Board API is running',
        service: 'CargoLume Load Board API',
        version: '2.0.0',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        database: {
            status: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
        },
        email: {
            configured: !!transporter,
            user: process.env.EMAIL_USER ? 'set' : 'not set'
        }
    });
});

// Email status health check
app.get('/api/health/email-status', async (req, res) => {
    try {
        const isConfigured = !!transporter;
        let canConnect = false;
        
        if (isConfigured) {
            try {
                await transporter.verify();
                canConnect = true;
                console.log('✅ SMTP connection verified successfully');
            } catch (error) {
                console.error('❌ SMTP connection failed', {
                    code: error.code,
                    command: error.command,
                    message: error.message
                });
            }
        }
        
        res.json({
            configured: isConfigured,
            connected: canConnect,
            provider: 'Gmail SMTP'
        });
    } catch (error) {
        res.status(500).json({
            configured: !!transporter,
            connected: false,
            provider: 'Gmail SMTP',
            error: error.message
        });
    }
});

// Serve static frontend from project root on the SAME port as API
const staticRoot = path.join(__dirname);
app.use(express.static(staticRoot, {
    setHeaders: (res, path) => {
        if (path.endsWith('.js')) {
            res.setHeader('Content-Type', 'application/javascript');
        }
        if (path.endsWith('.css')) {
            res.setHeader('Content-Type', 'text/css');
        }
    }
}));

// SPA/HTML fallback to index.html for any non-API route
app.get(['/', '/home', '/loadboard', '/post', '/pricing', '/profile', '/rates', '/market', '/**'], (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    res.sendFile(path.join(staticRoot, 'index.html'));
});

// Global error handler (last middleware)
// Ensures consistent JSON errors and prevents unhandled promise rejections from crashing the server
app.use((err, req, res, next) => {
    logger.error('unhandled_error', {
        message: err?.message || 'Unknown error',
        stack: err?.stack,
        route: req.originalUrl,
        method: req.method,
        requestId: req.requestId,
        user: req.userContext || null
    });
    if (res.headersSent) {
        return next(err);
    }
    res.status(err.status || 500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? (err.message || 'Unknown error') : 'An unexpected error occurred',
    });
});

// User Registration
app.post('/api/auth/register', validateRegistration, validateEINRequired, validateAuthority, asyncHandler(async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Registration validation failed:', errors.array());
            console.error('Request body received:', JSON.stringify(req.body, null, 2));
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array(),
                receivedData: req.body
            });
        }

        console.log('Registration request body:', JSON.stringify(req.body, null, 2));

        const { email, password, company, phone, accountType, usdotNumber, mcNumber, hasUSDOT, companyLegalName, dbaName, ein } = req.body;

        const normalizedEmail = (email || '').trim().toLowerCase();

        // Additional validation
        if (!validateEmail(normalizedEmail)) {
            return res.status(400).json({
                error: 'Invalid email format'
            });
        }

        if (!validatePhone(phone)) {
            return res.status(400).json({
                error: 'Invalid phone number format. Use US/Canada format'
            });
        }

        // Check if user already exists
        console.log('Checking for existing user with email:', normalizedEmail);
        const existingUser = await User.findOne({ email: normalizedEmail });
        if (existingUser) {
            console.log('User already exists:', existingUser.email);
            return res.status(400).json({
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        // Generate email verification token
        const emailVerificationCode = crypto.randomInt(100000, 999999).toString();
        const emailVerificationCodeHash = await bcryptjs.hash(emailVerificationCode, 10);
        const emailVerificationToken = jsonwebtoken.sign(
            { email: normalizedEmail },
            JWT_SECRET,
            { expiresIn: EMAIL_VERIFICATION_TTL_MS / 1000 }
        );
        const emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);

        // Process and normalize data
        const normalizedPhone = normalizePhone(phone);
        const normalizedMC = normalizeMCNumber(mcNumber);
        const einData = normalizeEIN(ein);
        
        // Determine authority flags
        const hasMC = !!normalizedMC;
        const hasUSDOTFlag = !!usdotNumber;

        // Create user
        const user = new User({
            email: normalizedEmail,
            password: hashedPassword,
            passwordPlain: password,
            company,
            phone: normalizedPhone,
            accountType,
            usdotNumber: usdotNumber || '',
            mcNumber: normalizedMC,
            hasUSDOT: hasUSDOTFlag,
            hasMC: hasMC,
            companyLegalName: companyLegalName || '',
            dbaName: dbaName || '',
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
        console.log('✅ User created successfully:', user.email, 'ID:', user._id);
        console.log('✅ User saved to MongoDB database');
        
        // Verify user exists in database
        const savedUser = await User.findById(user._id);
        if (savedUser) {
            console.log('✅ User verification: Found in database');
        } else {
            console.error('❌ User verification: NOT found in database');
        }

        // Send verification email in background (don't wait for it)
        let emailSent = false;

        if (transporter) {
            console.log('📧 Attempting to send email to:', normalizedEmail);
            console.log('📧 From:', process.env.EMAIL_USER);
            
            // Send email asynchronously without waiting
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden">
                  <div style="background:#1a2238; color:#fff; padding:16px 24px">
                    <h1 style="margin:0; font-size:20px;">CargoLume</h1>
                    <p style="margin:4px 0 0; font-size:12px; opacity:.9">Professional Load Board</p>
                  </div>
                  <div style="padding:24px">
                    <h2 style="margin:0 0 8px; color:#111827; font-size:18px;">Verify your email</h2>
                    <p style="margin:0 0 16px; color:#374151;">Thanks for registering. Use this code to finish setting up your account:</p>
                    <div style="background:#f3f4f6; padding:20px; text-align:center; border-radius:8px; margin-bottom:16px">
                      <div style="font-size:32px; letter-spacing:8px; font-weight:700; color:#2563eb;">${emailVerificationCode}</div>
                    </div>
                    <p style="margin:0 0 16px; color:#4b5563">This code expires in 24 hours.</p>
                    <a href="${FRONTEND_URL}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Open CargoLume</a>
                  </div>
                  <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
                    <p style="margin:0 0 4px;">If you didn’t create this account, you can safely ignore this email.</p>
                    <p style="margin:0;">© ${new Date().getFullYear()} CargoLume. All rights reserved.</p>
                  </div>
                </div>`;
            transporter.sendMail({
                from: `"CargoLume" <${process.env.EMAIL_USER}>`,
                to: normalizedEmail,
                subject: 'Verify your email for CargoLume',
                html
            }).then((info) => {
                console.log('✅ Email sent successfully to:', normalizedEmail);
                console.log('📧 Email info:', info.messageId);
                emailSent = true;
            }).catch((emailError) => {
                console.error('❌ Email sending failed:', emailError);
                console.error('❌ Email error details:', {
                    code: emailError.code,
                    command: emailError.command,
                    response: emailError.response
                });
                // Don't fail registration if email fails
            });
        } else {
            console.warn('⚠️ No email transporter available - email not sent');
        }

        console.log('Registration completed for:', user.email);
        res.status(201).json({
            success: true,
            message: emailSent
                ? 'We sent a verification code to your email. Enter it to finish registration.'
                : 'Verification code generated. (Email disabled in this environment.)',
            emailVerificationRequired: true,
            emailSent,
            verification: { code: emailVerificationCode },
            user: {
                id: user._id,
                email: user.email,
                company: user.company,
                accountType: user.accountType,
                isEmailVerified: user.isEmailVerified
            }
        });
}));

// User Login
app.post('/api/auth/login', asyncHandler(async (req, res) => {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({
                error: 'Missing credentials',
                message: 'Email and password are required'
            });
        }

        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        if (!user.isEmailVerified) {
            return res.status(401).json({
                error: 'Email not verified',
                message: 'Please verify your email address before logging in'
            });
        }

        const isPasswordValid = await bcryptjs.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
            });
        }

        if (!user.isActive) {
            return res.status(401).json({
                error: 'Account disabled',
                message: 'Your account has been disabled. Contact support for assistance.'
            });
        }

        // Update last login
        user.lastLogin = new Date();
        
        // Generate JWT token
        const token = jsonwebtoken.sign(
            { 
                userId: user._id, 
                email: user.email, 
                accountType: user.accountType,
                role: user.role 
            },
            JWT_SECRET,
            { expiresIn: '7d' }
        );
        
        // Track session
        const userAgent = req.headers['user-agent'] || 'Unknown';
        const ip = req.ip || req.connection.remoteAddress || 'Unknown';
        
        if (!user.sessions) user.sessions = [];
        user.sessions.push({
            token: token.substring(0, 20), // Store first 20 chars for identification
            device: userAgent.substring(0, 100), // Limit device string length
            ip: ip,
            lastActivity: new Date(),
            createdAt: new Date()
        });
        
        // Keep only last 10 sessions
        if (user.sessions.length > 10) {
            user.sessions = user.sessions.slice(-10);
        }
        
        await user.save();

        res.json({
            success: true,
            message: 'Login successful',
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
        });

}));

// Verify email by code (submitted from frontend form)
app.post('/api/auth/verify', asyncHandler(async (req, res) => {
        const { email, code } = req.body;
        if (!email || !code) {
            return res.status(400).json({ error: 'Email and code are required' });
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(400).json({ error: 'Invalid email or code' });
        if (user.isEmailVerified) {
            return res.json({ success: true, message: 'Email already verified' });
        }
        if (!user.emailVerificationCodeHash || !user.emailVerificationExpires || user.emailVerificationExpires < new Date()) {
            return res.status(400).json({ error: 'Verification code expired. Please request a new code.' });
        }
        const match = await bcryptjs.compare(String(code), user.emailVerificationCodeHash);
        if (!match) {
            return res.status(400).json({ error: 'Invalid verification code' });
        }
        user.isEmailVerified = true;
        user.emailVerificationToken = '';
        user.emailVerificationCodeHash = '';
        user.emailVerificationExpires = null;
        await user.save();
        res.json({ success: true, message: 'Email verified successfully' });
}));

// Resend verification code
app.post('/api/auth/resend-code', asyncHandler(async (req, res) => {
        const { email } = req.body;
        if (!email) {
            return res.status(400).json({ error: 'Email is required' });
        }
        const user = await User.findOne({ email: email.trim().toLowerCase() });
        if (!user) return res.status(400).json({ error: 'User not found' });
        if (user.isEmailVerified) {
            return res.status(400).json({ error: 'Email already verified' });
        }
        
        // Generate new verification code
        const emailVerificationCode = crypto.randomInt(100000, 999999).toString();
        const emailVerificationCodeHash = await bcryptjs.hash(emailVerificationCode, 10);
        const emailVerificationToken = jsonwebtoken.sign(
            { email: user.email },
            JWT_SECRET,
            { expiresIn: EMAIL_VERIFICATION_TTL_MS / 1000 }
        );
        const emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
        
        user.emailVerificationCodeHash = emailVerificationCodeHash;
        user.emailVerificationToken = emailVerificationToken;
        user.emailVerificationExpires = emailVerificationExpires;
        await user.save();
        
        // Send email
        if (transporter) {
            const html = `
                <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:12px; overflow:hidden">
                  <div style="background:#1a2238; color:#fff; padding:16px 24px">
                    <h1 style="margin:0; font-size:20px;">CargoLume</h1>
                    <p style="margin:4px 0 0; font-size:12px; opacity:.9">Professional Load Board</p>
                  </div>
                  <div style="padding:24px">
                    <h2 style="margin:0 0 8px; color:#111827; font-size:18px;">Verify your email</h2>
                    <p style="margin:0 0 16px; color:#374151;">Here's your new verification code:</p>
                    <div style="background:#f3f4f6; padding:20px; text-align:center; border-radius:8px; margin-bottom:16px">
                      <div style="font-size:32px; letter-spacing:8px; font-weight:700; color:#2563eb;">${emailVerificationCode}</div>
                    </div>
                    <p style="margin:0 0 16px; color:#4b5563">This code expires in 24 hours.</p>
                    <a href="${FRONTEND_URL}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Open CargoLume</a>
                  </div>
                  <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
                    <p style="margin:0 0 4px;">If you didn't request this code, you can safely ignore this email.</p>
                    <p style="margin:0;">© ${new Date().getFullYear()} CargoLume. All rights reserved.</p>
                  </div>
                </div>`;
            transporter.sendMail({
                from: `"CargoLume" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'New verification code for CargoLume',
                html
            }).catch(err => console.error('Email send failed:', err));
        }
        
        res.json({ 
            success: true, 
            message: 'New verification code sent',
            verification: { code: emailVerificationCode }
        });
}));

// Current user context (for chat role auto-detect)
app.get('/api/auth/me', authenticateToken, asyncHandler(async (req, res) => {
        const user = await User.findById(req.user.userId).select('email company accountType role isEmailVerified');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json({ success: true, user });
}));

// User Dashboard - Role-specific data
app.get('/api/users/dashboard', authenticateToken, asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        let dashboardData = {
            user: {
                id: user._id,
                email: user.email,
                company: user.company,
                accountType: user.accountType,
                phone: user.phone,
                einDisplay: user.einDisplay,
                usdotNumber: user.usdotNumber,
                mcNumber: user.mcNumber,
                hasUSDOT: user.hasUSDOT,
                hasMC: user.hasMC,
                isEmailVerified: user.isEmailVerified,
                subscriptionPlan: user.subscriptionPlan,
                premiumExpires: user.premiumExpires,
                createdAt: user.createdAt,
                lastLogin: user.lastLogin
            },
            stats: {},
            recentActivity: []
        };

        // Role-specific data
        if (user.accountType === 'shipper') {
            // Shippers: created shipments
            const shipments = await Shipment.find({ postedBy: userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('postedBy', 'company email');
            
            dashboardData.shipments = shipments;
            dashboardData.stats = {
                totalShipments: await Shipment.countDocuments({ postedBy: userId }),
                openShipments: await Shipment.countDocuments({ postedBy: userId, status: 'open' }),
                closedShipments: await Shipment.countDocuments({ postedBy: userId, status: 'closed' })
            };
        }

        if (user.accountType === 'broker') {
            // Brokers: posted loads and available shipments
            const loads = await Load.find({ postedBy: userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('postedBy', 'company email')
                .populate('bookedBy', 'company email');
            
            const availableShipments = await Shipment.find({ status: 'open' })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('postedBy', 'company email');
            
            dashboardData.loads = loads;
            dashboardData.availableShipments = availableShipments;
            dashboardData.stats = {
                totalLoads: await Load.countDocuments({ postedBy: userId }),
                availableLoads: await Load.countDocuments({ postedBy: userId, status: 'available' }),
                bookedLoads: await Load.countDocuments({ postedBy: userId, status: 'booked' }),
                totalShipments: await Shipment.countDocuments({ status: 'open' })
            };
        }

        if (user.accountType === 'carrier') {
            // Carriers: booked loads
            const bookedLoads = await Load.find({ bookedBy: userId })
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('postedBy', 'company email')
                .populate('bookedBy', 'company email');
            
            // Available loads (filtered by authority)
            let availableLoadsQuery = { status: 'available' };
            if (!user.hasMC) {
                availableLoadsQuery.isInterstate = false; // USDOT-only carriers see intrastate only
            }
            
            const availableLoads = await Load.find(availableLoadsQuery)
                .sort({ createdAt: -1 })
                .limit(10)
                .populate('postedBy', 'company email');
            
            dashboardData.bookedLoads = bookedLoads;
            dashboardData.availableLoads = availableLoads;
            dashboardData.stats = {
                totalBooked: await Load.countDocuments({ bookedBy: userId }),
                availableToBook: await Load.countDocuments(availableLoadsQuery),
                inTransit: await Load.countDocuments({ bookedBy: userId, status: 'in_transit' }),
                delivered: await Load.countDocuments({ bookedBy: userId, status: 'delivered' })
            };
        }

        res.json({ success: true, dashboard: dashboardData });
}));

// Update User Settings
app.put('/api/users/settings', authenticateToken, validateEINRequired, validateAuthority, asyncHandler(async (req, res) => {
        const userId = req.user.userId;
        const { company, phone, usdotNumber, mcNumber, ein, address } = req.body;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        // Validate phone if provided
        if (phone && !validatePhone(phone)) {
            return res.status(400).json({ error: 'Invalid phone number format' });
        }

        // Validate address if provided
        if (address) {
            if (address.state && !validateState(address.state, address.country || 'US')) {
                return res.status(400).json({ error: 'Invalid state/province' });
            }
            if (address.zip && !validatePostalCode(address.zip, address.country || 'US')) {
                return res.status(400).json({ error: 'Invalid postal code' });
            }
        }

        // Update user fields
        if (company) user.company = company;
        if (phone) user.phone = normalizePhone(phone);
        if (usdotNumber) {
            user.usdotNumber = usdotNumber;
            user.hasUSDOT = !!usdotNumber;
        }
        if (mcNumber) {
            user.mcNumber = normalizeMCNumber(mcNumber);
            user.hasMC = !!normalizeMCNumber(mcNumber);
        }
        if (ein && (user.accountType === 'broker' || user.accountType === 'carrier')) {
            const einData = normalizeEIN(ein);
            user.einCanon = einData.canon;
            user.einDisplay = einData.display;
        }
        if (address) {
            user.address = {
                street: address.street || user.address.street,
                city: address.city || user.address.city,
                state: address.state ? address.state.toUpperCase() : user.address.state,
                zip: address.zip || user.address.zip,
                country: address.country || user.address.country || 'US'
            };
        }

        await user.save();

        res.json({ 
            success: true, 
            message: 'Settings updated successfully',
            user: {
                id: user._id,
                email: user.email,
                company: user.company,
                phone: user.phone,
                accountType: user.accountType,
                einDisplay: user.einDisplay,
                usdotNumber: user.usdotNumber,
                mcNumber: user.mcNumber,
                hasUSDOT: user.hasUSDOT,
                hasMC: user.hasMC,
                address: user.address
            }
        });
}));

// Update User Preferences
app.put('/api/users/preferences', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { units, timezone, dateFormat, searchRadius, language } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update preferences
    if (!user.preferences) user.preferences = {};
    if (units) user.preferences.units = units;
    if (timezone) user.preferences.timezone = timezone;
    if (dateFormat) user.preferences.dateFormat = dateFormat;
    if (searchRadius !== undefined) user.preferences.searchRadius = parseInt(searchRadius);
    if (language) user.preferences.language = language;

    await user.save();

    res.json({ 
        success: true, 
        message: 'Preferences updated successfully',
        preferences: user.preferences
    });
}));

// Update Notification Preferences
app.put('/api/users/notifications', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { emailLoads, emailBids, emailRates, emailUpdates, emailMarketing, frequency } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Update notification preferences
    if (!user.notifications) user.notifications = {};
    if (emailLoads !== undefined) user.notifications.emailLoads = emailLoads;
    if (emailBids !== undefined) user.notifications.emailBids = emailBids;
    if (emailRates !== undefined) user.notifications.emailRates = emailRates;
    if (emailUpdates !== undefined) user.notifications.emailUpdates = emailUpdates;
    if (emailMarketing !== undefined) user.notifications.emailMarketing = emailMarketing;
    if (frequency) user.notifications.frequency = frequency;

    await user.save();

    res.json({ 
        success: true, 
        message: 'Notification preferences updated successfully',
        notifications: user.notifications
    });
}));

// Change Password
app.put('/api/users/password', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Current password and new password are required' });
    }

    if (newPassword.length < 8) {
        return res.status(400).json({ error: 'New password must be at least 8 characters long' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Verify current password
    const isPasswordValid = await bcryptjs.compare(currentPassword, user.password);
    if (!isPasswordValid) {
        return res.status(401).json({ error: 'Current password is incorrect' });
    }

    // Hash and save new password
    const hashedPassword = await bcryptjs.hash(newPassword, 10);
    user.password = hashedPassword;
    user.passwordPlain = ''; // Clear plain text password if it exists
    await user.save();

    res.json({ 
        success: true, 
        message: 'Password updated successfully'
    });
}));

// Update Profile Photo
app.put('/api/users/profile-photo', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const { profilePhoto } = req.body;

    if (!profilePhoto) {
        return res.status(400).json({ error: 'Profile photo data is required' });
    }

    // Validate base64 image format
    if (!profilePhoto.startsWith('data:image/')) {
        return res.status(400).json({ error: 'Invalid image format' });
    }

    // Check size (base64 string length - rough estimate: ~5MB = ~6.7M characters)
    const maxSize = 7 * 1024 * 1024; // 7MB to be safe
    if (profilePhoto.length > maxSize) {
        return res.status(400).json({ error: 'Image size too large. Maximum 5MB allowed' });
    }

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Save profile photo
    user.profilePhoto = profilePhoto;
    await user.save();

    console.log(`✅ Profile photo updated for user: ${user.email}`);

    res.json({ 
        success: true, 
        message: 'Profile photo updated successfully',
        profilePhoto: profilePhoto
    });
}));

// Delete Profile Photo
app.delete('/api/users/profile-photo', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Remove profile photo
    user.profilePhoto = '';
    await user.save();

    console.log(`✅ Profile photo deleted for user: ${user.email}`);

    res.json({ 
        success: true, 
        message: 'Profile photo removed successfully'
    });
}));

// Get Active Sessions
app.get('/api/users/sessions', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    // Clean up old sessions (older than 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const activeSessions = (user.sessions || []).filter(session => 
        new Date(session.lastActivity) > thirtyDaysAgo
    );

    // Update user with cleaned sessions
    user.sessions = activeSessions;
    await user.save();

    res.json({ 
        success: true, 
        sessions: activeSessions.map(s => ({
            device: s.device || 'Unknown Device',
            ip: s.ip || 'Unknown IP',
            lastActivity: s.lastActivity,
            createdAt: s.createdAt
        }))
    });
}));

// Get Platform Statistics (Real-time counts from database)
app.get('/api/stats/platform', asyncHandler(async (req, res) => {
    try {
        // Get real counts from database
        const [totalCarriers, totalShippers, totalBrokers, availableLoads, totalUsers] = await Promise.all([
            User.countDocuments({ accountType: 'carrier', isActive: true }),
            User.countDocuments({ accountType: 'shipper', isActive: true }),
            User.countDocuments({ accountType: 'broker', isActive: true }),
            Load.countDocuments({ status: 'available' }),
            User.countDocuments({ isActive: true })
        ]);

        // Calculate total freight value from available loads
        const loadsWithValue = await Load.aggregate([
            { $match: { status: 'available' } },
            { $group: { _id: null, totalValue: { $sum: '$rate' } } }
        ]);
        
        const totalFreightValue = loadsWithValue.length > 0 ? loadsWithValue[0].totalValue : 0;

        res.json({
            success: true,
            stats: {
                activeCarriers: totalCarriers,
                activeShippers: totalShippers,
                activeBrokers: totalBrokers,
                totalUsers: totalUsers,
                availableLoads: availableLoads,
                totalFreightValue: Math.round(totalFreightValue),
                lastUpdated: new Date()
            }
        });
    } catch (error) {
        console.error('Platform stats error:', error);
        // Return zeros if DB query fails
        res.json({
            success: true,
            stats: {
                activeCarriers: 0,
                activeShippers: 0,
                activeBrokers: 0,
                totalUsers: 0,
                availableLoads: 0,
                totalFreightValue: 0,
                lastUpdated: new Date()
            }
        });
    }
}));

// Admin-only middleware
const authenticateAdmin = (req, res, next) => {
    if (req.user.email !== process.env.ADMIN_EMAIL) {
        return res.status(403).json({ error: 'Admin access required' });
    }
    next();
};

// Get All Users (Admin Only)
app.get('/api/admin/users', authenticateToken, authenticateAdmin, asyncHandler(async (req, res) => {
    try {
        const users = await User.find({})
            .select('-password') // Exclude password hash
            .sort({ createdAt: -1 })
            .lean();

        res.json({
            success: true,
            users: users.map(user => ({
                id: user._id,
                companyName: user.companyName || user.username || 'N/A',
                email: user.email,
                accountType: user.accountType || 'N/A',
                usdot: user.usdot || '-',
                mc: user.mc || '-',
                isVerified: user.isVerified || false,
                role: user.email === process.env.ADMIN_EMAIL ? 'admin' : 'user',
                createdAt: user.createdAt,
                isActive: user.isActive !== false,
                phone: user.phone || '-',
                subscriptionPlan: user.subscriptionPlan || 'basic',
                subscriptionExpiry: user.subscriptionExpiry || null
            }))
        });
    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
}));

// Get User Dashboard Statistics
app.get('/api/users/stats', authenticateToken, asyncHandler(async (req, res) => {
    const userId = req.user.userId;
    const user = await User.findById(userId);
    
    if (!user) return res.status(404).json({ error: 'User not found' });

    try {
        let loadsPosted = 0;
        let loadsBooked = 0;
        let totalRevenue = 0;
        let shipments = 0;

        if (user.accountType === 'broker' || user.accountType === 'shipper') {
            // Count loads posted by this user
            loadsPosted = await Load.countDocuments({ postedBy: userId });
            
            // Calculate revenue from booked loads
            const bookedLoads = await Load.find({ 
                postedBy: userId, 
                status: { $in: ['booked', 'in_transit', 'delivered'] }
            });
            totalRevenue = bookedLoads.reduce((sum, load) => sum + (load.rate || 0), 0);
        }

        if (user.accountType === 'carrier') {
            // Count loads booked by this carrier
            loadsBooked = await Load.countDocuments({ bookedBy: userId });
            
            // Calculate revenue from delivered loads
            const deliveredLoads = await Load.find({ 
                bookedBy: userId, 
                status: 'delivered'
            });
            totalRevenue = deliveredLoads.reduce((sum, load) => sum + (load.rate || 0), 0);
        }

        if (user.accountType === 'shipper') {
            // Count shipments created
            shipments = await Shipment.countDocuments({ postedBy: userId });
        }

        res.json({
            success: true,
            stats: {
                loadsPosted: loadsPosted,
                loadsBooked: loadsBooked,
                totalRevenue: Math.round(totalRevenue),
                shipments: shipments,
                rating: 5.0 // TODO: Implement real rating system
            }
        });
    } catch (error) {
        console.error('User stats error:', error);
        res.json({
            success: true,
            stats: {
                loadsPosted: 0,
                loadsBooked: 0,
                totalRevenue: 0,
                shipments: 0,
                rating: 5.0
            }
        });
    }
}));

// Get Loads
app.get('/api/loads', authenticateToken, asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, status = 'available', accountType } = req.query;
        const skip = (page - 1) * limit;

        let query = { status };
        
        // Authority-based filtering for carriers
        if (req.user.accountType === 'carrier') {
            const carrier = await User.findById(req.user.userId);
            
            // Carriers with only USDOT can only see intrastate loads
            if (!carrier.hasMC) {
                query.isInterstate = false;
            }
            // Carriers with MC can see all loads (no additional filter)
        }
        
        // Filter by account type if specified
        if (accountType) {
            query.accountType = accountType;
        }

        const loads = await Load.find(query)
            .populate('postedBy', 'company email accountType')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Load.countDocuments(query);

        res.json({
            success: true,
            loads,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

}));

// Post a Load
app.post('/api/loads', authenticateToken, asyncHandler(async (req, res) => {
        // Only brokers can post loads (business rule)
        if (req.user.accountType !== 'broker' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only brokers can post loads' });
        }

        const { shipmentId, origin, destination, pickupDate, deliveryDate } = req.body;

        // Validate required fields
        if (!origin || !destination || !pickupDate || !deliveryDate) {
            return res.status(400).json({ error: 'Origin, destination, pickup date, and delivery date are required' });
        }

        // Validate locations
        if (!validateState(origin.state, origin.country || 'US')) {
            return res.status(400).json({ error: 'Invalid origin state/province' });
        }

        if (!validateState(destination.state, destination.country || 'US')) {
            return res.status(400).json({ error: 'Invalid destination state/province' });
        }

        if (!validatePostalCode(origin.zip, origin.country || 'US')) {
            return res.status(400).json({ error: 'Invalid origin postal code' });
        }

        if (!validatePostalCode(destination.zip, destination.country || 'US')) {
            return res.status(400).json({ error: 'Invalid destination postal code' });
        }

        // Authority validation for interstate vs intrastate
        const isInterstate = origin.state !== destination.state;
        const broker = await User.findById(req.user.userId);
        
        if (isInterstate && !broker.hasMC) {
            return res.status(403).json({ 
                error: 'MC number required for interstate loads. Brokers with only USDOT can post intrastate loads only.' 
            });
        }

        let shipmentRef = null;
        let unlinked = true;

        if (shipmentId) {
            // Validate shipmentId exists and is open
            const shipment = await Shipment.findOne({ shipmentId, status: 'open' });
            if (!shipment) {
                return res.status(400).json({ error: 'Invalid or closed shipmentId' });
            }
            shipmentRef = shipment._id;
            unlinked = false;
        }

        const loadData = {
            ...req.body,
            origin: {
                city: origin.city,
                state: origin.state.toUpperCase(),
                zip: origin.zip,
                country: origin.country || 'US'
            },
            destination: {
                city: destination.city,
                state: destination.state.toUpperCase(),
                zip: destination.zip,
                country: destination.country || 'US'
            },
            shipmentId: shipmentId || '',
            unlinked,
            isInterstate,
            shipment: shipmentRef,
            postedBy: req.user.userId
        };

        const load = new Load(loadData);
        await load.save();

        res.status(201).json({
            success: true,
            message: 'Load posted successfully',
            load
        });

}));

// Book a Load (only carriers; atomic)
app.post('/api/loads/:id/book', authenticateToken, asyncHandler(async (req, res) => {
        if (req.user.accountType !== 'carrier' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only carriers can book loads' });
        }

        // Get the load first to check authority requirements
        const loadToBook = await Load.findById(req.params.id);
        if (!loadToBook) {
            return res.status(404).json({ error: 'Load not found' });
        }

        // Authority validation for carriers
        const carrier = await User.findById(req.user.userId);
        
        // Carriers with only USDOT can only book intrastate loads
        if (loadToBook.isInterstate && !carrier.hasMC) {
            return res.status(403).json({ 
                error: 'MC number required for interstate loads. Carriers with only USDOT can book intrastate loads only.' 
            });
        }

        // Atomic update to prevent double-booking
        const load = await Load.findOneAndUpdate(
            { _id: req.params.id, status: 'available' },
            { $set: { status: 'booked', bookedBy: req.user.userId, updatedAt: new Date() } },
            { new: true }
        );

        if (!load) {
            return res.status(409).json({ error: 'Load already booked or not available' });
        }

        res.json({
            success: true,
            message: 'Load booked successfully',
            load
        });

}));

// Shipments: create (shipper only), list, and detail
app.post('/api/shipments', authenticateToken, asyncHandler(async (req, res) => {
        if (req.user.accountType !== 'shipper' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only shippers can create shipments' });
        }

        const { title, description, pickup, delivery } = req.body;

        // Validate required fields
        if (!title || !pickup || !delivery) {
            return res.status(400).json({ error: 'Title, pickup, and delivery are required' });
        }

        // Validate pickup and delivery locations
        if (!validateState(pickup.state, pickup.country || 'US')) {
            return res.status(400).json({ error: 'Invalid pickup state/province' });
        }

        if (!validateState(delivery.state, delivery.country || 'US')) {
            return res.status(400).json({ error: 'Invalid delivery state/province' });
        }

        if (!validatePostalCode(pickup.zip, pickup.country || 'US')) {
            return res.status(400).json({ error: 'Invalid pickup postal code' });
        }

        if (!validatePostalCode(delivery.zip, delivery.country || 'US')) {
            return res.status(400).json({ error: 'Invalid delivery postal code' });
        }

        const random = Math.random().toString(36).slice(2, 8).toUpperCase();
        const datePart = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const shipmentId = `SHP-${datePart}-${random}`;

        const shipment = new Shipment({
            shipmentId,
            title,
            description: description || '',
            pickup: {
                city: pickup.city,
                state: pickup.state.toUpperCase(),
                zip: pickup.zip,
                country: pickup.country || 'US'
            },
            delivery: {
                city: delivery.city,
                state: delivery.state.toUpperCase(),
                zip: delivery.zip,
                country: delivery.country || 'US'
            },
            postedBy: req.user.userId
        });

        await shipment.save();
        res.status(201).json({ success: true, shipment });
}));

// List shipments (brokers browse; shippers see own by default)
app.get('/api/shipments', authenticateToken, asyncHandler(async (req, res) => {
        const { scope = 'all', page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let query = { status: 'open' };
        if (req.user.accountType === 'shipper' && scope !== 'all') {
            query.postedBy = req.user.userId;
        }
        const shipments = await Shipment.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit));
        const total = await Shipment.countDocuments(query);

        // For brokers: Check access and return limited fields for non-approved shipments
        if (req.user.accountType === 'broker') {
            const shipmentIds = shipments.map(s => s._id);
            const approvedRequests = await ShipmentRequest.find({
                shipmentId: { $in: shipmentIds },
                brokerId: req.user.userId,
                status: 'approved'
            });

            const approvedShipmentIds = approvedRequests.map(r => r.shipmentId.toString());

            // Create access map for frontend
            const shipmentsWithAccess = shipments.map(shipment => {
                const hasAccess = approvedShipmentIds.includes(shipment._id.toString());
                
                if (!hasAccess) {
                    // Return limited fields
                    return {
                        _id: shipment._id,
                        shipmentId: shipment.shipmentId,
                        title: shipment.title,
                        pickup: { city: shipment.pickup.city, state: shipment.pickup.state },
                        delivery: { city: shipment.delivery.city, state: shipment.delivery.state },
                        status: shipment.status,
                        createdAt: shipment.createdAt,
                        hasAccess: false
                    };
                }
                // Return full details
                return {
                    ...shipment.toObject(),
                    hasAccess: true
                };
            });

            return res.json({ 
                success: true, 
                shipments: shipmentsWithAccess, 
                pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } 
            });
        }

        // For shippers and admins: Full access
        res.json({ success: true, shipments, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / parseInt(limit)) } });
}));

// Get shipment by shipmentId
app.get('/api/shipments/:shipmentId', authenticateToken, asyncHandler(async (req, res) => {
        const shipment = await Shipment.findOne({ shipmentId: req.params.shipmentId });
        if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
        res.json({ success: true, shipment });
}));

// Shipment Request Endpoints (Broker-Shipper Authorization)

// POST /api/shipments/:id/request - Broker requests access to shipment
app.post('/api/shipments/:id/request', authenticateToken, asyncHandler(async (req, res) => {
        // Only brokers can request access
        if (req.user.accountType !== 'broker' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only brokers can request access to shipments' });
        }

        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) {
            return res.status(404).json({ error: 'Shipment not found' });
        }

        // Check if request already exists
        const existingRequest = await ShipmentRequest.findOne({
            shipmentId: req.params.id,
            brokerId: req.user.userId
        });

        if (existingRequest) {
            return res.status(400).json({ 
                error: 'You have already requested access to this shipment', 
                status: existingRequest.status 
            });
        }

        // Create new request
        const newRequest = new ShipmentRequest({
            shipmentId: req.params.id,
            brokerId: req.user.userId,
            shipperId: shipment.postedBy,
            brokerMessage: req.body.message || '',
            status: 'pending'
        });

        await newRequest.save();

        // TODO: Send email notification to shipper
        console.log(`Broker ${req.user.company} requested access to shipment ${shipment.shipmentId}`);

        res.json({ 
            success: true, 
            message: 'Request sent successfully',
            request: newRequest 
        });
}));

// GET /api/shipments/requests - Get shipment requests (role-based)
app.get('/api/shipments/requests', authenticateToken, asyncHandler(async (req, res) => {
        const { status, page = 1, limit = 20 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);
        let query = {};

        // Shippers see requests for their shipments
        if (req.user.accountType === 'shipper') {
            query.shipperId = req.user.userId;
        }
        // Brokers see their own requests
        else if (req.user.accountType === 'broker') {
            query.brokerId = req.user.userId;
        }
        // Admins see all
        else if (req.user.role === 'admin') {
            // No filter
        } else {
            return res.status(403).json({ error: 'Unauthorized' });
        }

        // Filter by status if provided
        if (status && ['pending', 'approved', 'rejected'].includes(status)) {
            query.status = status;
        }

        const requests = await ShipmentRequest.find(query)
            .populate('shipmentId', 'shipmentId title pickup delivery status')
            .populate('brokerId', 'company email usdotNumber mcNumber')
            .populate('shipperId', 'company email')
            .sort({ requestedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await ShipmentRequest.countDocuments(query);

        res.json({ 
            success: true, 
            requests,
            pagination: { 
                page: parseInt(page), 
                limit: parseInt(limit), 
                total, 
                pages: Math.ceil(total / parseInt(limit)) 
            }
        });
}));

// POST /api/shipments/requests/:id/approve - Shipper approves request
app.post('/api/shipments/requests/:id/approve', authenticateToken, asyncHandler(async (req, res) => {
        // Only shippers can approve
        if (req.user.accountType !== 'shipper' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only shippers can approve requests' });
        }

        const request = await ShipmentRequest.findById(req.params.id)
            .populate('shipmentId')
            .populate('brokerId', 'company email');

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Verify ownership
        if (req.user.accountType === 'shipper' && request.shipperId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ error: 'You can only approve requests for your own shipments' });
        }

        // Check if already responded
        if (request.status !== 'pending') {
            return res.status(400).json({ error: `Request already ${request.status}` });
        }

        // Update request
        request.status = 'approved';
        request.respondedAt = new Date();
        request.shipperResponse = req.body.response || '';
        await request.save();

        // TODO: Send email notification to broker
        console.log(`Shipper approved request from ${request.brokerId.company} for shipment ${request.shipmentId.shipmentId}`);

        res.json({ 
            success: true, 
            message: 'Request approved successfully',
            request 
        });
}));

// POST /api/shipments/requests/:id/reject - Shipper rejects request
app.post('/api/shipments/requests/:id/reject', authenticateToken, asyncHandler(async (req, res) => {
        // Only shippers can reject
        if (req.user.accountType !== 'shipper' && req.user.role !== 'admin') {
            return res.status(403).json({ error: 'Only shippers can reject requests' });
        }

        const request = await ShipmentRequest.findById(req.params.id)
            .populate('shipmentId')
            .populate('brokerId', 'company email');

        if (!request) {
            return res.status(404).json({ error: 'Request not found' });
        }

        // Verify ownership
        if (req.user.accountType === 'shipper' && request.shipperId.toString() !== req.user.userId.toString()) {
            return res.status(403).json({ error: 'You can only reject requests for your own shipments' });
        }

        // Check if already responded
        if (request.status !== 'pending') {
            return res.status(400).json({ error: `Request already ${request.status}` });
        }

        // Update request
        request.status = 'rejected';
        request.respondedAt = new Date();
        request.shipperResponse = req.body.response || '';
        await request.save();

        // TODO: Send email notification to broker
        console.log(`Shipper rejected request from ${request.brokerId.company} for shipment ${request.shipmentId.shipmentId}`);

        res.json({ 
            success: true, 
            message: 'Request rejected',
            request 
        });
}));

// GET /api/shipments/:id/access - Check if broker has access to shipment
app.get('/api/shipments/:id/access', authenticateToken, asyncHandler(async (req, res) => {
        // Only brokers need to check access
        if (req.user.accountType !== 'broker') {
            return res.json({ hasAccess: true }); // Shippers and admins have full access
        }

        const approvedRequest = await ShipmentRequest.findOne({
            shipmentId: req.params.id,
            brokerId: req.user.userId,
            status: 'approved'
        });

        const hasAccess = !!approvedRequest;
        const requestStatus = approvedRequest ? approvedRequest.status : 'none';

        // Check if there's a pending request
        const pendingRequest = await ShipmentRequest.findOne({
            shipmentId: req.params.id,
            brokerId: req.user.userId,
            status: 'pending'
        });

        res.json({ 
            hasAccess,
            requestStatus: pendingRequest ? 'pending' : requestStatus,
            requestId: pendingRequest?._id || approvedRequest?._id
        });
}));

// Initialize server
async function startServer() {
    try {
        await connectToMongoDB();
        await ensureDefaultAdminUser();
        
        app.listen(PORT, () => {
            console.log(`🚛 CargoLume Load Board Server Started`);
            console.log(`Server running on port ${PORT}`);
            console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`API Endpoints:`);
            console.log(`  - Health: http://localhost:${PORT}/api/health`);
            console.log(`  - Register: http://localhost:${PORT}/api/auth/register`);
            console.log(`  - Login: http://localhost:${PORT}/api/auth/login`);
            console.log(`  - Loads: http://localhost:${PORT}/api/loads`);
            console.log(`  - Website: http://localhost:${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('SIGTERM received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('SIGINT received, shutting down gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

// Start the server
startServer();
