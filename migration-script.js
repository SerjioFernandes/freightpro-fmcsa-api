// CargoLume Migration Script
// Migrates existing data to new schema with EIN validation and authority rules
// Run with: node migration-script.js

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcryptjs from 'bcryptjs';

dotenv.config();

// Connect to MongoDB
async function connectToMongoDB() {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI environment variable is required');
        }
        
        await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });
        
        console.log('✅ Connected to MongoDB');
    } catch (error) {
        console.error('❌ MongoDB connection failed:', error);
        process.exit(1);
    }
}

// User Schema (updated)
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
    einCanon: { type: String, default: '' },
    einDisplay: { type: String, default: '' },
    
    // Address Information (USA/Canada only)
    address: {
        street: { type: String, default: '' },
        city: { type: String, default: '' },
        state: { type: String, default: '' },
        zip: { type: String, default: '' },
        country: { type: String, default: 'US', enum: ['US', 'CA'] }
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

// Load Schema (updated)
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
    shipmentId: { type: String, default: '' },
    unlinked: { type: Boolean, default: false },
    
    // Relationships
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    bookedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    
    // Authority validation
    isInterstate: { type: Boolean, default: true },
    
    // Timestamps
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Load = mongoose.model('Load', loadSchema);

// Shipment Schema
const shipmentSchema = new mongoose.Schema({
    shipmentId: { type: String, required: true, unique: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    pickup: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: 'US', enum: ['US', 'CA'] }
    },
    delivery: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        zip: { type: String, required: true },
        country: { type: String, default: 'US', enum: ['US', 'CA'] }
    },
    status: { type: String, enum: ['open', 'closed'], default: 'open' },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

// Validation helpers
function validateEIN(ein) {
    if (!ein || typeof ein !== 'string') return false;
    return /^\d{2}-\d{7}$/.test(ein.trim());
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
    return phone;
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

// Migration functions
async function migrateUsers() {
    console.log('\n🔄 Migrating Users...');
    
    const users = await User.find({});
    let migrated = 0;
    let errors = 0;
    
    for (const user of users) {
        try {
            let needsUpdate = false;
            const updates = {};
            
            // Normalize phone number
            if (user.phone && !user.phone.startsWith('+1')) {
                const normalizedPhone = normalizePhone(user.phone);
                if (normalizedPhone !== user.phone) {
                    updates.phone = normalizedPhone;
                    needsUpdate = true;
                }
            }
            
            // Normalize MC number
            if (user.mcNumber && !user.mcNumber.startsWith('MC-')) {
                const normalizedMC = normalizeMCNumber(user.mcNumber);
                if (normalizedMC !== user.mcNumber) {
                    updates.mcNumber = normalizedMC;
                    needsUpdate = true;
                }
            }
            
            // Set authority flags
            if (user.usdotNumber && !user.hasUSDOT) {
                updates.hasUSDOT = true;
                needsUpdate = true;
            }
            
            if (user.mcNumber && !user.hasMC) {
                updates.hasMC = true;
                needsUpdate = true;
            }
            
            // Handle EIN for brokers/carriers
            if ((user.accountType === 'broker' || user.accountType === 'carrier') && !user.einDisplay) {
                // Generate a placeholder EIN for existing users
                const placeholderEIN = '00-0000000';
                updates.einCanon = '000000000';
                updates.einDisplay = placeholderEIN;
                needsUpdate = true;
                console.log(`   ⚠️  User ${user.email} needs EIN - set placeholder: ${placeholderEIN}`);
            }
            
            // Remove EIN from shippers
            if (user.accountType === 'shipper' && (user.einCanon || user.einDisplay)) {
                updates.einCanon = '';
                updates.einDisplay = '';
                needsUpdate = true;
            }
            
            // Add country to address if missing
            if (user.address && !user.address.country) {
                updates['address.country'] = 'US';
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await User.findByIdAndUpdate(user._id, { $set: updates });
                migrated++;
            }
            
        } catch (error) {
            console.error(`   ❌ Error migrating user ${user.email}:`, error.message);
            errors++;
        }
    }
    
    console.log(`   ✅ Migrated ${migrated} users, ${errors} errors`);
}

async function migrateLoads() {
    console.log('\n🔄 Migrating Loads...');
    
    const loads = await Load.find({});
    let migrated = 0;
    let errors = 0;
    
    for (const load of loads) {
        try {
            let needsUpdate = false;
            const updates = {};
            
            // Add country to origin/destination if missing
            if (load.origin && !load.origin.country) {
                updates['origin.country'] = 'US';
                needsUpdate = true;
            }
            
            if (load.destination && !load.destination.country) {
                updates['destination.country'] = 'US';
                needsUpdate = true;
            }
            
            // Set interstate flag
            if (load.origin && load.destination && load.origin.state && load.destination.state) {
                const isInterstate = load.origin.state !== load.destination.state;
                if (load.isInterstate !== isInterstate) {
                    updates.isInterstate = isInterstate;
                    needsUpdate = true;
                }
            }
            
            // Set unlinked flag for existing loads
            if (load.unlinked === undefined) {
                updates.unlinked = true; // Existing loads are unlinked by default
                needsUpdate = true;
            }
            
            if (needsUpdate) {
                await Load.findByIdAndUpdate(load._id, { $set: updates });
                migrated++;
            }
            
        } catch (error) {
            console.error(`   ❌ Error migrating load ${load._id}:`, error.message);
            errors++;
        }
    }
    
    console.log(`   ✅ Migrated ${migrated} loads, ${errors} errors`);
}

async function validateData() {
    console.log('\n🔍 Validating Data...');
    
    // Check for users that need EIN
    const brokersWithoutEIN = await User.countDocuments({
        accountType: { $in: ['broker', 'carrier'] },
        einDisplay: { $in: ['', null] }
    });
    
    if (brokersWithoutEIN > 0) {
        console.log(`   ⚠️  ${brokersWithoutEIN} brokers/carriers need EIN numbers`);
    }
    
    // Check for shippers with EIN
    const shippersWithEIN = await User.countDocuments({
        accountType: 'shipper',
        $or: [
            { einCanon: { $ne: '' } },
            { einDisplay: { $ne: '' } }
        ]
    });
    
    if (shippersWithEIN > 0) {
        console.log(`   ⚠️  ${shippersWithEIN} shippers have EIN (should be removed)`);
    }
    
    // Check for loads without interstate flag
    const loadsWithoutInterstate = await Load.countDocuments({
        isInterstate: { $exists: false }
    });
    
    if (loadsWithoutInterstate > 0) {
        console.log(`   ⚠️  ${loadsWithoutInterstate} loads missing interstate flag`);
    }
    
    console.log('   ✅ Data validation completed');
}

async function createIndexes() {
    console.log('\n📊 Creating Indexes...');
    
    try {
        // User indexes
        await User.collection.createIndex({ email: 1 }, { unique: true });
        await User.collection.createIndex({ accountType: 1 });
        await User.collection.createIndex({ einCanon: 1 });
        
        // Load indexes
        await Load.collection.createIndex({ status: 1 });
        await Load.collection.createIndex({ postedBy: 1 });
        await Load.collection.createIndex({ bookedBy: 1 });
        await Load.collection.createIndex({ isInterstate: 1 });
        await Load.collection.createIndex({ shipmentId: 1 });
        
        // Shipment indexes
        await Shipment.collection.createIndex({ shipmentId: 1 }, { unique: true });
        await Shipment.collection.createIndex({ postedBy: 1 });
        await Shipment.collection.createIndex({ status: 1 });
        
        console.log('   ✅ Indexes created successfully');
    } catch (error) {
        console.error('   ❌ Error creating indexes:', error.message);
    }
}

// Main migration function
async function runMigration() {
    console.log('🚛 CargoLume Migration Script');
    console.log('==============================');
    
    try {
        await connectToMongoDB();
        
        console.log('\n📋 Migration Plan:');
        console.log('1. Migrate user data (normalize phone, MC, add authority flags)');
        console.log('2. Migrate load data (add country, interstate flag, unlinked flag)');
        console.log('3. Validate data integrity');
        console.log('4. Create database indexes');
        
        const confirm = process.argv.includes('--confirm');
        if (!confirm) {
            console.log('\n⚠️  This is a dry run. Add --confirm to actually run the migration.');
            console.log('   Example: node migration-script.js --confirm');
            return;
        }
        
        await migrateUsers();
        await migrateLoads();
        await validateData();
        await createIndexes();
        
        console.log('\n✅ Migration completed successfully!');
        console.log('\n📝 Post-Migration Checklist:');
        console.log('1. Update brokers/carriers with placeholder EINs to real EINs');
        console.log('2. Test user registration with new validation rules');
        console.log('3. Test load posting with authority validation');
        console.log('4. Verify dashboard functionality');
        console.log('5. Test email verification system');
        
    } catch (error) {
        console.error('\n❌ Migration failed:', error);
        process.exit(1);
    } finally {
        await mongoose.disconnect();
        console.log('\n🔌 Disconnected from MongoDB');
    }
}

// Run migration if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
    runMigration();
}

export { runMigration, migrateUsers, migrateLoads, validateData, createIndexes };
