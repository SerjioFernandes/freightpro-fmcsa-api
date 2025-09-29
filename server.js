// FreightPro Load Board Backend Server
import express from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';
import jsonwebtoken from 'jsonwebtoken';
import nodemailer from 'nodemailer';
import { body, validationResult } from 'express-validator';
import helmet from 'helmet';
import compression from 'compression';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

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
app.use(cors({
    origin: [
        'https://freightpro.netlify.app',
        'http://localhost:3000',
        'http://localhost:8000',
        'http://localhost:4000',
        'null'  // Allow file:// protocol (when opening HTML directly)
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));

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
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'your-email@gmail.com',
        pass: process.env.EMAIL_PASS || 'your-app-password'
    }
});

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
    body('company').notEmpty().withMessage('Company name required'),
    body('phone').isMobilePhone().withMessage('Valid phone number required'),
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
            return res.status(400).json({
                error: 'Validation failed',
                details: errors.array()
            });
        }

        const { email, password, company, phone, accountType, usdotNumber, mcNumber, hasUSDOT, companyLegalName, dbaName, address } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                error: 'User already exists',
                message: 'An account with this email already exists'
            });
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcryptjs.hash(password, saltRounds);

        // Generate email verification token
        const emailVerificationToken = jsonwebtoken.sign(
            { email },
            JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Create user
        const user = new User({
            email,
            password: hashedPassword,
            company,
            phone,
            accountType,
            usdotNumber: usdotNumber || '',
            mcNumber: mcNumber || '',
            hasUSDOT: hasUSDOT || false,
            companyLegalName: companyLegalName || '',
            dbaName: dbaName || '',
            address: address || {},
            emailVerificationToken
        });

        await user.save();

        // Send verification email
        try {
            const verificationUrl = `${req.protocol}://${req.get('host')}/api/auth/verify/${emailVerificationToken}`;
            
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: email,
                subject: 'FreightPro - Verify Your Email',
                html: `
                    <h2>Welcome to FreightPro!</h2>
                    <p>Thank you for registering with FreightPro Load Board.</p>
                    <p>Please click the link below to verify your email address:</p>
                    <a href="${verificationUrl}" style="background-color: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
                    <p>This link will expire in 24 hours.</p>
                    <p>If you didn't create this account, please ignore this email.</p>
                `
            });
        } catch (emailError) {
            console.error('Email sending failed:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            success: true,
            message: 'User registered successfully. Please check your email to verify your account.',
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

        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials',
                message: 'Email or password is incorrect'
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