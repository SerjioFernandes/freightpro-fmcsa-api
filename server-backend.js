// FreightPro Load Board Backend Server
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
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://freight-pro.netlify.app').trim();
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
        passwordPlain: ADMIN_PASSWORD,
        company: 'FreightPro',
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
    
    // Authority Information (for carriers/brokers)
    usdotNumber: { type: String, default: '' },
    mcNumber: { type: String, default: '' },
    hasUSDOT: { type: Boolean, default: false },
    
    // Company Information
    companyLegalName: { type: String, default: '' },
    dbaName: { type: String, default: '' },
    
    // EIN Information (for brokers/carriers)
    einCanon: { type: String, default: '' }, // EIN without dashes (e.g., 894521364)
    einDisplay: { type: String, default: '' }, // EIN with dashes (e.g., 89-4521364)
    
    // Address Information
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' }
    },
    
    // Account Status
    isEmailVerified: { type: Boolean, default: false },
    emailVerificationToken: { type: String, default: '' },
    emailVerificationCodeHash: { type: String, default: '' },
    emailVerificationExpires: { type: Date },
    isActive: { type: Boolean, default: true },
    role: { type: String, default: 'user', enum: ['user', 'admin'] },
    
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
const loadSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    origin: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true }
    },
    destination: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true }
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
    
    // Relationships
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    
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
const allowedOrigins = [
    'https://freight-pro.netlify.app', // Your new Netlify URL
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:4000',
    'null'
];

if (FRONTEND_URL && !allowedOrigins.includes(FRONTEND_URL)) {
    allowedOrigins.push(FRONTEND_URL);
}

// Handle preflight requests first
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

