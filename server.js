// FreightPro Load Board Backend Server
import express from 'express';
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
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const FRONTEND_URL = (process.env.FRONTEND_URL || 'https://freight-pro.netlify.app').trim();
const EMAIL_VERIFICATION_TTL_MS = Number(process.env.EMAIL_VERIFICATION_TTL_MS) || 24 * 60 * 60 * 1000;

async function ensureDefaultAdminUser() {
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
}

// MongoDB Connection
async function connectToMongoDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is required');
        }
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB successfully');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error.message);
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
app.use(helmet());
app.use(compression());
const allowedOrigins = [
    'https://freight-pro.netlify.app',
    'http://localhost:3000',
    'http://localhost:8000',
    'http://localhost:4000',
    'null'
];

if (FRONTEND_URL && !allowedOrigins.includes(FRONTEND_URL)) {
    allowedOrigins.push(FRONTEND_URL);
}

app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

console.log('🔐 CORS allowed origins:', JSON.stringify(allowedOrigins));

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
app.options('*', cors());

// Email Configuration
function createEmailTransporter() {
    const user = process.env.EMAIL_USER;
    const pass = process.env.EMAIL_PASS;

    if (!user || !pass) {
        console.warn('⚠️ EMAIL_USER or EMAIL_PASS environment variables are missing. Email notifications are disabled.');
        return null;
    }

    return nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user,
            pass
        }
    });
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
        }
    });
});

// User Registration
app.post('/api/auth/register', validateRegistration, async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            console.error('Registration validation failed:', errors.array());
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        console.log('Registration request body:', JSON.stringify(req.body, null, 2));

        const { email, password, company, phone, accountType, usdotNumber, mcNumber, hasUSDOT, companyLegalName, dbaName, address } = req.body;

        const normalizedEmail = (email || '').trim().toLowerCase();

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
            address: address || {},
            emailVerificationToken,
            emailVerificationCodeHash,
            emailVerificationExpires
        });

        await user.save();
        console.log('User created successfully:', user.email, 'ID:', user._id);

        // Send verification email
        let emailSent = false;

        if (transporter) {
            try {
                await transporter.sendMail({
                    from: process.env.EMAIL_USER,
                    to: normalizedEmail,
                    subject: 'FreightPro - Verify Your Email',
                    html: `
                        <h2>Welcome to FreightPro!</h2>
                        <p>Thank you for registering with FreightPro Load Board.</p>
                        <p>Please enter the following verification code on the FreightPro website to activate your account:</p>
                        <div style="font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #2563eb; margin: 20px 0;">${emailVerificationCode}</div>
                        <p style="margin-top: 12px;">This code will expire in 24 hours.</p>
                        <p>If you didn't create this account, please ignore this email.</p>
                    `
                });
                emailSent = true;
            } catch (emailError) {
                console.error('Email sending failed:', emailError);
                // Don't fail registration if email fails
            }
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

    } catch (error) {
        console.error('Registration error:', error);
        console.error('Error stack:', error.stack);
        res.status(500).json({
            error: 'Registration failed',
            message: 'An error occurred during registration',
            details: process.env.NODE_ENV === 'development' ? error.message : 'Contact support for assistance'
        });
    }
});

// Email Verification
app.get('/api/auth/verify/:token', async (req, res) => {
    try {
        const { token } = req.params;

        const decoded = jsonwebtoken.verify(token, JWT_SECRET);
        const user = await User.findOne({ email: decoded.email });

        if (!user) {
            return res.status(400).json({
                error: 'Invalid verification token',
                message: 'User not found'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                error: 'Email already verified',
                message: 'This email has already been verified'
            });
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = '';
        user.emailVerificationCodeHash = '';
        user.emailVerificationExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in to your account.'
        });

    } catch (error) {
        console.error('Email verification error:', error);
        res.status(400).json({
            error: 'Verification failed',
            message: 'Invalid or expired verification token'
        });
    }
});

// Admin: list users with plain password
app.get('/api/admin/users', authenticateToken, async (req, res) => {
    try {
        if (!req.user || req.user.role !== 'admin') {
            return res.status(403).json({
                error: 'Access denied',
                message: 'Admin privileges required'
            });
        }

        const users = await User.find().select('-emailVerificationToken -emailVerificationCodeHash');

        res.json({
            success: true,
            users
        });

    } catch (error) {
        console.error('Admin users fetch error:', error);
        res.status(500).json({
            error: 'Admin users fetch failed',
            message: 'Unable to load users'
        });
    }
});