console.log('🔐 CORS allowed origins:', JSON.stringify(allowedOrigins));

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
        secure: false, // true for 465, false for other ports
        auth: {
            user,
            pass
        },
        tls: {
            rejectUnauthorized: false
        },
        // Additional options to help with Gmail
        pool: true,
        maxConnections: 1,
        maxMessages: 3,
        rateDelta: 20000,
        rateLimit: 5
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
        message: 'FreightPro Load Board API is running',
        service: 'FreightPro Load Board API',
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
app.post('/api/auth/register', validateRegistration, asyncHandler(async (req, res) => {
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

        // EIN validation for brokers and carriers
        if (accountType === 'broker' || accountType === 'carrier') {
            if (!ein || !ein.trim()) {
                return res.status(400).json({
                    error: 'EIN required',
                    message: 'EIN is required for brokers and carriers'
                });
            }
            
            // Validate EIN format (XX-XXXXXXX)
            const einPattern = /^\d{2}-\d{7}$/;
            if (!einPattern.test(ein.trim())) {
                return res.status(400).json({
                    error: 'Invalid EIN format',
                    message: 'EIN must be in format XX-XXXXXXX (e.g., 89-4521364)'
                });
            }
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

        // Process EIN for brokers/carriers
        let einCanon = '';
        let einDisplay = '';
        if (ein && (accountType === 'broker' || accountType === 'carrier')) {
            einDisplay = ein.trim();
            einCanon = ein.trim().replace('-', '');
        }

        // Create user
        const user = new User({
            email: normalizedEmail,
            password: hashedPassword,
            passwordPlain: password,
            company,
            phone,
            accountType,
            usdotNumber: usdotNumber || '',
            mcNumber: mcNumber || '',
            hasUSDOT: hasUSDOT || false,
            companyLegalName: companyLegalName || '',
            dbaName: dbaName || '',
            einCanon,
            einDisplay,
            address: {
                street: '',
                city: '',
                state: '',
                zip: ''
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
                    <h1 style="margin:0; font-size:20px;">FreightPro</h1>
                    <p style="margin:4px 0 0; font-size:12px; opacity:.9">Professional Load Board</p>
                  </div>
                  <div style="padding:24px">
                    <h2 style="margin:0 0 8px; color:#111827; font-size:18px;">Verify your email</h2>
                    <p style="margin:0 0 16px; color:#374151;">Thanks for registering. Use this code to finish setting up your account:</p>
                    <div style="background:#f3f4f6; padding:20px; text-align:center; border-radius:8px; margin-bottom:16px">
                      <div style="font-size:32px; letter-spacing:8px; font-weight:700; color:#2563eb;">${emailVerificationCode}</div>
                    </div>
                    <p style="margin:0 0 16px; color:#4b5563">This code expires in 24 hours.</p>
                    <a href="${FRONTEND_URL}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Open FreightPro</a>
                  </div>
                  <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
                    <p style="margin:0 0 4px;">If you didn’t create this account, you can safely ignore this email.</p>
                    <p style="margin:0;">© ${new Date().getFullYear()} FreightPro. All rights reserved.</p>
                  </div>
                </div>`;
            transporter.sendMail({
                from: `"FreightPro" <${process.env.EMAIL_USER}>`,
                to: normalizedEmail,
                subject: 'Verify your email for FreightPro',
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
        await user.save();

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

        res.json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                email: user.email,
                company: user.company,
                accountType: user.accountType,
                isEmailVerified: user.isEmailVerified,
                role: user.role
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
                    <h1 style="margin:0; font-size:20px;">FreightPro</h1>
                    <p style="margin:4px 0 0; font-size:12px; opacity:.9">Professional Load Board</p>
                  </div>
                  <div style="padding:24px">
                    <h2 style="margin:0 0 8px; color:#111827; font-size:18px;">Verify your email</h2>
                    <p style="margin:0 0 16px; color:#374151;">Here's your new verification code:</p>
                    <div style="background:#f3f4f6; padding:20px; text-align:center; border-radius:8px; margin-bottom:16px">
                      <div style="font-size:32px; letter-spacing:8px; font-weight:700; color:#2563eb;">${emailVerificationCode}</div>
                    </div>
                    <p style="margin:0 0 16px; color:#4b5563">This code expires in 24 hours.</p>
                    <a href="${FRONTEND_URL}" style="display:inline-block; background:#2563eb; color:#fff; padding:10px 16px; border-radius:8px; text-decoration:none;">Open FreightPro</a>
                  </div>
                  <div style="padding:16px 24px; background:#f9fafb; color:#6b7280; font-size:12px;">
                    <p style="margin:0 0 4px;">If you didn't request this code, you can safely ignore this email.</p>
                    <p style="margin:0;">© ${new Date().getFullYear()} FreightPro. All rights reserved.</p>
                  </div>
                </div>`;
            transporter.sendMail({
                from: `"FreightPro" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: 'New verification code for FreightPro',
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

// Get Loads
app.get('/api/loads', asyncHandler(async (req, res) => {
        const { page = 1, limit = 20, status = 'available', accountType } = req.query;
        const skip = (page - 1) * limit;

        let query = { status };
        
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

        const { shipmentId } = req.body;

        let shipmentRef = null;
        if (shipmentId) {
            // Validate shipmentId exists and is open
            const shipment = await Shipment.findOne({ shipmentId, status: 'open' });
            if (!shipment) {
                return res.status(400).json({ error: 'Invalid or closed shipmentId' });
            }
            shipmentRef = shipment._id;
        }

        const loadData = {
            ...req.body,
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

        const random = Math.random().toString(36).slice(2, 8).toUpperCase();
        const datePart = new Date().toISOString().slice(0,10).replace(/-/g, '');
        const shipmentId = `SHP-${datePart}-${random}`;

        const shipment = new Shipment({
            shipmentId,
            title: req.body.title,
            description: req.body.description || '',
            pickup: req.body.pickup,
            delivery: req.body.delivery,
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
        res.json({ success: true, shipments, pagination: { page: parseInt(page), limit: parseInt(limit), total, pages: Math.ceil(total / limit) } });
}));

// Get shipment by shipmentId
app.get('/api/shipments/:shipmentId', authenticateToken, asyncHandler(async (req, res) => {
        const shipment = await Shipment.findOne({ shipmentId: req.params.shipmentId });
        if (!shipment) return res.status(404).json({ error: 'Shipment not found' });
        res.json({ success: true, shipment });
}));

// Initialize server
async function startServer() {
    try {
        await connectToMongoDB();
        await ensureDefaultAdminUser();
        
        app.listen(PORT, () => {
            console.log(`🚛 FreightPro Load Board Server Started`);
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