// Email Verification via code
app.post('/api/auth/verify-code', async (req, res) => {
    try {
        const { email, code, token } = req.body;

        if (!email || !code) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Email and verification code are required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No account found for this email'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                error: 'Email already verified',
                message: 'This email has already been verified'
            });
        }

        if (user.emailVerificationExpires && user.emailVerificationExpires.getTime() < Date.now()) {
            return res.status(400).json({
                error: 'Verification code expired',
                message: 'Your verification code has expired. Please request a new one.'
            });
        }

        const codeMatches = await bcryptjs.compare(code.toString().trim(), user.emailVerificationCodeHash || '');
        if (!codeMatches) {
            return res.status(400).json({
                error: 'Invalid code',
                message: 'The verification code you entered is invalid.'
            });
        }

        if (token) {
            try {
                const decoded = jsonwebtoken.verify(token, JWT_SECRET);
                if (decoded.email !== normalizedEmail) {
                    return res.status(400).json({
                        error: 'Invalid token',
                        message: 'Verification token does not match this email.'
                    });
                }
            } catch (err) {
                return res.status(400).json({
                    error: 'Invalid token',
                    message: 'Verification token is invalid or expired.'
                });
            }
        }

        user.isEmailVerified = true;
        user.emailVerificationToken = '';
        user.emailVerificationCodeHash = '';
        user.emailVerificationExpires = null;
        await user.save();

        res.json({
            success: true,
            message: 'Email verified successfully! You can now log in to your account.'
        });

    } catch (error) {
        console.error('Email verification code error:', error);
        res.status(500).json({
            error: 'Verification failed',
            message: 'An error occurred while verifying your email'
        });
    }
});

// Resend verification code
app.post('/api/auth/resend-code', async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                error: 'Validation failed',
                message: 'Email is required'
            });
        }

        const normalizedEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normalizedEmail });

        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'No account found for this email'
            });
        }

        if (user.isEmailVerified) {
            return res.status(400).json({
                error: 'Email already verified',
                message: 'This email has already been verified'
            });
        }

        const emailVerificationCode = crypto.randomInt(100000, 999999).toString();
        user.emailVerificationCodeHash = await bcryptjs.hash(emailVerificationCode, 10);
    user.emailVerificationToken = jsonwebtoken.sign(
        { email: normalizedEmail },
        JWT_SECRET,
        { expiresIn: EMAIL_VERIFICATION_TTL_MS / 1000 }
    );
        user.emailVerificationExpires = new Date(Date.now() + EMAIL_VERIFICATION_TTL_MS);
        await user.save();

        if (!transporter) {
        return res.json({
            success: true,
            message: 'Verification code resent. Email service is currently unavailable.',
            expiresInMinutes: Math.round(EMAIL_VERIFICATION_TTL_MS / (60 * 1000))
        });
        }

    await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: normalizedEmail,
        subject: 'FreightPro - Your new verification code',
        html: `
            <h2>Your Verification Code</h2>
            <p>Use the following code to verify your FreightPro account:</p>
            <div style="font-size: 32px; letter-spacing: 10px; font-weight: bold; color: #2563eb; margin: 20px 0;">${emailVerificationCode}</div>
            <p>This code will expire in ${Math.round(EMAIL_VERIFICATION_TTL_MS / (60 * 1000))} minutes.</p>
        `
    });

        res.json({
            success: true,
            message: 'A new verification code has been sent to your email.',
            expiresInMinutes: Math.round(EMAIL_VERIFICATION_TTL_MS / (60 * 1000))
        });

    } catch (error) {
        console.error('Resend verification code error:', error);
        res.status(500).json({
            error: 'Resend failed',
            message: 'Failed to resend verification code.'
        });
    }
});

// User Login
app.post('/api/auth/login', async (req, res) => {
    try {
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

    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed',
            message: 'An error occurred during login'
        });
    }
});

// Get User Profile
app.get('/api/auth/profile', authenticateToken, async (req, res) => {
    try {
        const user = await User.findById(req.user.userId).select('-password -emailVerificationToken');
        
        if (!user) {
            return res.status(404).json({
                error: 'User not found',
                message: 'User account not found'
            });
        }

        res.json({
            success: true,
            user
        });

    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({
            error: 'Profile fetch failed',
            message: 'An error occurred while fetching profile'
        });
    }
});

// Load Board Routes

// Post a Load
app.post('/api/loads', authenticateToken, async (req, res) => {
    try {
        const loadData = {
            ...req.body,
            postedBy: req.user.userId
        };

        const load = new Load(loadData);
        await load.save();

        res.status(201).json({
            success: true,
            message: 'Load posted successfully',
            load
        });

    } catch (error) {
        console.error('Load posting error:', error);
        res.status(500).json({
            error: 'Load posting failed',
            message: 'An error occurred while posting the load'
        });
    }
});

// Get Loads
app.get('/api/loads', async (req, res) => {
    try {
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

    } catch (error) {
        console.error('Loads fetch error:', error);
        res.status(500).json({
            error: 'Loads fetch failed',
            message: 'An error occurred while fetching loads'
        });
    }
});

// Book a Load
app.post('/api/loads/:id/book', authenticateToken, async (req, res) => {
    try {
        const load = await Load.findById(req.params.id);
        
        if (!load) {
            return res.status(404).json({
                error: 'Load not found',
                message: 'The requested load does not exist'
            });
        }

        if (load.status !== 'available') {
            return res.status(400).json({
                error: 'Load not available',
                message: 'This load is no longer available'
            });
        }

        load.status = 'booked';
        load.bookedBy = req.user.userId;
        load.updatedAt = new Date();
        
        await load.save();

        res.json({
            success: true,
            message: 'Load booked successfully',
            load
        });

    } catch (error) {
        console.error('Load booking error:', error);
        res.status(500).json({
            error: 'Load booking failed',
            message: 'An error occurred while booking the load'
        });
    }
});

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